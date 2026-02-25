import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wallet, CreditCard, Send, PlusCircle, History, Clock, CheckCircle, XCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const COIN_TO_BDT = 720;
const OFFICIAL_NUMBER = "+8801875354842";

export default function Deposit({ user }) {
  const [activeTab, setActiveTab] = useState('request');
  const [amountBdt, setAmountBdt] = useState('');
  const [method, setMethod] = useState('Bkash');
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const showToast = useToast();

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, activeTab]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('coin_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const bdt = parseFloat(amountBdt);
    if (isNaN(bdt) || bdt < 10) return showToast("Minimum deposit is 10 BDT.", "error");
    if (!trxId) return showToast("Transaction ID is required.", "error");

    setSubmitting(true);
    try {
      const { error } = await supabase.from('coin_requests').insert([{
        user_id: user.id,
        email: user.email,
        amount_bdt: bdt,
        coins_to_add: bdt * COIN_TO_BDT,
        method: method,
        transaction_id: trxId,
        status: 'pending'
      }]);

      if (error) {
        if (error.code === '23505') throw new Error("This Transaction ID has already been submitted.");
        throw error;
      }

      showToast("Deposit request received! Verification takes 15-60 mins.", "success");
      setAmountBdt('');
      setTrxId('');
      setActiveTab('history');
    } catch (err) {
      showToast(err.message || "Submission failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-premium-gold rounded-xl shadow-neon-gold">
             <PlusCircle className="text-black size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Add Capital</h1>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Rate: 1 BDT = {COIN_TO_BDT} Coins</p>
          </div>
        </div>
      </header>

      <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
        {['request', 'history'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all ${activeTab === tab ? 'bg-premium-gold text-black shadow-neon-gold' : 'text-zinc-500'}`}
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
            onSubmit={handleDeposit} 
            className="space-y-6"
          >
            <div className="premium-card bg-zinc-900/40 border-zinc-800 space-y-4">
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Select Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Bkash', 'Nagad', 'Rocket'].map((m) => (
                    <button 
                      key={m}
                      type="button" 
                      onClick={() => setMethod(m)}
                      className={`py-3 rounded-xl border-2 font-black text-[11px] uppercase transition-all ${method === m ? 'bg-premium-gold/10 border-premium-gold text-premium-gold shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-transparent border-zinc-800 text-zinc-600'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-zinc-800/50 space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase font-black">Official Merchant Number</p>
                <div className="flex justify-between items-center">
                   <p className="text-xl font-mono font-black text-white tracking-widest">{OFFICIAL_NUMBER}</p>
                   <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(OFFICIAL_NUMBER);
                      showToast("Number Copied!", "success");
                    }}
                    className="text-[10px] font-black text-premium-gold bg-premium-gold/10 px-3 py-1.5 rounded-lg border border-premium-gold/20"
                   >
                     COPY
                   </button>
                </div>
                <p className="text-[9px] text-zinc-600 font-bold uppercase italic mt-2 flex items-center gap-1">
                  <AlertCircle size={10} /> Use "Send Money" only.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block mb-2 px-1">Amount (BDT)</label>
                <input 
                  type="number" 
                  value={amountBdt}
                  onChange={(e) => setAmountBdt(e.target.value)}
                  placeholder="Min 10 BDT"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-4 px-5 text-white focus:border-premium-gold outline-none transition-all font-mono font-black text-xl"
                />
                {amountBdt && (
                   <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-4 bottom-4 text-premium-gold font-black italic text-xs bg-premium-gold/10 px-3 py-1 rounded-lg border border-premium-gold/20"
                   >
                     = {(parseFloat(amountBdt) * COIN_TO_BDT).toLocaleString()} COINS
                   </motion.div>
                )}
              </div>

              <div className="relative">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block mb-2 px-1">Transaction ID</label>
                <input 
                  type="text" 
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="Enter TrxID"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-4 px-5 text-white focus:border-premium-gold outline-none transition-all font-mono font-black tracking-widest uppercase"
                />
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex gap-3">
               <ShieldCheck className="text-red-500 size-5 flex-shrink-0" />
               <p className="text-[9px] text-zinc-500 font-bold leading-relaxed uppercase">
                 Security Alert: Submitting fake Transaction IDs will result in permanent account suspension and asset forfeiture.
               </p>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="premium-button w-full h-16 shadow-none hover:shadow-neon-gold"
            >
              {submitting ? (
                <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-xl font-black italic tracking-tighter uppercase">Confirm Capital Load</span>
              )}
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
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">No transaction records found</p>
              </div>
            ) : (
              history.map((req) => (
                <div key={req.id} className="premium-card p-4 flex justify-between items-center bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <h3 className="font-black font-mono text-zinc-100">{req.coins_to_add?.toLocaleString() || (req.amount_bdt * COIN_TO_BDT).toLocaleString()} 🪙</h3>
                       <p className="text-[8px] border border-zinc-700 px-2 rounded font-bold text-zinc-500 italic">৳ {req.amount_bdt}</p>
                    </div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{new Date(req.created_at).toLocaleDateString()} • {req.method}</p>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter font-black">{req.transaction_id}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                    req.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                    req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}>
                    {req.status === 'approved' && <CheckCircle size={10} />}
                    {req.status === 'rejected' && <XCircle size={10} />}
                    {req.status === 'pending' && <Clock size={10} className="animate-spin" />}
                    {req.status}
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
