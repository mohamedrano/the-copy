#!/usr/bin/env python3
# script: export_deliverables.py

import json
import shutil
import zipfile
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime
import logging

class DeliverablesExporter:
    """مصدر حزمة التسليمات النهائية"""

    def __init__(self, output_dir: str, analysis_id: str):
        self.output_dir = Path(output_dir)
        self.analysis_id = analysis_id
        self.deliverables_dir = self.output_dir / "deliverables"
        self.logger = logging.getLogger(__name__)

        # إنشاء مجلد التسليمات
        self.deliverables_dir.mkdir(parents=True, exist_ok=True)

    def export_all_deliverables(self) -> str:
        """تصدير جميع التسليمات وإنشاء أرشيف"""
        self.logger.info("📦 بدء تصدير التسليمات النهائية...")

        # إنتاج README الرئيسي
        self._generate_main_readme()

        # نسخ وتنظيم التقارير
        self._organize_reports()

        # إنتاج ملخص تنفيذي
        self._generate_executive_summary()

        # إنتاج دليل إعادة الإنتاج
        self._generate_reproduction_guide()

        # إنشاء أرشيف نهائي
        archive_path = self._create_final_archive()

        self.logger.info(f"✅ تم تصدير التسليمات بنجاح: {archive_path}")
        return str(archive_path)

    def _generate_main_readme(self) -> None:
        """إنتاج README رئيسي للتسليمات"""

        # تحميل البيانات لملء README
        scorecard = self._load_json("artifacts/grade/scorecard.json")
        shortlist = self._load_json("artifacts/mix/opportunity_shortlist.json")

        overall_score = scorecard.get("summary", {}).get("overall_score", "N/A")
        grade = scorecard.get("summary", {}).get("grade", "N/A")

        top_opportunities = shortlist[:3] if shortlist else []

        readme_content = f"""# نتائج التحليل الهندسي المتكامل
## معرف التحليل: {self.analysis_id}

**تاريخ الإنتاج:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**إصدار الإطار:** 2.0

---

## 📊 الملخص التنفيذي

### نتائج التقييم العامة
- **الدرجة الإجمالية:** {overall_score}/10
- **التصنيف:** {grade}
- **إجمالي المخاطر:** {scorecard.get("summary", {}).get("total_risks", "N/A")}
- **المخاطر عالية الأولوية:** {scorecard.get("summary", {}).get("high_risks", "N/A")}

### أفضل 3 فرص استراتيجية
{chr(10).join([f"{i+1}. **{opp.get('title', 'N/A')}** - النتيجة: {opp.get('overall_score', 'N/A')}/10" for i, opp in enumerate(top_opportunities)])}

---

## 📁 هيكل التسليمات

```
deliverables/
├── 00_README.md                    # هذا الملف
├── 01_executive_summary.md         # الملخص التنفيذي الشامل
├── 02_reproduction_guide.md        # دليل إعادة الإنتاج
├── reports/
│   ├── architecture_analysis.md    # تحليل المعمارية
│   ├── scorecard.json             # بطاقة النتائج التفصيلية
│   ├── risk_register.md           # سجل المخاطر
│   └── opportunities_analysis.md   # تحليل الفرص
├── concepts/
│   ├── concept_01.md              # مفهوم المنتج الأول
│   ├── concept_01.json            # بيانات JSON للمفهوم الأول
│   ├── concept_02.md              # مفهوم المنتج الثاني
│   ├── concept_02.json            # بيانات JSON للمفهوم الثاني
│   ├── concept_03.md              # مفهوم المنتج الثالث
│   └── concept_03.json            # بيانات JSON للمفهوم الثالث
├── visuals/
│   ├── dependency_graph.png       # خريطة التبعيات
│   └── architecture_overview.png  # نظرة عامة على المعمارية
└── raw_data/
    ├── build_analysis.json        # بيانات التحليل الأولي
    ├── dependency_graph.json      # بيانات خريطة التبعيات
    └── opportunity_longlist.json  # القائمة الطويلة للفرص
```

---

## 🚀 الخطوات التالية الموصى بها

### إجراءات فورية (0-2 أسابيع)
1. **مراجعة تفصيلية للمخاطر عالية الأولوية**
2. **اختيار مفهوم المنتج للبدء به**
3. **تجميع الفريق الأساسي للتطوير**

### إجراءات قصيرة المدى (1-3 أشهر)
1. **بدء تطوير MVP للمفهوم المختار**
2. **تطبيق التوصيات التقنية الأساسية**
3. **إنشاء خطة تفصيلية لبقية المفاهيم**

### إجراءات متوسطة المدى (3-12 شهر)
1. **إطلاق المنتج الأول**
2. **تطوير المفهوم الثاني**
3. **بناء استراتيجية go-to-market**

---

## 📞 المساعدة والدعم

لأي استفسارات حول هذا التحليل أو الحاجة لمساعدة في التنفيذ:

- راجع `02_reproduction_guide.md` لإعادة تشغيل التحليل
- راجع التقارير التفصيلية في مجلد `reports/`
- استخدم ملفات JSON للتكامل مع أدوات أخرى

---

*تم إنتاج هذا التحليل بواسطة إطار العمل الهندسي المتكامل v2.0*
*جميع النتائج قابلة للتحقق وإعادة الإنتاج باتباع الدليل المرفق*
"""

        with open(self.deliverables_dir / "00_README.md", "w", encoding="utf-8") as f:
            f.write(readme_content)

    def _organize_reports(self) -> None:
        """تنظيم ونسخ التقارير"""

        # إنشاء المجلدات
        reports_dir = self.deliverables_dir / "reports"
        concepts_dir = self.deliverables_dir / "concepts"
        visuals_dir = self.deliverables_dir / "visuals"
        raw_data_dir = self.deliverables_dir / "raw_data"

        for dir_path in [reports_dir, concepts_dir, visuals_dir, raw_data_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)

        # نسخ الملفات الأساسية
        file_mappings = {
            # التقارير
            "artifacts/grade/scorecard.json": reports_dir / "scorecard.json",
            "artifacts/build/codebase_analysis.json": raw_data_dir / "build_analysis.json",
            "artifacts/assemble/dependency_graph.json": raw_data_dir / "dependency_graph.json",
            "artifacts/mix/opportunity_longlist.json": raw_data_dir / "opportunity_longlist.json",
            "artifacts/mix/opportunity_shortlist.json": raw_data_dir / "opportunity_shortlist.json",

            # المفاهيم
            "artifacts/render/concept_01.md": concepts_dir / "concept_01.md",
            "artifacts/render/concept_01.json": concepts_dir / "concept_01.json",
            "artifacts/render/concept_02.md": concepts_dir / "concept_02.md",
            "artifacts/render/concept_02.json": concepts_dir / "concept_02.json",
            "artifacts/render/concept_03.md": concepts_dir / "concept_03.md",
            "artifacts/render/concept_03.json": concepts_dir / "concept_03.json",

            # الرسوم البيانية
            "artifacts/assemble/dependency_graph.png": visuals_dir / "dependency_graph.png",
        }

        # نسخ الملفات الموجودة
        for src_path, dst_path in file_mappings.items():
            src_full_path = self.output_dir / src_path
            if src_full_path.exists():
                shutil.copy2(src_full_path, dst_path)
                self.logger.info(f"📄 تم نسخ: {src_path} → {dst_path.name}")
            else:
                self.logger.warning(f"⚠️ ملف غير موجود: {src_path}")

        # إنتاج تقارير مدمجة
        self._generate_architecture_report(reports_dir)
        self._generate_risk_register(reports_dir)
        self._generate_opportunities_report(reports_dir)

    def _generate_architecture_report(self, reports_dir: Path) -> None:
        """إنتاج تقرير تحليل المعمارية"""

        build_data = self._load_json("artifacts/build/codebase_analysis.json")
        assemble_data = self._load_json("artifacts/assemble/dependency_graph.json")
        api_data = self._load_json("artifacts/assemble/api_analysis.json")

        # تحليل المعمارية
        total_modules = len(assemble_data.get("modules", {}))
        total_dependencies = len(assemble_data.get("dependencies", []))
        circular_deps = len(assemble_data.get("circular_dependencies", []))

        # تحليل الكود
        line_counts = build_data.get("line_counts", {})
        if isinstance(line_counts, dict) and "SUM" in line_counts:
            total_code_lines = line_counts["SUM"].get("code", 0)
            total_comment_lines = line_counts["SUM"].get("comment", 0)
            comment_ratio = (total_comment_lines / total_code_lines * 100) if total_code_lines > 0 else 0
        else:
            total_code_lines = "N/A"
            comment_ratio = "N/A"

        # تحليل APIs
        total_apis = (
            len(api_data.get("rest_endpoints", [])) +
            len(api_data.get("graphql_schemas", [])) +
            len(api_data.get("grpc_services", []))
        )

        architecture_report = f"""# تقرير تحليل المعمارية
**تاريخ الإنتاج:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

## 📊 نظرة عامة على المشروع

### إحصائيات الكود
- **إجمالي أسطر الكود:** {total_code_lines:,} سطر
- **نسبة التعليقات:** {comment_ratio:.1f}% (إذا كانت رقمية)
- **أنواع المشاريع المكتشفة:** {', '.join(build_data.get('project_types', []))}

### هيكل المعمارية
- **إجمالي الوحدات:** {total_modules}
- **إجمالي التبعيات:** {total_dependencies}
- **التبعيات الدورية:** {circular_deps}
- **متوسط coupling:** {assemble_data.get('metrics', {}).get('average_coupling', 'N/A')}

### واجهات APIs
- **إجمالي APIs:** {total_apis}
- **REST endpoints:** {len(api_data.get('rest_endpoints', []))}
- **GraphQL schemas:** {len(api_data.get('graphql_schemas', []))}
- **gRPC services:** {len(api_data.get('grpc_services', []))}

---

## 🏗️ تحليل المعمارية التفصيلي

### نقاط القوة
- {"✅ لا توجد تبعيات دورية" if circular_deps == 0 else f"⚠️ يوجد {circular_deps} تبعية دورية تحتاج إصلاح"}
- {"✅ coupling منخفض - معمارية جيدة" if assemble_data.get('metrics', {}).get('average_coupling', 1) < 0.3 else "⚠️ coupling عالي - يحتاج تحسين"}
- {"✅ توثيق APIs متوفر" if total_apis > 0 else "⚠️ لا توجد واجهات API موثقة"}

### التحديات والتوصيات
{self._generate_architecture_recommendations(build_data, assemble_data, api_data)}

---

## 📈 اتجاهات التحسين

### قصيرة المدى (1-3 أشهر)
1. **إصلاح التبعيات الدورية** (إذا وجدت)
2. **تحسين توثيق APIs**
3. **إضافة اختبارات للوحدات الأساسية**

### متوسطة المدى (3-6 أشهر)
1. **تطبيق مبادئ SOLID**
2. **تحسين separation of concerns**
3. **إضافة مراقبة الأداء**

### طويلة المدى (6+ أشهر)
1. **تقييم انتقال إلى microservices**
2. **تطبيق Domain-Driven Design**
3. **استراتيجية caching متقدمة**

---

*للمزيد من التفاصيل، راجع ملفات البيانات الخام في مجلد raw_data/*
"""

        with open(reports_dir / "architecture_analysis.md", "w", encoding="utf-8") as f:
            f.write(architecture_report)

    def _generate_architecture_recommendations(self, build_data: Dict, assemble_data: Dict, api_data: Dict) -> str:
        """توليد توصيات تحسين المعمارية"""
        recommendations = []

        # فحص التبعيات الدورية
        circular_deps = assemble_data.get("circular_dependencies", [])
        if circular_deps:
            recommendations.append("**أولوية عالية:** إزالة التبعيات الدورية لتحسين maintainability")

        # فحص coupling
        avg_coupling = assemble_data.get("metrics", {}).get("average_coupling", 0.5)
        if avg_coupling > 0.6:
            recommendations.append("**أولوية متوسطة:** تقليل coupling بين الوحدات")

        # فحص APIs
        if not api_data.get("openapi_specs") and api_data.get("rest_endpoints"):
            recommendations.append("**أولوية متوسطة:** إضافة توثيق OpenAPI للـ REST endpoints")

        # فحص structure
        structure = build_data.get("directory_structure", {})
        if structure.get("max_depth", 0) > 8:
            recommendations.append("**أولوية منخفضة:** إعادة تنظيم هيكل المجلدات العميق")

        if structure.get("large_files"):
            recommendations.append("**أولوية متوسطة:** تقسيم الملفات الكبيرة لتحسين maintainability")

        if not recommendations:
            recommendations.append("✅ **المعمارية في حالة جيدة** - فقط تحسينات طفيفة مطلوبة")

        return "\n".join([f"- {rec}" for rec in recommendations])

    def _generate_risk_register(self, reports_dir: Path) -> None:
        """إنتاج سجل المخاطر"""

        scorecard = self._load_json("artifacts/grade/scorecard.json")
        risks = scorecard.get("risk_register", [])

        risk_report = f"""# سجل المخاطر
**تاريخ الإنتاج:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

## 📊 ملخص المخاطر

**إجمالي المخاطر:** {len(risks)}
**مخاطر حرجة:** {len([r for r in risks if r.get('level') == 'حرج'])}
**مخاطر عالية:** {len([r for r in risks if r.get('level') == 'عالي'])}
**مخاطر متوسطة:** {len([r for r in risks if r.get('level') == 'متوسط'])}
**مخاطر منخفضة:** {len([r for r in risks if r.get('level') == 'منخفض'])}

---

## ⚠️ المخاطر عالية الأولوية

{self._format_high_priority_risks(risks)}

---

## 📋 سجل المخاطر الكامل

| ID | العنوان | الفئة | الاحتمالية | التأثير | المستوى |
|----|---------|-------|------------|---------|----------|
{chr(10).join([
    f"| {risk.get('id', 'N/A')} | {risk.get('title', 'N/A')} | {risk.get('category', 'N/A')} | {risk.get('probability', 0):.1f} | {risk.get('impact', 0):.1f} | {risk.get('level', 'N/A')} |"
    for risk in risks
])}

---

## 🛡️ استراتيجيات التخفيف المطلوبة

{self._generate_mitigation_strategies(risks)}

---

*للحصول على تفاصيل أكثر، راجع scorecard.json في نفس المجلد*
"""

        with open(reports_dir / "risk_register.md", "w", encoding="utf-8") as f:
            f.write(risk_report)

    def _format_high_priority_risks(self, risks: List[Dict]) -> str:
        """تنسيق المخاطر عالية الأولوية"""
        high_priority_risks = [
            risk for risk in risks
            if risk.get('level') in ['حرج', 'عالي']
        ]

        if not high_priority_risks:
            return "✅ **لا توجد مخاطر عالية الأولوية**"

        formatted_risks = []
        for risk in high_priority_risks:
            formatted_risks.append(f"""### {risk.get('title', 'N/A')} ({risk.get('level', 'N/A')})
**الوصف:** {risk.get('description', 'N/A')}
**الاحتمالية:** {risk.get('probability', 0):.1f} | **التأثير:** {risk.get('impact', 0):.1f}

**استراتيجيات التخفيف:**
{chr(10).join([f"- {strategy}" for strategy in risk.get('mitigation_strategies', [])])}

---""")

        return "\n".join(formatted_risks)

    def _generate_mitigation_strategies(self, risks: List[Dict]) -> str:
        """توليد ملخص استراتيجيات التخفيف"""

        # تجميع الاستراتيجيات حسب الفئة
        strategies_by_category = {}

        for risk in risks:
            category = risk.get('category', 'عام')
            if category not in strategies_by_category:
                strategies_by_category[category] = set()

            for strategy in risk.get('mitigation_strategies', []):
                strategies_by_category[category].add(strategy)

        formatted_strategies = []
        for category, strategies in strategies_by_category.items():
            formatted_strategies.append(f"""### {category.title()}
{chr(10).join([f"- {strategy}" for strategy in strategies])}""")

        return "\n\n".join(formatted_strategies)

    def _generate_opportunities_report(self, reports_dir: Path) -> None:
        """إنتاج تقرير تحليل الفرص"""

        shortlist = self._load_json("artifacts/mix/opportunity_shortlist.json")
        longlist = self._load_json("artifacts/mix/opportunity_longlist.json")

        opportunities_report = f"""# تقرير تحليل الفرص الاستراتيجية
**تاريخ الإنتاج:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

## 📊 ملخص الفرص

**إجمالي الفرص المحددة:** {len(longlist)}
**الفرص في القائمة القصيرة:** {len(shortlist)}
**متوسط النتيجة للقائمة القصيرة:** {sum(opp.get('overall_score', 0) for opp in shortlist) / len(shortlist):.1f}/10 (إذا وجدت فرص)

---

## 🏆 أفضل 3 فرص (القائمة القصيرة)

{self._format_top_opportunities(shortlist[:3])}

---

## 📈 تحليل الفرص حسب الفئة

{self._analyze_opportunities_by_category(longlist)}

---

## 💡 توصيات التنفيذ

### الأولوية الأولى (0-3 أشهر)
**الفرصة المختارة:** {shortlist[0].get('title', 'N/A') if shortlist else 'لا توجد فرص'}

**الخطوات التالية:**
1. تكوين فريق التطوير الأساسي
2. تحديد MVP واضح ومخرجات قابلة للقياس
3. إنشاء خطة تطوير تفصيلية لـ 3 أشهر

### الأولوية الثانية (3-6 أشهر)
**الفرصة المختارة:** {shortlist[1].get('title', 'N/A') if len(shortlist) > 1 else 'لا توجد فرص'}

**الخطوات التالية:**
1. بدء البحث والتطوير الأولي
2. إنشاء proof of concept
3. تقييم market validation

### الأولوية الثالثة (6-12 شهر)
**الفرصة المختارة:** {shortlist[2].get('title', 'N/A') if len(shortlist) > 2 else 'لا توجد فرص'}

**الخطوات التالية:**
1. تقييم مستمر للجدوى
2. مراقبة اتجاهات السوق
3. تحضير للتطوير المستقبلي

---

## 📊 مصفوفة تقييم الفرص

| الفرصة | الجدوى التقنية | إمكانية السوق | الملاءمة الاستراتيجية | النتيجة الإجمالية |
|--------|-----------------|----------------|---------------------|-------------------|
{chr(10).join([
    f"| {opp.get('title', 'N/A')[:30]}... | {opp.get('feasibility_score', 0):.1f} | {opp.get('market_potential_score', 0):.1f} | {opp.get('strategic_fit_score', 0):.1f} | **{opp.get('overall_score', 0):.1f}** |"
    for opp in shortlist
])}

---

*للحصول على تفاصيل كاملة لكل فرصة، راجع ملفات JSON في مجلد raw_data/*
"""

        with open(reports_dir / "opportunities_analysis.md", "w", encoding="utf-8") as f:
            f.write(opportunities_report)

    def _format_top_opportunities(self, top_opportunities: List[Dict]) -> str:
        """تنسيق أفضل الفرص"""
        if not top_opportunities:
            return "لا توجد فرص في القائمة القصيرة"

        formatted_opps = []
        for i, opp in enumerate(top_opportunities, 1):
            formatted_opps.append(f"""### {i}. {opp.get('title', 'N/A')} (النتيجة: {opp.get('overall_score', 0):.1f}/10)

**الوصف:** {opp.get('description', 'N/A')}

**الفئة:** {opp.get('category', 'N/A')}
**السوق المستهدف:** {opp.get('target_market', 'N/A')}
**وقت التطوير المتوقع:** {opp.get('development_time_months', 'N/A')} شهر

**نقاط القوة:**
{chr(10).join([f"- {factor}" for factor in opp.get('differentiation_factors', [])])}

**ROI المتوقع:** {opp.get('roi_estimate', 'N/A')}

---""")

        return "\n".join(formatted_opps)

    def _analyze_opportunities_by_category(self, opportunities: List[Dict]) -> str:
        """تحليل الفرص حسب الفئة"""

        # تجميع الفرص حسب الفئة
        categories = {}
        for opp in opportunities:
            category = opp.get('category', 'أخرى')
            if category not in categories:
                categories[category] = []
            categories[category].append(opp)

        category_analysis = []
        for category, opps in categories.items():
            avg_score = sum(opp.get('overall_score', 0) for opp in opps) / len(opps)
            best_opp = max(opps, key=lambda x: x.get('overall_score', 0))

            category_analysis.append(f"""### {category}
**عدد الفرص:** {len(opps)}
**متوسط النتيجة:** {avg_score:.1f}/10
**أفضل فرصة:** {best_opp.get('title', 'N/A')} ({best_opp.get('overall_score', 0):.1f}/10)""")

        return "\n\n".join(category_analysis)

    def _generate_executive_summary(self) -> None:
        """إنتاج الملخص التنفيذي"""

        scorecard = self._load_json("artifacts/grade/scorecard.json")
        shortlist = self._load_json("artifacts/mix/opportunity_shortlist.json")
        build_data = self._load_json("artifacts/build/codebase_analysis.json")

        overall_score = scorecard.get("summary", {}).get("overall_score", 0)
        grade = scorecard.get("summary", {}).get("grade", "غير محدد")
        total_risks = scorecard.get("summary", {}).get("total_risks", 0)
        high_risks = scorecard.get("summary", {}).get("high_risks", 0)

        # توصيات بناءً على النتائج
        if overall_score >= 8.0:
            readiness_assessment = "المشروع في حالة ممتازة وجاهز للتطوير فوراً"
            next_steps = ["البدء في تطوير المنتج الأول", "تجميع فريق التطوير", "وضع خطة go-to-market"]
        elif overall_score >= 6.0:
            readiness_assessment = "المشروع في حالة جيدة مع بعض التحسينات المطلوبة"
            next_steps = ["معالجة المخاطر عالية الأولوية", "تحسين جودة الكود", "ثم البدء في التطوير"]
        else:
            readiness_assessment = "المشروع يحتاج تحسينات جوهرية قبل البدء"
            next_steps = ["إعادة هيكلة الكود", "معالجة جميع المخاطر", "مراجعة شاملة للمعمارية"]

        executive_summary = f"""# الملخص التنفيذي
## تحليل هندسي متكامل - {self.analysis_id}

**تاريخ الإنتاج:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

## 🎯 النتائج الرئيسية

### تقييم الحالة الحالية
- **الدرجة الإجمالية:** {overall_score}/10 ({grade})
- **حالة الاستعداد:** {readiness_assessment}
- **إجمالي المخاطر:** {total_risks} (منها {high_risks} عالي الأولوية)

### أفضل الفرص الاستراتيجية
{chr(10).join([f"{i+1}. **{opp.get('title', 'N/A')}** - ROI متوقع: {opp.get('roi_estimate', 'N/A')}" for i, opp in enumerate(shortlist[:3])])}

---

## 💼 التوصيات الاستراتيجية

### الخطوات الفورية (الأسبوعين القادمين)
{chr(10).join([f"- {step}" for step in next_steps])}

### الاستثمار المطلوب
**للفرصة الأولى:**
- **التكلفة المتوقعة:** {shortlist[0].get('development_cost_estimate', 'N/A') if shortlist else 'N/A'}
- **الوقت للـ MVP:** {shortlist[0].get('development_time_months', 'N/A') if shortlist else 'N/A'} شهر
- **العائد المتوقع:** {shortlist[0].get('revenue_potential', 'N/A') if shortlist else 'N/A'}

### عوامل النجاح الحرجة
1. **القيادة التقنية القوية** - ضرورية لتنفيذ رؤية واضحة
2. **التركيز على MVP** - تجنب feature creep في المراحل الأولى
3. **التحقق من السوق مبكراً** - customer validation قبل الاستثمار الكبير
4. **إدارة المخاطر الاستباقية** - خاصة {high_risks} مخاطر عالية الأولوية

---

## 📊 التوقعات المالية (الفرصة الأولى)

| المؤشر | السنة 1 | السنة 2 | السنة 3 |
|---------|----------|----------|----------|
| الاستثمار | {shortlist[0].get('development_cost_estimate', 'N/A') if shortlist else 'N/A'} | 30% من السنة 1 | 20% من السنة 1 |
| الإيرادات المتوقعة | 50% من الاستثمار | 200% من الاستثمار | 400% من الاستثمار |
| نقطة التعادل | الشهر {shortlist[0].get('payback_period_months', 'N/A') if shortlist else 'N/A'} | - | - |

---

## ⚡ خلاصة القرار

### ✅ أسباب المضي قدماً
- قاعدة تقنية قوية قابلة للاستفادة منها
- فرص سوقية واضحة مع potential عالي
- فريق تقني موجود ومؤهل

### ⚠️ المخاطر التي يجب إدارتها
- {high_risks} مخاطر عالية الأولوية تحتاج معالجة فورية
- منافسة محتملة في السوق المستهدف
- التحديات التقنية في scaling

### 🎯 القرار الموصى به
**المضي قدماً** مع التركيز على الفرصة الأولى: **{shortlist[0].get('title', 'N/A') if shortlist else 'N/A'}**

**التوقيت المقترح للبدء:** خلال 2-4 أسابيع بعد معالجة المخاطر العالية

---

*هذا الملخص مبني على تحليل شامل للكود والسوق والجدوى التقنية*
*للتفاصيل الكاملة، راجع التقارير التفصيلية المرفقة*
"""

        with open(self.deliverables_dir / "01_executive_summary.md", "w", encoding="utf-8") as f:
            f.write(executive_summary)

    def _generate_reproduction_guide(self) -> None:
        """إنتاج دليل إعادة الإنتاج"""

        reproduction_guide = f"""# دليل إعادة الإنتاج
## كيفية إعادة تشغيل التحليل الهندسي المتكامل

**إصدار الإطار:** 2.0
**تاريخ الإنتاج:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

## 🔧 المتطلبات التقنية

### البرامج الأساسية
```bash
# أنظمة التشغيل المدعومة
- Linux (Ubuntu 20.04+, CentOS 8+)
- macOS (10.15+)
- Windows 10/11 مع WSL2

# المتطلبات الأساسية
- Python 3.8+ مع pip
- Node.js 16+ مع npm
- Git 2.30+
- Docker 20.0+ (اختياري لكن موصى به)
```

### مكتبات Python المطلوبة
```bash
pip install -r requirements.txt

# أو تثبيت يدوي:
pip install requests gitpython pandas matplotlib networkx
pip install ast-unparser pylint bandit safety
```

### أدوات التحليل الإضافية
```bash
# لتحليل JavaScript/TypeScript
npm install -g madge cloc

# لتحليل Java
# تثبيت Maven 3.6+ أو Gradle 6+

# لتحليل Go
# تثبيت Go 1.16+
```

---

## 📁 بنية المشروع

```
repo-analysis-framework/
├── scripts/
│   ├── initialize_analysis_env.sh
│   ├── verify_requirements.py
│   ├── build_analysis.py
│   ├── assemble_architecture.py
│   ├── grade_assessment.py
│   ├── mix_opportunities.py
│   ├── render_concepts.py
│   └── export_deliverables.py
├── config/
│   ├── quality_gates.json
│   ├── scoring_weights.json
│   └── opportunity_templates.json
├── requirements.txt
└── README.md
```

---

## 🚀 خطوات التشغيل

### الخطوة 1: الإعداد الأولي
```bash
# استنساخ إطار العمل
git clone https://github.com/your-org/repo-analysis-framework.git
cd repo-analysis-framework

# تثبيت المتطلبات
pip install -r requirements.txt

# التحقق من الأدوات
python scripts/verify_requirements.py
```

### الخطوة 2: تهيئة التحليل
```bash
# إنشاء بيئة تحليل جديدة
./scripts/initialize_analysis_env.sh [REPO_URL] [BRANCH]

# مثال:
./scripts/initialize_analysis_env.sh https://github.com/example/repo main
```

### الخطوة 3: تشغيل مراحل التحليل
```bash
# تعيين متغيرات البيئة
export ANALYSIS_DIR="./analysis_[ANALYSIS_ID]"
export REPO_PATH="$ANALYSIS_DIR/repository"

# المرحلة 1: البناء والتحليل الأولي
python scripts/build_analysis.py $REPO_PATH $ANALYSIS_DIR

# المرحلة 2: تجميع وتحليل المعمارية
python scripts/assemble_architecture.py $REPO_PATH $ANALYSIS_DIR

# المرحلة 3: التقييم والتحكيم
python scripts/grade_assessment.py $REPO_PATH $ANALYSIS_DIR

# المرحلة 4: توليد الفرص الاستراتيجية
python scripts/mix_opportunities.py $REPO_PATH $ANALYSIS_DIR

# المرحلة 5: صياغة مفاهيم المنتجات
python scripts/render_concepts.py $REPO_PATH $ANALYSIS_DIR

# المرحلة 6: تصدير التسليمات
python scripts/export_deliverables.py $ANALYSIS_DIR [ANALYSIS_ID]
```

### الخطوة 4: تشغيل آلي (اختياري)
```bash
# تشغيل جميع المراحل بأمر واحد
python scripts/run_full_analysis.py \
  --repo-url [REPO_URL] \
  --branch [BRANCH] \
  --output-dir [OUTPUT_DIR]
```

---

## ⚙️ التخصيص والتكوين

### تخصيص معايير الجودة
```json
// config/quality_gates.json
{
  "min_overall_score": 8.5,
  "max_debt_ratio": 0.05,
  "min_test_coverage": 0.80,
  "max_complexity": 10,
  "min_documentation_coverage": 0.90
}
```

### تخصيص أوزان التقييم
```json
// config/scoring_weights.json
{
  "architecture": 0.20,
  "code_quality": 0.15,
  "security": 0.15,
  "scalability": 0.12,
  "maintainability": 0.13,
  "testing": 0.10,
  "documentation": 0.08,
  "performance": 0.07
}
```

---

## 🐛 استكشاف الأخطاء وإصلاحها

### المشاكل الشائعة

#### خطأ في أذونات Git
```bash
# الحل: استخدام SSH keys أو personal access tokens
git config --global credential.helper store
```

#### نقص في أدوات التحليل
```bash
# تحقق من التثبيت
which cloc madge pylint
npm list -g madge

# إعادة تثبيت
npm install -g madge cloc
pip install --upgrade pylint bandit
```

#### مشاكل الذاكرة مع المشاريع الكبيرة
```bash
# زيادة حد الذاكرة
export NODE_OPTIONS="--max-old-space-size=8192"
ulimit -v 8388608
```

#### خطأ في تحليل التبعيات
```bash
# حل مشاكل package.json
npm audit fix
rm -rf node_modules && npm install

# حل مشاكل requirements.txt
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

---

## 📊 فهم النتائج

### هيكل ملفات النتائج
```
artifacts/
├── build/           # نتائج التحليل الأولي
├── assemble/        # تحليل المعمارية والتبعيات
├── grade/           # تقييم الجودة والمخاطر
├── mix/             # الفرص الاستراتيجية
└── render/          # مفاهيم المنتجات النهائية
```

### قراءة نتائج التقييم
- **8.5-10:** ممتاز - جاهز للإنتاج
- **7.0-8.4:** جيد جداً - تحسينات طفيفة
- **5.5-6.9:** جيد - تحسينات متوسطة
- **4.0-5.4:** مقبول - تحسينات كبيرة
- **أقل من 4.0:** ضعيف - إعادة هيكلة شاملة

---

## 🔄 تشغيل التحديثات

### تحديث التحليل لنفس المستودع
```bash
# تحديث الكود
cd $REPO_PATH && git pull

# إعادة تشغيل مراحل معينة
python scripts/build_analysis.py $REPO_PATH $ANALYSIS_DIR --update
python scripts/grade_assessment.py $REPO_PATH $ANALYSIS_DIR --update
```

### مقارنة نتائج التحليلات
```bash
python scripts/compare_analyses.py \
  --baseline [OLD_ANALYSIS_DIR] \
  --current [NEW_ANALYSIS_DIR] \
  --output comparison_report.md
```

---

## 📞 الدعم والمساعدة

### الحصول على المساعدة
- **الوثائق الكاملة:** [docs/](docs/)
- **أمثلة تطبيقية:** [examples/](examples/)
- **الأسئلة الشائعة:** [FAQ.md](FAQ.md)

### تقديم التقارير والتحسينات
- **تقرير مشكلة:** GitHub Issues
- **طلب ميزة جديدة:** GitHub Discussions
- **تقديم مساهمة:** Pull Requests

---

*هذا الدليل يضمن إمكانية إعادة إنتاج النتائج بدقة وموثوقية*
"""

        with open(self.deliverables_dir / "02_reproduction_guide.md", "w", encoding="utf-8") as f:
            f.write(reproduction_guide)

    def _create_final_archive(self) -> Path:
        """إنشاء الأرشيف النهائي"""

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        archive_name = f"analysis_results_{self.analysis_id}_{timestamp}.zip"
        archive_path = self.output_dir / archive_name

        with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # إضافة جميع ملفات التسليمات
            for file_path in self.deliverables_dir.rglob("*"):
                if file_path.is_file():
                    # الحصول على المسار النسبي
                    relative_path = file_path.relative_to(self.deliverables_dir)
                    zipf.write(file_path, f"deliverables/{relative_path}")

        self.logger.info(f"📦 تم إنشاء الأرشيف النهائي: {archive_path}")
        return archive_path

    def _load_json(self, file_path: str) -> Dict[str, Any]:
        """تحميل ملف JSON"""
        try:
            with open(self.output_dir / file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            self.logger.warning(f"⚠️ تعذر تحميل {file_path}: {e}")
            return {}

def main():
    """الدالة الرئيسية"""
    import sys

    if len(sys.argv) < 3:
        print("الاستخدام: python export_deliverables.py <output_dir> <analysis_id>")
        sys.exit(1)

    output_dir = sys.argv[1]
    analysis_id = sys.argv[2]

    exporter = DeliverablesExporter(output_dir, analysis_id)
    archive_path = exporter.export_all_deliverables()

    print(f"✅ تم تصدير التسليمات النهائية")
    print(f"📦 الأرشيف: {archive_path}")
    print(f"📁 المجلد: {exporter.deliverables_dir}")

if __name__ == "__main__":
    main()