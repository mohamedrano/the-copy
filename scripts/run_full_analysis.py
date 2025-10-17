#!/usr/bin/env python3
# script: run_full_analysis.py

import os
import sys
import subprocess
import argparse
import logging
from pathlib import Path
from datetime import datetime
import json

class FullAnalysisRunner:
    """منسق تشغيل التحليل الكامل"""

    def __init__(self, repo_url: str, branch: str = "main", output_dir: str = None):
        self.repo_url = repo_url
        self.branch = branch
        self.analysis_id = f"RAMP-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        self.output_dir = Path(output_dir or f"./analysis_{self.analysis_id}")

        # إعداد التسجيل
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(f"analysis_{self.analysis_id}.log"),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

        # مسارات المشاريع
        self.scripts_dir = Path(__file__).parent
        self.repo_path = self.output_dir / "repository"

    def run_complete_analysis(self) -> bool:
        """تشغيل التحليل الكامل"""

        try:
            self.logger.info(f"🚀 بدء التحليل الشامل - {self.analysis_id}")
            self.logger.info(f"📁 المستودع: {self.repo_url}")
            self.logger.info(f"🌿 الفرع: {self.branch}")
            self.logger.info(f"📂 مجلد النتائج: {self.output_dir}")

            # المرحلة 0: التحقق من المتطلبات
            if not self._verify_requirements():
                return False

            # المرحلة 1: التهيئة والإعداد
            if not self._initialize_environment():
                return False

            # المرحلة 2: BUILD - التحليل الأولي
            if not self._run_build_phase():
                return False

            # المرحلة 3: ASSEMBLE - تحليل المعمارية
            if not self._run_assemble_phase():
                return False

            # المرحلة 4: GRADE - التقييم والتحكيم
            if not self._run_grade_phase():
                return False

            # المرحلة 5: MIX - توليد الفرص
            if not self._run_mix_phase():
                return False

            # المرحلة 6: RENDER - صياغة المفاهيم
            if not self._run_render_phase():
                return False

            # المرحلة 7: EXPORT - تصدير التسليمات
            if not self._run_export_phase():
                return False

            self.logger.info("🎉 تم إكمال التحليل الشامل بنجاح!")
            return True

        except Exception as e:
            self.logger.error(f"❌ خطأ في التحليل الشامل: {e}")
            return False

    def _verify_requirements(self) -> bool:
        """التحقق من المتطلبات"""
        self.logger.info("🔍 التحقق من المتطلبات...")

        try:
            result = subprocess.run(
                [sys.executable, self.scripts_dir / "verify_requirements.py"],
                capture_output=True,
                text=True,
                timeout=60
            )

            if result.returncode == 0:
                self.logger.info("✅ جميع المتطلبات متوفرة")
                return True
            else:
                self.logger.error(f"❌ متطلبات ناقصة: {result.stderr}")
                return False

        except Exception as e:
            self.logger.error(f"❌ خطأ في التحقق من المتطلبات: {e}")
            return False

    def _initialize_environment(self) -> bool:
        """تهيئة البيئة"""
        self.logger.info("🏗️ تهيئة بيئة التحليل...")

        try:
            # إنشاء مجلدات
            self.output_dir.mkdir(parents=True, exist_ok=True)

            # إنشاء ملف التكوين
            config = {
                "analysis_id": self.analysis_id,
                "repository": {
                    "url": self.repo_url,
                    "branch": self.branch,
                    "timestamp": datetime.now().isoformat()
                },
                "phases": {
                    "build": {"status": "pending"},
                    "assemble": {"status": "pending"},
                    "grade": {"status": "pending"},
                    "mix": {"status": "pending"},
                    "render": {"status": "pending"},
                    "export": {"status": "pending"}
                }
            }

            with open(self.output_dir / "config.json", "w") as f:
                json.dump(config, f, indent=2)

            self.logger.info("✅ تم تهيئة البيئة")
            return True

        except Exception as e:
            self.logger.error(f"❌ خطأ في تهيئة البيئة: {e}")
            return False

    def _run_build_phase(self) -> bool:
        """تشغيل مرحلة BUILD"""
        self.logger.info("🔨 المرحلة 1: BUILD - التحليل الأولي...")

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    self.scripts_dir / "build_analysis.py",
                    self.repo_url,
                    str(self.output_dir),
                    self.branch
                ],
                capture_output=True,
                text=True,
                timeout=600
            )

            if result.returncode == 0:
                self._update_phase_status("build", "completed")
                self.logger.info("✅ مرحلة BUILD مكتملة")
                return True
            else:
                self.logger.error(f"❌ فشل في مرحلة BUILD: {result.stderr}")
                self._update_phase_status("build", "failed")
                return False

        except subprocess.TimeoutExpired:
            self.logger.error("❌ انتهت مهلة مرحلة BUILD")
            self._update_phase_status("build", "timeout")
            return False
        except Exception as e:
            self.logger.error(f"❌ خطأ في مرحلة BUILD: {e}")
            self._update_phase_status("build", "error")
            return False

    def _run_assemble_phase(self) -> bool:
        """تشغيل مرحلة ASSEMBLE"""
        self.logger.info("🗺️ المرحلة 2: ASSEMBLE - تحليل المعمارية...")

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    self.scripts_dir / "assemble_architecture.py",
                    str(self.repo_path),
                    str(self.output_dir)
                ],
                capture_output=True,
                text=True,
                timeout=300
            )

            if result.returncode == 0:
                self._update_phase_status("assemble", "completed")
                self.logger.info("✅ مرحلة ASSEMBLE مكتملة")
                return True
            else:
                self.logger.error(f"❌ فشل في مرحلة ASSEMBLE: {result.stderr}")
                self._update_phase_status("assemble", "failed")
                return False

        except Exception as e:
            self.logger.error(f"❌ خطأ في مرحلة ASSEMBLE: {e}")
            self._update_phase_status("assemble", "error")
            return False

    def _run_grade_phase(self) -> bool:
        """تشغيل مرحلة GRADE"""
        self.logger.info("📊 المرحلة 3: GRADE - التقييم والتحكيم...")

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    self.scripts_dir / "grade_assessment.py",
                    str(self.repo_path),
                    str(self.output_dir)
                ],
                capture_output=True,
                text=True,
                timeout=300
            )

            if result.returncode == 0:
                self._update_phase_status("grade", "completed")
                self.logger.info("✅ مرحلة GRADE مكتملة")
                return True
            else:
                self.logger.error(f"❌ فشل في مرحلة GRADE: {result.stderr}")
                self._update_phase_status("grade", "failed")
                return False

        except Exception as e:
            self.logger.error(f"❌ خطأ في مرحلة GRADE: {e}")
            self._update_phase_status("grade", "error")
            return False

    def _run_mix_phase(self) -> bool:
        """تشغيل مرحلة MIX"""
        self.logger.info("🎯 المرحلة 4: MIX - توليد الفرص الاستراتيجية...")

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    self.scripts_dir / "mix_opportunities.py",
                    str(self.repo_path),
                    str(self.output_dir)
                ],
                capture_output=True,
                text=True,
                timeout=300
            )

            if result.returncode == 0:
                self._update_phase_status("mix", "completed")
                self.logger.info("✅ مرحلة MIX مكتملة")
                return True
            else:
                self.logger.error(f"❌ فشل في مرحلة MIX: {result.stderr}")
                self._update_phase_status("mix", "failed")
                return False

        except Exception as e:
            self.logger.error(f"❌ خطأ في مرحلة MIX: {e}")
            self._update_phase_status("mix", "error")
            return False

    def _run_render_phase(self) -> bool:
        """تشغيل مرحلة RENDER"""
        self.logger.info("🎨 المرحلة 5: RENDER - صياغة مفاهيم المنتجات...")

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    self.scripts_dir / "render_concepts.py",
                    str(self.repo_path),
                    str(self.output_dir)
                ],
                capture_output=True,
                text=True,
                timeout=300
            )

            if result.returncode == 0:
                self._update_phase_status("render", "completed")
                self.logger.info("✅ مرحلة RENDER مكتملة")
                return True
            else:
                self.logger.error(f"❌ فشل في مرحلة RENDER: {result.stderr}")
                self._update_phase_status("render", "failed")
                return False

        except Exception as e:
            self.logger.error(f"❌ خطأ في مرحلة RENDER: {e}")
            self._update_phase_status("render", "error")
            return False

    def _run_export_phase(self) -> bool:
        """تشغيل مرحلة EXPORT"""
        self.logger.info("📦 المرحلة 6: EXPORT - تصدير التسليمات...")

        try:
            result = subprocess.run(
                [
                    sys.executable,
                    self.scripts_dir / "export_deliverables.py",
                    str(self.output_dir),
                    self.analysis_id
                ],
                capture_output=True,
                text=True,
                timeout=300
            )

            if result.returncode == 0:
                self._update_phase_status("export", "completed")
                self.logger.info("✅ مرحلة EXPORT مكتملة")
                return True
            else:
                self.logger.error(f"❌ فشل في مرحلة EXPORT: {result.stderr}")
                self._update_phase_status("export", "failed")
                return False

        except Exception as e:
            self.logger.error(f"❌ خطأ في مرحلة EXPORT: {e}")
            self._update_phase_status("export", "error")
            return False

    def _update_phase_status(self, phase: str, status: str) -> None:
        """تحديث حالة المرحلة"""
        try:
            config_path = self.output_dir / "config.json"
            with open(config_path, 'r') as f:
                config = json.load(f)

            config["phases"][phase]["status"] = status
            config["phases"][phase]["timestamp"] = datetime.now().isoformat()

            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)

        except Exception as e:
            self.logger.warning(f"⚠️ تعذر تحديث حالة المرحلة {phase}: {e}")

