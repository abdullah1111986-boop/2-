
import React, { useState, useCallback, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Settings, Users, Briefcase, BarChart3, PieChart as PieIcon, Info, Sparkles, Printer, RefreshCcw, UserCheck, 
  TrendingUp, Activity, CheckCircle2, ChevronRight, Calculator, Plus, Trash2
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
      
      // Last item adjustment to ensure sum equals totalTrainees exactly
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

  useEffect(() => {
    calculateDistribution();
  }, [calculateDistribution]);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const chartData = result?.specs.map(s => ({
    name: s.name,
    متدربون: s.traineesCount,
    مدربون: s.trainersCount
  })) || [];

  const pieData = result?.specs.map(s => ({
    name: s.name,
    value: s.traineesCount
  })) || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-['Tajawal']">
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
        
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full text-slate-600">
            <Activity size={16} className="text-blue-500" />
            <span>الحالة: متصل</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full text-slate-600">
            <UserCheck size={16} className="text-emerald-500" />
            <span>م. عبدالله الزهراني</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow w-full">
        
        {/* Sidebar / Controls */}
        <aside className="lg:col-span-4 space-y-6 no-print">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6"
          >
            <div className="flex items-center justify-between text-blue-600 font-bold text-lg mb-2">
              <div className="flex items-center gap-2">
                <Settings size={20} />
                <h2>إعدادات التوزيع</h2>
              </div>
              <button 
                onClick={addSpecialization}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                title="إضافة تخصص"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Total Trainees Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">إجمالي القبول المستهدف</label>
                <div className="relative">
                  <Users className="absolute right-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    value={totalTrainees} 
                    onChange={(e) => setTotalTrainees(Number(e.target.value))}
                    className="w-full pr-10 pl-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-lg"
                  />
                </div>
              </div>

              {/* Dynamic Specs List */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {specs.map((spec, idx) => (
                    <motion.div 
                      key={spec.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative group"
                    >
                      <button 
                        onClick={() => removeSpecialization(spec.id)}
                        className="absolute -left-2 -top-2 bg-white text-red-400 p-1.5 rounded-full shadow-sm border border-red-50 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">تخصص {idx + 1}</span>
                        <div className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-xs font-bold text-blue-700">
                          {spec.trainersCount} مدرب
                        </div>
                      </div>
                      
                      <input 
                        type="text" 
                        value={spec.name} 
                        onChange={(e) => updateSpec(spec.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="اسم التخصص"
                      />
                      
                      <div className="flex items-center gap-3">
                         <input 
                          type="range" min="1" max="100"
                          value={spec.trainersCount} 
                          onChange={(e) => updateSpec(spec.id, 'trainersCount', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button 
                onClick={calculateDistribution}
                className="w-full group bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 overflow-hidden relative"
              >
                <Calculator size={20} className="group-hover:rotate-12 transition-transform" />
                <span>إعادة احتساب التوزيع</span>
              </button>
            </div>
          </motion.div>

          {/* AI Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-700 via-blue-800 to-slate-900 p-6 rounded-3xl shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={20} className="text-indigo-300 animate-pulse" />
                <h3 className="font-bold text-lg">التحليل الاستراتيجي</h3>
              </div>
              <p className="text-sm text-indigo-100/80 mb-6 leading-relaxed">
                استخدم الذكاء الاصطناعي لمراجعة توزيع المقاعد وضمان جودة المخرجات التدريبية.
              </p>
              <button 
                onClick={handleGetAdvice}
                disabled={loading}
                className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCcw className="animate-spin" size={20} /> : 'طلب استشارة Gemini'}
              </button>
            </div>
          </motion.div>
        </aside>

        {/* Content Area */}
        <section className="lg:col-span-8 space-y-8">
          
          <AnimatePresence mode="wait">
            {result && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Scorecards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {result.specs.map((s, i) => (
                    <motion.div 
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 card-hover"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl" style={{ backgroundColor: `${COLORS[i % COLORS.length]}15`, color: COLORS[i % COLORS.length] }}>
                          <TrendingUp size={24} />
                        </div>
                        <span className="text-2xl font-black" style={{ color: COLORS[i % COLORS.length] }}>{s.percentage}%</span>
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1 truncate">{s.name}</p>
                      <h3 className="text-2xl font-extrabold">{s.traineesCount} <span className="text-sm font-medium text-slate-400">مقعد</span></h3>
                      <p className="text-xs text-slate-500 mt-2 font-medium">بناءً على {s.trainersCount} مدرب</p>
                    </motion.div>
                  ))}

                  {/* Summary Scorecard */}
                  <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl text-white card-hover overflow-hidden relative group md:col-span-2 xl:col-span-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                      <Activity size={100} />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-2">كفاءة التوزيع</p>
                    <h3 className="text-3xl font-black">{result.averageRatio.toFixed(1)} <span className="text-sm font-light text-slate-400">طالب/مدرب</span></h3>
                    <div className="mt-4 flex items-center gap-2">
                       <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(result.averageRatio * 4, 100)}%` }}
                          ></div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Main Visuals */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Bar Chart */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                        <BarChart3 size={20} />
                      </div>
                      <h3 className="font-bold text-lg">مقارنة التخصصات</h3>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={8}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                            dy={10}
                          />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <RechartsTooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                          />
                          <Bar dataKey="متدربون" fill="#2563eb" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="مدربون" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                        <PieIcon size={20} />
                      </div>
                      <h3 className="font-bold text-lg">تحليل حصة القبول</h3>
                    </div>
                    <div className="flex-grow flex items-center justify-center relative">
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={95}
                              paddingAngle={5}
                              dataKey="value"
                              animationDuration={1500}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">المقاعد</span>
                        <span className="text-3xl font-black text-slate-800">{result.totalTrainees}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Advice Section */}
          {advice && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2.5rem] shadow-xl border border-indigo-50 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-50 via-white to-white px-8 py-8 border-b border-indigo-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">التقرير الفني الذكي</h3>
                    <p className="text-indigo-600 text-sm font-bold flex items-center gap-1 mt-1 uppercase tracking-wider">
                      تحليل مدعوم بـ Gemini AI <ChevronRight size={14} />
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">نقاط الكفاءة</div>
                   <div className="flex items-center gap-3">
                      <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${advice.efficiencyScore}%` }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-indigo-600 rounded-full"
                        ></motion.div>
                      </div>
                      <span className="text-xl font-black text-slate-800">{advice.efficiencyScore}%</span>
                   </div>
                </div>
              </div>
              
              <div className="p-8 lg:p-10 space-y-10">
                <p className="text-lg text-slate-700 font-medium leading-[1.8] border-r-4 border-indigo-500 pr-6 text-justify">
                  {advice.summary}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {advice.recommendations.map((rec, idx) => (
                    <div 
                      key={idx}
                      className="group bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all p-6 rounded-3xl border border-slate-100 flex gap-4 items-start"
                    >
                      <div className="bg-white group-hover:bg-indigo-600 group-hover:text-white transition-colors w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-indigo-600 font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20 no-print">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg text-white">
                <Settings size={20} />
              </div>
              <span className="font-black text-xl tracking-tighter">METRIC HUB</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="font-black text-slate-800 text-lg">تطوير م. عبدالله الزهراني</p>
              <p className="text-slate-400 text-sm mt-1 font-medium">نظام التوزيع الذكي - الإصدار الثاني المطور</p>
            </div>
          </div>
        </div>
      </footer>

      {/* FABs */}
      <div className="fixed bottom-8 left-8 flex flex-col gap-4 no-print">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.print()}
          className="bg-white text-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center group"
          title="طباعة"
        >
          <Printer size={24} className="group-hover:rotate-12 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
};

export default App;
