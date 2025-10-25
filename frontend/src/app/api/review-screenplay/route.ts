import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'النص قصير جداً للمراجعة' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'مفتاح API غير متوفر' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `أنت خبير في كتابة السيناريوهات العربية. قم بمراجعة النص التالي وقدم ملاحظات على:
1. استمرارية الحبكة
2. تطور الشخصيات
3. قوة الحوار
4. التناقضات في النص

قدم اقتراحات محددة لتحسين النص مع الحفاظ على الأسلوب العربي الأصيل.

النص:
${text}`;

    const result = await model.generateContent(prompt);
    const review = result.response.text();

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error('Error reviewing screenplay:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء المراجعة' },
      { status: 500 }
    );
  }
}
