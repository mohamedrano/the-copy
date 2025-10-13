#!/usr/bin/env python3
# script: build_analysis.py

import os
import git
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Any
import logging

class RepositoryAnalyzer:
    """محلل شامل للمستودعات البرمجية"""

    def __init__(self, repo_url: str, output_dir: str, branch: str = "main"):
        self.repo_url = repo_url
        self.output_dir = Path(output_dir)
        self.branch = branch
        self.repo_path = self.output_dir / "repository"

        # إعداد التسجيل
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def clone_repository(self) -> bool:
        """استنساخ المستودع"""
        try:
            self.logger.info(f"🔄 استنساخ المستودع: {self.repo_url}")

            if self.repo_path.exists():
                self.logger.info("📁 المستودع موجود، تحديث...")
                repo = git.Repo(self.repo_path)
                repo.remotes.origin.pull()
            else:
                repo = git.Repo.clone_from(
                    self.repo_url,
                    self.repo_path,
                    branch=self.branch
                )

            # الحصول على معلومات الالتزام
            commit_info = {
                "sha": repo.head.commit.hexsha,
                "message": repo.head.commit.message.strip(),
                "author": str(repo.head.commit.author),
                "date": repo.head.commit.committed_datetime.isoformat()
            }

            # حفظ معلومات المستودع
            repo_info = {
                "url": self.repo_url,
                "branch": self.branch,
                "last_commit": commit_info,
                "total_commits": len(list(repo.iter_commits())),
                "branches": [str(branch) for branch in repo.branches],
                "tags": [str(tag) for tag in repo.tags]
            }

            with open(self.output_dir / "artifacts/build/repo_info.json", "w") as f:
                json.dump(repo_info, f, indent=2, ensure_ascii=False)

            self.logger.info("✅ تم استنساخ المستودع بنجاح")
            return True

        except Exception as e:
            self.logger.error(f"❌ خطأ في استنساخ المستودع: {e}")
            return False

    def analyze_codebase_structure(self) -> Dict[str, Any]:
        """تحليل هيكل قاعدة الكود"""
        self.logger.info("🔍 تحليل هيكل قاعدة الكود...")

        # تشغيل cloc لإحصاء الأسطر
        try:
            cloc_result = subprocess.run(
                ["cloc", str(self.repo_path), "--json"],
                capture_output=True,
                text=True,
                timeout=120
            )

            if cloc_result.returncode == 0:
                cloc_data = json.loads(cloc_result.stdout)
            else:
                cloc_data = {"error": "فشل تشغيل cloc"}

        except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError):
            cloc_data = {"error": "cloc غير متوفر"}

        # تحليل هيكل المجلدات
        structure_analysis = self._analyze_directory_structure()

        # كشف أنواع المشاريع
        project_types = self._detect_project_types()

        # تحليل التبعيات
        dependencies = self._analyze_dependencies()

        analysis_result = {
            "line_counts": cloc_data,
            "directory_structure": structure_analysis,
            "project_types": project_types,
            "dependencies": dependencies,
            "file_extensions": self._get_file_extensions_stats()
        }

        # حفظ النتائج
        with open(self.output_dir / "artifacts/build/codebase_analysis.json", "w") as f:
            json.dump(analysis_result, f, indent=2, ensure_ascii=False)

        return analysis_result

    def _analyze_directory_structure(self) -> Dict[str, Any]:
        """تحليل هيكل المجلدات"""
        structure = {
            "total_files": 0,
            "total_directories": 0,
            "max_depth": 0,
            "large_files": [],  # ملفات > 1MB
            "common_patterns": {}
        }

        for root, dirs, files in os.walk(self.repo_path):
            # تجاهل مجلدات Git
            dirs[:] = [d for d in dirs if not d.startswith('.git')]

            level = root.replace(str(self.repo_path), '').count(os.sep)
            structure["max_depth"] = max(structure["max_depth"], level)
            structure["total_directories"] += len(dirs)

            for file in files:
                if file.startswith('.'):
                    continue

                file_path = Path(root) / file
                structure["total_files"] += 1

                # فحص الملفات الكبيرة
                try:
                    file_size = file_path.stat().st_size
                    if file_size > 1024 * 1024:  # > 1MB
                        structure["large_files"].append({
                            "path": str(file_path.relative_to(self.repo_path)),
                            "size_mb": round(file_size / (1024 * 1024), 2)
                        })
                except OSError:
                    pass

        return structure

    def _detect_project_types(self) -> List[str]:
        """كشف أنواع المشاريع"""
        project_indicators = {
            "package.json": "Node.js/JavaScript",
            "requirements.txt": "Python",
            "setup.py": "Python",
            "pom.xml": "Maven/Java",
            "build.gradle": "Gradle/Java",
            "Cargo.toml": "Rust",
            "go.mod": "Go",
            "composer.json": "PHP",
            "Gemfile": "Ruby",
            "mix.exs": "Elixir",
            "pubspec.yaml": "Dart/Flutter",
            "CMakeLists.txt": "C/C++",
            "Dockerfile": "Docker",
            "docker-compose.yml": "Docker Compose",
            "k8s": "Kubernetes",
            ".github/workflows": "GitHub Actions",
            "terraform": "Terraform"
        }

        detected_types = []

        for indicator, project_type in project_indicators.items():
            if (self.repo_path / indicator).exists():
                detected_types.append(project_type)

        return detected_types

    def _analyze_dependencies(self) -> Dict[str, Any]:
        """تحليل التبعيات"""
        dependencies = {
            "package_managers": [],
            "total_dependencies": 0,
            "outdated_dependencies": [],
            "security_issues": []
        }

        # Node.js dependencies
        package_json = self.repo_path / "package.json"
        if package_json.exists():
            dependencies["package_managers"].append("npm")
            try:
                with open(package_json) as f:
                    package_data = json.load(f)
                    deps = package_data.get("dependencies", {})
                    dev_deps = package_data.get("devDependencies", {})
                    dependencies["total_dependencies"] += len(deps) + len(dev_deps)
            except json.JSONDecodeError:
                pass

        # Python dependencies
        requirements_txt = self.repo_path / "requirements.txt"
        if requirements_txt.exists():
            dependencies["package_managers"].append("pip")
            try:
                with open(requirements_txt) as f:
                    lines = f.readlines()
                    dependencies["total_dependencies"] += len([
                        line for line in lines
                        if line.strip() and not line.startswith('#')
                    ])
            except OSError:
                pass

        return dependencies

    def _get_file_extensions_stats(self) -> Dict[str, int]:
        """إحصائيات امتدادات الملفات"""
        extensions = {}

        for file_path in self.repo_path.rglob("*"):
            if file_path.is_file() and not any(
                part.startswith('.git') for part in file_path.parts
            ):
                ext = file_path.suffix.lower()
                if ext:
                    extensions[ext] = extensions.get(ext, 0) + 1

        # ترتيب حسب التكرار
        return dict(sorted(extensions.items(), key=lambda x: x[1], reverse=True))

    def run_build_tests(self) -> Dict[str, Any]:
        """تشغيل اختبارات البناء"""
        self.logger.info("🧪 تشغيل اختبارات البناء...")

        test_results = {
            "build_status": "unknown",
            "test_status": "unknown",
            "coverage": None,
            "build_time": None,
            "errors": [],
            "warnings": []
        }

        # Node.js project
        if (self.repo_path / "package.json").exists():
            test_results.update(self._test_nodejs_project())

        # Python project
        elif (self.repo_path / "setup.py").exists() or (self.repo_path / "requirements.txt").exists():
            test_results.update(self._test_python_project())

        # حفظ نتائج الاختبارات
        with open(self.output_dir / "artifacts/build/test_results.json", "w") as f:
            json.dump(test_results, f, indent=2, ensure_ascii=False)

        return test_results

    def _test_nodejs_project(self) -> Dict[str, Any]:
        """اختبار مشروع Node.js"""
        results = {"project_type": "Node.js"}

        os.chdir(self.repo_path)

        try:
            # تثبيت التبعيات
            install_result = subprocess.run(
                ["npm", "ci"],
                capture_output=True,
                text=True,
                timeout=300
            )

            if install_result.returncode == 0:
                results["install_status"] = "success"

                # تشغيل البناء
                build_result = subprocess.run(
                    ["npm", "run", "build"],
                    capture_output=True,
                    text=True,
                    timeout=300
                )

                results["build_status"] = "success" if build_result.returncode == 0 else "failed"
                results["build_output"] = build_result.stdout
                results["build_errors"] = build_result.stderr

            else:
                results["install_status"] = "failed"
                results["install_errors"] = install_result.stderr

        except subprocess.TimeoutExpired:
            results["build_status"] = "timeout"
        except Exception as e:
            results["build_status"] = "error"
            results["error"] = str(e)

        return results

    def _test_python_project(self) -> Dict[str, Any]:
        """اختبار مشروع Python"""
        results = {"project_type": "Python"}

        os.chdir(self.repo_path)

        try:
            # إنشاء بيئة افتراضية
            subprocess.run(["python", "-m", "venv", "test_env"], timeout=60)

            # تثبيت التبعيات
            if (self.repo_path / "requirements.txt").exists():
                install_result = subprocess.run(
                    ["./test_env/bin/pip", "install", "-r", "requirements.txt"],
                    capture_output=True,
                    text=True,
                    timeout=300
                )

                results["install_status"] = "success" if install_result.returncode == 0 else "failed"

                if install_result.returncode != 0:
                    results["install_errors"] = install_result.stderr

        except subprocess.TimeoutExpired:
            results["install_status"] = "timeout"
        except Exception as e:
            results["install_status"] = "error"
            results["error"] = str(e)

        return results

def main():
    """الدالة الرئيسية"""
    import sys

    if len(sys.argv) < 3:
        print("الاستخدام: python build_analysis.py <repo_url> <output_dir> [branch]")
        sys.exit(1)

    repo_url = sys.argv[1]
    output_dir = sys.argv[2]
    branch = sys.argv[3] if len(sys.argv) > 3 else "main"

    analyzer = RepositoryAnalyzer(repo_url, output_dir, branch)

    # تشغيل التحليل
    if analyzer.clone_repository():
        analyzer.analyze_codebase_structure()
        analyzer.run_build_tests()
        print("✅ تمت مرحلة البناء بنجاح")
    else:
        print("❌ فشلت مرحلة البناء")
        sys.exit(1)

if __name__ == "__main__":
    main()