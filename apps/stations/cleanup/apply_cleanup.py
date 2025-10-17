#!/usr/bin/env python3

import json
import os
import shutil
import tarfile
from datetime import datetime

def backup_file(file_path):
    """إنشاء نسخة احتياطية من الملف"""
    if os.path.exists(file_path):
        backup_dir = "cleanup/_backup"
        os.makedirs(backup_dir, exist_ok=True)
        
        # إنشاء اسم الملف مع timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.basename(file_path)
        name, ext = os.path.splitext(filename)
        backup_filename = f"{name}_{timestamp}{ext}"
        backup_path = os.path.join(backup_dir, backup_filename)
        
        shutil.copy2(file_path, backup_path)
        print("Backed up file")
        return backup_path
    return None

def remove_file(file_path):
    """حذف الملف"""
    if os.path.exists(file_path):
        if os.path.isfile(file_path):
            os.remove(file_path)
            print(f"Removed file: {file_path}")
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)
            print(f"Removed directory: {file_path}")
        return True
    else:
        print(f"File not found: {file_path}")
        return False

def main():
    # قراءة التقرير
    with open('cleanup/trash_report.jsonl', 'r', encoding='utf-8') as f:
        files_to_remove = [json.loads(line.strip()) for line in f if line.strip()]
    
    print(f"Found {len(files_to_remove)} files to remove")
    
    # تصنيف الملفات حسب المخاطر
    low_risk = [f for f in files_to_remove if f['risk'] == 'low']
    medium_risk = [f for f in files_to_remove if f['risk'] == 'medium']
    high_risk = [f for f in files_to_remove if f['risk'] == 'high']
    
    print(f"\nRisk levels:")
    print(f"  Low risk: {len(low_risk)} files")
    print(f"  Medium risk: {len(medium_risk)} files")
    print(f"  High risk: {len(high_risk)} files")
    
    # إنشاء نسخة احتياطية لجميع الملفات
    print("\nCreating backups...")
    backup_files = []
    for item in files_to_remove:
        file_path = item['file']
        backup_path = backup_file(file_path)
        if backup_path:
            backup_files.append(backup_path)
    
    # حذف الملفات منخفضة المخاطر فقط
    print("\nRemoving low-risk files...")
    removed_count = 0
    for item in low_risk:
        file_path = item['file']
        if remove_file(file_path):
            removed_count += 1
    
    print(f"\nRemoved {removed_count} low-risk files")
    
    # إنشاء تقرير النتائج
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_files": len(files_to_remove),
        "removed_files": removed_count,
        "backup_files": backup_files,
        "low_risk_removed": len(low_risk),
        "medium_risk_skipped": len(medium_risk),
        "high_risk_skipped": len(high_risk)
    }
    
    with open('cleanup/cleanup_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\nCleanup completed. Results saved to cleanup/cleanup_results.json")
    print(f"Medium and high risk files were skipped for safety.")

if __name__ == "__main__":
    main()
