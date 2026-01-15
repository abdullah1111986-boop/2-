
import React, { useState, useCallback, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { SpecializationData, DistributionResult, GeminiAdvice } from './types';
import { getSmartAdvice } from './services/geminiService';

// Icons as components for easier usage
const TrainerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const App: React.FC = () => {
  const [specA, setSpecA] = useState<SpecializationData>({ name: 'محركات ومركبات', trainersCount: 10 });
  const [specB, setSpecB] = useState<SpecializationData>({ name: 'التصنيع', trainersCount: 15 });
  const [totalTrainees, setTotalTrainees] = useState<number>(100);
  const [result, setResult] = useState<DistributionResult | null>(null);
  const [advice, setAdvice] = useState<GeminiAdvice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const calculateDistribution = useCallback(() => {
    const totalTrainers = specA.trainersCount + specB.trainersCount;
    if (totalTrainers === 0) return;

    const ratioA = (specA.trainersCount / totalTrainers);
    const ratioB = (specB.trainersCount / totalTrainers);

    const traineesA = Math.round(totalTrainees * ratioA);
    const traineesB = totalTrainees - traineesA; // Ensure sum is exactly totalTrainees

    const newResult: DistributionResult = {
      specAName: specA.name,
      specBName: specB.name,
      specATrainees: traineesA,
      specBTrainees: traineesB,
      specAPercentage: Math.round(ratioA * 100),
      specBPercentage: Math.round(ratioB * 100),
      totalTrainers,
      totalTrainees,
      ratioA: ratioA * 100,
      ratioB: ratioB * 100
    };

    setResult(newResult);
  }, [specA, specB, totalTrainees]);

  const handleGetAdvice = async () => {
    if (!result) return;
    setLoading(true);
    const aiAdvice = await getSmartAdvice(result);
    setAdvice(aiAdvice);
    setLoading(false);
  };

  // Initial calculation
  useEffect(() => {
    calculateDistribution();
  }, [calculateDistribution]);

  const COLORS = ['#3b82f6', '#10b981'];

  const chartData = result ? [
    { name: result.specAName, متدربون: result.specATrainees, مدربون: specA.trainersCount },
    { name: result.specBName, متدربون: result.specBTrainees, مدربون: specB.trainersCount },
  ] : [];

  const pieData = result ? [
    { name: result.specAName, value: result.specATrainees },
    { name: result.specBName, value: result.specBTrainees },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-blue-900 text-white py-8 px-6 shadow-lg mb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">منصة توزيع المتدربين العادلة</h1>
            <p className="text-blue-200 mt-2">قسم التقنية الميكانيكية - موازنة القبول بناءً على الكادر التدريبي</p>
          </div>
          <div className="bg-blue-800/50 p-4 rounded-lg border border-blue-700 backdrop-blur-sm">
            <span className="text-sm block text-blue-300">إجمالي المدربين</span>
            <span className="text-2xl font-bold">{specA.trainersCount + specB.trainersCount} مدرباً</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Inputs */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-blue-100 p-2 rounded-lg text-blue-600">⚙️</span>
              إعدادات القسم
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">إجمالي المتدربين المستهدف</label>
                <input 
                  type="number" 
                  value={totalTrainees} 
                  onChange={(e) => setTotalTrainees(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-semibold text-blue-800 mb-3">التخصص الأول</label>
                <input 
                  type="text" 
                  placeholder="اسم التخصص"
                  value={specA.name} 
                  onChange={(e) => setSpecA({...specA, name: e.target.value})}
                  className="w-full px-4 py-2 mb-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="flex items-center gap-3">
                  <input 
                    type="range" min="1" max="50"
                    value={specA.trainersCount} 
                    onChange={(e) => setSpecA({...specA, trainersCount: Number(e.target.value)})}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="w-12 text-center font-bold bg-blue-50 py-1 rounded-md">{specA.trainersCount}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-semibold text-green-800 mb-3">التخصص الثاني</label>
                <input 
                  type="text" 
                  placeholder="اسم التخصص"
                  value={specB.name} 
                  onChange={(e) => setSpecB({...specB, name: e.target.value})}
                  className="w-full px-4 py-2 mb-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
                />
                <div className="flex items-center gap-3">
                  <input 
                    type="range" min="1" max="50"
                    value={specB.trainersCount} 
                    onChange={(e) => setSpecB({...specB, trainersCount: Number(e.target.value)})}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <span className="w-12 text-center font-bold bg-green-50 py-1 rounded-md">{specB.trainersCount}</span>
                </div>
              </div>

              <button 
                onClick={calculateDistribution}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                تحديث الحسابات
              </button>
            </div>
          </div>

          {/* AI Advice Button Section */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-xl text-white">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span>✨</span> استشارة الذكاء الاصطناعي
            </h3>
            <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
              احصل على تحليل معمق وتوصيات بناءً على طاقة القسم الاستيعابية.
            </p>
            <button 
              onClick={handleGetAdvice}
              disabled={loading}
              className="w-full bg-white text-indigo-700 font-bold py-2 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري التحليل...' : 'تحليل التوزيع ذكياً'}
            </button>
          </div>
        </section>

        {/* Results & Visuals */}
        <section className="lg:col-span-2 space-y-8">
          {result && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-500 text-sm">{result.specAName}</p>
                      <h3 className="text-3xl font-bold mt-1">{result.specATrainees}</h3>
                      <p className="text-blue-600 text-sm font-medium">متدرباً ({result.specAPercentage}%)</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                       <TrainerIcon />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-emerald-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-500 text-sm">{result.specBName}</p>
                      <h3 className="text-3xl font-bold mt-1">{result.specBTrainees}</h3>
                      <p className="text-emerald-600 text-sm font-medium">متدرباً ({result.specBPercentage}%)</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                      <TrainerIcon />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-6">مخطط التوزيع المقارن</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="متدربون" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="مدربون" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
                  <h3 className="text-lg font-bold mb-4 w-full">نسبة المقاعد</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold mb-4">التفاصيل الفنية</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">متوسط المتدربين لكل مدرب</span>
                      <span className="font-bold">{(result.totalTrainees / result.totalTrainers).toFixed(1)} : 1</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(result.totalTrainees / result.totalTrainers) * 4}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic mt-4">
                      * تم حساب الأعداد بناءً على النسبة المئوية لعدد المدربين الفعليين في كل تخصص لضمان التوزيع العادل للحمل التدريبي.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* AI Insights Section */}
          {advice && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
                  <span className="text-indigo-600">🤖</span> تحليل الخبير الذكي
                </h3>
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-1 rounded-full border border-indigo-100">
                  <span className="text-sm font-semibold text-indigo-700">نقاط الكفاءة:</span>
                  <span className="text-lg font-bold text-indigo-800">{advice.efficiencyScore}%</span>
                </div>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <p className="text-slate-700 mb-6 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                  "{advice.summary}"
                </p>
                
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> توصيات استراتيجية:
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0">
                  {advice.recommendations.map((rec, idx) => (
                    <li key={idx} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 text-indigo-900 text-sm flex gap-3 items-start">
                      <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">{idx + 1}</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Button for Mobile Reset or Print */}
      <div className="fixed bottom-6 left-6 flex gap-3">
        <button 
          onClick={() => window.print()}
          className="bg-white text-slate-700 p-4 rounded-full shadow-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 font-bold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          <span className="hidden md:inline">طباعة التقرير</span>
        </button>
      </div>
    </div>
  );
};

export default App;
