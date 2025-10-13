export enum TaskType {
  // الوظائف الأساسية المحدثة
  ANALYSIS = 'analysis',
  CREATIVE = 'creative',
  INTEGRATED = 'integrated',
  COMPLETION = 'completion',

  // وظائف تحليلية متقدمة موجودة
  RHYTHM_MAPPING = 'rhythm_mapping', // رسم خرائط الإيقاع الدرامي
  CHARACTER_NETWORK = 'character_network', // تحليل شبكات الشخصيات
  DIALOGUE_FORENSICS = 'dialogue_forensics', // تحليل الحوار الجنائي
  THEMATIC_MINING = 'thematic_mining', // التنقيب عن الموضوعات العميقة
  STYLE_FINGERPRINT = 'style_fingerprint', // بصمة الأسلوب الفريدة
  CONFLICT_DYNAMICS = 'conflict_dynamics', // ديناميكيات الصراع

  // وظائف إبداعية متطورة موجودة
  ADAPTIVE_REWRITING = 'adaptive_rewriting', // إعادة الكتابة التكيفية
  SCENE_GENERATOR = 'scene_generator', // مولد المشاهد الذكي
  CHARACTER_VOICE = 'character_voice', // محاكي صوت الشخصيات
  WORLD_BUILDER = 'world_builder', // باني العوالم الدرامية

  // وظائف تنبؤية وتوليدية موجودة
  PLOT_PREDICTOR = 'plot_predictor', // متنبئ مسار الحبكة
  TENSION_OPTIMIZER = 'tension_optimizer', // محسن التوتر الدرامي
  AUDIENCE_RESONANCE = 'audience_resonance', // محلل صدى الجمهور
  PLATFORM_ADAPTER = 'platform_adapter', // محول المنصات الذكي

  // --- الوحدات الجديدة (Units 3-11) ---
  // الوحدة 3: مُحلل الشخصيات العميق
  CHARACTER_DEEP_ANALYZER = 'character_deep_analyzer',
  // الوحدة 4: محلل الحوار المتطور
  DIALOGUE_ADVANCED_ANALYZER = 'dialogue_advanced_analyzer',
  // الوحدة 5: محلل السياق البصري والسينمائي
  VISUAL_CINEMATIC_ANALYZER = 'visual_cinematic_analyzer',
  // الوحدة 6: محلل الموضوعات والرسائل
  THEMES_MESSAGES_ANALYZER = 'themes_messages_analyzer',
  // الوحدة 7: محلل السياق الثقافي والتاريخي
  CULTURAL_HISTORICAL_ANALYZER = 'cultural_historical_analyzer',
  // الوحدة 8: محلل القابلية للإنتاج
  PRODUCIBILITY_ANALYZER = 'producibility_analyzer',
  // الوحدة 9: محلل الجمهور المستهدف
  TARGET_AUDIENCE_ANALYZER = 'target_audience_analyzer',
  // الوحدة 10: محلل الجودة الأدبية
  LITERARY_QUALITY_ANALYZER = 'literary_quality_analyzer',
  // الوحدة 11: مولد التوصيات والتحسينات
  RECOMMENDATIONS_GENERATOR = 'recommendations_generator',
}

export enum TaskCategory {
  CORE = 'المهام الأساسية',
  ANALYSIS = 'التحليلات',
  CREATIVE = 'الإبداع',
  PREDICTIVE = 'التنبؤ والتحسين',
  ADVANCED_MODULES = 'الوحدات المتخصصة'
}
