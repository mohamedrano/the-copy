import { AgentType } from "../../types/agent.types";
import { CreativeBrief } from "../../types/session.types";

export class PromptBuilder {
  static buildAgentPrompt(
    agentType: AgentType,
    guideContent: string,
    context: {
      creativeBrief?: CreativeBrief;
      idea?: any;
      sessionData?: any;
      phase?: string;
    },
  ): string {
    const basePrompt = this.getBasePrompt(agentType, guideContent);
    const contextPrompt = this.buildContextPrompt(context);
    const taskPrompt = this.getTaskPrompt(agentType, context.phase);

    return `${basePrompt}\n\n${contextPrompt}\n\n${taskPrompt}`;
  }

  private static getBasePrompt(
    agentType: AgentType,
    guideContent: string,
  ): string {
    return `أنت ${this.getAgentName(agentType)} في نظام Jules للتطوير القصصي متعدد الوكلاء.

${guideContent}

يجب عليك:
1. اتباع دليلك المتخصص بدقة
2. تقديم تحليل عميق ومفصل
3. استخدام اللغة العربية في جميع استجاباتك
4. التركيز على الجودة والوضوح
5. تقديم توصيات قابلة للتنفيذ`;
  }

  private static buildContextPrompt(context: any): string {
    let contextPrompt = "## السياق الحالي:\n";

    if (context.creativeBrief) {
      contextPrompt += `\n### الموجز الإبداعي:
- الفكرة الأساسية: ${context.creativeBrief.coreIdea}
- النوع الأدبي: ${context.creativeBrief.genre}
- الجمهور المستهدف: ${context.creativeBrief.targetAudience || "غير محدد"}
- المواضيع: ${context.creativeBrief.themes.join(", ")}`;
    }

    if (context.idea) {
      contextPrompt += `\n### الفكرة المطروحة:
- العنوان: ${context.idea.title}
- المحتوى: ${context.idea.content}
- النوع: ${context.idea.genre}
- المواضيع: ${context.idea.themes?.join(", ") || "غير محدد"}`;
    }

    if (context.sessionData) {
      contextPrompt += `\n### بيانات الجلسة:
- حالة الجلسة: ${context.sessionData.status}
- المرحلة الحالية: ${context.sessionData.currentPhase}
- التقدم: ${context.sessionData.progress?.progress || 0}%`;
    }

    return contextPrompt;
  }

  private static getTaskPrompt(agentType: AgentType, phase?: string): string {
    const phaseTasks = {
      brief: "قم بتحليل الموجز الإبداعي وتقديم تقييم شامل",
      idea_generation: "قم بتطوير وتحسين الأفكار المولدة",
      review: "قم بمراجعة الفكرة المطروحة وتقديم تقييم مفصل",
      tournament: "قم بتحليل الحجج وتقديم رأي مدعوم",
      decision: "قم بتحليل جميع العوامل واتخاذ قرار مدروس",
    };

    const baseTask =
      phaseTasks[phase as keyof typeof phaseTasks] ||
      "قم بتنفيذ مهمتك المتخصصة";

    const specificTasks = {
      story_architect: "ركز على البنية السردية وتطوير الحبكة",
      realism_critic: "ركز على الواقعية والمنطق في القصة",
      strategic_analyst: "ركز على الإمكانات السوقية والاستراتيجية",
      character_development: "ركز على تطوير الشخصيات الرئيسية",
      character_expansion: "ركز على توسيع الشخصيات الثانوية",
      world_building: "ركز على بناء العالم والبيئة",
      dialogue_voice: "ركز على الحوار والأصوات المميزة",
      theme_agent: "ركز على الموضوعات والرسائل",
      genre_tone: "ركز على النوع الأدبي والأسلوب",
      pacing_agent: "ركز على الإيقاع والسرعة",
      conflict_tension: "ركز على الصراعات والتوتر",
    };

    return `${baseTask}. ${specificTasks[agentType]}.`;
  }

