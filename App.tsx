
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';
import { 
  Settings, Users, Briefcase, BarChart3, PieChart as PieIcon, Sparkles, Printer, RefreshCcw, UserCheck, 
  TrendingUp, Activity, Calculator, Plus, Trash2, FileText, Download, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpecializationData, DistributionResult, GeminiAdvice, SpecializationResult } from './types';
import { getSmartAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [specs, setSpecs] = useState<SpecializationData[]>([
    { id: '1', name: 'محركات ومركبات', trainersCount: 12 },
    { id: '2', name: 'التصنيع والإنتاج', trainersCount: 18 }
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
    if (!reportRef.current || !result) return;
    const element = reportRef.current;
    
    element.style.visibility = 'visible';
    element.style.display = 'block';

    const opt = {
      margin: 0,
      filename: `تقرير_توزيع_المتدربين_${new Date().toLocaleDateString('ar-SA')}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await window.html2pdf().from(element).set(opt).save();
    } finally {
      element.style.visibility = 'hidden';
      element.style.display = 'none';
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
      
      {/* 📄 TECHNICAL OFFICIAL REPORT TEMPLATE (Hidden but ready for Print/PDF) */}
      <div id="printable-report" className="pdf-container-hidden print-only" ref={reportRef} dir="rtl">
        <div style={{ width: '210mm', height: '297mm', padding: '20mm', background: 'white', position: 'relative', overflow: 'hidden' }}>
          
          {/* Header Area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '10px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'right', lineHeight: '1.4' }}>
              <p style={{ fontWeight: '800', fontSize: '14px', margin: 0 }}>المملكة العربية السعودية</p>
              <p style={{ fontSize: '12px', margin: 0 }}>المؤسسة العامة للتدريب التقني والمهني</p>
              <p style={{ fontSize: '12px', margin: 0 }}>الكلية التقنية - قسم التقنية الميكانيكية</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: '#1e293b', color: 'white', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px' }}>
                تقرير فني معتمد
              </div>
            </div>
            <div style={{ textAlign: 'left', fontSize: '11px', color: '#64748b' }}>
              <p style={{ margin: 0 }}>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
              <p style={{ margin: 0 }}>رقم الوثيقة: TR-{Math.floor(Math.random() * 10000)}</p>
            </div>
          </div>

          <h2 style={{ textAlign: 'center', fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '25px' }}>توزيع المتدربين المقبولين للعام التدريبي {new Date().getFullYear()}</h2>

          {/* Quick Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
            <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', margin: '0 0 5px 0' }}>إجمالي القبول</p>
              <p style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#2563eb' }}>{totalTrainees}</p>
            </div>
            <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', margin: '0 0 5px 0' }}>إجمالي المدربين</p>
              <p style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>{result?.totalTrainers}</p>
            </div>
            <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', margin: '0 0 5px 0' }}>متوسط النصاب</p>
              <p style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>{result?.averageRatio.toFixed(1)} <span style={{fontSize: '10px'}}>ط/م</span></p>
            </div>
            <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', margin: '0 0 5px 0' }}>كفاءة التوزيع</p>
              <p style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#10b981' }}>{advice?.efficiencyScore || '95'}%</p>
            </div>
          </div>

          {/* Table Section */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '14px', borderRight: '4px solid #2563eb', paddingRight: '10px', fontWeight: 'bold', marginBottom: '12px' }}>تفاصيل توزيع المقاعد حسب التخصصات</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#1e293b' }}>
                  <th style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'right' }}>التخصص</th>
                  <th style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>عدد المدربين</th>
                  <th style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>النسبة المئوية</th>
                  <th style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>المقاعد المعتمدة</th>
                </tr>
              </thead>
              <tbody>
                {result?.specs.map((s) => (
                  <tr key={s.id}>
                    <td style={{ border: '1px solid #e2e8f0', padding: '12px', fontWeight: 'bold' }}>{s.name}</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>{s.trainersCount}</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>{s.percentage}%</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center', fontWeight: '900', color: '#2563eb' }}>{s.traineesCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visuals Section (Smaller for one-page fit) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', height: '180px' }}>
             <div style={{ border: '1px solid #f1f5f9', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '10px' }}>تحليل موازنة الطاقة التدريبية</p>
                <div style={{ width: '100%', height: '130px' }}>
                   <ResponsiveContainer>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 8}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 8}} axisLine={false} tickLine={false} />
                        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
             <div style={{ border: '1px solid #f1f5f9', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '10px' }}>نسبة القبول لكل تخصص</p>
                <div style={{ width: '100%', height: '130px' }}>
                   <ResponsiveContainer>
                      <PieChart>
                        <Pie data={pieData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                          {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* Advice Box */}
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '20px', borderRadius: '12px' }}>
             <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1' }}>
                <Sparkles size={16} /> التوصيات الفنية والتحليل الاستراتيجي (AI)
             </h4>
             <p style={{ fontSize: '11px', lineHeight: '1.6', color: '#0c4a6e', margin: '0 0 15px 0', textAlign: 'justify' }}>
                {advice?.summary || "بناءً على التوزيع الحالي، يتبين أن هناك توازناً في توزيع المقاعد بناءً على الكادر التدريبي المتوفر. يُنصح بمراقبة جودة التدريب في التخصصات ذات الكثافة الأعلى."}
             </p>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {(advice?.recommendations || [
                   "تفعيل آلية المداورة في المعامل المشتركة.",
                   "متابعة نصاب الساعات التدريبية لكل مدرب.",
                   "التأكد من توفر المواد الاستهلاكية لكل تخصص.",
                   "توزيع الجداول التدريبية لتقليل التكدس."
                ]).slice(0, 4).map((rec, i) => (
                   <div key={i} style={{ fontSize: '9px', display: 'flex', gap: '5px', alignItems: 'start' }}>
                      <span style={{ color: '#2563eb', fontWeight: 'bold' }}>•</span> {rec}
                   </div>
                ))}
             </div>
          </div>

          {/* Signature Footer */}
          <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '40px' }}>
             <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '0 0 50px 0' }}>رئيس قسم التقنية الميكانيكية</p>
                <p style={{ fontSize: '11px', borderBottom: '1px solid #ccc', width: '150px' }}></p>
             </div>
             <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '0 0 50px 0' }}>وكيل الكلية لشؤون المتدربين</p>
                <p style={{ fontSize: '11px', borderBottom: '1px solid #ccc', width: '150px' }}></p>
             </div>
             <div style={{ textAlign: 'left', fontSize: '9px', color: '#94a3b8' }}>
                <p style={{ margin: 0 }}>نظام METRIC HUB v1.0</p>
                <p style={{ margin: 0 }}>بواسطة م. عبدالله الزهراني</p>
             </div>
          </div>

        </div>
      </div>

      {/* DASHBOARD NAVBAR (Hidden in Print) */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 glass-morphism no-print">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">نظام توزيع المتدربين</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">قسم التقنية الميكانيكية</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-blue-100"
          >
            <Download size={18} />
            <span className="hidden md:inline">تصدير التقرير PDF</span>
          </button>
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-slate-600 text-xs font-bold border border-slate-100">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>م. عبدالله الزهراني</span>
          </div>
        </div>
      </nav>

      {/* DASHBOARD CONTENT (Hidden in Print) */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow w-full no-print">
        {/* Sidebar Settings */}
        <aside className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between text-blue-600 font-bold text-lg">
              <div className="flex items-center gap-2"><Settings size={20} /><h2>إعدادات التوزيع</h2></div>
              <button onClick={addSpecialization} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Plus size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">إجمالي القبول المستهدف</label>
                <div className="relative">
                  <Users className="absolute right-3 top-3.5 text-slate-400" size={18} />
                  <input type="number" value={totalTrainees} onChange={(e) => setTotalTrainees(Number(e.target.value))} className="w-full pr-10 pl-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-xl transition-all"/>
                </div>
              </div>

              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {specs.map((spec, idx) => (
                    <motion.div key={spec.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 space-y-4 relative group">
                      <button onClick={() => removeSpecialization(spec.id)} className="absolute -left-2 -top-2 bg-white text-red-400 p-2 rounded-full shadow-md border border-red-50 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all z-10"><Trash2 size={16} /></button>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">التخصص {idx + 1}</span>
                        <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-sm font-black text-blue-700">{spec.trainersCount} مدرب</div>
                      </div>
                      <input type="text" value={spec.name} onChange={(e) => updateSpec(spec.id, 'name', e.target.value)} className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5"/>
                      <div className="flex items-center gap-4">
                        <input type="range" min="1" max="100" value={spec.trainersCount} onChange={(e) => updateSpec(spec.id, 'trainersCount', Number(e.target.value))} className="flex-grow h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button onClick={calculateDistribution} className="w-full group bg-slate-900 hover:bg-black text-white font-black py-4.5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 overflow-hidden relative active:scale-95 text-lg">
                <Calculator size={22} className="group-hover:rotate-12 transition-transform" />
                <span>تحديث احتساب التوزيع</span>
              </button>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-indigo-800 to-slate-900 p-7 rounded-[2.5rem] shadow-2xl text-white space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2"><Sparkles size={20} className="text-indigo-300" /><h3 className="font-black text-lg">التحليل الفني الذكي</h3></div>
              <p className="text-sm text-indigo-100/70 leading-relaxed font-medium">قم بربط البيانات بمحرك Gemini AI للحصول على توصيات استراتيجية لضبط جودة التوزيع التدريبي.</p>
              <button onClick={handleGetAdvice} disabled={loading} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <RefreshCcw className="animate-spin" size={20} /> : 'طلب استشارة Gemini'}
              </button>
            </div>
          </motion.div>
        </aside>

        {/* Results Area */}
        <section className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {result.specs.map((s, i) => (
                    <motion.div key={s.id} whileHover={{y: -5}} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-5">
                        <div className="p-3.5 rounded-2xl" style={{ backgroundColor: `${COLORS[i % COLORS.length]}10`, color: COLORS[i % COLORS.length] }}>
                           <TrendingUp size={24} />
                        </div>
                        <span className="text-2xl font-black" style={{ color: COLORS[i % COLORS.length] }}>{s.percentage}%</span>
                      </div>
                      <p className="text-slate-400 text-xs font-black uppercase mb-1 tracking-wider">{s.name}</p>
                      <h3 className="text-3xl font-black text-slate-800">{s.traineesCount} <span className="text-sm font-medium text-slate-400">مقعد</span></h3>
                      <p className="text-xs text-slate-500 mt-2 font-bold bg-slate-50 inline-block px-2 py-1 rounded-md">بناءً على {s.trainersCount} مدرب</p>
                    </motion.div>
                  ))}
                  <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl text-white relative overflow-hidden flex flex-col justify-center">
                    <Activity size={100} className="absolute -top-6 -right-6 opacity-5" />
                    <p className="text-slate-400 text-xs font-black uppercase mb-1 tracking-wider">متوسط النصاب</p>
                    <h3 className="text-4xl font-black">{result.averageRatio.toFixed(1)} <span className="text-sm font-light text-slate-300">طالب/مدرب</span></h3>
                  </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><BarChart3 size={20} /></div>
                       <h3 className="font-black text-lg">مقارنة التوزيع التدريبي</h3>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} />
                          <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><PieIcon size={20} /></div>
                       <h3 className="font-black text-lg">تحليل حصص القبول</h3>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
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

          {/* AI Insights Card */}
          <AnimatePresence>
            {advice && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl border border-indigo-50 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-10 flex items-center justify-between text-white">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-lg flex items-center justify-center shadow-xl"><Sparkles size={32} /></div>
                    <div>
                       <h3 className="text-2xl font-black leading-tight">التقرير الاستشاري الذكي</h3>
                       <p className="text-indigo-100/80 text-sm font-bold mt-1 uppercase tracking-widest">Powered by Gemini Pro 2.5</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 lg:p-12 space-y-12">
                  <div className="relative">
                    <div className="absolute -right-6 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-full opacity-30"></div>
                    <p className="text-xl text-slate-700 font-bold leading-[1.8] pr-4">{advice.summary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {advice.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-slate-50 p-7 rounded-[2rem] border border-slate-100 flex gap-5 items-start">
                        <div className="bg-white w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-indigo-600 font-black text-lg">{idx + 1}</div>
                        <p className="text-slate-600 font-bold leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* FOOTER (Hidden in Print) */}
      <footer className="bg-white border-t border-slate-200 mt-20 no-print">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-right">
          <div className="flex items-center gap-3"><Settings size={24} className="text-blue-600" /><span className="font-black text-2xl tracking-tighter uppercase">Metric Hub</span></div>
          <div className="space-y-1">
             <p className="font-black text-slate-800 text-xl">تطوير م. عبدالله الزهراني</p>
             <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">نظام موازنة المقاعد التدريبية - قسم الميكانيكا</p>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION BUTTONS (Hidden in Print) */}
      <div className="fixed bottom-10 left-10 flex flex-col gap-5 no-print">
        <button onClick={downloadPDF} className="bg-blue-600 text-white p-5 rounded-[1.5rem] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center group" title="تحميل التقرير PDF">
          <FileText size={28} />
        </button>
        <button onClick={() => window.print()} className="bg-white text-slate-800 p-5 rounded-[1.5rem] shadow-xl border border-slate-200 hover:bg-slate-50 hover:-translate-y-1 transition-all flex items-center justify-center group" title="طباعة">
          <Printer size={28} />
        </button>
      </div>
    </div>
  );
};

export default App;
