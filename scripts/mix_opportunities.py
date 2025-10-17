#!/usr/bin/env python3
# script: mix_opportunities.py

import json
import math
from pathlib import Path
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import logging

class OpportunityCategory(Enum):
    """فئات الفرص"""
    PRODUCT_EXTENSION = "توسيع المنتج"
    NEW_MARKET = "سوق جديد"
    PLATFORM_PLAY = "منصة تقنية"
    DATA_MONETIZATION = "استثمار البيانات"
    INTERNAL_TOOLING = "أدوات داخلية"
    API_AS_SERVICE = "API كخدمة"
    INFRASTRUCTURE = "بنية تحتية"

@dataclass
class MarketOpportunity:
    """فرصة سوقية"""
    id: str
    title: str
    description: str
    category: OpportunityCategory

    # التحليل التقني
    leveraged_assets: List[str]
    new_components: List[str]
    technical_complexity: float  # 1-10
    development_time_months: int

    # التحليل السوقي
    target_market: str
    market_size_estimate: str
    competitive_landscape: str
    differentiation_factors: List[str]

    # التحليل المالي
    development_cost_estimate: str
    revenue_potential: str
    roi_estimate: str
    payback_period_months: int

    # تحليل المخاطر
    technical_risks: List[str]
    market_risks: List[str]
    mitigation_strategies: List[str]

    # مؤشرات التقييم
    feasibility_score: float  # 0-10
    market_potential_score: float  # 0-10
    strategic_fit_score: float  # 0-10
    overall_score: float  # 0-10

