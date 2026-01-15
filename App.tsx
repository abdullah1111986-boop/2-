
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Settings, Users, Briefcase, BarChart3, PieChart as PieIcon, Sparkles, Printer, RefreshCcw, UserCheck, 
  TrendingUp, Activity, ChevronRight, Calculator, Plus, Trash2, FileText, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpecializationData, DistributionResult, GeminiAdvice, SpecializationResult } from './types';
import { getSmartAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [specs, setSpecs] = useState<SpecializationData[]>([
    { id: '1', name: 'محركات ومركبات', trainersCount: 12 },
    { id: '2', name: 'التصنيع', trainersCount: 18 }
  ]);
  const [totalTrainees, setTotalTrainees] = useState<number>(120);
  const [result, setResult] = useState<DistributionResult | null>(null);
  const [advice, setAdvice] = useState<GeminiAdvice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const addSpecialization = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setSpecs([...specs, { id: newId, name: `تخصص جديد ${specs.length + 1}`, trainersCount: 10 }]);
  };

  const removeSpecialization = (id: string) => {
    if (specs.length <= 1) return;
    setSpecs(specs.filter(s => s.id !== id));
  };

  const updateSpec = (id: string, field: keyof SpecializationData, value: any) => {
    setSpecs(specs.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculateDistribution = useCallback(() => {
    const totalTrainers = specs.reduce((acc, curr) => acc + curr.trainersCount, 0);
    if (totalTrainers === 0) return;

    let remainingTrainees = totalTrainees;
    const specResults: SpecializationResult[] = specs.map((spec, index) => {
      const ratio = spec.trainersCount / totalTrainers;
      let count = Math.round(totalTrainees * ratio);
      if (index === specs.length - 1) {
        count = remainingTrainees;
      } else {
        remainingTrainees -= count;
      }
      return {
        id: spec.id,
        name: spec.name,
        traineesCount: count,
        percentage: Math.round(ratio * 100),
        trainersCount: spec.trainersCount
      };
    });

    setResult({
      specs: specResults,
      totalTrainers,
      totalTrainees,
      averageRatio: totalTrainees / totalTrainers
    });
  }, [specs, totalTrainees]);

  const handleGetAdvice = async () => {
    if (!result) return;
    setLoading(true);
    const aiAdvice = await getSmartAdvice(result);
    setAdvice(aiAdvice);
    setLoading(false);
  };

  const downloadPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const opt = {
      margin: 0,
      filename: `تقرير_توزيع_المتدربين_${new Date().toLocaleDateString('ar-SA')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // @ts-ignore
    window.html2pdf().from(element).set(opt).save();
  };

  useEffect(() => {
    calculateDistribution();
  }, [calculateDistribution]);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const chartData = result?.specs.map(s => ({ name: s.name, متدربون: s.traineesCount, مدربون: s.trainersCount })) || [];
  const pieData = result?.specs.map(s => ({ name: s.name, value: s.traineesCount })) || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-['Tajawal']">
      
      {/* Hidden PDF Report Template */}
      <div id="pdf-report" ref={reportRef} dir="rtl">
        <div className="border-[3px] border-slate-900 p-8 min-h-[280mm] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900">التقرير الفني لتوزيع القبول</h1>
              <p className="text-sm font-bold text-slate-500">قسم التقنية الميكانيكية - الكلية التقنية</p>
              <p className="text-xs text-slate-400">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            <div className="text-left bg-slate-900 text-white p-3 rounded-lg">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">إجمالي المستهدف</p>
              <p className="text-xl font-black">{totalTrainees} متدرب</p>
            </div>
          </div>

          {/* Section: Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 mb-1">إجمالي المدربين</p>
              <p className="text-lg font-black">{result?.totalTrainers}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 mb-1">متوسط النصاب</p>
              <p className="text-lg font-black">{result?.averageRatio.toFixed(1)} ط/م</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 mb-1">عدد التخصصات</p>
              <p className="text-lg font-black">{specs.length}</p>
            </div>
          </div>

          {/* Section: Table */}
          <div className="mb-6">
            <h3 className="text-sm font-black mb-3 border-r-4 border-blue-600 pr-2">جدول توزيع المقاعد المعتمد</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="p-2 border border-slate-200 text-right">التخصص</th>
                  <th className="p-2 border border-slate-200 text-center">عدد المدربين</th>
                  <th className="p-2 border border-slate-200 text-center">النسبة المئوية</th>
                  <th className="p-2 border border-slate-200 text-center">المقاعد المخصصة</th>
                </tr>
              </thead>
              <tbody>
                {result?.specs.map((s, i) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-200 font-bold">{s.name}</td>
                    <td className="p-2 border border-slate-200 text-center">{s.trainersCount}</td>
                    <td className="p-2 border border-slate-200 text-center">{s.percentage}%</td>
                    <td className="p-2 border border-slate-200 text-center font-black text-blue-700">{s.traineesCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section: Charts Side-by-Side */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 border border-slate-200 rounded-xl h-64">
              <p className="text-xs font-bold text-center mb-4">توزيع المقاعد حسب التخصص</p>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{fontSize: 8}} />
                  <YAxis tick={{fontSize: 8}} />
                  <Bar dataKey="متدربون" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-xl h-64">
              <p className="text-xs font-bold text-center mb-4">النسب المئوية الإجمالية</p>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie data={pieData} innerRadius={35} outerRadius={55} dataKey="value">
                    {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section: AI Advice */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex-grow">
            <h3 className="text-sm font-black text-indigo-900 mb-3 flex items-center gap-2">
              <Sparkles size={16} /> التوصيات الاستراتيجية والتحليل الفني
            </h3>
            {advice ? (
              <div className="space-y-4">
                <p className="text-xs leading-relaxed text-indigo-900 font-medium text-justify">{advice.summary}</p>
                <div className="grid grid-cols-2 gap-3">
                  {advice.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2 items-start text-[10px] text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0 font-bold text-indigo-600">{i+1}</div>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-indigo-400 text-center py-8">يرجى الضغط على "طلب استشارة Gemini" في الواجهة الرئيسية لتضمين التحليل الذكي هنا.</p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center opacity-50">
            <p className="text-[9px] font-bold">نظام METRIC HUB | تطوير م. عبدالله الزهراني</p>
            <p className="text-[9px]">وثيقة رقم: {Math.floor(Math.random() * 900000) + 100000}</p>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 glass-morphism no-print">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">نظام توزيع المتدربين</h1>
            <p className="text-xs font-medium text-slate-500 uppercase">قسم التقنية الميكانيكية</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={downloadPDF}
            className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all text-sm font-bold shadow-lg"
          >
            <Download size={18} />
            <span>تحميل التقرير PDF</span>
          </button>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full text-slate-600 text-xs font-semibold">
            <UserCheck size={16} className="text-emerald-500" />
            <span>م. عبدالله الزهراني</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow w-full">
        <aside className="lg:col-span-4 space-y-6 no-print">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between text-blue-600 font-bold text-lg mb-2">
              <div className="flex items-center gap-2"><Settings size={20} /><h2>إعدادات التوزيع</h2></div>
              <button onClick={addSpecialization} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Plus size={20} /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">إجمالي القبول المستهدف</label>
                <div className="relative">
                  <Users className="absolute right-3 top-3 text-slate-400" size={18} />
                  <input type="number" value={totalTrainees} onChange={(e) => setTotalTrainees(Number(e.target.value))} className="w-full pr-10 pl-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-lg"/>
                </div>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {specs.map((spec, idx) => (
                    <motion.div key={spec.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative group">
                      <button onClick={() => removeSpecialization(spec.id)} className="absolute -left-2 -top-2 bg-white text-red-400 p-1.5 rounded-full shadow-sm border border-red-50 opacity-0 group-hover:opacity-100 hover:text-red-600"><Trash2 size={14} /></button>
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase">تخصص {idx + 1}</span><div className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-xs font-bold text-blue-700">{spec.trainersCount} مدرب</div></div>
                      <input type="text" value={spec.name} onChange={(e) => updateSpec(spec.id, 'name', e.target.value)} className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"/>
                      <input type="range" min="1" max="100" value={spec.trainersCount} onChange={(e) => updateSpec(spec.id, 'trainersCount', Number(e.target.value))} className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <button onClick={calculateDistribution} className="w-full group bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 overflow-hidden relative"><Calculator size={20} className="group-hover:rotate-12 transition-transform" /><span>إعادة احتساب التوزيع</span></button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-indigo-700 via-blue-800 to-slate-900 p-6 rounded-3xl shadow-2xl text-white relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2"><Sparkles size={20} className="text-indigo-300" /><h3 className="font-bold text-lg">التحليل الاستراتيجي</h3></div>
              <p className="text-sm text-indigo-100/80 leading-relaxed">استخدم الذكاء الاصطناعي لمراجعة توزيع المقاعد وضمان جودة المخرجات التدريبية.</p>
              <button onClick={handleGetAdvice} disabled={loading} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <RefreshCcw className="animate-spin" size={20} /> : 'طلب استشارة Gemini'}
              </button>
            </div>
          </motion.div>
        </aside>

        <section className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {result.specs.map((s, i) => (
                    <div key={s.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 card-hover">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl" style={{ backgroundColor: `${COLORS[i % COLORS.length]}15`, color: COLORS[i % COLORS.length] }}><TrendingUp size={24} /></div>
                        <span className="text-2xl font-black" style={{ color: COLORS[i % COLORS.length] }}>{s.percentage}%</span>
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1 truncate">{s.name}</p>
                      <h3 className="text-2xl font-extrabold">{s.traineesCount} <span className="text-sm font-medium text-slate-400">مقعد</span></h3>
                      <p className="text-xs text-slate-500 mt-2 font-medium">بناءً على {s.trainersCount} مدرب</p>
                    </div>
                  ))}
                  <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl text-white card-hover relative group md:col-span-2 xl:col-span-1 overflow-hidden">
                    <Activity size={80} className="absolute -top-4 -right-4 opacity-10" />
                    <p className="text-slate-400 text-xs font-bold uppercase mb-2">كفاءة التوزيع</p>
                    <h3 className="text-3xl font-black">{result.averageRatio.toFixed(1)} <span className="text-sm font-light text-slate-400">طالب/مدرب</span></h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-8"><BarChart3 size={20} /><h3 className="font-bold text-lg">مقارنة التخصصات</h3></div>
                    <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><XAxis dataKey="name" tick={{fontSize: 10}} /><YAxis tick={{fontSize: 10}} /><Bar dataKey="متدربون" fill="#2563eb" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-8"><PieIcon size={20} /><h3 className="font-bold text-lg">تحليل الحصص</h3></div>
                    <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {advice && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] shadow-xl border border-indigo-50 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 via-white to-white px-8 py-8 border-b border-indigo-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-200"><Sparkles size={28} /></div>
                  <div><h3 className="text-2xl font-black text-slate-900 leading-tight">التقرير الفني الذكي</h3><p className="text-indigo-600 text-sm font-bold flex items-center gap-1 mt-1 uppercase tracking-wider">تحليل مدعوم بـ Gemini AI</p></div>
                </div>
              </div>
              <div className="p-8 lg:p-10 space-y-10">
                <p className="text-lg text-slate-700 font-medium leading-[1.8] border-r-4 border-indigo-500 pr-6 text-justify">{advice.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {advice.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-4 items-start">
                      <div className="bg-white w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-indigo-600 font-bold">{idx + 1}</div>
                      <p className="text-slate-600 text-sm leading-relaxed font-semibold">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20 no-print">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3"><Settings size={20} /><span className="font-black text-xl tracking-tighter uppercase">Metric Hub</span></div>
          <div className="text-center md:text-right"><p className="font-black text-slate-800 text-lg">تطوير م. عبدالله الزهراني</p></div>
        </div>
      </footer>

      <div className="fixed bottom-8 left-8 flex flex-col gap-4 no-print">
        <button onClick={downloadPDF} className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center group" title="تحميل التقرير الفني PDF">
          <FileText size={24} />
        </button>
        <button onClick={() => window.print()} className="bg-white text-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center group" title="طباعة">
          <Printer size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;
