
import { GoogleGenAI, Type } from "@google/genai";
import { DistributionResult } from "../types";

// وظيفة آمنة للحصول على مفتاح الـ API لتجنب خطأ "process is not defined" في المتصفح
const getApiKey = () => {
  try {
    return typeof process !== 'undefined' ? process.env.API_KEY || '' : '';
  } catch {
    return '';
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const getSmartAdvice = async (data: DistributionResult) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      summary: "مفتاح الـ API غير متوفر حالياً. يرجى التأكد من إعدادات البيئة.",
      recommendations: ["يرجى إعداد مفتاح Google Gemini لاستخدام ميزة التحليل الذكي."],
      efficiencyScore: 0
    };
  }

  try {
    const specsDescription = data.specs.map(s => 
      `- تخصص ${s.name}: عدد المدربين ${s.trainersCount}، عدد المتدربين المقترح ${s.traineesCount} (${s.percentage}%).`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: `بصفتك خبير في الإدارة الأكاديمية والتقنية، قم بتحليل التوزيع التالي لقسم التقنية الميكانيكية:
      
      إجمالي المتدربين المستهدف: ${data.totalTrainees}
      إجمالي عدد المدربين: ${data.totalTrainers}
      متوسط نصيب المدرب: ${data.averageRatio.toFixed(2)} متدرب.

      تفاصيل التخصصات:
      ${specsDescription}

      حلل العبء التدريبي وقدم نصائح لتحسين الجودة التعليمية والعدالة في التوزيع بناءً على هذه الأرقام باللغة العربية.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "ملخص سريع للتحليل" },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "قائمة من التوصيات العملية"
            },
            efficiencyScore: { type: Type.NUMBER, description: "درجة الكفاءة المتوقعة من 0 إلى 100" }
          },
          required: ["summary", "recommendations", "efficiencyScore"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary: "حدث خطأ أثناء تحليل البيانات ذكياً. يرجى مراجعة التوزيع يدوياً وفقاً لمعايير القسم.",
      recommendations: ["تأكد من موازنة نصاب المدربين حسب اللوائح.", "راجع الطاقة الاستيعابية للقاعات والمعامل."],
      efficiencyScore: 50
    };
  }
};
