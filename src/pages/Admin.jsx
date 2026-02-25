import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/ToastContext';
import { Users, Package, Settings, Plus, Edit2, Trash2, CheckCircle, Database, TrendingUp, AlertCircle, Clock } from 'lucide-react';

export default function Admin({ user }) {
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [profiles, setProfiles] = useState([]);
  const [assets, setAssets] = useState([]);
  const [depositRequests, setDepositRequests] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email === 'mdmarzangazi@gmail.com') {
      refreshAll();
    }
  }, [user]);

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchProfiles(),
      fetchAssets(),
      fetchDepositRequests(),
      fetchWithdrawRequests()
    ]);
    setLoading(false);
  };

  const fetchDepositRequests = async () => {
    const { data } = await supabase.from('coin_requests').select('*').order('created_at', { ascending: false });
    if (data) setDepositRequests(data);
  };

  const fetchWithdrawRequests = async () => {
    const { data } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
    if (data) setWithdrawRequests(data);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('balance', { ascending: false });
    if (data) setProfiles(data);
  };

  const fetchAssets = async () => {
    const { data } = await supabase.from('assets').select('*').order('created_at', { ascending: true });
    if (data) setAssets(data);
  };

  const handleAssetAction = async (asset = null) => {
    const isEdit = !!asset;
    const name = prompt("Asset Designation (Name):", isEdit ? asset.name : "");
    if (!name) return;
    
    const type = prompt("Vector Classification ('worker' or 'investor'):", isEdit ? asset.type : "worker");
    const price = prompt("Deployment Cost (Internal Coins):", isEdit ? asset.price : "1000");
    const stock_limit = prompt("Global Emission Limit (Stock):", isEdit ? asset.stock_limit : "100");
    const lifecycle = prompt("Operational Lifecycle (Days):", isEdit ? asset.lifecycle_days : "30");
    
    let rate = 0;
    let profit_tier = 0;

    if (type === 'worker') {
      rate = prompt("Active Generation Velocity (Coins/Hour):", isEdit ? asset.rate : "10");
    } else {
      profit_tier = prompt("Strategic Profit Target (Monthly Total Coins):", isEdit ? asset.profit_tier_coins : "5000");
    }

    const payload = {
      name,
      type,
      price: parseFloat(price),
      stock_limit: parseInt(stock_limit),
      lifecycle_days: parseInt(lifecycle),
      rate: parseFloat(rate || 0),
      profit_tier_coins: parseFloat(profit_tier || 0),
      icon: type === 'worker' ? 'Zap' : 'Rocket'
    };

    const { error } = isEdit 
      ? await supabase.from('assets').update(payload).eq('id', asset.id)
      : await supabase.from('assets').insert([payload]);

    if (!error) {
      showToast(isEdit ? "Asset configuration synchronized!" : "New asset vector deployed!", "success");
      fetchAssets();
    } else {
      showToast(error.message, "error");
    }
  };

  const approveDeposit = async (req) => {
    try {
      // Use the RPC for atomic update if exists, else manual
      const { error } = await supabase.rpc('approve_coin_request', { req_id: req.id });
      if (error) {
        // Fallback manual update if RPC is missing
        await supabase.from('profiles').update({ 
          balance: profiles.find(p => p.id === req.user_id).balance + req.coins_to_add 
        }).eq('id', req.user_id);
        await supabase.from('coin_requests').update({ status: 'approved' }).eq('id', req.id);
      }
      showToast("Deposit Approved + Capital Added", "success");
      refreshAll();
    } catch (e) {
      showToast("Failed to process approval", "error");
    }
  };

  if (user?.email !== 'mdmarzangazi@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="premium-card text-center max-w-sm space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
             <AlertCircle className="text-red-500 size-10" />
          </div>
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Access Denied</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase leading-relaxed">Financial compliance violation. Your account lacks 'Market Oversight' privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pb-32 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-premium-gold uppercase">Central Command</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">ParTimer Official Oversight System</p>
        </div>
        <div className="flex gap-3">
           <button onClick={refreshAll} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all"><Clock size={20} /></button>
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-neon-gold/5">
              <div className="text-right">
                <p className="text-[8px] text-zinc-600 font-black uppercase">Reserves</p>
                <p className="text-premium-gold font-mono font-black">{profiles.find(p => p.email === user.email)?.balance?.toLocaleString()} 🪙</p>
              </div>
           </div>
        </div>
      </header>

      <nav className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 sticky top-4 z-50 backdrop-blur-xl">
        {[
          { id: 'users', icon: Users, label: 'Capitalists' },
          { id: 'deposits', icon: Plus, label: 'Inflow' },
          { id: 'withdrawals', icon: TrendingUp, label: 'Outflow' },
          { id: 'assets', icon: Package, label: 'Market' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-premium-gold text-black shadow-neon-gold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <tab.icon size={14} /> <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {activeTab === 'users' && (
        <div className="grid gap-4">
          <div className="bg-premium-gold/5 border border-premium-gold/20 p-6 rounded-[2rem] flex justify-between items-center">
             <div>
               <h2 className="text-lg font-black italic text-white uppercase">Circulating Supply</h2>
               <p className="text-zinc-500 text-[10px] font-bold uppercase">Total coins across all active portfolios</p>
             </div>
             <p className="text-3xl font-mono text-premium-gold font-black">{profiles.reduce((acc, p) => acc + (p.balance || 0), 0).toLocaleString()} 🪙</p>
          </div>
          {profiles.map(p => (
            <div key={p.id} className="premium-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:bg-zinc-900/80 transition-all">
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${p.badge === 'Platinum' ? 'bg-premium-gold text-black shadow-neon-gold' : 'bg-zinc-800 text-zinc-500'}`}>
                   {p.email[0].toUpperCase()}
                 </div>
                 <div>
                   <div className="flex items-center gap-2">
                     <p className="font-bold text-white">{p.email}</p>
                     {p.badge === 'Platinum' && <CheckCircle size={12} className="text-premium-gold" />}
                   </div>
                   <p className="text-[10px] font-black uppercase text-zinc-600 tracking-tighter">{p.id.slice(0, 18)}...</p>
                 </div>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className="text-right flex-1 md:flex-none">
                    <p className="text-[9px] font-black uppercase text-zinc-500 mb-1">Available Capital</p>
                    <p className="text-xl font-mono font-black text-premium-gold">{p.balance?.toLocaleString()} 🪙</p>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => {
                        const amt = prompt("Amount to adjust:");
                        if (amt) supabase.rpc('increment', { row_id: p.id, table_name: 'profiles', column_name: 'balance', amount: parseFloat(amt) }).then(() => refreshAll());
                    }} className="p-3 bg-zinc-800 hover:bg-premium-gold hover:text-black rounded-xl border border-zinc-700 transition-all"><Edit2 size={16} /></button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'deposits' && (
        <div className="grid gap-4">
           {depositRequests.length === 0 ? <EmptyState msg="No capital inflow requests" /> : 
            depositRequests.map(req => (
              <div key={req.id} className="premium-card flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 items-center w-full">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                     <Plus size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{req.email}</h3>
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{new Date(req.created_at).toLocaleString()}</p>
                    <div className="flex gap-2 mt-1">
                       <span className="text-[8px] font-black bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 uppercase">{req.method}</span>
                       <span className="text-[8px] font-black bg-zinc-800 px-2 py-0.5 rounded text-premium-gold uppercase">{req.transaction_id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto">
                   <div className="text-right">
                      <p className="text-[9px] font-black uppercase text-zinc-500">Requested Coins</p>
                      <p className="text-xl font-mono font-black text-premium-gold">+{req.coins_to_add?.toLocaleString()} 🪙</p>
                      <p className="text-[10px] font-bold text-zinc-600">৳ {req.amount_bdt}</p>
                   </div>
                   {req.status === 'pending' && (
                     <button 
                        onClick={() => approveDeposit(req)}
                        className="bg-green-500 text-black px-6 py-3 rounded-xl font-black italic uppercase tracking-tighter hover:scale-105 transition-all"
                     >Approve</button>
                   )}
                </div>
              </div>
            ))
           }
        </div>
      )}

      {activeTab === 'withdrawals' && (
         <div className="grid gap-4">
           {withdrawRequests.length === 0 ? <EmptyState msg="No liquidity exit requests" /> : 
            withdrawRequests.map(req => (
              <div key={req.id} className="premium-card flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 items-center w-full">
                  <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                     <TrendingUp size={24} className="rotate-180" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{req.email}</h3>
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{req.method} • {req.number}</p>
                    <p className="text-[9px] font-bold text-zinc-500">{new Date(req.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto">
                   <div className="text-right">
                      <p className="text-[9px] font-black uppercase text-zinc-500">Exiting Volume</p>
                      <p className="text-xl font-mono font-black text-red-400">-{req.amount_coins?.toLocaleString()} 🪙</p>
                      <p className="text-[10px] font-bold text-zinc-600">৳ {req.amount_bdt?.toFixed(2)}</p>
                   </div>
                   {req.status === 'pending' ? (
                     <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            await supabase.from('withdrawals').update({ status: 'approved' }).eq('id', req.id);
                            showToast("Withdrawal Paid", "success");
                            refreshAll();
                          }}
                          className="bg-white text-black px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest"
                        >Settle</button>
                        <button 
                          onClick={async () => {
                            const { data: userData } = await supabase.from('profiles').select('balance').eq('id', req.user_id).single();
                            await supabase.from('profiles').update({ balance: (userData?.balance || 0) + req.amount_coins }).eq('id', req.user_id);
                            await supabase.from('withdrawals').update({ status: 'rejected' }).eq('id', req.id);
                            showToast("Request Returned", "info");
                            refreshAll();
                          }}
                          className="bg-red-500/10 text-red-500 px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest"
                        >Void</button>
                     </div>
                   ) : (
                     <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg ${req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {req.status}
                     </span>
                   )}
                </div>
              </div>
            ))
           }
         </div>
      )}

      {activeTab === 'assets' && (
        <div className="space-y-6">
          <button 
            onClick={() => handleAssetAction()}
            className="w-full bg-premium-gold text-black py-4 rounded-3xl font-black italic tracking-tighter uppercase text-xl shadow-neon-gold hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
          >
            <Database /> Deploy New Asset Class
          </button>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map(a => (
              <div key={a.id} className="relative bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 hover:border-premium-gold/40 transition-all duration-500 group overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                   <Activity size={120} />
                </div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-[1.5rem] ${a.type === 'worker' ? 'bg-blue-500/10 text-blue-400' : 'bg-premium-gold/10 text-premium-gold shadow-inner'}`}>
                    {a.type === 'worker' ? <Package size={24} /> : <Rocket size={24} />}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleAssetAction(a)} className="p-2.5 bg-zinc-800/50 text-zinc-500 hover:text-white rounded-xl transition-all hover:bg-zinc-800"><Edit2 size={16} /></button>
                    <button onClick={async () => {
                       if(confirm("Expunge terminal vector?")) {
                         await supabase.from('assets').delete().eq('id', a.id);
                         fetchAssets();
                       }
                    }} className="p-2.5 bg-red-500/5 text-zinc-500 hover:text-red-500 rounded-xl transition-all hover:bg-red-500/20"><Trash2 size={16} /></button>
                  </div>
                </div>
                
                <div className="mb-6">
                   <h3 className="text-xl font-black text-zinc-100 italic uppercase tracking-tighter leading-tight">{a.name}</h3>
                   <div className="flex items-center gap-2 mt-2">
                     <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${a.type === 'investor' ? 'bg-premium-gold text-black' : 'bg-zinc-800 text-zinc-600'}`}>{a.type}</span>
                     <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">{a.id.slice(0, 8)}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-black/40 rounded-2xl p-4 border border-zinc-800/50">
                      <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Valuation</p>
                      <p className="font-mono font-black text-premium-gold text-sm">{a.price?.toLocaleString()} 🪙</p>
                   </div>
                   <div className="bg-black/40 rounded-2xl p-4 border border-zinc-800/50">
                      <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">{a.type === 'worker' ? 'Yield/Hr' : 'Monthly Pool'}</p>
                      <p className="font-mono font-black text-zinc-200 text-sm">{a.type === 'worker' ? `+${a.rate}` : a.profit_tier_coins}</p>
                   </div>
                   <div className="bg-black/40 rounded-2xl p-4 border border-zinc-800/50 col-span-2">
                      <div className="flex justify-between items-center mb-1.5">
                         <p className="text-[8px] font-black text-zinc-600 uppercase">Stock Density</p>
                         <p className="text-[8px] font-mono font-black text-zinc-500">{a.units_sold} / {a.stock_limit}</p>
                      </div>
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-premium-gold/40" style={{ width: `${(a.units_sold/a.stock_limit)*100}%` }} />
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[2.5rem] py-20 text-center">
       <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.3em]">{msg}</p>
    </div>
  );
}
