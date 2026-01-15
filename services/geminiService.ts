
import { GoogleGenAI, Type } from "@google/genai";
import { DistributionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartAdvice = async (data: DistributionResult) => {
  try {
    const specsDescription = data.specs.map(s => 
      `- تخصص ${s.name}: عدد المدربين ${s.trainersCount}، عدد المتدربين المقترح ${s.traineesCount} (${s.percentage}%).`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
      summary: "عذراً، حدث خطأ أثناء جلب النصائح الذكية. يرجى مراجعة التوزيع يدوياً.",
      recommendations: ["تأكد من عدم تجاوز النصاب التدريبي المعتمد.", "راجع خطة القبول السنوية بالتنسيق مع رؤساء التخصصات."],
      efficiencyScore: 0
    };
  }
};
