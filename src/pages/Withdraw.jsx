import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wallet, CreditCard, Send, AlertTriangle, Clock, ShieldCheck, History, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const COIN_TO_BDT = 720;

export default function Withdraw({ profile, user, onUpdate }) {
  const [activeTab, setActiveTab] = useState('request');
  const [amountCoins, setAmountCoins] = useState('');
  const [method, setMethod] = useState('Bkash');
  const [number, setNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const showToast = useToast();

  const minWithdrawCoins = 7200; // 10 BDT

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, activeTab]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const coins = parseFloat(amountCoins);
    if (isNaN(coins) || coins < minWithdrawCoins) return showToast(`Minimum withdrawal is ${minWithdrawCoins} Coins (৳10).`, "error");
    if (profile.balance < coins) return showToast("Insufficient Coins!", "error");
    if (!number) return showToast("Account number is required.", "error");

    setSubmitting(true);
    try {
      const bdt = coins / COIN_TO_BDT;
      
      // 1. Log request
      const { error: logError } = await supabase.from('withdrawals').insert([{
        user_id: user.id,
        email: user.email,
        amount_coins: coins,
        amount_bdt: bdt,
        method: method,
        number: number,
        status: 'pending'
      }]);
      if (logError) throw logError;

      // 2. Deduct balance
      const { error: balError } = await supabase.from('profiles').update({ 
        balance: profile.balance - coins 
      }).eq('id', user.id);
      if (balError) throw balError;

      showToast("Withdrawal submitted! Processing starts at 10 AM.", "success");
      setAmountCoins('');
      setNumber('');
      setActiveTab('history');
      if (onUpdate) onUpdate();
    } catch (err) {
      showToast("Transaction failed. Contact Admin.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)]">
             <Wallet className="text-white size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Cash Out</h1>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Rate: {COIN_TO_BDT} Coins = 1 BDT</p>
          </div>
        </div>
      </header>

      <div className="bg-zinc-900/50 p-4 border border-zinc-800 rounded-2xl flex items-start gap-4">
         <Clock className="text-premium-gold size-5 flex-shrink-0 mt-0.5" />
         <div>
           <p className="text-white text-xs font-black uppercase tracking-widest">Processing Window</p>
           <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1 italic">10:00 AM — 06:00 PM (Daily)</p>
         </div>
      </div>

      <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
        {['request', 'history'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all ${activeTab === tab ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-zinc-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'request' ? (
          <motion.form 
            key="request"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleWithdraw} 
            className="space-y-6"
          >
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block mb-2 px-1">Amount to Cashout (Coins)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amountCoins}
                  onChange={(e) => setAmountCoins(e.target.value)}
                  placeholder="Min 7200 Coins"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-5 px-6 text-white focus:border-red-500 outline-none transition-all font-mono font-black text-2xl"
                />
                {amountCoins && (
                   <div className="absolute right-4 bottom-4 text-red-400 font-black italic text-xs bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">
                     = ৳ {(parseFloat(amountCoins) / COIN_TO_BDT).toFixed(2)} BDT
                   </div>
                )}
              </div>
              <p className="text-right text-[10px] text-zinc-600 font-black uppercase tracking-tighter">
                Available Volume: {profile?.balance?.toLocaleString()} 🪙
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block mb-2 px-1">Payment Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {['Bkash', 'Nagad', 'Rocket'].map((m) => (
                  <button 
                    key={m}
                    type="button" 
                    onClick={() => setMethod(m)}
                    className={`py-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${method === m ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-transparent border-zinc-800 text-zinc-600'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block mb-2 px-1">Account Number</label>
              <input 
                type="text" 
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Enter Personal Number"
                className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-4 px-5 text-white focus:border-red-500 outline-none transition-all font-mono font-black tracking-widest"
              />
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex gap-3">
               <ShieldCheck className="text-zinc-600 size-5 flex-shrink-0" />
               <p className="text-[9px] text-zinc-600 font-bold leading-relaxed uppercase">
                 Note: For security, all withdrawals are audited by our financial compliance team. Ensure your BDT account is active.
               </p>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full h-16 bg-red-500 text-white rounded-2xl font-black italic tracking-tighter uppercase text-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:grayscale"
            >
              {submitting ? 'Authenticating...' : 'Confirm Withdrawal'}
            </button>
          </motion.form>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {history.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">No payout records found</p>
              </div>
            ) : (
              history.map((req) => (
                <div key={req.id} className="premium-card p-4 flex justify-between items-center bg-zinc-900/40 border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <h3 className="font-black font-mono text-zinc-100">{req.amount_coins?.toLocaleString()} 🪙</h3>
                       <p className="text-[8px] border border-red-500/30 px-2 rounded font-bold text-red-400 italic">৳ {req.amount_bdt?.toFixed(2)}</p>
                    </div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{new Date(req.created_at).toLocaleDateString()} • {req.method}</p>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter font-black">{req.number}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                    req.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}>
                    {req.status === 'approved' && <CheckCircle size={10} />}
                    {req.status === 'rejected' && <XCircle size={10} />}
                    {req.status === 'pending' && <Clock size={10} />}
                    {req.status === 'approved' ? 'Paid' : req.status}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