  private static getAgentName(agentType: AgentType): string {
    const names = {
      story_architect: "مهندس القصة",
      realism_critic: "ناقد الواقعية",
      strategic_analyst: "المحلل الاستراتيجي",
      character_development: "مطور الشخصيات",
      character_expansion: "موسع الشخصيات",
      world_building: "باني العالم",
      dialogue_voice: "خبير الحوار",
      theme_agent: "وكيل الموضوعات",
      genre_tone: "خبير النوع والأسلوب",
      pacing_agent: "وكيل الإيقاع",
      conflict_tension: "وكيل الصراع والتوتر",
    };

    return names[agentType] || agentType;
  }

  static buildIdeaGenerationPrompt(creativeBrief: CreativeBrief): string {
    return `بناءً على الموجز الإبداعي التالي، قم بتوليد فكرتين متكاملتين ومختلفتين:

## الموجز الإبداعي:
- الفكرة الأساسية: ${creativeBrief.coreIdea}
- النوع الأدبي: ${creativeBrief.genre}
- الجمهور المستهدف: ${creativeBrief.targetAudience || "غير محدد"}
- المواضيع: ${creativeBrief.themes.join(", ")}

## المتطلبات:
1. كل فكرة يجب أن تكون مكتملة ومفصلة
2. يجب أن تختلف الفكرتان في النهج أو التركيز
3. كل فكرة يجب أن تحتوي على:
   - عنوان جذاب
   - ملخص مفصل
   - الشخصيات الرئيسية
   - البنية السردية الأساسية
   - المواضيع الرئيسية
   - الإعداد والبيئة

## التنسيق المطلوب:
قدم كل فكرة في قسم منفصل مع العناوين التالية:
### الفكرة الأولى: [العنوان]
### الفكرة الثانية: [العنوان]

تأكد من أن كل فكرة مكتملة ومفصلة وقابلة للتطوير.`;
  }

  static buildReviewPrompt(
    agentType: AgentType,
    idea: any,
    guideContent: string,
  ): string {
    return `بصفتك ${this.getAgentName(agentType)}، قم بمراجعة الفكرة التالية وفقاً لدليلك المتخصص:

${guideContent}

## الفكرة المراجعة:
- العنوان: ${idea.title}
- المحتوى: ${idea.content}
- النوع: ${idea.genre}
- المواضيع: ${idea.themes?.join(", ") || "غير محدد"}

## مطلوب منك:
1. تقييم شامل للفكرة من منظور تخصصك
2. تحديد نقاط القوة والضعف
3. تقديم توصيات للتحسين
4. إعطاء درجات من 1-10 في:
   - الجودة العامة
   - الأصالة
   - التأثير
5. شرح مفصل لتقييمك

## تنسيق الاستجابة:
### التقييم العام: [درجة من 1-10]
### نقاط القوة: [قائمة مفصلة]
### نقاط الضعف: [قائمة مفصلة]
### التوصيات: [توصيات قابلة للتنفيذ]
### التبرير: [شرح مفصل لتقييمك]`;
  }

  static buildTournamentPrompt(
    agentType: AgentType,
    idea: any,
    previousArguments: any[],
    guideContent: string,
  ): string {
    return `بصفتك ${this.getAgentName(agentType)}، شارك في النقاش حول الفكرة التالية:

${guideContent}

## الفكرة المتنافسة:
- العنوان: ${idea.title}
- المحتوى: ${idea.content}
- النوع: ${idea.genre}

## الحجج المقدمة حتى الآن:
${arguments.map((arg, index) => `${index + 1}. ${arg.agentName}: ${arg.content}`).join("\n")}

## مطلوب منك:
1. قدم حجة قوية مدعومة بالأدلة
2. استخدم معرفتك المتخصصة
3. ارد على الحجج السابقة إذا لزم الأمر
4. كن مقنعاً ومفصلاً
5. اذكر سبب دعمك أو معارضتك للفكرة

## تنسيق الاستجابة:
### موقفي: [دعم/معارضة/محايد]
### حجتي: [حجة مفصلة ومدعومة]
### الأدلة: [أدلة من الفكرة أو المعرفة العامة]
### الرد على الحجج السابقة: [إذا لزم الأمر]`;
  }
}
