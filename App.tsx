
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Settings, Users, Briefcase, BarChart3, PieChart as PieIcon, Sparkles, Printer, RefreshCcw, UserCheck, 
  TrendingUp, Activity, Calculator, Plus, Trash2, FileText, Download
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

  const downloadPDF = async () => {
    if (!reportRef.current || !result) {
      alert("البيانات غير مكتملة، يرجى إجراء التوزيع أولاً.");
      return;
    }

    const element = reportRef.current;
    
    // إظهار العنصر مؤقتاً للمكتبة
    element.style.visibility = 'visible';
    element.style.height = 'auto';
    element.style.overflow = 'visible';

    const opt = {
      margin: 10,
      filename: `تقرير_توزيع_المتدربين_${new Date().toISOString().slice(0,10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await window.html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      // إعادة الإخفاء بعد الانتهاء
      element.style.visibility = 'hidden';
      element.style.height = '0';
      element.style.overflow = 'hidden';
    }
  };

  useEffect(() => {
    calculateDistribution();
  }, [calculateDistribution]);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const chartData = result?.specs.map(s => ({ name: s.name, count: s.traineesCount })) || [];
  const pieData = result?.specs.map(s => ({ name: s.name, value: s.traineesCount })) || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-['Tajawal']">
      
      {/* Hidden PDF Report Template Container */}
      <div className="pdf-container-hidden" ref={reportRef} dir="rtl">
        <div style={{ padding: '20px', background: 'white', width: '190mm', margin: 'auto' }}>
          {/* PDF Content */}
          <div style={{ border: '2px solid #000', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>التقرير الفني لتوزيع القبول</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>قسم التقنية الميكانيكية | الكلية التقنية</p>
                <p style={{ color: '#999', fontSize: '12px' }}>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>إجمالي المستهدف</p>
                <p style={{ fontSize: '24px', fontWeight: 'black' }}>{totalTrainees} متدرب</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
              <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '10px', color: '#999' }}>إجمالي المدربين</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{result?.totalTrainers}</p>
              </div>
              <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '10px', color: '#999' }}>متوسط النصاب</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{result?.averageRatio.toFixed(1)} ط/م</p>
              </div>
              <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '10px', color: '#999' }}>التخصصات</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{specs.length}</p>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderRight: '4px solid #2563eb', paddingRight: '10px', marginBottom: '15px' }}>جدول التوزيع التفصيلي</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '30px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>التخصص</th>
                  <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>المدربون</th>
                  <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>النسبة</th>
                  <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>المقاعد المعتمدة</th>
                </tr>
              </thead>
              <tbody>
                {result?.specs.map((s) => (
                  <tr key={s.id}>
                    <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold' }}>{s.name}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{s.trainersCount}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{s.percentage}%</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontWeight: 'black', color: '#2563eb' }}>{s.traineesCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {advice && (
              <div style={{ background: '#eef2ff', padding: '20px', borderRadius: '15px', border: '1px solid #c7d2fe' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#312e81', marginBottom: '10px' }}>التحليل الفني والتوصيات الذكية (AI)</h3>
                <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#3730a3', marginBottom: '15px' }}>{advice.summary}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {advice.recommendations.map((rec, i) => (
                    <div key={i} style={{ fontSize: '10px', display: 'flex', gap: '5px' }}>
                      <span style={{ fontWeight: 'bold' }}>•</span> {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#999' }}>
              <p>نظام METRIC HUB | تطوير م. عبدالله الزهراني</p>
              <p>مخصص لأغراض الاعتماد الأكاديمي</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 glass-morphism no-print">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
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
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all text-sm font-bold shadow-lg"
          >
            <Download size={18} />
            <span className="hidden md:inline">تحميل التقرير PDF</span>
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
              <button onClick={calculateDistribution} className="w-full group bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 overflow-hidden relative"><Calculator size={20} className="group-hover:rotate-12 transition-transform" /><span>تحديث التوزيع</span></button>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-indigo-700 to-blue-900 p-6 rounded-3xl shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-2"><Sparkles size={20} className="text-indigo-300" /><h3 className="font-bold text-lg">التحليل الاستراتيجي</h3></div>
            <p className="text-sm text-indigo-100/80 leading-relaxed">استخدم الذكاء الاصطناعي لمراجعة توزيع المقاعد وضمان جودة المخرجات التدريبية.</p>
            <button onClick={handleGetAdvice} disabled={loading} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <RefreshCcw className="animate-spin" size={20} /> : 'طلب استشارة Gemini'}
            </button>
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

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 no-print">
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-8"><BarChart3 size={20} /><h3 className="font-bold text-lg">مقارنة التخصصات</h3></div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis dataKey="name" tick={{fontSize: 10}} />
                          <YAxis tick={{fontSize: 10}} />
                          <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-8"><PieIcon size={20} /><h3 className="font-bold text-lg">تحليل الحصص</h3></div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {advice && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] shadow-xl border border-indigo-50 overflow-hidden no-print">
              <div className="bg-gradient-to-r from-indigo-50 to-white px-8 py-8 border-b border-indigo-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-200"><Sparkles size={28} /></div>
                  <div><h3 className="text-2xl font-black text-slate-900 leading-tight">التقرير الفني الذكي</h3><p className="text-indigo-600 text-sm font-bold uppercase tracking-wider">تحليل Gemini AI</p></div>
                </div>
              </div>
              <div className="p-8 lg:p-10 space-y-10">
                <p className="text-lg text-slate-700 font-medium leading-[1.8] border-r-4 border-indigo-500 pr-6">{advice.summary}</p>
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