def main():
    """الدالة الرئيسية"""

    parser = argparse.ArgumentParser(
        description="تشغيل التحليل الهندسي المتكامل الشامل"
    )

    parser.add_argument(
        "--repo-url",
        required=True,
        help="رابط المستودع للتحليل"
    )

    parser.add_argument(
        "--branch",
        default="main",
        help="الفرع المراد تحليله (افتراضي: main)"
    )

    parser.add_argument(
        "--output-dir",
        help="مجلد النتائج (افتراضي: analysis_[timestamp])"
    )

    parser.add_argument(
        "--verbose",
        action="store_true",
        help="عرض تفاصيل أكثر"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # تشغيل التحليل
    runner = FullAnalysisRunner(
        repo_url=args.repo_url,
        branch=args.branch,
        output_dir=args.output_dir
    )

    success = runner.run_complete_analysis()

    if success:
        print(f"\n🎉 تم إكمال التحليل بنجاح!")
        print(f"📁 النتائج في: {runner.output_dir}")
        print(f"📦 ابحث عن الأرشيف النهائي في مجلد deliverables/")
        sys.exit(0)
    else:
        print(f"\n❌ فشل في التحليل!")
        print(f"📋 راجع السجل: analysis_{runner.analysis_id}.log")
        sys.exit(1)

if __name__ == "__main__":
    main()