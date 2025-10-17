#!/usr/bin/env python3
# script: verify_requirements.py

import subprocess
import sys
import json
from typing import Dict, List, Tuple

class RequirementsVerifier:
    """فئة للتحقق من توفر الأدوات والمتطلبات اللازمة"""

    def __init__(self):
        self.required_tools = {
            "git": {"version_cmd": "--version", "min_version": "2.30.0"},
            "node": {"version_cmd": "--version", "min_version": "16.0.0"},
            "python": {"version_cmd": "--version", "min_version": "3.8.0"},
            "docker": {"version_cmd": "--version", "min_version": "20.0.0"},
            "sonar-scanner": {"version_cmd": "--version", "min_version": "4.7.0"}
        }

    def verify_tool(self, tool: str, config: Dict) -> Tuple[bool, str]:
        """التحقق من توفر أداة محددة"""
        try:
            result = subprocess.run(
                [tool, config["version_cmd"]],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode == 0:
                version_output = result.stdout.strip()
                return True, f"✅ {tool}: {version_output}"
            else:
                return False, f"❌ {tool}: غير متوفر"

        except (subprocess.TimeoutExpired, FileNotFoundError) as e:
            return False, f"❌ {tool}: خطأ - {str(e)}"

    def verify_all(self) -> Dict[str, bool]:
        """التحقق من جميع الأدوات المطلوبة"""
        results = {}

        print("🔍 التحقق من الأدوات المطلوبة...")

        for tool, config in self.required_tools.items():
            is_available, message = self.verify_tool(tool, config)
            results[tool] = is_available
            print(f"  {message}")

        # تحقق إضافي من مكتبات Python
        python_packages = ["requests", "gitpython", "pandas", "matplotlib"]

        print("\n🐍 التحقق من مكتبات Python...")
        for package in python_packages:
            try:
                __import__(package)
                print(f"  ✅ {package}: متوفر")
                results[f"python_{package}"] = True
            except ImportError:
                print(f"  ❌ {package}: غير متوفر")
                results[f"python_{package}"] = False

        return results

    def generate_report(self, results: Dict[str, bool]) -> str:
        """إنتاج تقرير نتائج التحقق"""
        passed = sum(1 for v in results.values() if v)
        total = len(results)

        report = {
            "verification_summary": {
                "total_checks": total,
                "passed": passed,
                "failed": total - passed,
                "success_rate": f"{(passed/total)*100:.1f}%"
            },
            "detailed_results": results,
            "recommendations": []
        }

        if total - passed > 0:
            report["recommendations"].append(
                "قم بتثبيت الأدوات المفقودة قبل المتابعة"
            )

        return json.dumps(report, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    verifier = RequirementsVerifier()
    results = verifier.verify_all()

    report = verifier.generate_report(results)

    # حفظ التقرير
    with open("verification_report.json", "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\n📊 تم حفظ تقرير التحقق في: verification_report.json")

    # الخروج بحالة خطأ إذا فشل أي تحقق أساسي
    critical_tools = ["git", "python", "node"]
    if not all(results.get(tool, False) for tool in critical_tools):
        print("❌ فشل في التحقق من الأدوات الأساسية")
        sys.exit(1)

    print("✅ تم التحقق بنجاح من جميع المتطلبات")