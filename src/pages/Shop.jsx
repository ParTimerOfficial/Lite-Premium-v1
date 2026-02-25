import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingBag, Zap, Shield, Crown, HardHat, TrendingUp, Sparkles, AlertCircle, ShoppingCart, Rocket, Flame } from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const COIN_TO_BDT = 720;
const icons = { HardHat, Zap, Shield, Crown, Rocket, Flame };

export default function Shop({ profile, user, onUpdate }) {
  const showToast = useToast();
  const [assets, setAssets] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('worker');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAssets(), fetchInvestments()]);
    setLoading(false);
  };

  const fetchAssets = async () => {
    const { data } = await supabase.from('assets').select('*').order('price', { ascending: true });
    if (data) setAssets(data);
  };

  const fetchInvestments = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_investments').select('*').eq('user_id', user.id).eq('status', 'active');
    if (data) setInvestments(data);
  };

  const buyAsset = async (asset) => {
    if (!profile) return;
    if (profile.balance < asset.price) return showToast("Insufficient Liquidity!", "error");
    if (asset.units_sold >= asset.stock_limit) return showToast("Market Exhausted!", "error");
    
    try {
      const { error: invError } = await supabase.from('user_investments').insert([{
        user_id: user.id,
        asset_id: asset.id,
        asset_name: asset.name,
        type: asset.type,
        amount: asset.price,
        hourly_return: asset.type === 'worker' ? asset.rate : 0
      }]);
      if (invError) throw invError;
      
      const { error: stockError } = await supabase.from('assets').update({ 
        units_sold: (asset.units_sold || 0) + 1 
      }).eq('id', asset.id);
      if (stockError) throw stockError;

      const { error: balError } = await supabase.from('profiles').update({ 
        balance: profile.balance - asset.price,
        mining_rate: asset.type === 'worker' ? (profile.mining_rate || 0) + asset.rate : profile.mining_rate
      }).eq('id', user.id);
      if (balError) throw balError;
      
      showToast(`${asset.name} Vector Initialized!`, "success");
      fetchData();
      if (onUpdate) onUpdate();
    } catch (err) {
      showToast("Sync Error. Transaction voided.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-premium-gold border-t-transparent shadow-neon-gold"></div>
        <p className="text-premium-gold font-black tracking-widest animate-pulse uppercase text-[10px]">Filtering Market Vectors...</p>
      </div>
    );
  }

  const filteredAssets = assets.filter(a => a.type === activeCategory);

  return (
    <div className="p-6 max-w-lg mx-auto space-y-10 pb-32">
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-5 bg-premium-gold/10 border border-premium-gold/30 rounded-[2.5rem] shadow-neon-gold group-hover:rotate-12 transition-transform duration-500">
             <ShoppingBag className="text-premium-gold size-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Market <span className="text-premium-gold">Vectors</span></h1>
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.4em] mt-2">Financial Operations Center</p>
          </div>
        </div>

        {/* Tactical Category Switcher */}
        <div className="flex bg-zinc-900 border-2 border-zinc-800 p-2 rounded-[2rem] shadow-2xl overflow-hidden">
           {['worker', 'investor'].map((cat) => (
             <button 
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`flex-1 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 ${activeCategory === cat ? 'bg-premium-gold text-black shadow-neon-gold scale-[1.02]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
             >
               {cat === 'worker' ? (
                 <><HardHat size={14} /> Active Workers</>
               ) : (
                 <><Rocket size={14} /> Passive Investors</>
               )}
             </button>
           ))}
        </div>
      </header>

      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {filteredAssets.map((asset, index) => {
            const Icon = icons[asset.icon] || Zap;
            const unitsLeft = (asset.stock_limit || 100) - (asset.units_sold || 0);
            const scarcityPercent = ((asset.units_sold || 0) / (asset.stock_limit || 100)) * 100;
            const isInvestor = asset.type === 'investor';
            const isSoldOut = unitsLeft <= 0;
            const ownedCount = investments.filter(i => i.asset_name === asset.name).length;
            
            return (
              <motion.div 
                key={asset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`transition-all duration-500 ${isSoldOut ? 'opacity-40 grayscale pointer-events-none' : ''}`}
              >
                <div className={`relative bg-zinc-900 border-2 rounded-[2.5rem] p-8 overflow-hidden group hover:border-premium-gold/40 transition-colors shadow-2xl ${isInvestor ? 'border-premium-gold/20' : 'border-zinc-800/80'}`}>
                  {/* Scarcity Notification */}
                  <div className="flex justify-between items-center mb-8">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${unitsLeft < 15 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        <span className="text-[10px] font-black uppercase text-zinc-500">{unitsLeft} Units Available</span>
                     </div>
                     <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full ${isInvestor ? 'bg-premium-gold/10 text-premium-gold' : 'bg-blue-500/10 text-blue-400'}`}>
                        {isInvestor ? 'Investment Grade' : 'Operational Class'}
                     </span>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`p-5 rounded-[2rem] shadow-inner ${isInvestor ? 'bg-premium-gold/10 text-premium-gold shadow-premium-gold/5' : 'bg-zinc-800 text-zinc-500'}`}>
                        <Icon size={40} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{asset.name}</h3>
                        <div className="flex items-center gap-3 mt-2">
                           {ownedCount > 0 && <span className="bg-white/5 text-zinc-400 text-[9px] font-bold px-3 py-1 rounded-lg border border-zinc-800">Owned: {ownedCount} Units</span>}
                           <span className="text-zinc-600 text-[10px] font-black italic uppercase">30D Contract</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 p-5 rounded-[1.8rem] border border-zinc-800/50">
                        <p className="text-zinc-600 text-[10px] uppercase font-black mb-1">Entry Capital</p>
                        <p className="text-premium-gold font-mono font-black text-xl">{asset.price.toLocaleString()} 🪙</p>
                        <p className="text-[10px] text-zinc-500 font-bold mt-1 tracking-tighter italic">≈ ৳ {(asset.price / COIN_TO_BDT).toFixed(0)} BDT</p>
                      </div>
                      <div className="bg-black/40 p-5 rounded-[1.8rem] border border-zinc-800/50">
                        <p className={`text-[10px] uppercase font-black mb-1 ${isInvestor ? 'text-green-400' : 'text-blue-400'}`}>
                          {isInvestor ? 'Monthly Yield' : 'Hourly ROI'}
                        </p>
                        <p className="text-white font-mono font-black text-xl">
                          {isInvestor ? `${asset.profit_tier_coins}` : `+${asset.rate}/hr`}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-bold mt-1 tracking-tighter italic">Secured Vector</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => buyAsset(asset)}
                      className={`premium-button w-full h-16 group relative overflow-hidden active:scale-95 ${isInvestor ? 'bg-premium-gold' : 'bg-zinc-800 border border-zinc-700 text-white'}`}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-4">
                        <Sparkles className="animate-pulse" />
                        <span className="text-xl">Initialize Deployment</span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="premium-card p-6 bg-premium-gold/5 border border-premium-gold/10 rounded-[2.5rem] flex gap-5 items-start">
         <div className="p-3 bg-premium-gold/10 rounded-2xl text-premium-gold">
            <AlertCircle size={24} />
         </div>
         <p className="text-[10px] text-zinc-500 font-bold leading-relaxed uppercase tracking-tighter">
           Strategic Notice: ParTimer Official ensures capital stability by strictly limiting market entry vectors. All assets carry a guaranteed 30-day lifecycle with automated liquidations at term.
         </p>
      </div>
    </div>
  );
}