class OpportunityGenerator:
    """مولد الفرص الاستراتيجية"""

    def __init__(self, repo_path: str, output_dir: str):
        self.repo_path = Path(repo_path)
        self.output_dir = Path(output_dir)
        self.logger = logging.getLogger(__name__)

        # تحميل بيانات التحليل السابقة
        self.build_data = self._load_json("artifacts/build/codebase_analysis.json")
        self.assemble_data = self._load_json("artifacts/assemble/dependency_graph.json")
        self.api_data = self._load_json("artifacts/assemble/api_analysis.json")
        self.scorecard = self._load_json("artifacts/grade/scorecard.json")

        # استخراج الأصول القابلة للاستفادة
        self.leverageable_assets = self._identify_leverageable_assets()

    def _load_json(self, file_path: str) -> Dict[str, Any]:
        """تحميل ملف JSON"""
        try:
            with open(self.output_dir / file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            self.logger.warning(f"⚠️ تعذر تحميل {file_path}: {e}")
            return {}

    def _identify_leverageable_assets(self) -> Dict[str, List[str]]:
        """تحديد الأصول القابلة للاستفادة"""
        assets = {
            "data_models": [],
            "apis": [],
            "algorithms": [],
            "ui_components": [],
            "infrastructure": [],
            "business_logic": []
        }

        # استخراج نماذج البيانات
        modules = self.assemble_data.get("modules", {})
        for module_name, module_data in modules.items():
            if "model" in module_name.lower() or "entity" in module_name.lower():
                assets["data_models"].append(module_name)
            elif "service" in module_name.lower() or "controller" in module_name.lower():
                assets["business_logic"].append(module_name)
            elif "util" in module_name.lower() or "helper" in module_name.lower():
                assets["algorithms"].append(module_name)

        # استخراج APIs
        api_data = self.api_data
        if api_data.get("rest_endpoints"):
            assets["apis"].extend([f"REST: {ep['path']}" for ep in api_data["rest_endpoints"][:5]])
        if api_data.get("graphql_schemas"):
            assets["apis"].extend([f"GraphQL: {schema['file']}" for schema in api_data["graphql_schemas"]])
        if api_data.get("grpc_services"):
            assets["apis"].extend([f"gRPC: {service['file']}" for service in api_data["grpc_services"]])

        # استخراج مكونات البنية التحتية
        project_types = self.build_data.get("project_types", [])
        if "Docker" in project_types:
            assets["infrastructure"].append("Docker containerization")
        if "Kubernetes" in project_types:
            assets["infrastructure"].append("Kubernetes orchestration")
        if "GitHub Actions" in project_types:
            assets["infrastructure"].append("CI/CD pipeline")

        return assets

    def generate_opportunities(self) -> List[MarketOpportunity]:
        """توليد قائمة الفرص الاستراتيجية"""
        self.logger.info("🎯 توليد الفرص الاستراتيجية...")

        opportunities = []

        # توليد فرص مختلفة بناءً على الأصول المتاحة
        opportunities.extend(self._generate_api_opportunities())
        opportunities.extend(self._generate_data_opportunities())
        opportunities.extend(self._generate_platform_opportunities())
        opportunities.extend(self._generate_tooling_opportunities())
        opportunities.extend(self._generate_infrastructure_opportunities())

        # تقييم وترتيب الفرص
        evaluated_opportunities = []
        for opp in opportunities:
            evaluated_opp = self._evaluate_opportunity(opp)
            evaluated_opportunities.append(evaluated_opp)

        # ترتيب حسب النتيجة الإجمالية
        evaluated_opportunities.sort(key=lambda x: x.overall_score, reverse=True)

        return evaluated_opportunities

    def _generate_api_opportunities(self) -> List[MarketOpportunity]:
        """توليد فرص مبنية على APIs"""
        opportunities = []

        apis = self.leverageable_assets.get("apis", [])
        if not apis:
            return opportunities

        # فرصة 1: API Marketplace
        if len(apis) >= 3:
            opportunities.append(MarketOpportunity(
                id="API-MARKETPLACE-001",
                title="منصة APIs للمطورين",
                description="تحويل APIs الداخلية إلى منصة خدمات للمطورين الخارجيين",
                category=OpportunityCategory.API_AS_SERVICE,
                leveraged_assets=apis + self.leverageable_assets.get("business_logic", []),
                new_components=[
                    "نظام إدارة مفاتيح API",
                    "لوحة تحكم للمطورين",
                    "نظام billing ومراقبة الاستخدام",
                    "وثائق تفاعلية للAPI",
                    "SDK متعددة اللغات"
                ],
                technical_complexity=7.5,
                development_time_months=8,
                target_market="شركات التقنية والمطورين المستقلين",
                market_size_estimate="$50M - $200M سنوياً",
                competitive_landscape="منافسة متوسطة مع RapidAPI و Postman",
                differentiation_factors=[
                    "تخصص في المجال الحالي",
                    "جودة APIs مثبتة",
                    "دعم فني متخصص"
                ],
                development_cost_estimate="$300K - $500K",
                revenue_potential="$2M - $10M خلال 3 سنوات",
                roi_estimate="400% - 800%",
                payback_period_months=18,
                technical_risks=[
                    "تحديات في scalability عند زيادة المستخدمين",
                    "تعقيد إدارة versions متعددة",
                    "أمان وحماية البيانات"
                ],
                market_risks=[
                    "منافسة شديدة من اللاعبين الكبار",
                    "تغير احتياجات السوق",
                    "صعوبة اكتساب المطورين"
                ],
                mitigation_strategies=[
                    "بناء community قوي من المطورين",
                    "التركيز على niche markets",
                    "شراكات مع شركات التقنية"
                ],
                feasibility_score=0.0,  # سيتم حسابها
                market_potential_score=0.0,
                strategic_fit_score=0.0,
                overall_score=0.0
            ))

        # فرصة 2: API Analytics Platform
        if any("analytics" in api.lower() or "data" in api.lower() for api in apis):
            opportunities.append(MarketOpportunity(
                id="API-ANALYTICS-001",
                title="منصة تحليلات APIs",
                description="أداة مراقبة وتحليل أداء APIs للشركات",
                category=OpportunityCategory.PLATFORM_PLAY,
                leveraged_assets=apis + self.leverageable_assets.get("data_models", []),
                new_components=[
                    "محرك تحليل real-time",
                    "dashboards تفاعلية",
                    "نظام تنبيهات ذكي",
                    "تقارير أداء مخصصة",
                    "ML models للتنبؤ بالمشاكل"
                ],
                technical_complexity=8.0,
                development_time_months=10,
                target_market="شركات SaaS ومؤسسات التقنية",
                market_size_estimate="$100M - $500M سنوياً",
                competitive_landscape="منافسة مع Datadog و New Relic",
                differentiation_factors=[
                    "تحليلات متخصصة للAPIs",
                    "سهولة التكامل",
                    "ذكاء اصطناعي للتنبؤ"
                ],
                development_cost_estimate="$400K - $700K",
                revenue_potential="$5M - $20M خلال 3 سنوات",
                roi_estimate="500% - 1000%",
                payback_period_months=20,
                technical_risks=[
                    "معالجة كميات بيانات ضخمة",
                    "latency في التحليل real-time",
                    "دقة ML models"
                ],
                market_risks=[
                    "منافسة من عمالقة المراقبة",
                    "تشبع السوق",
                    "تغير في أولويات الشركات"
                ],
                mitigation_strategies=[
                    "التركيز على APIs المتخصصة",
                    "بناء integrations قوية",
                    "استراتيجية pricing مرنة"
                ],
                feasibility_score=0.0,
                market_potential_score=0.0,
                strategic_fit_score=0.0,
                overall_score=0.0
            ))

        return opportunities

    def _generate_data_opportunities(self) -> List[MarketOpportunity]:
        """توليد فرص مبنية على البيانات"""
        opportunities = []

        data_models = self.leverageable_assets.get("data_models", [])
        if not data_models:
            return opportunities

        # فرصة: Data-as-a-Service Platform
        opportunities.append(MarketOpportunity(
            id="DATA-SERVICE-001",
            title="منصة البيانات كخدمة",
            description="تحويل نماذج البيانات إلى خدمات بيانات قابلة للاشتراك",
            category=OpportunityCategory.DATA_MONETIZATION,
            leveraged_assets=data_models + self.leverageable_assets.get("business_logic", []),
            new_components=[
                "واجهة استعلام البيانات",
                "نظام subscription management",
                "data privacy وحماية البيانات",
                "real-time data streaming",
                "data quality monitoring"
            ],
            technical_complexity=7.0,
            development_time_months=6,
            target_market="شركات التجارة الإلكترونية وanalytical companies",
            market_size_estimate="$20M - $100M سنوياً",
            competitive_landscape="منافسة مع Snowflake وAWS Data Exchange",
            differentiation_factors=[
                "بيانات متخصصة ونظيفة",
                "APIs سهلة الاستخدام",
                "pricing مرن"
            ],
            development_cost_estimate="$200K - $400K",
            revenue_potential="$1M - $5M خلال 3 سنوات",
            roi_estimate="300% - 600%",
            payback_period_months=15,
            technical_risks=[
                "حماية خصوصية البيانات",
                "scalability للاستعلامات الكثيرة",
                "جودة البيانات باستمرار"
            ],
            market_risks=[
                "منافسة من منصات البيانات الكبيرة",
                "تغير في قوانين الخصوصية",
                "انخفاض الطلب على نوع البيانات"
            ],
            mitigation_strategies=[
                "التركيز على niche data markets",
                "بناء partnerships قوية",
                "الامتثال لمعايير الخصوصية العالمية"
            ],
            feasibility_score=0.0,
            market_potential_score=0.0,
            strategic_fit_score=0.0,
            overall_score=0.0
        ))

        return opportunities

    def _generate_platform_opportunities(self) -> List[MarketOpportunity]:
        """توليد فرص منصات تقنية"""
        opportunities = []

        # فحص إمكانية بناء منصة تطوير
        if self.leverageable_assets.get("infrastructure") and self.leverageable_assets.get("apis"):
            opportunities.append(MarketOpportunity(
                id="DEV-PLATFORM-001",
                title="منصة تطوير متكاملة",
                description="منصة low-code/no-code مبنية على الأصول الحالية",
                category=OpportunityCategory.PLATFORM_PLAY,
                leveraged_assets=(
                    self.leverageable_assets.get("infrastructure", []) +
                    self.leverageable_assets.get("apis", []) +
                    self.leverageable_assets.get("ui_components", [])
                ),
                new_components=[
                    "visual workflow builder",
                    "drag-and-drop UI designer",
                    "template marketplace",
                    "collaboration tools",
                    "deployment automation"
                ],
                technical_complexity=9.0,
                development_time_months=14,
                target_market="الشركات الصغيرة والمتوسطة، citizen developers",
                market_size_estimate="$500M - $2B سنوياً",
                competitive_landscape="منافسة قوية مع Bubble، Webflow، Zapier",
                differentiation_factors=[
                    "تكامل عميق مع APIs موجودة",
                    "أداء عالي مقارنة بالمنافسين",
                    "مرونة في التخصيص"
                ],
                development_cost_estimate="$800K - $1.5M",
                revenue_potential="$10M - $50M خلال 3 سنوات",
                roi_estimate="600% - 1200%",
                payback_period_months=24,
                technical_risks=[
                    "تعقيد في بناء visual builders",
                    "performance عند العمل مع تطبيقات معقدة",
                    "أمان في بيئة multi-tenant"
                ],
                market_risks=[
                    "منافسة شديدة من اللاعبين الكبار",
                    "سرعة تغير التقنيات",
                    "صعوبة في user acquisition"
                ],
                mitigation_strategies=[
                    "التركيز على industry-specific solutions",
                    "بناء ecosystem قوي من partners",
                    "استثمار كبير في UX/UI"
                ],
                feasibility_score=0.0,
                market_potential_score=0.0,
                strategic_fit_score=0.0,
                overall_score=0.0
            ))

        return opportunities

    def _generate_tooling_opportunities(self) -> List[MarketOpportunity]:
        """توليد فرص أدوات التطوير"""
        opportunities = []

        # فحص وجود أدوات داخلية قابلة للتحويل لمنتجات
        algorithms = self.leverageable_assets.get("algorithms", [])
        if algorithms:
            opportunities.append(MarketOpportunity(
                id="DEV-TOOLS-001",
                title="مجموعة أدوات التطوير",
                description="تحويل الأدوات الداخلية إلى منتجات للمطورين",
                category=OpportunityCategory.INTERNAL_TOOLING,
                leveraged_assets=algorithms + self.leverageable_assets.get("business_logic", []),
                new_components=[
                    "CLI tools موحدة",
                    "IDE plugins",
                    "documentation generator",
                    "testing framework",
                    "deployment helpers"
                ],
                technical_complexity=5.5,
                development_time_months=4,
                target_market="مطورين ومهندسين البرمجيات",
                market_size_estimate="$10M - $50M سنوياً",
                competitive_landscape="منافسة متوسطة في tools متخصصة",
                differentiation_factors=[
                    "تركيز على use cases محددة",
                    "سهولة الاستخدام",
                    "تكامل مع workflows موجودة"
                ],
                development_cost_estimate="$100K - $250K",
                revenue_potential="$500K - $3M خلال 3 سنوات",
                roi_estimate="200% - 500%",
                payback_period_months=12,
                technical_risks=[
                    "توافق مع environments مختلفة",
                    "صيانة عبر platforms متعددة",
                    "user adoption في مجتمع المطورين"
                ],
                market_risks=[
                    "ظهور أدوات مجانية منافسة",
                    "تغير في developer preferences",
                    "صعوبة في marketing للمطورين"
                ],
                mitigation_strategies=[
                    "open source core مع premium features",
                    "بناء community نشط",
                    "integrations مع أدوات شائعة"
                ],
                feasibility_score=0.0,
                market_potential_score=0.0,
                strategic_fit_score=0.0,
                overall_score=0.0
            ))

        return opportunities

    def _generate_infrastructure_opportunities(self) -> List[MarketOpportunity]:
        """توليد فرص البنية التحتية"""
        opportunities = []

        infrastructure = self.leverageable_assets.get("infrastructure", [])
        if infrastructure:
            opportunities.append(MarketOpportunity(
                id="INFRA-SERVICE-001",
                title="خدمات البنية التحتية المدارة",
                description="تقديم البنية التحتية الحالية كخدمة مدارة للشركات",
                category=OpportunityCategory.INFRASTRUCTURE,
                leveraged_assets=infrastructure,
                new_components=[
                    "control plane للإدارة",
                    "monitoring وalerts",
                    "auto-scaling mechanisms",
                    "backup وdisaster recovery",
                    "security hardening"
                ],
                technical_complexity=8.5,
                development_time_months=12,
                target_market="الشركات المتوسطة التي تحتاج managed infrastructure",
                market_size_estimate="$200M - $1B سنوياً",
                competitive_landscape="منافسة مع AWS، GCP، Azure",
                differentiation_factors=[
                    "تخصص في industry محدد",
                    "دعم فني متخصص",
                    "pricing أفضل للشركات المتوسطة"
                ],
                development_cost_estimate="$600K - $1M",
                revenue_potential="$3M - $15M خلال 3 سنوات",
                roi_estimate="300% - 700%",
                payback_period_months=20,
                technical_risks=[
                    "reliability وuptime requirements عالية",
                    "أمان في multi-tenant environment",
                    "scalability للعديد من العملاء"
                ],
                market_risks=[
                    "منافسة شديدة من cloud providers",
                    "race to the bottom في الأسعار",
                    "تغير rapid في التقنيات"
                ],
                mitigation_strategies=[
                    "التركيز على niche markets",
                    "value-added services",
                    "شراكات مع cloud providers"
                ],
                feasibility_score=0.0,
                market_potential_score=0.0,
                strategic_fit_score=0.0,
                overall_score=0.0
            ))

        return opportunities

    def _evaluate_opportunity(self, opportunity: MarketOpportunity) -> MarketOpportunity:
        """تقييم فرصة واحدة"""

        # تقييم الجدوى التقنية (Technical Feasibility)
        feasibility_factors = {
            "leveraged_assets_ratio": len(opportunity.leveraged_assets) / max(len(opportunity.leveraged_assets) + len(opportunity.new_components), 1),
            "technical_complexity_factor": (10 - opportunity.technical_complexity) / 10,
            "development_time_factor": max(0, (24 - opportunity.development_time_months) / 24),
            "existing_infrastructure": 1.0 if self.leverageable_assets.get("infrastructure") else 0.5
        }

        # حساب نتيجة الجدوى
        feasibility_score = (
            feasibility_factors["leveraged_assets_ratio"] * 3.0 +
            feasibility_factors["technical_complexity_factor"] * 2.5 +
            feasibility_factors["development_time_factor"] * 2.0 +
            feasibility_factors["existing_infrastructure"] * 2.5
        )

        # تقييم إمكانية السوق (Market Potential)
        market_size_multiplier = self._extract_market_size_score(opportunity.market_size_estimate)
        roi_multiplier = self._extract_roi_score(opportunity.roi_estimate)
        payback_factor = max(0, (36 - opportunity.payback_period_months) / 36)

        market_potential_score = (
            market_size_multiplier * 4.0 +
            roi_multiplier * 3.0 +
            payback_factor * 3.0
        )

        # تقييم الملاءمة الاستراتيجية (Strategic Fit)
        current_score = self.scorecard.get("summary", {}).get("overall_score", 5.0)
        score_factor = current_score / 10.0

        category_weights = {
            OpportunityCategory.API_AS_SERVICE: 0.9,
            OpportunityCategory.DATA_MONETIZATION: 0.8,
            OpportunityCategory.PLATFORM_PLAY: 0.95,
            OpportunityCategory.INTERNAL_TOOLING: 0.7,
            OpportunityCategory.INFRASTRUCTURE: 0.85,
            OpportunityCategory.NEW_MARKET: 0.6,
            OpportunityCategory.PRODUCT_EXTENSION: 0.8
        }

        category_weight = category_weights.get(opportunity.category, 0.7)
        risk_factor = max(0, (10 - len(opportunity.technical_risks) - len(opportunity.market_risks)) / 10)

        strategic_fit_score = (
            score_factor * 3.0 +
            category_weight * 4.0 +
            risk_factor * 3.0
        )

        # حساب النتيجة الإجمالية
        overall_score = (
            feasibility_score * 0.35 +
            market_potential_score * 0.4 +
            strategic_fit_score * 0.25
        )

        # تحديث الفرصة بالنتائج
        opportunity.feasibility_score = round(min(feasibility_score, 10.0), 2)
        opportunity.market_potential_score = round(min(market_potential_score, 10.0), 2)
        opportunity.strategic_fit_score = round(min(strategic_fit_score, 10.0), 2)
        opportunity.overall_score = round(min(overall_score, 10.0), 2)

        return opportunity

    def _extract_market_size_score(self, market_size_str: str) -> float:
        """استخراج نتيجة حجم السوق من النص"""
        # تحليل بسيط لنص حجم السوق
        if "$1B" in market_size_str or "$2B" in market_size_str:
            return 1.0
        elif "$500M" in market_size_str:
            return 0.9
        elif "$200M" in market_size_str:
            return 0.8
        elif "$100M" in market_size_str:
            return 0.7
        elif "$50M" in market_size_str:
            return 0.6
        elif "$20M" in market_size_str:
            return 0.5
        elif "$10M" in market_size_str:
            return 0.4
        else:
            return 0.3

    def _extract_roi_score(self, roi_str: str) -> float:
        """استخراج نتيجة ROI من النص"""
        # تحليل بسيط لنص ROI
        if "1000%" in roi_str or "1200%" in roi_str:
            return 1.0
        elif "800%" in roi_str:
            return 0.9
        elif "600%" in roi_str or "700%" in roi_str:
            return 0.8
        elif "500%" in roi_str:
            return 0.7
        elif "400%" in roi_str:
            return 0.6
        elif "300%" in roi_str:
            return 0.5
        elif "200%" in roi_str:
            return 0.4
        else:
            return 0.3

    def generate_shortlist(self, opportunities: List[MarketOpportunity], top_n: int = 5) -> List[MarketOpportunity]:
        """إنتاج القائمة القصيرة للفرص"""

        # ترتيب حسب النتيجة الإجمالية
        sorted_opportunities = sorted(opportunities, key=lambda x: x.overall_score, reverse=True)

        # أخذ أفضل N فرص
        shortlist = sorted_opportunities[:top_n]

        # التأكد من التنوع في الفئات
        categories_included = set()
        diverse_shortlist = []

        for opp in sorted_opportunities:
            if len(diverse_shortlist) >= top_n:
                break

            if opp.category not in categories_included or len(diverse_shortlist) < 3:
                diverse_shortlist.append(opp)
                categories_included.add(opp.category)

        return diverse_shortlist[:top_n]

def main():
    """الدالة الرئيسية"""
    import sys

    if len(sys.argv) < 3:
        print("الاستخدام: python mix_opportunities.py <repo_path> <output_dir>")
        sys.exit(1)

    repo_path = sys.argv[1]
    output_dir = sys.argv[2]

    generator = OpportunityGenerator(repo_path, output_dir)

    # توليد الفرص
    opportunities = generator.generate_opportunities()
    shortlist = generator.generate_shortlist(opportunities)

    # حفظ النتائج
    output_path = Path(output_dir) / "artifacts/mix"
    output_path.mkdir(parents=True, exist_ok=True)

    # حفظ القائمة الطويلة
    with open(output_path / "opportunity_longlist.json", "w", encoding="utf-8") as f:
        json.dump([asdict(opp) for opp in opportunities], f, indent=2, ensure_ascii=False)

    # حفظ القائمة القصيرة
    with open(output_path / "opportunity_shortlist.json", "w", encoding="utf-8") as f:
        json.dump([asdict(opp) for opp in shortlist], f, indent=2, ensure_ascii=False)

    # طباعة ملخص
    print(f"✅ تم توليد {len(opportunities)} فرصة")
    print(f"🎯 القائمة القصيرة: {len(shortlist)} فرص")
    print(f"🏆 أفضل فرصة: {shortlist[0].title} (نتيجة: {shortlist[0].overall_score})")

    print("\n📊 القائمة القصيرة:")
    for i, opp in enumerate(shortlist, 1):
        print(f"  {i}. {opp.title} - {opp.overall_score}/10")

if __name__ == "__main__":
    main()