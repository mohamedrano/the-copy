#!/usr/bin/env python3
# script: grade_assessment.py

import json
import math
from pathlib import Path
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import logging

class RiskLevel(Enum):
    """مستويات المخاطر"""
    LOW = "منخفض"
    MEDIUM = "متوسط"
    HIGH = "عالي"
    CRITICAL = "حرج"

class QualityMetric(Enum):
    """مؤشرات الجودة"""
    ARCHITECTURE = "architecture"
    CODE_QUALITY = "code_quality"
    SECURITY = "security"
    SCALABILITY = "scalability"
    MAINTAINABILITY = "maintainability"
    TESTING = "testing"
    DOCUMENTATION = "documentation"
    PERFORMANCE = "performance"

@dataclass
class ScoreCard:
    """بطاقة النتائج"""
    metric: str
    score: float  # 0-10
    weight: float  # 0-1
    evidence: List[str]
    recommendations: List[str]

    @property
    def weighted_score(self) -> float:
        return self.score * self.weight

@dataclass
class RiskItem:
    """عنصر مخاطرة"""
    id: str
    title: str
    description: str
    category: str
    probability: float  # 0-1
    impact: float  # 0-10
    level: RiskLevel
    mitigation_strategies: List[str]

    @property
    def risk_score(self) -> float:
        return self.probability * self.impact

