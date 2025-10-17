#!/usr/bin/env python3
# script: render_concepts.py

import json
from pathlib import Path
from typing import Dict, List, Any
from dataclasses import dataclass
import logging
from datetime import datetime

@dataclass
class ProductConcept:
    """مفهوم منتج متكامل"""
    id: str
    title: str
    problem_statement: str
    vision: str
    value_propositions: List[str]

    # MVP Features
    mvp_epics: List[Dict[str, Any]]

    # Technical Approach
    leveraged_assets: List[str]
    new_components: List[str]
    technical_risks: List[str]
    mitigation_strategies: List[str]

    # Market Strategy
    target_market: str
    market_size: str
    competitive_analysis: str
    differentiation: List[str]

    # Business Model
    revenue_streams: List[str]
    cost_structure: List[str]
    pricing_strategy: str

    # Success Metrics
    kpis: List[Dict[str, str]]
    success_criteria: List[str]

    # Implementation Plan
    development_phases: List[Dict[str, Any]]
    timeline_months: int
    resource_requirements: Dict[str, Any]

    # Financial Projections
    financial_projections: Dict[str, Any]

class ConceptRenderer:
    """صائغ موجزات المفاهيم"""

    def __init__(self, repo_path: str, output_dir: str):
        self.repo_path = Path(repo_path)
        self.output_dir = Path(output_dir)
        self.logger = logging.getLogger(__name__)

        # تحميل البيانات السابقة
        self.shortlist = self._load_json("artifacts/mix/opportunity_shortlist.json")
        self.build_data = self._load_json("artifacts/build/codebase_analysis.json")
        self.scorecard = self._load_json("artifacts/grade/scorecard.json")

    def _load_json(self, file_path: str) -> List[Dict[str, Any]]:
        """تحميل ملف JSON"""
        try:
            with open(self.output_dir / file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            self.logger.warning(f"⚠️ تعذر تحميل {file_path}: {e}")
            return []

    def render_top_concepts(self, count: int = 3) -> List[ProductConcept]:
        """صياغة أفضل 3 مفاهيم منتجات"""
        self.logger.info(f"🎨 صياغة أفضل {count} مفاهيم منتجات...")

        concepts = []

        # أخذ أفضل فرص من القائمة القصيرة
        top_opportunities = self.shortlist[:count]

        for i, opportunity in enumerate(top_opportunities):
            concept = self._render_concept_from_opportunity(opportunity, i + 1)
            concepts.append(concept)

        return concepts

    def _render_concept_from_opportunity(self, opportunity: Dict[str, Any], concept_number: int) -> ProductConcept:
        """تحويل فرصة إلى مفهوم منتج متكامل"""

        # توليد MVPs مفصلة
        mvp_epics = self._generate_mvp_epics(opportunity)

        # توليد خطة التطوير
        development_phases = self._generate_development_phases(opportunity)

        # توليد التوقعات المالية
        financial_projections = self._generate_financial_projections(opportunity)

        # توليد KPIs
        kpis = self._generate_kpis(opportunity)

        concept = ProductConcept(
            id=f"CONCEPT-{concept_number:03d}",
            title=opportunity["title"],
            problem_statement=self._enhance_problem_statement(opportunity["description"]),
            vision=self._generate_vision_statement(opportunity),
            value_propositions=self._generate_value_propositions(opportunity),

            mvp_epics=mvp_epics,

            leveraged_assets=opportunity["leveraged_assets"],
            new_components=opportunity["new_components"],
            technical_risks=opportunity["technical_risks"],
            mitigation_strategies=opportunity["mitigation_strategies"],

            target_market=opportunity["target_market"],
            market_size=opportunity["market_size_estimate"],
            competitive_analysis=opportunity["competitive_landscape"],
            differentiation=opportunity["differentiation_factors"],

            revenue_streams=self._generate_revenue_streams(opportunity),
            cost_structure=self._generate_cost_structure(opportunity),
            pricing_strategy=self._generate_pricing_strategy(opportunity),

            kpis=kpis,
            success_criteria=self._generate_success_criteria(opportunity),

            development_phases=development_phases,
            timeline_months=opportunity["development_time_months"],
            resource_requirements=self._generate_resource_requirements(opportunity),

            financial_projections=financial_projections
        )

        return concept

    def _enhance_problem_statement(self, description: str) -> str:
        """تحسين بيان المشكلة"""
        enhanced_statements = {
            "API": """في عالم التطوير البرمجي اليوم، تواجه الشركات والمطورون تحديات متزايدة في:
            • العثور على APIs موثوقة وعالية الجودة لتسريع التطوير
            • ضمان استقرار وأداء APIs الخارجية في بيئات الإنتاج
            • إدارة تكاليف وعقود APIs المتعددة من موردين مختلفين
            • نقص الوثائق الشاملة والدعم التقني المتخصص

            هذا يؤدي إلى تأخير في المشاريع، زيادة في التكاليف، ومخاطر تقنية عالية.""",

            "Data": """الشركات الحديثة تولد كميات ضخمة من البيانات يومياً، لكنها تواجه:
            • صعوبة في استخراج قيمة حقيقية من البيانات المتراكمة
            • تكاليف عالية لبناء وصيانة أنظمة تحليل البيانات
            • نقص في الخبرات التقنية لتحليل البيانات المعقدة
            • تحديات في ضمان جودة وحداثة البيانات

            نتيجة لذلك، تضيع فرص استراتيجية هائلة وتتراجع القدرة التنافسية.""",

            "Platform": """المؤسسات تحتاج لتطوير تطبيقات وحلول رقمية بسرعة، لكنها تواجه:
            • نقص في المواهب التقنية المتخصصة
            • طول دورات التطوير التقليدية
            • تعقيد في دمج الأنظمة والخدمات المختلفة
            • صعوبة في الحفاظ على الجودة مع السرعة المطلوبة

            هذا يؤثر على القدرة على الاستجابة لمتطلبات السوق والعملاء."""
        }

        # اختيار البيان المناسب بناءً على نوع الفرصة
        for key, statement in enhanced_statements.items():
            if key.lower() in description.lower():
                return statement

        return f"تواجه الشركات في السوق الحالي تحديات كبيرة تتطلب حلول مبتكرة: {description}"

    def _generate_vision_statement(self, opportunity: Dict[str, Any]) -> str:
        """توليد بيان الرؤية"""
        title = opportunity["title"]
        category = opportunity.get("category", "")

        vision_templates = {
            "API": f"نرى مستقبلاً حيث {title} تمكن كل مطور ومؤسسة من الوصول إلى APIs عالية الجودة وموثوقة، مما يسرع الابتكار ويقلل التعقيد التقني.",

            "Data": f"رؤيتنا هي تحويل {title} إلى المصدر الأول للبيانات الذكية، حيث تستطيع كل شركة اتخاذ قرارات مبنية على بيانات دقيقة ومحدثة.",

            "Platform": f"نسعى لجعل {title} المنصة الرائدة التي تمكن أي شخص من بناء حلول رقمية متطورة دون الحاجة لخبرة تقنية عميقة.",

            "Tools": f"نهدف إلى أن يصبح {title} الأداة الأساسية في كل بيئة تطوير، مما يرفع إنتاجية المطورين ويحسن جودة البرمجيات."
        }

        # اختيار القالب المناسب
        for key, template in vision_templates.items():
            if key.lower() in category.lower() or key.lower() in title.lower():
                return template

        return f"نسعى لتطوير {title} لتصبح الحل الرائد في السوق، مما يخلق قيمة مستدامة لعملائنا وشركائنا."

    def _generate_value_propositions(self, opportunity: Dict[str, Any]) -> List[str]:
        """توليد القيم المقترحة"""
        base_props = [
            "تقليل وقت التطوير بنسبة 60-80% مقارنة بالحلول التقليدية",
            "ضمان جودة وموثوقية عالية مع uptime 99.9%+",
            "دعم فني متخصص ووثائق شاملة",
            "تكامل سلس مع الأنظمة والأدوات الموجودة"
        ]

        # إضافة قيم مخصصة بناءً على نوع الفرصة
        category = opportunity.get("category", "")

        if "API" in category:
            base_props.extend([
                "مكتبة شاملة من APIs المختبرة في بيئات إنتاج حقيقية",
                "نموذج تسعير مرن يناسب الشركات من جميع الأحجام",
                "أدوات مراقبة وتحليل متقدمة لاستخدام APIs"
            ])
        elif "Data" in category:
            base_props.extend([
                "بيانات نظيفة ومحدثة باستمرار مع ضمانات الجودة",
                "APIs سهلة الاستخدام للوصول للبيانات",
                "التزام كامل بمعايير الخصوصية والأمان"
            ])
        elif "Platform" in category:
            base_props.extend([
                "واجهة مستخدم بديهية لا تتطلب خبرة تقنية",
                "قوالب جاهزة لحالات الاستخدام الشائعة",
                "إمكانية التخصيص الكامل للاحتياجات المتقدمة"
            ])

        return base_props[:5]  # أفضل 5 قيم

    def _generate_mvp_epics(self, opportunity: Dict[str, Any]) -> List[Dict[str, Any]]:
        """توليد MVP Epics مفصلة"""
        base_epics = []
        category = opportunity.get("category", "")

        if "API" in category:
            base_epics = [
                {
                    "id": "MVP-API-001",
                    "title": "نظام إدارة APIs الأساسي",
                    "description": "بناء النواة الأساسية لإدارة وتوثيق APIs",
                    "user_stories": [
                        "كمطور، أريد تصفح كتالوج APIs المتاحة حتى أختار الأنسب لمشروعي",
                        "كمطور، أريد الحصول على مفتاح API بسهولة حتى أبدأ الاستخدام فوراً",
                        "كمطور، أريد رؤية وثائق شاملة لكل API حتى أفهم كيفية الاستخدام"
                    ],
                    "acceptance_criteria": [
                        "عرض قائمة بجميع APIs المتاحة مع تفاصيل كل API",
                        "نظام تسجيل وإدارة مفاتيح APIs",
                        "وثائق تفاعلية مع أمثلة عملية"
                    ],
                    "effort_estimate": "8-10 أسابيع",
                    "priority": "عالية"
                },
                {
                    "id": "MVP-API-002",
                    "title": "نظام المراقبة والتحليل",
                    "description": "مراقبة استخدام APIs وتحليل الأداء",
                    "user_stories": [
                        "كمدير منتج، أريد رؤية إحصائيات استخدام APIs حتى أفهم الأداء",
                        "كمطور، أريد تلقي تنبيهات عند حدوث مشاكل حتى أتعامل معها سريعاً",
                        "كمالك منتج، أريد تقارير تفصيلية عن الاستخدام حتى أخطط للمستقبل"
                    ],
                    "acceptance_criteria": [
                        "dashboard يعرض metrics في الوقت الفعلي",
                        "نظام تنبيهات قابل للتخصيص",
                        "تقارير دورية وإمكانية التصدير"
                    ],
                    "effort_estimate": "6-8 أسابيع",
                    "priority": "متوسطة"
                },
                {
                    "id": "MVP-API-003",
                    "title": "نظام الدفع والفوترة",
                    "description": "إدارة الاشتراكات والدفع حسب الاستخدام",
                    "user_stories": [
                        "كعميل، أريد اختيار خطة تسعير تناسب احتياجاتي",
                        "كعميل، أريد رؤية استهلاكي الحالي والفواتير السابقة",
                        "كإداري، أريد إدارة خطط التسعير والعروض الخاصة"
                    ],
                    "acceptance_criteria": [
                        "خطط تسعير متعددة (freemium, pay-per-use, enterprise)",
                        "فوترة تلقائية ونظام دفع آمن",
                        "لوحة تحكم للاستهلاك والفواتير"
                    ],
                    "effort_estimate": "10-12 أسبوع",
                    "priority": "عالية"
                }
            ]

        elif "Data" in category:
            base_epics = [
                {
                    "id": "MVP-DATA-001",
                    "title": "محرك استعلام البيانات",
                    "description": "نظام قوي لاستعلام ومعالجة البيانات",
                    "user_stories": [
                        "كمحلل بيانات، أريد استعلام البيانات بصيغ مختلفة حتى أحصل على المطلوب",
                        "كمطور، أريد APIs موثقة للوصول للبيانات حتى أدمجها في تطبيقي",
                        "كباحث، أريد تصدير البيانات بصيغ مختلفة حتى أحللها بأدوات أخرى"
                    ],
                    "acceptance_criteria": [
                        "محرك استعلام يدعم SQL وNoSQL",
                        "APIs RESTful وGraphQL للوصول للبيانات",
                        "تصدير بصيغ CSV, JSON, Parquet"
                    ],
                    "effort_estimate": "8-10 أسابيع",
                    "priority": "عالية"
                },
                {
                    "id": "MVP-DATA-002",
                    "title": "نظام ضمان جودة البيانات",
                    "description": "مراقبة وضمان جودة البيانات باستمرار",
                    "user_stories": [
                        "كمستخدم، أريد ضمان دقة البيانات التي أحصل عليها",
                        "كإداري، أريد مراقبة جودة البيانات والتنبه للمشاكل",
                        "كعميل، أريد تقارير شفافة عن جودة البيانات"
                    ],
                    "acceptance_criteria": [
                        "اختبارات جودة تلقائية للبيانات الجديدة",
                        "مؤشرات جودة واضحة لكل dataset",
                        "تنبيهات عند انخفاض الجودة"
                    ],
                    "effort_estimate": "6-8 أسابيع",
                    "priority": "عالية"
                },
                {
                    "id": "MVP-DATA-003",
                    "title": "لوحة تحكم التحليلات",
                    "description": "واجهة بصرية لاستكشاف وتحليل البيانات",
                    "user_stories": [
                        "كمحلل، أريد إنشاء مخططات وتصورات بسهولة",
                        "كمدير، أريد مشاركة التقارير مع الفريق",
                        "كمستخدم، أريد حفظ الاستعلامات المفضلة"
                    ],
                    "acceptance_criteria": [
                        "أدوات تصور تفاعلية",
                        "إمكانية مشاركة التقارير والdashboards",
                        "حفظ وإدارة الاستعلامات"
                    ],
                    "effort_estimate": "8-10 أسابيع",
                    "priority": "متوسطة"
                }
            ]

        elif "Platform" in category:
            base_epics = [
                {
                    "id": "MVP-PLAT-001",
                    "title": "محرر التطبيقات المرئي",
                    "description": "أداة drag-and-drop لبناء التطبيقات",
                    "user_stories": [
                        "كمستخدم بدون خبرة تقنية، أريد بناء تطبيق بسحب وإفلات المكونات",
                        "كمطور، أريد تخصيص المكونات الجاهزة حسب احتياجاتي",
                        "كمصمم، أريد التحكم في شكل ومظهر التطبيق"
                    ],
                    "acceptance_criteria": [
                        "واجهة drag-and-drop بديهية",
                        "مكتبة غنية من المكونات الجاهزة",
                        "إمكانية التخصيص والتحكم في التصميم"
                    ],
                    "effort_estimate": "12-14 أسبوع",
                    "priority": "عالية"
                },
                {
                    "id": "MVP-PLAT-002",
                    "title": "نظام إدارة البيانات",
                    "description": "إدارة قواعد البيانات والمحتوى بصرياً",
                    "user_stories": [
                        "كمستخدم، أريد إنشاء وإدارة قاعدة بيانات دون كتابة SQL",
                        "كمدير محتوى، أريد إضافة وتعديل البيانات بسهولة",
                        "كمطور، أريد ربط البيانات بالمكونات المرئية"
                    ],
                    "acceptance_criteria": [
                        "محرر schema مرئي",
                        "واجهة CMS لإدارة المحتوى",
                        "ربط تلقائي بين البيانات والواجهة"
                    ],
                    "effort_estimate": "10-12 أسبوع",
                    "priority": "عالية"
                },
                {
                    "id": "MVP-PLAT-003",
                    "title": "نظام النشر والاستضافة",
                    "description": "نشر التطبيقات تلقائياً مع استضافة مدارة",
                    "user_stories": [
                        "كمستخدم، أريد نشر تطبيقي بنقرة واحدة",
                        "كمطور، أريد خيارات نشر متقدمة وتحكم في البيئة",
                        "كمالك منتج، أريد مراقبة أداء التطبيق المنشور"
                    ],
                    "acceptance_criteria": [
                        "نشر تلقائي بخطوة واحدة",
                        "استضافة مدارة مع auto-scaling",
                        "مراقبة الأداء والتنبيهات"
                    ],
                    "effort_estimate": "8-10 أسابيع",
                    "priority": "عالية"
                }
            ]

        else:
            # Default epics for other categories
            base_epics = [
                {
                    "id": "MVP-GEN-001",
                    "title": "النواة الأساسية للمنتج",
                    "description": "بناء الوظائف الأساسية للمنتج",
                    "user_stories": [
                        "كمستخدم، أريد الوصول للوظائف الأساسية بسهولة",
                        "كمستخدم، أريد واجهة بديهية وسهلة الاستخدام"
                    ],
                    "acceptance_criteria": [
                        "تنفيذ الوظائف الأساسية",
                        "واجهة مستخدم نظيفة وبديهية"
                    ],
                    "effort_estimate": "8-10 أسابيع",
                    "priority": "عالية"
                },
                {
                    "id": "MVP-GEN-002",
                    "title": "نظام إدارة المستخدمين",
                    "description": "تسجيل وإدارة حسابات المستخدمين",
                    "user_stories": [
                        "كمستخدم، أريد إنشاء حساب وتسجيل الدخول بأمان",
                        "كإداري، أريد إدارة صلاحيات المستخدمين"
                    ],
                    "acceptance_criteria": [
                        "نظام تسجيل وتسجيل دخول آمن",
                        "إدارة الصلاحيات والأدوار"
                    ],
                    "effort_estimate": "4-6 أسابيع",
                    "priority": "عالية"
                },
                {
                    "id": "MVP-GEN-003",
                    "title": "نظام التقارير والتحليل",
                    "description": "مراقبة الاستخدام وتحليل الأداء",
                    "user_stories": [
                        "كمدير، أريد رؤية إحصائيات الاستخدام",
                        "كمستخدم، أريد تتبع نشاطي وإنجازاتي"
                    ],
                    "acceptance_criteria": [
                        "لوحة تحكم للإحصائيات",
                        "تقارير قابلة للتخصيص"
                    ],
                    "effort_estimate": "6-8 أسابيع",
                    "priority": "متوسطة"
                }
            ]

        return base_epics

    def _generate_development_phases(self, opportunity: Dict[str, Any]) -> List[Dict[str, Any]]:
        """توليد مراحل التطوير"""
        total_months = opportunity["development_time_months"]

        phases = [
            {
                "phase": "المرحلة الأولى: MVP",
                "duration_months": min(4, total_months // 2),
                "objectives": [
                    "بناء الوظائف الأساسية",
                    "إطلاق نسخة تجريبية محدودة",
                    "جمع feedback من المستخدمين الأوائل"
                ],
                "deliverables": [
                    "MVP قابل للاستخدام",
                    "وثائق المطورين الأساسية",
                    "نظام مراقبة أولي"
                ],
                "success_metrics": [
                    "10+ مستخدم نشط يومياً",
                    "معدل رضا > 7/10",
                    "صفر مشاكل أمنية حرجة"
                ]
            },
            {
                "phase": "المرحلة الثانية: التوسع",
                "duration_months": max(2, total_months // 3),
                "objectives": [
                    "إضافة ميزات متقدمة",
                    "تحسين الأداء والاستقرار",
                    "توسيع قاعدة المستخدمين"
                ],
                "deliverables": [
                    "ميزات إضافية حسب feedback",
                    "تحسينات الأداء",
                    "نظام دعم العملاء"
                ],
                "success_metrics": [
                    "100+ مستخدم نشط",
                    "معدل نمو شهري > 20%",
                    "uptime > 99.5%"
                ]
            },
            {
                "phase": "المرحلة الثالثة: النضج",
                "duration_months": max(2, total_months - (total_months // 2) - (total_months // 3)),
                "objectives": [
                    "تحسين تجربة المستخدم",
                    "تطوير ميزات enterprise",
                    "التحضير للإطلاق التجاري"
                ],
                "deliverables": [
                    "منتج جاهز للسوق",
                    "خطط تسعير متعددة",
                    "نظام billing متكامل"
                ],
                "success_metrics": [
                    "500+ مستخدم نشط",
                    "إيرادات شهرية > $10K",
                    "معدل بقاء > 80%"
                ]
            }
        ]

        return phases

    def _generate_financial_projections(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """توليد التوقعات المالية"""
        dev_cost = self._extract_cost(opportunity["development_cost_estimate"])

        projections = {
            "development_costs": {
                "year_0": dev_cost,
                "year_1": dev_cost * 0.3,  # صيانة وتحسينات
                "year_2": dev_cost * 0.2,
                "year_3": dev_cost * 0.15
            },
            "operational_costs": {
                "year_0": dev_cost * 0.2,  # infrastructure, marketing
                "year_1": dev_cost * 0.4,
                "year_2": dev_cost * 0.6,
                "year_3": dev_cost * 0.8
            },
            "revenue_projections": {
                "year_0": 0,
                "year_1": dev_cost * 0.5,   # تحفظي
                "year_2": dev_cost * 2.0,   # نمو
                "year_3": dev_cost * 4.0    # نضج
            },
            "break_even_month": opportunity["payback_period_months"],
            "roi_3_years": self._extract_roi_number(opportunity["roi_estimate"])
        }

        # حساب الربح الصافي
        for year in ["year_0", "year_1", "year_2", "year_3"]:
            total_costs = projections["development_costs"][year] + projections["operational_costs"][year]
            revenue = projections["revenue_projections"][year]
            projections[f"net_profit_{year}"] = revenue - total_costs

        return projections

    def _extract_cost(self, cost_str: str) -> int:
        """استخراج التكلفة من النص"""
        # تحويل نص التكلفة إلى رقم (بالآلاف)
        if "$1M" in cost_str or "$1.5M" in cost_str:
            return 1000
        elif "$700K" in cost_str or "$800K" in cost_str:
            return 750
        elif "$500K" in cost_str:
            return 500
        elif "$400K" in cost_str:
            return 400
        elif "$300K" in cost_str:
            return 300
        elif "$250K" in cost_str:
            return 250
        elif "$200K" in cost_str:
            return 200
        elif "$100K" in cost_str:
            return 100
        else:
            return 300  # default

    def _extract_roi_number(self, roi_str: str) -> float:
        """استخراج رقم ROI من النص"""
        if "1200%" in roi_str:
            return 12.0
        elif "1000%" in roi_str:
            return 10.0
        elif "800%" in roi_str:
            return 8.0
        elif "600%" in roi_str:
            return 6.0
        elif "500%" in roi_str:
            return 5.0
        elif "400%" in roi_str:
            return 4.0
        elif "300%" in roi_str:
            return 3.0
        elif "200%" in roi_str:
            return 2.0
        else:
            return 3.0  # default

    def _generate_revenue_streams(self, opportunity: Dict[str, Any]) -> List[str]:
        """توليد مصادر الإيرادات"""
        category = opportunity.get("category", "")

        base_streams = []

        if "API" in category:
            base_streams = [
                "اشتراكات شهرية حسب حجم الاستخدام (Freemium model)",
                "خطط Enterprise مع SLA مخصص",
                "عمولة على المعاملات المالية (إذا كان ذا صلة)",
                "خدمات التطوير والتكامل المخصص",
                "تدريب وشهادات للمطورين"
            ]
        elif "Data" in category:
            base_streams = [
                "اشتراكات حسب حجم البيانات المستهلكة",
                "بيع تقارير وتحليلات مخصصة",
                "خدمات استشارية لتحليل البيانات",
                "APIs premium للوصول real-time",
                "خدمات تنظيف وتحسين البيانات"
            ]
        elif "Platform" in category:
            base_streams = [
                "اشتراكات شهرية حسب عدد التطبيقات",
                "عمولة على المبيعات من marketplace",
                "خدمات الاستضافة المدارة",
                "قوالب وإضافات premium",
                "خدمات التطوير المخصص"
            ]
        else:
            base_streams = [
                "اشتراكات شهرية/سنوية",
                "نموذج freemium مع ميزات premium",
                "خدمات احترافية ودعم فني",
                "تراخيص للمؤسسات الكبيرة",
                "شراكات وعمولات"
            ]

        return base_streams

    def _generate_cost_structure(self, opportunity: Dict[str, Any]) -> List[str]:
        """توليد هيكل التكاليف"""
        return [
            "رواتب الفريق التقني والمنتج (60-70%)",
            "البنية التحتية والاستضافة (10-15%)",
            "التسويق واكتساب العملاء (15-20%)",
            "العمليات والدعم الفني (5-10%)",
            "تكاليف قانونية وامتثال (2-5%)",
            "R&D وتطوير ميزات جديدة (10-15%)"
        ]

    def _generate_pricing_strategy(self, opportunity: Dict[str, Any]) -> str:
        """توليد استراتيجية التسعير"""
        category = opportunity.get("category", "")

        if "API" in category:
            return """استراتيجية تسعير متدرجة:
            • طبقة مجانية: 1000 استدعاء/شهر
            • Starter: $29/شهر - 10K استدعاء
            • Professional: $99/شهر - 100K استدعاء
            • Enterprise: تسعير مخصص حسب الحجم والSLA"""

        elif "Data" in category:
            return """نموذج pay-as-you-go مع خصومات حجم:
            • $0.10 لكل GB للاستعلامات الأساسية
            • $0.25 لكل GB للتحليلات المتقدمة
            • خصومات تصل 50% للعقود السنوية
            • خطط Enterprise مخصصة للشركات الكبيرة"""

        elif "Platform" in category:
            return """نموذج freemium مع اشتراكات متدرجة:
            • طبقة مجانية: تطبيق واحد، ميزات محدودة
            • Pro: $49/شهر - 5 تطبيقات، ميزات متقدمة
            • Team: $149/شهر - تطبيقات غير محدودة، تعاون
            • Enterprise: تسعير مخصص، دعم dedicated"""

        else:
            return """استراتيجية تسعير value-based:
            • تحديد الأسعار بناءً على القيمة المقدمة للعميل
            • نماذج تسعير مرنة (اشتراك، استخدام، مختلط)
            • خصومات للعقود طويلة المدى
            • تسعير تنافسي مع value proposition واضح"""

    def _generate_kpis(self, opportunity: Dict[str, Any]) -> List[Dict[str, str]]:
        """توليد مؤشرات الأداء الرئيسية"""
        base_kpis = [
            {
                "category": "Product",
                "kpi": "Monthly Active Users (MAU)",
                "target": "نمو 25% شهرياً في السنة الأولى",
                "measurement": "تتبع تسجيل دخول وتفاعل المستخدمين"
            },
            {
                "category": "Business",
                "kpi": "Monthly Recurring Revenue (MRR)",
                "target": "$10K في الشهر 6، $50K في الشهر 12",
                "measurement": "إجمالي الإيرادات الشهرية المتكررة"
            },
            {
                "category": "Customer",
                "kpi": "Customer Acquisition Cost (CAC)",
                "target": "< 3 أضعاف Customer Lifetime Value",
                "measurement": "تكلفة التسويق ÷ العملاء الجدد"
            },
            {
                "category": "Product",
                "kpi": "Net Promoter Score (NPS)",
                "target": "> 50 (ممتاز)",
                "measurement": "استطلاعات دورية للعملاء"
            },
            {
                "category": "Technical",
                "kpi": "System Uptime",
                "target": "> 99.9%",
                "measurement": "مراقبة متواصلة للخدمات"
            }
        ]

        # إضافة KPIs مخصصة حسب النوع
        category = opportunity.get("category", "")

        if "API" in category:
            base_kpis.extend([
                {
                    "category": "Usage",
                    "kpi": "API Calls per Month",
                    "target": "1M استدعاء في الشهر 6",
                    "measurement": "إحصائيات استخدام APIs"
                },
                {
                    "category": "Quality",
                    "kpi": "API Response Time",
                    "target": "< 200ms للـ 95th percentile",
                    "measurement": "مراقبة performance مستمرة"
                }
            ])

        elif "Data" in category:
            base_kpis.extend([
                {
                    "category": "Usage",
                    "kpi": "Data Processing Volume",
                    "target": "10TB شهرياً في السنة الأولى",
                    "measurement": "حجم البيانات المعالجة"
                },
                {
                    "category": "Quality",
                    "kpi": "Data Quality Score",
                    "target": "> 95%",
                    "measurement": "اختبارات جودة تلقائية"
                }
            ])

        return base_kpis[:7]  # أفضل 7 مؤشرات

    def _generate_success_criteria(self, opportunity: Dict[str, Any]) -> List[str]:
        """توليد معايير النجاح"""
        return [
            f"تحقيق break-even خلال {opportunity['payback_period_months']} شهر",
            "الوصول لـ Product-Market Fit مع NPS > 50",
            "بناء فريق تقني قوي (5-10 أشخاص)",
            "تأمين جولة تمويل Series A (إذا لزم الأمر)",
            "إنشاء شراكات استراتيجية مع 3+ شركات",
            "الحصول على 100+ عميل يدفع في السنة الأولى",
            "بناء brand recognition في المجال المستهدف"
        ]

    def _generate_resource_requirements(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """توليد متطلبات الموارد"""
        complexity = opportunity["technical_complexity"]
        timeline = opportunity["development_time_months"]

        # حساب حجم الفريق بناءً على التعقيد والوقت
        if complexity >= 8:
            team_size = "8-12 شخص"
            tech_leads = 2
            developers = "4-6"
            specialists = "2-4"
        elif complexity >= 6:
            team_size = "5-8 أشخاص"
            tech_leads = 1
            developers = "3-4"
            specialists = "1-3"
        else:
            team_size = "3-5 أشخاص"
            tech_leads = 1
            developers = "2-3"
            specialists = "0-1"

        return {
            "team_size": team_size,
            "key_roles": {
                "Technical Lead/Architect": tech_leads,
                "Full-stack Developers": developers,
                "DevOps Engineer": 1,
                "Product Manager": 1,
                "UI/UX Designer": 1,
                "QA Engineer": 1,
                "Domain Specialists": specialists
            },
            "infrastructure": {
                "cloud_budget_monthly": "$500-2000 (يتزايد مع النمو)",
                "development_tools": "$100-300/شهر",
                "monitoring_services": "$200-500/شهر",
                "security_tools": "$100-400/شهر"
            },
            "external_services": {
                "legal_compliance": "$5K-15K للإعداد الأولي",
                "marketing_budget": "20-30% من الإيرادات المتوقعة",
                "accounting_services": "$200-500/شهر"
            }
        }

    def export_concepts(self, concepts: List[ProductConcept]) -> None:
        """تصدير المفاهيم إلى ملفات"""
        output_path = self.output_dir / "artifacts/render"
        output_path.mkdir(parents=True, exist_ok=True)

        for i, concept in enumerate(concepts, 1):
            # تصدير JSON
            json_data = {
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "version": "1.0",
                    "concept_id": concept.id
                },
                "concept": {
                    "id": concept.id,
                    "title": concept.title,
                    "problem_statement": concept.problem_statement,
                    "vision": concept.vision,
                    "value_propositions": concept.value_propositions,
                    "mvp_epics": concept.mvp_epics,
                    "technical_approach": {
                        "leveraged_assets": concept.leveraged_assets,
                        "new_components": concept.new_components,
                        "technical_risks": concept.technical_risks,
                        "mitigation_strategies": concept.mitigation_strategies
                    },
                    "market_strategy": {
                        "target_market": concept.target_market,
                        "market_size": concept.market_size,
                        "competitive_analysis": concept.competitive_analysis,
                        "differentiation": concept.differentiation
                    },
                    "business_model": {
                        "revenue_streams": concept.revenue_streams,
                        "cost_structure": concept.cost_structure,
                        "pricing_strategy": concept.pricing_strategy
                    },
                    "success_metrics": {
                        "kpis": concept.kpis,
                        "success_criteria": concept.success_criteria
                    },
                    "implementation": {
                        "development_phases": concept.development_phases,
                        "timeline_months": concept.timeline_months,
                        "resource_requirements": concept.resource_requirements,
                        "financial_projections": concept.financial_projections
                    }
                }
            }

            # حفظ JSON
            with open(output_path / f"concept_{i:02d}.json", "w", encoding="utf-8") as f:
                json.dump(json_data, f, indent=2, ensure_ascii=False)

            # إنتاج Markdown
            markdown_content = self._generate_markdown_report(concept)
            with open(output_path / f"concept_{i:02d}.md", "w", encoding="utf-8") as f:
                f.write(markdown_content)

        self.logger.info(f"✅ تم تصدير {len(concepts)} مفاهيم إلى: {output_path}")

    def _generate_markdown_report(self, concept: ProductConcept) -> str:
        """إنتاج تقرير Markdown للمفهوم"""

        # إنتاج جداول MVPs
        mvp_table = "\n".join([
            f"### {epic['title']}\n",
            f"**الوصف:** {epic['description']}\n",
            f"**تقدير المجهود:** {epic['effort_estimate']}\n",
            f"**الأولوية:** {epic['priority']}\n",
            "**User Stories:**",
            "\n".join([f"- {story}" for story in epic['user_stories']]),
            "\n**معايير القبول:**",
            "\n".join([f"- {criteria}" for criteria in epic['acceptance_criteria']]),
            "\n---\n"
        ] for epic in concept.mvp_epics)

        # إنتاج جدول KPIs
        kpi_table = "| الفئة | المؤشر | الهدف | طريقة القياس |\n|-------|--------|-------|-------------|\n"
        kpi_table += "\n".join([
            f"| {kpi['category']} | {kpi['kpi']} | {kpi['target']} | {kpi['measurement']} |"
            for kpi in concept.kpis
        ])

        # إنتاج جدول المراحل
        phases_content = "\n".join([
            f"### {phase['phase']}\n",
            f"**المدة:** {phase['duration_months']} شهر\n",
            "**الأهداف:**",
            "\n".join([f"- {obj}" for obj in phase['objectives']]),
            "\n**المخرجات:**",
            "\n".join([f"- {deliverable}" for deliverable in phase['deliverables']]),
            "\n**مؤشرات النجاح:**",
            "\n".join([f"- {metric}" for metric in phase['success_metrics']]),
            "\n"
        ] for phase in concept.development_phases)

        # إنتاج جدول التوقعات المالية
        financial_table = f"""| السنة | تكاليف التطوير | تكاليف التشغيل | الإيرادات المتوقعة | الربح الصافي |
|--------|-----------------|------------------|--------------------|--------------|
| السنة 0 | ${concept.financial_projections['development_costs']['year_0']:,} | ${concept.financial_projections['operational_costs']['year_0']:,} | ${concept.financial_projections['revenue_projections']['year_0']:,} | ${concept.financial_projections['net_profit_year_0']:,} |
| السنة 1 | ${concept.financial_projections['development_costs']['year_1']:,} | ${concept.financial_projections['operational_costs']['year_1']:,} | ${concept.financial_projections['revenue_projections']['year_1']:,} | ${concept.financial_projections['net_profit_year_1']:,} |
| السنة 2 | ${concept.financial_projections['development_costs']['year_2']:,} | ${concept.financial_projections['operational_costs']['year_2']:,} | ${concept.financial_projections['revenue_projections']['year_2']:,} | ${concept.financial_projections['net_profit_year_2']:,} |
| السنة 3 | ${concept.financial_projections['development_costs']['year_3']:,} | ${concept.financial_projections['operational_costs']['year_3']:,} | ${concept.financial_projections['revenue_projections']['year_3']:,} | ${concept.financial_projections['net_profit_year_3']:,} |"""

        markdown_content = f"""# {concept.title}
**ID:** {concept.id} | **تاريخ الإنتاج:** {datetime.now().strftime('%Y-%m-%d')}

---

## 📋 ملخص تنفيذي

{concept.vision}

### 🎯 القيم المقترحة
{chr(10).join([f"• {prop}" for prop in concept.value_propositions])}

---

## 🔍 تحليل المشكلة

{concept.problem_statement}

---

## 🚀 ميزات MVP الأساسية

{mvp_table}

---

## 🔧 النهج التقني

### الأصول المُعاد استخدامها
{chr(10).join([f"• {asset}" for asset in concept.leveraged_assets])}

### المكونات الجديدة المطلوبة
{chr(10).join([f"• {component}" for component in concept.new_components])}

### المخاطر التقنية
{chr(10).join([f"• {risk}" for risk in concept.technical_risks])}

### استراتيجيات التخفيف
{chr(10).join([f"• {strategy}" for strategy in concept.mitigation_strategies])}

---

## 📊 استراتيجية السوق

### السوق المستهدف
{concept.target_market}

### حجم السوق
{concept.market_size}

### تحليل المنافسة
{concept.competitive_analysis}

### عوامل التمايز
{chr(10).join([f"• {factor}" for factor in concept.differentiation])}

---

## 💰 النموذج التجاري

### مصادر الإيرادات
{chr(10).join([f"• {stream}" for stream in concept.revenue_streams])}

### هيكل التكاليف
{chr(10).join([f"• {cost}" for cost in concept.cost_structure])}

### استراتيجية التسعير
{concept.pricing_strategy}

---

## 📈 مؤشرات الأداء الرئيسية

{kpi_table}

### معايير النجاح
{chr(10).join([f"• {criteria}" for criteria in concept.success_criteria])}

---

## 🗓️ خطة التنفيذ

**إجمالي المدة:** {concept.timeline_months} شهر

{phases_content}

### متطلبات الموارد

**حجم الفريق:** {concept.resource_requirements['team_size']}

**الأدوار الأساسية:**
{chr(10).join([f"• {role}: {count}" for role, count in concept.resource_requirements['key_roles'].items()])}

---

## 💵 التوقعات المالية

{financial_table}

**نقطة التعادل:** {concept.financial_projections['break_even_month']} شهر
**ROI المتوقع خلال 3 سنوات:** {concept.financial_projections['roi_3_years']}x

---

## ⚠️ تحليل المخاطر

### المخاطر التقنية
{chr(10).join([f"• {risk}" for risk in concept.technical_risks])}

### استراتيجيات التخفيف
{chr(10).join([f"• {strategy}" for strategy in concept.mitigation_strategies])}

---

*تم إنتاج هذا التقرير آلياً بواسطة إطار العمل الهندسي المتكامل*"""

        return markdown_content

def main():
    """الدالة الرئيسية"""
    import sys

    if len(sys.argv) < 3:
        print("الاستخدام: python render_concepts.py <repo_path> <output_dir>")
        sys.exit(1)

    repo_path = sys.argv[1]
    output_dir = sys.argv[2]

    renderer = ConceptRenderer(repo_path, output_dir)
    concepts = renderer.render_top_concepts(3)
    renderer.export_concepts(concepts)

    print("✅ تم إنتاج مفاهيم المنتجات بنجاح")
    for i, concept in enumerate(concepts, 1):
        print(f"  {i}. {concept.title}")

if __name__ == "__main__":
    main()