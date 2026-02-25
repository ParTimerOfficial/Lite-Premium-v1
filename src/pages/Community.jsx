import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Globe, MessageSquare, Users, ExternalLink, Copy, Check, Wifi, WifiOff, Shield, Sparkles, Zap, Rocket, Fingerprint } from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../lib/ThemeContext';
import { useTranslation } from '../lib/i18n';

export default function Community() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState({});
  const showToast = useToast();
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('community_links').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (data) setLinks(data);
    } catch (err) {
      showToast("Failed to load community links", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (url, platform) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(prev => ({ ...prev, [platform]: true }));
      showToast(`${platform} link copied!`, "success");
      setTimeout(() => setCopied(prev => ({ ...prev, [platform]: false })), 2000);
    } catch (err) {
      showToast("Failed to copy link", "error");
    }
  };

  const openLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-premium-gold/10 rounded-[2rem] animate-ping absolute" />
          <div className="w-24 h-24 border-[6px] border-premium-gold border-t-transparent rounded-[2rem] animate-spin shadow-neon-gold" />
          <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-premium-gold animate-bounce" size={24} />
        </div>
        <p className="text-premium-gold font-black tracking-[0.4em] animate-pulse uppercase text-[10px]">Connecting Network Nodes</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-12 pb-44">
      <header className="space-y-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-premium-gold/10 border-2 border-premium-gold/20 rounded-[2rem] shadow-neon-gold/5">
            <Globe className="text-premium-gold size-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Network <span className="text-premium-gold">Matrix</span></h1>
            <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.4em] mt-3 leading-none">LitePremium Community Hub</p>
          </div>
        </div>

        <div className="bg-zinc-950 p-8 rounded-[2.5rem] border-2 border-zinc-900 shadow-inner space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-premium-gold/10 rounded-xl border border-premium-gold/20">
              <Shield className="text-premium-gold size-6" />
            </div>
            <div>
              <h3 className="text-lg font-black italic text-white">Secure Network Access</h3>
              <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Verified Community Channels</p>
            </div>
          </div>
          
          <p className="text-zinc-600 text-[10px] font-bold leading-relaxed tracking-tight">
            Access our official community channels for support, updates, and networking opportunities. 
            All links are verified and maintained by the LitePremium team.
          </p>
        </div>
      </header>

      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {links.map((link, index) => (
            <motion.div 
              key={link.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-zinc-950 border-2 border-zinc-900 rounded-[3rem] p-8 shadow-3xl hover:border-premium-gold/30 transition-all duration-700 overflow-hidden relative group"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-premium-gold/30 to-transparent" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-premium-gold/10 rounded-2xl border border-premium-gold/20 shadow-neon-gold/5 group-hover:scale-110 transition-transform">
                    {link.platform === 'telegram' && <MessageSquare className="text-premium-gold size-8" />}
                    {link.platform === 'whatsapp' && <Users className="text-premium-gold size-8" />}
                    {link.platform === 'imo' && <Wifi className="text-premium-gold size-8" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase text-white leading-none">
                      {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} Community
                    </h3>
                    <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest mt-1">Official Channel</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase px-3 py-1.5 bg-zinc-900 text-zinc-600 rounded-full border border-zinc-800">
                    {link.platform}
                  </span>
                  <Sparkles className="text-premium-gold size-4 animate-pulse" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-black/80 p-4 rounded-xl border border-zinc-900 shadow-inner">
                  <p className="text-zinc-800 text-[9px] uppercase font-black mb-2 px-1">Status</p>
                  <p className="text-green-500 font-black text-sm">ACTIVE</p>
                </div>
                
                <div className="bg-black/80 p-4 rounded-xl border border-zinc-900 shadow-inner">
                  <p className="text-zinc-800 text-[9px] uppercase font-black mb-2 px-1">Members</p>
                  <p className="text-white font-black text-sm">Growing Daily</p>
                </div>
                
                <div className="bg-black/80 p-4 rounded-xl border border-zinc-900 shadow-inner">
                  <p className="text-zinc-800 text-[9px] uppercase font-black mb-2 px-1">Response Time</p>
                  <p className="text-blue-500 font-black text-sm">24/7</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => copyToClipboard(link.url, link.platform)}
                  className="flex-1 h-14 bg-zinc-900 text-premium-gold border-2 border-premium-gold/20 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-premium-gold hover:text-black transition-all duration-300 shadow-neon-gold/5 flex items-center justify-center gap-3 group"
                >
                  {copied[link.platform] ? (
                    <>
                      <Check className="size-4" />
                      COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="size-4 group-hover:rotate-180 transition-transform" />
                      COPY LINK
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => openLink(link.url)}
                  className="flex-1 h-14 bg-premium-gold text-black border-2 border-premium-gold rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-black hover:text-premium-gold transition-all duration-300 shadow-neon-gold flex items-center justify-center gap-3 group"
                >
                  <ExternalLink className="size-4 group-hover:translate-x-1 transition-transform" />
                  OPEN LINK
                </button>
              </div>

              <div className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mb-2">Quick Access</p>
                <p className="text-zinc-600 text-[10px] font-bold tracking-tight">
                  Join our {link.platform} community for real-time support, updates, and networking with fellow investors.
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="bg-zinc-950 p-10 rounded-[3rem] border-2 border-zinc-900 flex gap-6 items-start shadow-inner relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:rotate-6 transition-transform"><Rocket size={100} /></div>
         <div className="p-4 bg-premium-gold/5 rounded-2xl text-premium-gold relative z-10">
            <Fingerprint size={28} />
         </div>
         <div className="relative z-10 space-y-2">
            <p className="text-white text-xs font-black uppercase tracking-widest leading-none">Network Security Protocol</p>
            <p className="text-[9px] text-zinc-700 font-bold leading-relaxed uppercase tracking-tight">
              All community links are verified and secured. Never share your credentials or personal information in public channels. 
              Our team will never ask for sensitive information via community platforms.
            </p>
         </div>
      </div>
    </div>
  );
}