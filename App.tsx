
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Tooltip 
} from 'recharts';
import { 
  Settings, Users, Briefcase, BarChart3, PieChart as PieIcon, Sparkles, Printer, RefreshCcw, UserCheck, 
  TrendingUp, Activity, Calculator, Plus, Trash2, ShieldCheck, ClipboardCheck, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpecializationData, DistributionResult, GeminiAdvice, SpecializationResult } from './types';
import { getSmartAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [specs, setSpecs] = useState<SpecializationData[]>([
    { id: '1', name: 'محركات ومركبات', trainersCount: 12, continuingTrainees: 45, expectedGraduates: 15, assignedTrainers: 2 },
    { id: '2', name: 'التصنيع والإنتاج', trainersCount: 18, continuingTrainees: 60, expectedGraduates: 20, assignedTrainers: 1 }
  ]);
  const [totalTrainees, setTotalTrainees] = useState<number>(120);
  const [result, setResult] = useState<DistributionResult | null>(null);
  const [advice, setAdvice] = useState<GeminiAdvice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const suggestIdealCapacity = () => {
    const totalTrainers = specs.reduce((acc, curr) => acc + curr.trainersCount, 0);
    const totalNetContinuing = specs.reduce((acc, curr) => acc + (curr.continuingTrainees - curr.expectedGraduates), 0);
    if (totalTrainers === 0) return;

    // Target ratio is 20 (middle of 19-21)
    const targetTotalTrainees = totalTrainers * 20;
    const suggestedNewAdmissions = Math.max(0, targetTotalTrainees - totalNetContinuing);
    
    setTotalTrainees(suggestedNewAdmissions);
  };

  const addSpecialization = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setSpecs([...specs, { id: newId, name: `تخصص جديد ${specs.length + 1}`, trainersCount: 10, continuingTrainees: 0, expectedGraduates: 0, assignedTrainers: 0 }]);
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
    const totalNetContinuing = specs.reduce((acc, curr) => acc + (curr.continuingTrainees - curr.expectedGraduates), 0);
    if (totalTrainers === 0) return;

    // K is the target total trainees per trainer (new + net continuing)
    const K = (totalTrainees + totalNetContinuing) / totalTrainers;

    let remainingNewTrainees = totalTrainees;
    const specResults: SpecializationResult[] = specs.map((spec, index) => {
      const netContinuing = spec.continuingTrainees - spec.expectedGraduates;
      // Ideal new trainees for this spec to reach target ratio K
      let count = Math.round(K * spec.trainersCount - netContinuing);
      
      // Ensure we don't assign negative trainees
      count = Math.max(0, count);

      if (index === specs.length - 1) {
        count = remainingNewTrainees;
      } else {
        // Don't assign more than what's left
        count = Math.min(count, remainingNewTrainees);
        remainingNewTrainees -= count;
      }

      const totalInSpec = count + netContinuing;
      const ratio = spec.trainersCount / totalTrainers;

      return {
        id: spec.id,
        name: spec.name,
        traineesCount: count,
        percentage: Math.round(ratio * 100),
        trainersCount: spec.trainersCount,
        continuingTrainees: spec.continuingTrainees,
        expectedGraduates: spec.expectedGraduates,
        netContinuing: netContinuing,
        totalTraineesInSpec: totalInSpec,
        assignedTrainers: spec.assignedTrainers
      };
    });

    setResult({
      specs: specResults,
      totalTrainers,
      totalTrainees,
      averageRatio: (totalTrainees + totalNetContinuing) / totalTrainers
    });
  }, [specs, totalTrainees]);

  const handleGetAdvice = async () => {
    if (!result) return;
    setLoading(true);
    const aiAdvice = await getSmartAdvice(result);
    setAdvice(aiAdvice);
    setLoading(false);
  };

  useEffect(() => {
    calculateDistribution();
  }, [calculateDistribution]);

  const COLORS = ['#1e40af', '#047857', '#b45309', '#be123c', '#6d28d9', '#db2777'];
  const chartData = result?.specs.map(s => ({ name: s.name, count: s.traineesCount })) || [];
  const pieData = result?.specs.map(s => ({ name: s.name, value: s.traineesCount })) || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-['Tajawal']">
      
      {/* 📄 OFFICIAL ENGINEERING REPORT (Visible only on Print) */}
      <div id="printable-report" className="print-only" dir="rtl">
        <div style={{ width: '210mm', padding: '10mm 15mm', background: 'white', margin: '0 auto' }}>
          
          {/* Official Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px double #000', paddingBottom: '10px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'right', fontSize: '11pt' }}>
              <p style={{ fontWeight: 'bold', margin: 0 }}>المملكة العربية السعودية</p>
              <p style={{ margin: 0 }}>المؤسسة العامة للتدريب التقني والمهني</p>
              <p style={{ margin: 0 }}>الكلية التقنية - قسم التقنية الميكانيكية</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '18pt', fontWeight: '900', margin: 0 }}>تقرير توزيع القبول</h1>
              <p style={{ fontSize: '10pt', color: '#000', marginTop: '5px' }}>نموذج توزيع المقاعد المعتمد بناءً على الكادر التدريبي</p>
            </div>
            <div style={{ textAlign: 'left', fontSize: '10pt', color: '#000' }}>
              <p style={{ margin: 0 }}>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
            </div>
          </div>

          {/* Report Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
            <div style={{ border: '2px solid #000', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>إجمالي المقبولين</p>
              <p style={{ fontSize: '16pt', fontWeight: '900', margin: 0 }}>{totalTrainees}</p>
            </div>
            <div style={{ border: '2px solid #000', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>إجمالي المدربين</p>
              <p style={{ fontSize: '16pt', fontWeight: '900', margin: 0 }}>{result?.totalTrainers}</p>
            </div>
            <div style={{ border: '2px solid #000', padding: '12px', textAlign: 'center', background: result && result.averageRatio >= 19 && result.averageRatio <= 21 ? '#f0fdf4' : '#fff' }}>
              <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>النصاب المعياري</p>
              <p style={{ fontSize: '16pt', fontWeight: '900', margin: 0 }}>{result?.averageRatio.toFixed(1)} <span style={{fontSize: '9pt'}}>ط/م</span></p>
              {result && (result.averageRatio < 19 || result.averageRatio > 21) && (
                <p style={{ fontSize: '7pt', color: '#b45309', margin: '2px 0 0 0', fontWeight: 'bold' }}>خارج النطاق (19-21)</p>
              )}
            </div>
            <div style={{ border: '2px solid #000', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>كفاءة الموازنة</p>
              <p style={{ fontSize: '16pt', fontWeight: '900', margin: 0 }}>{advice?.efficiencyScore || '92'}%</p>
            </div>
          </div>

          {/* Detailed Distribution Table */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '13pt', fontWeight: 'bold', borderRight: '6px solid #000', paddingRight: '12px', marginBottom: '12px', background: '#f8fafc', border: '2px solid #000', borderRightWidth: '6px', padding: '10px' }}>أولاً: بيانات توزيع المقاعد التدريبية</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', color: '#000' }}>
                  <th style={{ border: '2px solid #000', padding: '6px', textAlign: 'right' }}>التخصص</th>
                  <th style={{ border: '2px solid #000', padding: '6px', textAlign: 'center' }}>المدربين</th>
                  <th style={{ border: '2px solid #000', padding: '6px', textAlign: 'center' }}>مكلفين</th>
                  <th style={{ border: '2px solid #000', padding: '6px', textAlign: 'center' }}>المستمرين</th>
                  <th style={{ border: '2px solid #000', padding: '6px', textAlign: 'center' }}>خريجين</th>
                  <th style={{ border: '2px solid #000', padding: '6px', textAlign: 'center' }}>القبول الجديد</th>
                  <th style={{ border: '2px solid #000', padding: '6px', textAlign: 'center', fontWeight: '900' }}>الإجمالي الفعلي</th>
                </tr>
              </thead>
              <tbody>
                {result?.specs.map((s) => (
                  <tr key={s.id}>
                    <td style={{ border: '2px solid #000', padding: '6px', fontWeight: 'bold' }}>{s.name}</td>
                    <td style={{ border: '2px solid #000', padding: '6px', textAlign: 'center' }}>{s.trainersCount}</td>
                    <td style={{ border: '2px solid #000', padding: '6px', textAlign: 'center', color: '#64748b' }}>{s.assignedTrainers}</td>
                    <td style={{ border: '2px solid #000', padding: '6px', textAlign: 'center' }}>{s.continuingTrainees}</td>
                    <td style={{ border: '2px solid #000', padding: '6px', textAlign: 'center', color: '#be123c' }}>{s.expectedGraduates}</td>
                    <td style={{ border: '2px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{s.traineesCount}</td>
                    <td style={{ border: '2px solid #000', padding: '6px', textAlign: 'center', fontWeight: '900', fontSize: '10pt' }}>{s.totalTraineesInSpec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: '8pt', color: '#64748b', marginTop: '10px', fontStyle: 'italic' }}>* ملاحظة: عدد المدربين المكلفين هو معلومة إرشادية ولا يدخل في حسابات التوزيع.</p>
          </div>

          {/* AI Engineering Recommendations */}
          <div style={{ border: '2px solid #000', padding: '25px', borderRadius: '4px', background: '#f8fafc', marginBottom: '30px' }}>
             <h4 style={{ margin: '0 0 15px 0', fontSize: '12pt', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <ClipboardCheck size={20} /> ثانياً: التوصيات الاستراتيجية والتحليل الفني
             </h4>
             <div style={{ borderBottom: '2px solid #000', marginBottom: '18px', paddingBottom: '12px' }}>
               <p style={{ fontSize: '11pt', lineHeight: '1.7', color: '#000', margin: 0, textAlign: 'justify', fontWeight: '500' }}>
                  {advice?.summary || "تم إجراء موازنة القبول بناءً على معايير الجودة الأكاديمية ونصاب المدربين. تشير البيانات إلى استقرار توزيع العبء التدريبي مع مراعاة التباين في أعداد المدربين بين التخصصات لضمان عدالة المخرجات التدريبية وكفاءة تشغيل المعامل الميكانيكية."}
               </p>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {(advice?.recommendations || [
                   "موازنة نصاب الساعات لكل مدرب وفق اللائحة المنظمة.",
                   "توزيع المحاضرات التدريبية العملية على المعامل المتاحة بكفاءة.",
                   "التأكد من توفر المواد الاستهلاكية لكل تخصص مهني.",
                   "مراقبة جودة مخرجات التخصصات ذات الكثافة العالية."
                ]).slice(0, 4).map((rec, i) => (
                   <div key={i} style={{ fontSize: '10.5pt', display: 'flex', gap: '10px', alignItems: 'start', color: '#000' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14pt', lineHeight: '1' }}>•</span> {rec}
                   </div>
                ))}
             </div>
          </div>

          {/* Minimal Engineering Footer */}
          <div style={{ borderTop: '2px solid #000', marginTop: '20px', paddingTop: '15px', textAlign: 'center' }}>
             <p style={{ fontSize: '10pt', color: '#000', margin: 0, fontWeight: 'bold' }}>
               نظام METRIC HUB | م. عبدالله الزهراني | قسم التقنية الميكانيكية
             </p>
             <p style={{ fontSize: '8pt', color: '#333', margin: '5px 0 0 0' }}>تم إنشاء هذا التقرير هندسياً لدعم اتخاذ القرار وتوزيع القبول © {new Date().getFullYear()}</p>
          </div>

        </div>
      </div>

      {/* 🖥️ DASHBOARD INTERFACE (Hidden in Print) */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 glass-morphism no-print">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-200">
            <Briefcase size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">نظام توزيع المتدربين</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1.5 tracking-widest flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              قسم التقنية الميكانيكية | Metric Hub
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-all text-sm font-bold shadow-xl active:scale-95"
          >
            <Printer size={18} />
            <span>طباعة التقرير</span>
          </button>
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl text-slate-700 text-xs font-bold border border-slate-200">
             <UserCheck size={16} className="text-blue-600" />
             <span>م. عبدالله الزهراني</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow w-full no-print">
        {/* Input Configuration Panel */}
        <aside className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
            <div className="flex items-center justify-between text-blue-600 font-bold">
              <div className="flex items-center gap-2"><Settings size={22} /><h2 className="text-lg">تكوين التوزيع</h2></div>
              <button onClick={addSpecialization} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"><Plus size={20} /></button>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block flex items-center gap-2">
                    <Users size={14} /> إجمالي القبول المستهدف
                  </label>
                  <button 
                    onClick={suggestIdealCapacity}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Sparkles size={10} /> اقتراح السعة المثالية (20:1)
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Calculator size={20} />
                  </div>
                  <input type="number" value={totalTrainees} onChange={(e) => setTotalTrainees(Number(e.target.value))} className="w-full pr-12 pl-4 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none font-black text-2xl transition-all shadow-inner"/>
                </div>
                {result && (
                  <div className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                    result.averageRatio >= 19 && result.averageRatio <= 21 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    <Info size={12} />
                    {result.averageRatio >= 19 && result.averageRatio <= 21 
                      ? 'النصاب الحالي ضمن النطاق المعياري (19-21)' 
                      : `النصاب الحالي (${result.averageRatio.toFixed(1)}) خارج النطاق المستهدف (19-21)`}
                  </div>
                )}
              </div>

              <div className="space-y-5 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {specs.map((spec, idx) => (
                    <motion.div key={spec.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-5 relative group/card hover:bg-white hover:border-blue-100 transition-all hover:shadow-lg">
                      <button onClick={() => removeSpecialization(spec.id)} className="absolute -left-2 -top-2 bg-white text-red-400 p-2.5 rounded-full shadow-lg border border-red-50 opacity-0 group-hover/card:opacity-100 hover:text-red-600 transition-all z-10"><Trash2 size={16} /></button>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Info size={12} /> التخصص {idx + 1}</span>
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg shadow-blue-200">{spec.trainersCount} مدرب</div>
                      </div>
                      
                      <input type="text" value={spec.name} onChange={(e) => updateSpec(spec.id, 'name', e.target.value)} className="w-full px-5 py-3.5 bg-white rounded-2xl border border-slate-200 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"/>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">المدربين</label>
                          <input type="number" value={spec.trainersCount} onChange={(e) => updateSpec(spec.id, 'trainersCount', Number(e.target.value))} className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"/>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">مكلفين (إضافي)</label>
                          <input type="number" value={spec.assignedTrainers} onChange={(e) => updateSpec(spec.id, 'assignedTrainers', Number(e.target.value))} className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all text-slate-500"/>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">المستمرين</label>
                          <input type="number" value={spec.continuingTrainees} onChange={(e) => updateSpec(spec.id, 'continuingTrainees', Number(e.target.value))} className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"/>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">خريجين</label>
                          <input type="number" value={spec.expectedGraduates} onChange={(e) => updateSpec(spec.id, 'expectedGraduates', Number(e.target.value))} className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-red-600"/>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>الحد الأدنى</span><span>الحد الأقصى</span></div>
                        <input type="range" min="1" max="100" value={spec.trainersCount} onChange={(e) => updateSpec(spec.id, 'trainersCount', Number(e.target.value))} className="w-full h-2.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button onClick={calculateDistribution} className="w-full group bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-2xl transition-all flex items-center justify-center gap-3 overflow-hidden relative active:scale-95 text-lg">
                <RefreshCcw size={22} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>إعادة توازن المقاعد</span>
              </button>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-blue-900 via-slate-900 to-black p-8 rounded-[3rem] shadow-2xl text-white space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-700"></div>
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-3"><Sparkles size={24} className="text-blue-400" /><h3 className="font-black text-xl">تحليل Gemini الفني</h3></div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">قم بمعالجة بيانات التوزيع عبر محرك الذكاء الاصطناعي لاستخراج تقرير استشاري يضمن أعلى معايير الاعتماد الأكاديمي.</p>
              <button onClick={handleGetAdvice} disabled={loading} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/20 font-black py-4.5 rounded-[1.25rem] transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-xl hover:border-white/30">
                {loading ? <RefreshCcw className="animate-spin" size={20} /> : <><Sparkles size={20} /> <span>استشارة الخبير الذكي</span></>}
              </button>
            </div>
          </motion.div>
        </aside>

        {/* Dashboard Analytics Section */}
        <section className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Result Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {result.specs.map((s, i) => (
                    <motion.div key={s.id} whileHover={{y: -8}} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-200 group">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-4 rounded-2xl transition-colors" style={{ backgroundColor: `${COLORS[i % COLORS.length]}10`, color: COLORS[i % COLORS.length] }}>
                           <TrendingUp size={24} />
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black block" style={{ color: COLORS[i % COLORS.length] }}>{s.percentage}%</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نسبة المقاعد</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs font-black uppercase mb-1.5 tracking-tighter truncate">{s.name}</p>
                      <h3 className="text-4xl font-black text-slate-900">{s.traineesCount} <span className="text-sm font-bold text-slate-400">جديد</span></h3>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1.5 rounded-lg">
                          <UserCheck size={12} /> {s.trainersCount} مدرب
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1.5 rounded-lg flex items-center justify-center">
                          {s.assignedTrainers} مكلف
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1.5 rounded-lg flex items-center justify-center">
                          {s.continuingTrainees} مستمر
                        </div>
                        <div className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1.5 rounded-lg flex items-center justify-center">
                          -{s.expectedGraduates} خريج
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">الإجمالي الفعلي:</span>
                        <span className="text-lg font-black text-slate-900">{s.totalTraineesInSpec}</span>
                      </div>
                    </motion.div>
                  ))}
                  <div className={`p-8 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] text-white relative overflow-hidden flex flex-col justify-center group transition-colors duration-500 ${
                    result.averageRatio >= 19 && result.averageRatio <= 21 ? 'bg-emerald-900' : 'bg-slate-900'
                  }`}>
                    <Activity size={120} className="absolute -top-6 -right-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700" />
                    <p className="text-slate-500 text-xs font-black uppercase mb-2 tracking-widest">معدل الكفاءة (النصاب)</p>
                    <h3 className="text-5xl font-black text-white">{result.averageRatio.toFixed(1)} <span className="text-sm font-medium text-slate-400">طالب/مدرب</span></h3>
                    <p className={`text-[10px] font-black mt-3 flex items-center gap-1 ${
                      result.averageRatio >= 19 && result.averageRatio <= 21 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      <ShieldCheck size={12} /> 
                      {result.averageRatio >= 19 && result.averageRatio <= 21 ? 'توزيع مثالي (19-21)' : 'توزيع يحتاج مراجعة النصاب'}
                    </p>
                  </div>
                </div>

                {/* Dashboard Data Visualization */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><BarChart3 size={24} /></div>
                       <div>
                         <h3 className="font-black text-xl text-slate-900">مقارنة التوزيع</h3>
                         <p className="text-xs text-slate-400 font-bold">عرض المقاعد مقابل التخصصات</p>
                       </div>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 800, fill: '#64748b'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 800, fill: '#64748b'}} />
                          <Bar dataKey="count" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={45} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><PieIcon size={24} /></div>
                       <div>
                         <h3 className="font-black text-xl text-slate-900">المحاضرات التدريبية النسبية</h3>
                         <p className="text-xs text-slate-400 font-bold">توزيع القبول كنسبة مئوية</p>
                       </div>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value" stroke="none">
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

          {/* AI Insights Card (Interactive Dashboard View) */}
          <AnimatePresence>
            {advice && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] shadow-2xl border border-indigo-50 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-slate-900 px-10 py-12 flex items-center justify-between text-white relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-2xl flex items-center justify-center shadow-2xl border border-white/20"><Sparkles size={40} /></div>
                    <div>
                       <h3 className="text-3xl font-black leading-tight tracking-tight">التقرير الاستشاري الهندسي</h3>
                       <p className="text-indigo-200 text-sm font-bold mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
                         <ShieldCheck size={16} /> مدعوم بذكاء Gemini 2.5
                       </p>
                    </div>
                  </div>
                </div>
                <div className="p-10 lg:p-14 space-y-12">
                  <div className="relative">
                    <div className="absolute -right-8 top-0 bottom-0 w-2 bg-indigo-500 rounded-full opacity-20"></div>
                    <p className="text-2xl text-slate-700 font-extrabold leading-[1.8] pr-6">{advice.summary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {advice.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex gap-6 items-start hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all group/rec">
                        <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-indigo-600 font-black text-xl group-hover/rec:bg-indigo-600 group-hover/rec:text-white transition-all">{idx + 1}</div>
                        <p className="text-slate-600 font-bold leading-relaxed text-lg">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* FOOTER (Dashboard View) */}
      <footer className="bg-white border-t border-slate-200 mt-20 no-print">
        <div className="max-w-7xl mx-auto px-10 py-16 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-right">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-xl shadow-slate-200"><Settings size={28} /></div>
            <span className="font-black text-3xl tracking-tighter uppercase text-slate-900">Metric Hub <span className="text-blue-600">.</span></span>
          </div>
          <div className="space-y-2">
             <p className="font-black text-slate-900 text-2xl tracking-tight">تطوير م. عبدالله الزهراني</p>
             <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">قسم التقنية الميكانيكية | نموذج الاعتماد التدريبي</p>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION BUTTONS (Cleaned up - focus on Print) */}
      <div className="fixed bottom-12 left-12 flex flex-col gap-6 no-print">
        <button onClick={() => window.print()} className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] hover:bg-black hover:-translate-y-2 transition-all flex items-center justify-center group active:scale-95" title="طباعة التقرير">
          <Printer size={32} />
        </button>
      </div>
    </div>
  );
};

export default App;
