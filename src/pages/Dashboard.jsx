import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Coins, TrendingUp, Clock, UserPlus, Sparkles, MessageSquare, BadgeCheck, AlertTriangle, Newspaper, Shield, Trophy, Activity, Rocket } from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const COIN_TO_BDT = 720;

export default function Dashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [liveCoins, setLiveCoins] = useState(0);
  const [cycleProgress, setCycleProgress] = useState(0);
  const showToast = useToast();
  const timerRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchNews();
    }
    return () => clearInterval(timerRef.current);
  }, [user]);

  const fetchData = async () => {
    await Promise.all([fetchProfile(), fetchInvestments()]);
    setLoading(false);
  };

  useEffect(() => {
    if (profile && investments.length >= 0) {
      const interval = 100;
      
      timerRef.current = setInterval(() => {
        const lastCollect = new Date(profile.last_collect).getTime();
        const now = new Date().getTime();
        const diffMs = now - lastCollect;
        const diffHours = diffMs / (1000 * 60 * 60);

        // Logic: 24h cycle for Workers
        const progress = Math.min((diffMs / (24 * 60 * 60 * 1000)) * 100, 100);
        setCycleProgress(progress);

        // Calculate Worker Yield (Capped at 24h)
        const workerRate = profile.mining_rate || 0;
        const workerYield = Math.min(diffHours, 24) * workerRate;

        // Calculate Investor Yield (Linear, No Cap)
        // We calculate this from investments by checking asset types
        let investorRate = 0;
        investments.forEach(inv => {
          if (inv.type === 'investor' && inv.assets?.profit_tier_coins) {
             investorRate += inv.assets.profit_tier_coins / 720;
          }
        });
        const investorYield = diffHours * investorRate;

        setLiveCoins(workerYield + investorYield);
      }, interval);
    }
    return () => clearInterval(timerRef.current);
  }, [profile, investments]);

  const fetchNews = async () => {
    const { data } = await supabase.from('newsfeed').select('*').order('created_at', { ascending: false }).limit(5);
    if (data) setNews(data);
  };

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
  };

  const fetchInvestments = async () => {
    const { data } = await supabase.from('user_investments').select('*, assets(profit_tier_coins)').eq('user_id', user.id).eq('status', 'active');
    if (data) setInvestments(data);
  };

  const collectIncome = async () => {
    if (!profile || collecting) return;
    setCollecting(true);
    
    try {
      const { error } = await supabase.rpc('collect_earnings_expert', { target_user_id: user.id });
      if (error) throw error;
      
      await fetchData();
      setLiveCoins(0);
      showToast("Extraction Successful! Capital synchronized.", "success");
    } catch (err) {
      showToast("Sync Error. Verification failed.", "error");
    } finally {
      setCollecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-vh-100 gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-premium-gold/20 rounded-full animate-ping absolute" />
          <div className="w-20 h-20 border-4 border-premium-gold border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-premium-gold font-black tracking-widest animate-pulse uppercase text-[10px]">Parsing Neural Network...</p>
      </div>
    );
  }

  const workerRate = profile?.mining_rate || 0;
  let investorRate = 0;
  investments.forEach(inv => {
    if (inv.type === 'investor' && inv.assets?.profit_tier_coins) {
       investorRate += inv.assets.profit_tier_coins / 720;
    }
  });
  const totalHourlyRate = workerRate + investorRate;

  return (
    <div className="p-6 max-w-lg mx-auto space-y-10 pb-40">
      {/* Dynamic News Ticker */}
      <div className="relative h-12 bg-zinc-900 border-y border-zinc-800 flex items-center overflow-hidden shadow-inner">
        <div className="absolute left-0 top-0 bottom-0 px-6 bg-premium-gold text-black flex items-center font-black italic text-[10px] z-10 skew-x-[-20deg] -ml-4">
          <div className="skew-x-[20deg] flex items-center gap-2">
            <Newspaper size={14} /> FLASH
          </div>
        </div>
        <div className="flex gap-20 animate-marquee whitespace-nowrap pl-24">
          {news.map((n) => (
            <span key={n.id} className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={10} className="text-premium-gold" /> {n.message}
            </span>
          ))}
        </div>
      </div>

      {/* Liquidity Center */}
      <div className={`relative p-8 rounded-[3rem] bg-zinc-900 border-2 transition-all duration-1000 overflow-hidden group ${profile?.badge === 'Platinum' ? 'border-premium-gold shadow-neon-gold animate-glow' : 'border-zinc-800'}`}>
        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
           <Trophy size={200} className="text-premium-gold" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-start">
             <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Capital Reserves</p>
                   {profile?.badge === 'Platinum' && <BadgeCheck className="text-premium-gold size-4" />}
                </div>
                <div className="flex items-baseline gap-3">
                   <h2 className="text-5xl font-black font-mono tracking-tighter text-white">
                     {profile?.balance?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                   </h2>
                   <span className="text-premium-gold font-black italic text-xs">COINS</span>
                </div>
                <p className="text-zinc-600 font-bold text-xs uppercase italic">
                  ≈ ৳ {(profile?.balance / COIN_TO_BDT).toLocaleString()} BDT
                </p>
             </div>
             <div className="p-4 bg-premium-gold/10 rounded-2xl border border-premium-gold/20">
                <Shield className="text-premium-gold size-6" />
             </div>
          </div>

          <div className="bg-black/40 p-6 rounded-[2rem] border border-zinc-800/80 space-y-4">
             <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-500 italic">
                <span className="flex items-center gap-2">
                  <Activity size={10} className="text-green-400" /> Neural Extraction
                </span>
                <span className="text-green-500">Live Feedback</span>
             </div>
             <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black font-mono text-green-400 tracking-tighter">+{liveCoins.toFixed(5)}</p>
                <span className="text-green-900 font-black italic text-[10px] uppercase">Growing</span>
             </div>
             
             <div className="space-y-2">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-zinc-700">
                   <span>Worker Lifecycle</span>
                   <span>{cycleProgress.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${cycleProgress}%` }}
                     className={`h-full ${cycleProgress >= 90 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-premium-gold'}`}
                   />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Strategic Summary */}
      <div className="grid grid-cols-2 gap-4">
         <div className="premium-card p-6 flex flex-col items-center text-center gap-3 border-zinc-900 bg-zinc-900/50">
            <Activity className="text-blue-400 size-5" />
            <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Worker Rate</p>
            <p className="text-white font-black font-mono text-lg">+{workerRate.toFixed(0)} <span className="text-[10px] text-zinc-700">/HR</span></p>
         </div>
         <div className="premium-card p-6 flex flex-col items-center text-center gap-3 border-zinc-900 bg-zinc-900/50">
            <Rocket className="text-premium-gold size-5" />
            <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Investor Yield</p>
            <p className="text-white font-black font-mono text-lg">+{investorRate.toFixed(1)} <span className="text-[10px] text-zinc-700">/HR</span></p>
         </div>
      </div>

      {/* Harvest Section */}
      <div className={`p-8 rounded-[2.5rem] bg-zinc-900 border-2 transition-all duration-500 ${cycleProgress >= 85 ? 'border-red-500/30' : 'border-zinc-800'}`}>
         <div className="flex gap-5 items-start mb-8">
            <div className={`p-5 rounded-2xl ${cycleProgress >= 90 ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'bg-black text-zinc-600'}`}>
               <AlertTriangle size={28} />
            </div>
            <div>
               <h3 className="text-xl font-black italic uppercase text-white leading-none">Security Window</h3>
               <p className="text-zinc-500 text-[10px] font-bold uppercase mt-2 tracking-tighter">
                 {cycleProgress >= 90 ? 'PROTOCOL BREAK: Manual intervention required to prevent diversion.' : 'Workers operate on 24h cycles. Investors flow without restriction.'}
               </p>
            </div>
         </div>

         <button 
           onClick={collectIncome}
           disabled={collecting}
           className={`premium-button w-full h-16 group relative overflow-hidden transition-all ${cycleProgress < 20 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-[1.02]'}`}
         >
           {collecting ? (
             <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span className="text-lg">Synchronizing...</span>
             </div>
           ) : (
             <div className="flex items-center gap-3">
                <span className="text-xl font-black italic uppercase">Synchronize Assets</span>
                <Sparkles className="group-hover:rotate-12 transition-transform" />
             </div>
           )}
           <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
         </button>
      </div>

      {/* Referral Program */}
      <div className="premium-card bg-zinc-900 border-zinc-800">
         <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-premium-gold/10 rounded-2xl">
               <UserPlus className="text-premium-gold size-5" />
            </div>
            <h3 className="font-black italic uppercase tracking-widest text-white">Referral Protocol</h3>
         </div>
         <div className="flex gap-3 bg-black p-1.5 rounded-2xl border border-zinc-800">
            <input 
              readOnly 
              value={`${window.location.origin}/?ref=${user.id}`}
              className="bg-transparent border-none px-4 text-[9px] text-zinc-500 font-mono flex-1 outline-none"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/?ref=${user.id}`);
                showToast("System Link Copied!", "success");
              }}
              className="bg-premium-gold text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-neon-gold active:scale-95 transition-all"
            >
              COPY
            </button>
         </div>
      </div>
    </div>
  );
}