class QualityAssessor:
    """مقيم جودة المشروع"""

    def __init__(self, repo_path: str, output_dir: str):
        self.repo_path = Path(repo_path)
        self.output_dir = Path(output_dir)
        self.logger = logging.getLogger(__name__)

        # أوزان المعايير (يمكن تخصيصها)
        self.weights = {
            QualityMetric.ARCHITECTURE: 0.20,
            QualityMetric.CODE_QUALITY: 0.15,
            QualityMetric.SECURITY: 0.15,
            QualityMetric.SCALABILITY: 0.12,
            QualityMetric.MAINTAINABILITY: 0.13,
            QualityMetric.TESTING: 0.10,
            QualityMetric.DOCUMENTATION: 0.08,
            QualityMetric.PERFORMANCE: 0.07
        }

        # تحميل بيانات التحليل السابقة
        self.build_data = self._load_json("artifacts/build/codebase_analysis.json")
        self.assemble_data = self._load_json("artifacts/assemble/dependency_graph.json")
        self.api_data = self._load_json("artifacts/assemble/api_analysis.json")

    def _load_json(self, file_path: str) -> Dict[str, Any]:
        """تحميل ملف JSON"""
        try:
            with open(self.output_dir / file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            self.logger.warning(f"⚠️ تعذر تحميل {file_path}: {e}")
            return {}

    def assess_architecture(self) -> ScoreCard:
        """تقييم المعمارية"""
        score = 5.0  # نقطة البداية
        evidence = []
        recommendations = []

        # فحص وجود أنماط معمارية واضحة
        if self.assemble_data.get("modules"):
            module_count = len(self.assemble_data["modules"])

            if module_count > 0:
                score += 1.0
                evidence.append(f"تم العثور على {module_count} وحدة")

                # فحص التبعيات الدورية
                circular_deps = self.assemble_data.get("circular_dependencies", [])
                if not circular_deps:
                    score += 1.5
                    evidence.append("لا توجد تبعيات دورية")
                else:
                    score -= len(circular_deps) * 0.5
                    evidence.append(f"تم العثور على {len(circular_deps)} تبعية دورية")
                    recommendations.append("إصلاح التبعيات الدورية لتحسين بنية الكود")

                # فحص مؤشرات الـ coupling
                metrics = self.assemble_data.get("metrics", {})
                coupling = metrics.get("average_coupling", 0.5)

                if coupling < 0.3:
                    score += 1.0
                    evidence.append("مستوى coupling منخفض (ممتاز)")
                elif coupling < 0.6:
                    score += 0.5
                    evidence.append("مستوى coupling متوسط")
                else:
                    score -= 0.5
                    evidence.append("مستوى coupling عالي")
                    recommendations.append("تقليل الربط بين الوحدات")

        # فحص التنظيم الهيكلي
        structure = self.build_data.get("directory_structure", {})
        if structure.get("max_depth", 0) > 8:
            score -= 0.5
            evidence.append(f"عمق المجلدات عالي: {structure['max_depth']}")
            recommendations.append("إعادة تنظيم هيكل المجلدات")

        # فحص وجود واجهات API موثقة
        apis = self.api_data
        if apis.get("openapi_specs") or apis.get("graphql_schemas"):
            score += 1.0
            evidence.append("توجد واجهات API موثقة")
        else:
            recommendations.append("إضافة توثيق للواجهات API")

        return ScoreCard(
            metric="Architecture",
            score=min(score, 10.0),
            weight=self.weights[QualityMetric.ARCHITECTURE],
            evidence=evidence,
            recommendations=recommendations
        )

    def assess_code_quality(self) -> ScoreCard:
        """تقييم جودة الكود"""
        score = 5.0
        evidence = []
        recommendations = []

        # فحص تنوع اللغات
        line_counts = self.build_data.get("line_counts", {})
        if isinstance(line_counts, dict) and not line_counts.get("error"):
            languages = [lang for lang in line_counts.keys()
                        if lang not in ["header", "SUM"]]

            if len(languages) <= 3:
                score += 1.0
                evidence.append(f"تنوع محدود في اللغات: {len(languages)}")
            else:
                score -= 0.5
                evidence.append(f"تنوع عالي في اللغات قد يعقد الصيانة: {len(languages)}")

        # فحص نسبة التعليقات
        if "header" in line_counts:
            total_lines = line_counts.get("SUM", {}).get("code", 0)
            comment_lines = line_counts.get("SUM", {}).get("comment", 0)

            if total_lines > 0:
                comment_ratio = comment_lines / total_lines
                if 0.1 <= comment_ratio <= 0.3:
                    score += 1.0
                    evidence.append(f"نسبة تعليقات مناسبة: {comment_ratio:.1%}")
                elif comment_ratio < 0.1:
                    score -= 0.5
                    evidence.append(f"نسبة تعليقات منخفضة: {comment_ratio:.1%}")
                    recommendations.append("زيادة التعليقات التوضيحية")

        # فحص الملفات الكبيرة
        structure = self.build_data.get("directory_structure", {})
        large_files = structure.get("large_files", [])

        if not large_files:
            score += 0.5
            evidence.append("لا توجد ملفات كبيرة (> 1MB)")
        else:
            score -= len(large_files) * 0.2
            evidence.append(f"عدد الملفات الكبيرة: {len(large_files)}")
            recommendations.append("مراجعة الملفات الكبيرة وتحسينها")

        # فحص امتدادات الملفات
        extensions = self.build_data.get("file_extensions", {})
        if extensions:
            # نسبة ملفات الكود إلى الملفات الأخرى
            code_extensions = {'.py', '.js', '.ts', '.java', '.go', '.rs', '.cpp', '.c'}
            code_files = sum(count for ext, count in extensions.items()
                           if ext.lower() in code_extensions)
            total_files = sum(extensions.values())

            if total_files > 0:
                code_ratio = code_files / total_files
                if code_ratio > 0.6:
                    score += 0.5
                    evidence.append(f"نسبة عالية من ملفات الكود: {code_ratio:.1%}")

        return ScoreCard(
            metric="Code Quality",
            score=min(score, 10.0),
            weight=self.weights[QualityMetric.CODE_QUALITY],
            evidence=evidence,
            recommendations=recommendations
        )

    def assess_security(self) -> ScoreCard:
        """تقييم الأمان"""
        score = 5.0
        evidence = []
        recommendations = []

        # فحص ملفات التكوين الحساسة
        sensitive_files = [
            ".env", "config.py", "settings.py", "application.properties",
            "config.json", "secrets.yaml", "credentials.json"
        ]

        found_sensitive = []
        for file_pattern in sensitive_files:
            matches = list(self.repo_path.rglob(file_pattern))
            if matches:
                found_sensitive.extend([str(f.name) for f in matches])

        if found_sensitive:
            score -= 1.0
            evidence.append(f"ملفات تكوين حساسة: {', '.join(found_sensitive)}")
            recommendations.append("التأكد من عدم تضمين ملفات التكوين الحساسة")
        else:
            score += 0.5
            evidence.append("لا توجد ملفات تكوين حساسة ظاهرة")

        # فحص استخدام HTTPS
        has_https_config = any(
            list(self.repo_path.rglob("*ssl*")) +
            list(self.repo_path.rglob("*tls*")) +
            list(self.repo_path.rglob("*https*"))
        )

        if has_https_config:
            score += 1.0
            evidence.append("تكوين HTTPS/TLS موجود")
        else:
            recommendations.append("إضافة تكوين HTTPS/TLS")

        # فحص ملفات Docker
        dockerfiles = list(self.repo_path.rglob("Dockerfile*"))
        if dockerfiles:
            score += 0.5
            evidence.append("استخدام Docker (عزل أفضل)")

            # فحص أفضل ممارسات Docker
            for dockerfile in dockerfiles:
                try:
                    with open(dockerfile, 'r') as f:
                        content = f.read().upper()
                        if "USER" in content and "USER ROOT" not in content:
                            score += 0.5
                            evidence.append("استخدام مستخدم غير root في Docker")
                        else:
                            recommendations.append("استخدام مستخدم غير root في Docker")
                except Exception:
                    pass

        # فحص نمط كلمات المرور في الكود
        password_patterns = [
            "password", "passwd", "pwd", "secret", "key", "token"
        ]

        potential_secrets = []
        for code_file in self.repo_path.rglob("*"):
            if code_file.suffix in ['.py', '.js', '.java', '.go', '.rs']:
                try:
                    with open(code_file, 'r', encoding='utf-8') as f:
                        content = f.read().lower()
                        for pattern in password_patterns:
                            if f"{pattern}=" in content or f'"{pattern}"' in content:
                                potential_secrets.append(str(code_file.name))
                                break
                except Exception:
                    continue

        if potential_secrets:
            score -= 0.5
            evidence.append(f"ملفات قد تحتوي على أسرار: {len(potential_secrets)}")
            recommendations.append("مراجعة الملفات للتأكد من عدم وجود أسرار مدمجة")

        return ScoreCard(
            metric="Security",
            score=min(score, 10.0),
            weight=self.weights[QualityMetric.SECURITY],
            evidence=evidence,
            recommendations=recommendations
        )

    def assess_scalability(self) -> ScoreCard:
        """تقييم قابلية التوسع"""
        score = 5.0
        evidence = []
        recommendations = []

        # فحص وجود containerization
        has_docker = bool(list(self.repo_path.rglob("Dockerfile*")))
        has_compose = bool(list(self.repo_path.rglob("docker-compose*.yml")))
        has_k8s = bool(list(self.repo_path.rglob("k8s/*.yaml"))) or \
                  bool(list(self.repo_path.rglob("kubernetes/*.yaml")))

        container_score = 0
        if has_docker:
            container_score += 1
            evidence.append("Docker containerization")
        if has_compose:
            container_score += 0.5
            evidence.append("Docker Compose للخدمات المتعددة")
        if has_k8s:
            container_score += 1.5
            evidence.append("Kubernetes orchestration")

        score += container_score

        if not any([has_docker, has_compose, has_k8s]):
            recommendations.append("إضافة containerization لتحسين قابلية التوسع")

        # فحص أنماط المعمارية للتوسع
        microservices_indicators = [
            "service", "microservice", "api-gateway", "load-balancer"
        ]

        microservices_score = 0
        for indicator in microservices_indicators:
            if any(indicator in str(path).lower() for path in self.repo_path.rglob("*")):
                microservices_score += 0.25

        score += microservices_score
        if microservices_score > 0:
            evidence.append("مؤشرات على معمارية microservices")

        # فحص قواعد البيانات
        db_files = (
            list(self.repo_path.rglob("*redis*")) +
            list(self.repo_path.rglob("*mongo*")) +
            list(self.repo_path.rglob("*postgres*")) +
            list(self.repo_path.rglob("*mysql*")) +
            list(self.repo_path.rglob("*elastic*"))
        )

        if db_files:
            score += 0.5
            evidence.append("تكوين قواعد بيانات قابلة للتوسع")

        # فحص CI/CD
        ci_files = (
            list(self.repo_path.rglob(".github/workflows/*.yml")) +
            list(self.repo_path.rglob(".gitlab-ci.yml")) +
            list(self.repo_path.rglob("Jenkinsfile")) +
            list(self.repo_path.rglob(".circleci/config.yml"))
        )

        if ci_files:
            score += 1.0
            evidence.append("CI/CD pipeline موجود")
        else:
            recommendations.append("إضافة CI/CD pipeline")

        return ScoreCard(
            metric="Scalability",
            score=min(score, 10.0),
            weight=self.weights[QualityMetric.SCALABILITY],
            evidence=evidence,
            recommendations=recommendations
        )

    def assess_maintainability(self) -> ScoreCard:
        """تقييم قابلية الصيانة"""
        score = 5.0
        evidence = []
        recommendations = []

        # فحص وجود README
        readme_files = list(self.repo_path.rglob("README*"))
        if readme_files:
            score += 1.0
            evidence.append("ملف README موجود")

            # فحص جودة README
            try:
                readme_content = ""
                for readme in readme_files:
                    with open(readme, 'r', encoding='utf-8') as f:
                        readme_content += f.read()

                if len(readme_content) > 500:
                    score += 0.5
                    evidence.append("README مفصل")

                keywords = ["install", "usage", "example", "api", "contribution"]
                found_keywords = sum(1 for kw in keywords if kw.lower() in readme_content.lower())

                if found_keywords >= 3:
                    score += 0.5
                    evidence.append("README شامل")

            except Exception:
                pass
        else:
            recommendations.append("إضافة ملف README شامل")

        # فحص ملفات التوثيق
        doc_files = (
            list(self.repo_path.rglob("docs/*")) +
            list(self.repo_path.rglob("documentation/*")) +
            list(self.repo_path.rglob("*.md"))
        )

        if len(doc_files) > 3:
            score += 1.0
            evidence.append(f"توثيق شامل: {len(doc_files)} ملف")
        elif len(doc_files) > 0:
            score += 0.5
            evidence.append(f"توثيق أساسي: {len(doc_files)} ملف")
        else:
            recommendations.append("إضافة المزيد من التوثيق")

        # فحص ملفات التكوين للتطوير
        dev_files = [
            ".gitignore", ".editorconfig", "package.json", "requirements.txt",
            "setup.py", "Makefile", "pyproject.toml", "composer.json"
        ]

        found_dev_files = []
        for dev_file in dev_files:
            if (self.repo_path / dev_file).exists():
                found_dev_files.append(dev_file)

        dev_score = min(len(found_dev_files) * 0.2, 1.0)
        score += dev_score
        evidence.append(f"ملفات تكوين التطوير: {', '.join(found_dev_files)}")

        # فحص اختبارات
        test_files = (
            list(self.repo_path.rglob("test_*.py")) +
            list(self.repo_path.rglob("*test.py")) +
            list(self.repo_path.rglob("*.test.js")) +
            list(self.repo_path.rglob("*Test.java")) +
            list(self.repo_path.rglob("tests/*"))
        )

        if test_files:
            test_score = min(len(test_files) * 0.1, 1.5)
            score += test_score
            evidence.append(f"ملفات اختبار: {len(test_files)}")
        else:
            recommendations.append("إضافة اختبارات للكود")

        return ScoreCard(
            metric="Maintainability",
            score=min(score, 10.0),
            weight=self.weights[QualityMetric.MAINTAINABILITY],
            evidence=evidence,
            recommendations=recommendations
        )

    def assess_testing(self) -> ScoreCard:
        """تقييم الاختبارات"""
        score = 3.0  # نقطة بداية أقل للاختبارات
        evidence = []
        recommendations = []

        # فحص ملفات الاختبار
        test_patterns = [
            "test_*.py", "*_test.py", "*.test.js", "*.spec.js",
            "*Test.java", "*Tests.java", "*_test.go", "*test.php"
        ]

        all_test_files = []
        for pattern in test_patterns:
            all_test_files.extend(list(self.repo_path.rglob(pattern)))

        # حساب نسبة الاختبارات
        all_code_files = []
        code_patterns = ["*.py", "*.js", "*.java", "*.go", "*.php", "*.ts"]
        for pattern in code_patterns:
            all_code_files.extend(list(self.repo_path.rglob(pattern)))

        # تصفية ملفات الاختبار من ملفات الكود
        code_files = [f for f in all_code_files if f not in all_test_files]

        if code_files and all_test_files:
            test_ratio = len(all_test_files) / len(code_files)

            if test_ratio >= 0.8:
                score += 4.0
                evidence.append(f"تغطية اختبارات ممتازة: {test_ratio:.1%}")
            elif test_ratio >= 0.5:
                score += 3.0
                evidence.append(f"تغطية اختبارات جيدة: {test_ratio:.1%}")
            elif test_ratio >= 0.2:
                score += 1.5
                evidence.append(f"تغطية اختبارات أساسية: {test_ratio:.1%}")
            else:
                score += 0.5
                evidence.append(f"تغطية اختبارات منخفضة: {test_ratio:.1%}")
                recommendations.append("زيادة عدد الاختبارات")

        elif all_test_files:
            score += 2.0
            evidence.append(f"يوجد {len(all_test_files)} ملف اختبار")
        else:
            evidence.append("لا توجد اختبارات")
            recommendations.append("إضافة اختبارات شاملة")

        # فحص أطر عمل الاختبار
        test_frameworks = {
            "pytest": ["pytest", "conftest.py"],
            "unittest": ["unittest"],
            "jest": ["jest.config", "package.json"],
            "mocha": ["mocha", ".mocharc"],
            "junit": ["junit", "pom.xml"],
            "cypress": ["cypress.json", "cypress/"],
            "selenium": ["selenium"]
        }

        found_frameworks = []
        for framework, indicators in test_frameworks.items():
            for indicator in indicators:
                if list(self.repo_path.rglob(f"*{indicator}*")):
                    found_frameworks.append(framework)
                    break

        if found_frameworks:
            score += len(found_frameworks) * 0.5
            evidence.append(f"أطر اختبار: {', '.join(found_frameworks)}")

        # فحص ملفات تكوين التغطية
        coverage_files = list(self.repo_path.rglob(".coveragerc")) + \
                        list(self.repo_path.rglob("coverage.xml")) + \
                        list(self.repo_path.rglob("jest.config.js"))

        if coverage_files:
            score += 0.5
            evidence.append("تكوين قياس التغطية موجود")

        return ScoreCard(
            metric="Testing",
            score=min(score, 10.0),
            weight=self.weights[QualityMetric.TESTING],
            evidence=evidence,
            recommendations=recommendations
        )

    def assess_documentation(self) -> ScoreCard:
        """تقييم التوثيق"""
        score = 3.0
        evidence = []
        recommendations = []

        # فحص ملفات التوثيق الأساسية
        essential_docs = [
            ("README", ["README.md", "README.rst", "README.txt"]),
            ("CHANGELOG", ["CHANGELOG.md", "CHANGES.md", "HISTORY.md"]),
            ("LICENSE", ["LICENSE", "LICENSE.md", "LICENSE.txt"]),
            ("CONTRIBUTING", ["CONTRIBUTING.md", "CONTRIBUTING.rst"]),
            ("API Documentation", ["docs/api", "api.md", "API.md"])
        ]

        for doc_type, file_patterns in essential_docs:
            found = False
            for pattern in file_patterns:
                if list(self.repo_path.rglob(pattern)):
                    found = True
                    break

            if found:
                score += 1.0
                evidence.append(f"{doc_type} موجود")
            else:
                recommendations.append(f"إضافة {doc_type}")

        # فحص مجلد التوثيق المخصص
        docs_dirs = list(self.repo_path.rglob("docs/")) + \
                   list(self.repo_path.rglob("documentation/"))

        if docs_dirs:
            docs_files = []
            for docs_dir in docs_dirs:
                docs_files.extend(list(docs_dir.rglob("*.md")))
                docs_files.extend(list(docs_dir.rglob("*.rst")))

            if len(docs_files) >= 5:
                score += 1.5
                evidence.append(f"توثيق شامل: {len(docs_files)} ملف")
            elif len(docs_files) > 0:
                score += 0.5
                evidence.append(f"توثيق أساسي: {len(docs_files)} ملف")

        # فحص تعليقات الكود (docstrings/comments)
        documented_files = 0
        total_code_files = 0

        for code_file in self.repo_path.rglob("*.py"):
            if any(part.startswith('.') for part in code_file.parts):
                continue

            total_code_files += 1
            try:
                with open(code_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if '"""' in content or "'''" in content or "def " in content and "#" in content:
                        documented_files += 1
            except Exception:
                continue

        if total_code_files > 0:
            doc_ratio = documented_files / total_code_files
            if doc_ratio >= 0.7:
                score += 1.0
                evidence.append(f"نسبة توثيق الكود عالية: {doc_ratio:.1%}")
            elif doc_ratio >= 0.3:
                score += 0.5
                evidence.append(f"نسبة توثيق الكود متوسطة: {doc_ratio:.1%}")
            else:
                recommendations.append("زيادة تعليقات وtocstrings في الكود")

        return ScoreCard(
            metric="Documentation",
            score=min(score, 10.0),
            weight=self.weights[QualityMetric.DOCUMENTATION],
            evidence=evidence,
            recommendations=recommendations
        )

    def assess_performance(self) -> ScoreCard:
        """تقييم الأداء"""
        score = 5.0
        evidence = []
        recommendations = []

        # فحص تحسينات الأداء
        optimization_indicators = {
            "caching": ["cache", "redis", "memcached"],
            "database_optimization": ["index", "query_optimization", "orm"],
            "cdn": ["cdn", "cloudflare", "fastly"],
            "compression": ["gzip", "compression", "minify"],
            "async": ["async", "await", "promise", "concurrent"]
        }

        found_optimizations = []
        for opt_type, keywords in optimization_indicators.items():
            for keyword in keywords:
                if any(keyword in str(path).lower() for path in self.repo_path.rglob("*")):
                    found_optimizations.append(opt_type)
                    break

        if found_optimizations:
            score += len(found_optimizations) * 0.5
            evidence.append(f"تحسينات أداء: {', '.join(found_optimizations)}")

        # فحص ملفات قياس الأداء
        benchmark_files = (
            list(self.repo_path.rglob("*benchmark*")) +
            list(self.repo_path.rglob("*performance*")) +
            list(self.repo_path.rglob("*profiling*"))
        )

        if benchmark_files:
            score += 1.0
            evidence.append("ملفات قياس الأداء موجودة")
        else:
            recommendations.append("إضافة اختبارات قياس الأداء")

        # فحص استخدام أدوات مراقبة الأداء
        monitoring_tools = [
            "prometheus", "grafana", "newrelic", "datadog",
            "sentry", "bugsnag", "rollbar"
        ]

        found_monitoring = []
        for tool in monitoring_tools:
            if any(tool in str(path).lower() for path in self.repo_path.rglob("*")):
                found_monitoring.append(tool)

        if found_monitoring:
            score += 1.0
            evidence.append(f"أدوات مراقبة: {', '.join(found_monitoring)}")
        else:
            recommendations.append("إضافة أدوات مراقبة الأداء")

        return ScoreCard(
            metric="Performance",
            score=min(score, 10.0),
            weight=self.weights[QualityMetric.PERFORMANCE],
            evidence=evidence,
            recommendations=recommendations
        )

    def generate_risk_register(self, scorecards: List[ScoreCard]) -> List[RiskItem]:
        """إنتاج سجل المخاطر"""
        risks = []

        # مخاطر بناءً على الدرجات المنخفضة
        for scorecard in scorecards:
            if scorecard.score < 6.0:
                risk_level = RiskLevel.HIGH if scorecard.score < 4.0 else RiskLevel.MEDIUM

                risks.append(RiskItem(
                    id=f"RISK-{scorecard.metric.upper()}-001",
                    title=f"درجة منخفضة في {scorecard.metric}",
                    description=f"حصل معيار {scorecard.metric} على درجة {scorecard.score:.1f}/10",
                    category="quality",
                    probability=0.8,
                    impact=scorecard.weight * 10,
                    level=risk_level,
                    mitigation_strategies=scorecard.recommendations
                ))

        # مخاطر محددة

        # مخاطر الأمان
        security_score = next((s.score for s in scorecards if s.metric == "Security"), 5.0)
        if security_score < 7.0:
            risks.append(RiskItem(
                id="RISK-SECURITY-002",
                title="ثغرات أمنية محتملة",
                description="وجود مؤشرات على ضعف في الإجراءات الأمنية",
                category="security",
                probability=0.6,
                impact=9.0,
                level=RiskLevel.HIGH,
                mitigation_strategies=[
                    "إجراء مراجعة أمنية شاملة",
                    "تطبيق أفضل الممارسات الأمنية",
                    "استخدام أدوات فحص الثغرات"
                ]
            ))

        # مخاطر التبعيات الدورية
        circular_deps = self.assemble_data.get("circular_dependencies", [])
        if circular_deps:
            risks.append(RiskItem(
                id="RISK-ARCH-001",
                title="تبعيات دورية في المعمارية",
                description=f"وجود {len(circular_deps)} تبعية دورية قد تعقد الصيانة",
                category="architecture",
                probability=1.0,
                impact=6.0,
                level=RiskLevel.MEDIUM,
                mitigation_strategies=[
                    "إعادة هيكلة الكود لإزالة التبعيات الدورية",
                    "تطبيق مبادئ SOLID",
                    "استخدام Dependency Injection"
                ]
            ))

        # مخاطر قابلية التوسع
        scalability_score = next((s.score for s in scorecards if s.metric == "Scalability"), 5.0)
        if scalability_score < 6.0:
            risks.append(RiskItem(
                id="RISK-SCALE-001",
                title="قيود قابلية التوسع",
                description="المشروع قد يواجه صعوبات في التوسع",
                category="scalability",
                probability=0.7,
                impact=7.0,
                level=RiskLevel.MEDIUM,
                mitigation_strategies=[
                    "تطبيق containerization",
                    "تصميم معمارية microservices",
                    "استخدام load balancing"
                ]
            ))

        return risks

    def calculate_overall_score(self, scorecards: List[ScoreCard]) -> float:
        """حساب الدرجة الإجمالية"""
        total_weighted_score = sum(card.weighted_score for card in scorecards)
        total_weight = sum(card.weight for card in scorecards)

        if total_weight > 0:
            return total_weighted_score / total_weight
        return 0.0

    def generate_scorecard_report(self) -> Dict[str, Any]:
        """إنتاج تقرير بطاقة النتائج الشامل"""
        self.logger.info("📊 إنتاج تقرير بطاقة النتائج...")

        # تشغيل جميع التقييمات
        scorecards = [
            self.assess_architecture(),
            self.assess_code_quality(),
            self.assess_security(),
            self.assess_scalability(),
            self.assess_maintainability(),
            self.assess_testing(),
            self.assess_documentation(),
            self.assess_performance()
        ]

        # إنتاج سجل المخاطر
        risks = self.generate_risk_register(scorecards)

        # حساب الدرجة الإجمالية
        overall_score = self.calculate_overall_score(scorecards)

        # تصنيف المشروع
        if overall_score >= 8.5:
            grade = "ممتاز"
            readiness = "جاهز للإنتاج"
        elif overall_score >= 7.0:
            grade = "جيد جداً"
            readiness = "يحتاج تحسينات طفيفة"
        elif overall_score >= 5.5:
            grade = "جيد"
            readiness = "يحتاج تحسينات متوسطة"
        elif overall_score >= 4.0:
            grade = "مقبول"
            readiness = "يحتاج تحسينات كبيرة"
        else:
            grade = "ضعيف"
            readiness = "يحتاج إعادة هيكلة شاملة"

        report = {
            "summary": {
                "overall_score": round(overall_score, 2),
                "grade": grade,
                "readiness": readiness,
                "total_risks": len(risks),
                "high_risks": len([r for r in risks if r.level == RiskLevel.HIGH]),
                "assessment_date": json.dumps(None, default=str)  # سيتم استبدالها بالتاريخ الفعلي
            },
            "detailed_scores": [asdict(card) for card in scorecards],
            "risk_register": [asdict(risk) for risk in risks],
            "recommendations": {
                "immediate": [],
                "short_term": [],
                "long_term": []
            }
        }

        # تجميع التوصيات حسب الأولوية
        all_recommendations = []
        for card in scorecards:
            all_recommendations.extend(card.recommendations)

        # تصنيف التوصيات (بسيط - يمكن تحسينه)
        for rec in all_recommendations:
            if any(word in rec.lower() for word in ["أمان", "ثغرة", "حرج"]):
                report["recommendations"]["immediate"].append(rec)
            elif any(word in rec.lower() for word in ["اختبار", "توثيق", "تعليق"]):
                report["recommendations"]["short_term"].append(rec)
            else:
                report["recommendations"]["long_term"].append(rec)

        # إزالة التكرار
        for category in report["recommendations"]:
            report["recommendations"][category] = list(set(report["recommendations"][category]))

        return report

def main():
    """الدالة الرئيسية"""
    import sys
    from datetime import datetime

    if len(sys.argv) < 3:
        print("الاستخدام: python grade_assessment.py <repo_path> <output_dir>")
        sys.exit(1)

    repo_path = sys.argv[1]
    output_dir = sys.argv[2]

    assessor = QualityAssessor(repo_path, output_dir)
    report = assessor.generate_scorecard_report()

    # إضافة التاريخ الفعلي
    report["summary"]["assessment_date"] = datetime.now().isoformat()

    # حفظ التقرير
    output_path = Path(output_dir) / "artifacts/grade/scorecard.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    # طباعة ملخص
    print(f"✅ تم إنتاج تقرير التقييم")
    print(f"📊 الدرجة الإجمالية: {report['summary']['overall_score']}/10")
    print(f"🏆 التصنيف: {report['summary']['grade']}")
    print(f"⚠️ المخاطر العالية: {report['summary']['high_risks']}")
    print(f"📄 تم حفظ التقرير في: {output_path}")

if __name__ == "__main__":
    main()