
import { GoogleGenAI, Type } from "@google/genai";
import { DistributionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartAdvice = async (data: DistributionResult) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بصفتك خبير في الإدارة الأكاديمية والتقنية، قم بتحليل التوزيع التالي لقسم التقنية الميكانيكية:
      التخصص الأول: ${data.specAName}، عدد المدربين: ${Math.round(data.totalTrainers * (data.ratioA / 100))}، عدد المتدربين المقترح: ${data.specATrainees}.
      التخصص الثاني: ${data.specBName}، عدد المدربين: ${Math.round(data.totalTrainers * (data.ratioB / 100))}، عدد المتدربين المقترح: ${data.specBTrainees}.
      إجمالي المتدربين: ${data.totalTrainees}.
      حلل العبء التدريبي وقدم نصائح لتحسين الجودة التعليمية بناءً على هذه الأرقام باللغة العربية.`,
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
      recommendations: ["تأكد من عدم تجاوز نسبة 20 متدرب لكل مدرب.", "راجع خطة القبول السنوية."],
      efficiencyScore: 0
    };
  }
};
