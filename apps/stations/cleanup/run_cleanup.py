#!/usr/bin/env python3
import json
import os
import sys
import shutil
import subprocess
from pathlib import Path

def main():
    mode = "dry-run"
    report_path = "cleanup/trash_report.jsonl"
    backup_root = "cleanup/_backup"
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "--apply":
            mode = "apply"
        elif sys.argv[1] == "--dry-run":
            mode = "dry-run"
        else:
            print("Usage: python cleanup/run_cleanup.py [--dry-run|--apply]")
            sys.exit(1)
    
    if not os.path.exists(report_path):
        print(f"Report not found: {report_path}")
        sys.exit(1)
    
    # Read the report and filter items marked for removal
    removable_items = []
    with open(report_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            entry = json.loads(line)
            if entry.get('decision') == 'remove':
                removable_items.append(entry)
    
    if not removable_items:
        print(f"No removable items found in {report_path}.")
        return
    
    # Create backup directory
    os.makedirs(backup_root, exist_ok=True)
    
    print(f"Found {len(removable_items)} items to process in {mode} mode")
    
    for item in removable_items:
        target = item['path']
        kind = item.get('kind', 'file')
        risk = item.get('risk', 'med')
        
        if mode == "apply":
            if risk != "low":
                print(f"Refusing to delete {target} because risk level is {risk} (must be low).")
                sys.exit(2)
            
            if not os.path.exists(target):
                print(f"Warning: {target} does not exist on disk; skipping.")
                continue
            
            # Create backup
            safe_name = target.replace('/', '__')
            archive = f"{backup_root}/{safe_name}.tar.gz"
            print(f"Backing up {target} -> {archive}")
            
            # Create tar.gz backup
            subprocess.run(['tar', '-czf', archive, target], check=True)
            
            print(f"Removing {target}")
            if kind == 'dir':
                shutil.rmtree(target)
            else:
                os.remove(target)
            
            # Add to git
            subprocess.run(['git', 'add', '-A', target], check=True)
        else:
            if risk != "low":
                print(f"[DRY-RUN] {target} would require manual review (risk={risk}).")
            else:
                print(f"[DRY-RUN] Would backup and remove {target} (kind={kind}).")
    
    if mode == "apply":
        print("Cleanup applied. Review git status before committing.")
    else:
        print(f"Dry run complete. Generated action plan for {len(removable_items)} items.")

if __name__ == "__main__":
    main()
