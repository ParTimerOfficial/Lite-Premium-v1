import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { t } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { 
  Users, 
  DollarSign, 
  Settings, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  TrendingUp,
  BarChart3,
  Gamepad2,
  ShoppingBag,
  Globe,
  Shield,
  Database,
  Zap,
  Clock,
  TrendingDown
} from 'lucide-react';

const Admin = ({ session }) => {
  const { getComponentStyles } = useTheme();
  const styles = getComponentStyles();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [economy, setEconomy] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (session?.user?.email === 'mdmarzangazi@gmail.com') {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data
      const [usersRes, assetsRes, economyRes, settingsRes] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('assets').select('*').order('price_coins', { ascending: true }),
        supabase.from('economy_state').select('*').single(),
        supabase.from('admin_settings').select('*').single()
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (assetsRes.data) setAssets(assetsRes.data);
      if (economyRes.data) setEconomy(economyRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (error) {
      console.error('Admin fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'assets', label: t('assets'), icon: DollarSign },
    { id: 'economy', label: t('economy'), icon: TrendingUp },
    { id: 'settings', label: t('settings'), icon: Settings },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'utility', label: 'Utility', icon: ShoppingBag },
    { id: 'community', label: 'Community', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'logs', label: 'Logs', icon: Database }
  ];

  const AdminLayout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Admin Command Center
                </h1>
                <p className="text-sm text-gray-400">System Control & Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                Super Admin
              </span>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-200">Navigation</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">System Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Users</span>
                  <span className="text-white font-mono">{users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Assets</span>
                  <span className="text-white font-mono">{assets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Market Demand</span>
                  <span className={`font-mono ${economy?.market_demand_index > 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {economy?.market_demand_index?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard Tab
  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">System Dashboard</h2>
        <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleString()}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<Users size={24} />}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Coins"
          value={economy?.total_coins_circulation?.toFixed(0) || '0'}
          icon={<DollarSign size={24} />}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Market Index"
          value={economy?.market_demand_index?.toFixed(2) || '0.00'}
          icon={<TrendingUp size={24} />}
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Inflation Rate"
          value={`${(economy?.inflation_rate || 0).toFixed(2)}%`}
          icon={<TrendingDown size={24} />}
          color="from-red-500 to-pink-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-2">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex justify-between items-center p-2 bg-black/30 rounded">
                <span className="text-sm">{user.username || user.email}</span>
                <span className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Database</span>
              <span className="text-green-400 text-sm">✓ Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Auth System</span>
              <span className="text-green-400 text-sm">✓ Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Collection Engine</span>
              <span className="text-green-400 text-sm">✓ Running</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Users Tab
  const UsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Balance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-700/50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">{user.username || user.email}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-green-400">{user.coins_balance?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.is_verified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Eye size={16} />
                    </button>
                    <button className="p-1 text-yellow-400 hover:text-yellow-300">
                      <Edit size={16} />
                    </button>
                    <button className="p-1 text-red-400 hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Assets Tab
  const AssetsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Asset Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30">
          <Plus size={16} /> Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map(asset => (
          <div key={asset.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{asset.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                asset.type === 'worker' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {asset.type}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Price</span>
                <span className="font-mono text-green-400">{asset.price_coins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Base Rate</span>
                <span className="font-mono">{asset.base_rate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Level</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  asset.risk_level === 'high' ? 'bg-red-500/20 text-red-400' :
                  asset.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {asset.risk_level}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30">
                Edit
              </button>
              <button className="px-3 py-2 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Economy Tab
  const EconomyTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Economy Control</h2>
        <button
          onClick={updateEconomy}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
        >
          <RefreshCw size={16} /> Update Economy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Current State</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Coins</span>
              <span className="font-mono text-green-400">{economy?.total_coins_circulation?.toFixed(0) || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Market Demand</span>
              <span className="font-mono">{economy?.market_demand_index?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Season Modifier</span>
              <span className="font-mono">{economy?.season_modifier?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Inflation Rate</span>
              <span className="font-mono">{(economy?.inflation_rate || 0).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Control Parameters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Market Demand Index</label>
              <input
                type="number"
                step="0.1"
                defaultValue={economy?.market_demand_index || 1.0}
                className="w-full px-3 py-2 bg-gray-600 rounded text-white"
                id="market-demand"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Season Modifier</label>
              <input
                type="number"
                step="0.1"
                defaultValue={economy?.season_modifier || 1.0}
                className="w-full px-3 py-2 bg-gray-600 rounded text-white"
                id="season-modifier"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Inflation Rate (%)</label>
              <input
                type="number"
                step="0.1"
                defaultValue={economy?.inflation_rate || 0}
                className="w-full px-3 py-2 bg-gray-600 rounded text-white"
                id="inflation-rate"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Tab
  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">System Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Financial Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Cashout Number</label>
              <input
                type="text"
                defaultValue={settings?.cashout_number || ''}
                className="w-full px-3 py-2 bg-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Referral Bonus (Coins)</label>
              <input
                type="number"
                defaultValue={settings?.referral_bonus_coins || 720}
                className="w-full px-3 py-2 bg-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Min Withdraw (Coins)</label>
              <input
                type="number"
                defaultValue={settings?.min_withdraw_coins || 7200}
                className="w-full px-3 py-2 bg-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Exchange Rate (Coins/BDT)</label>
              <input
                type="number"
                defaultValue={settings?.exchange_rate_coins_per_bdt || 720}
                className="w-full px-3 py-2 bg-gray-600 rounded text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Maintenance Mode</span>
              <input
                type="checkbox"
                defaultChecked={settings?.is_maintenance || false}
                className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Auto Updates</span>
              <input
                type="checkbox"
                defaultChecked={true}
                className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper Components
  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-4 border border-gray-600">
      <div className="flex justify-between items-start mb-2">
        <div className={`w-10 h-10 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
    </div>
  );

  const updateEconomy = async () => {
    const marketDemand = parseFloat(document.getElementById('market-demand')?.value || economy?.market_demand_index);
    const seasonModifier = parseFloat(document.getElementById('season-modifier')?.value || economy?.season_modifier);
    const inflationRate = parseFloat(document.getElementById('inflation-rate')?.value || economy?.inflation_rate);

    try {
      const { error } = await supabase.rpc('update_economy_parameters', {
        new_market_demand: marketDemand,
        new_season_modifier: seasonModifier,
        new_inflation_rate: inflationRate
      });

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Update economy error:', error);
    }
  };

  if (session?.user?.email !== 'mdmarzangazi@gmail.com') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You must be a Super Admin to access this panel.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'assets' && <AssetsTab />}
      {activeTab === 'economy' && <EconomyTab />}
      {activeTab === 'settings' && <SettingsTab />}
      {activeTab === 'gaming' && <div className="text-center py-8 text-gray-400">Gaming System Coming Soon</div>}
      {activeTab === 'utility' && <div className="text-center py-8 text-gray-400">Utility System Coming Soon</div>}
      {activeTab === 'community' && <div className="text-center py-8 text-gray-400">Community Management Coming Soon</div>}
      {activeTab === 'security' && <div className="text-center py-8 text-gray-400">Security Logs Coming Soon</div>}
      {activeTab === 'logs' && <div className="text-center py-8 text-gray-400">System Logs Coming Soon</div>}
    </AdminLayout>
  );
};

export default Admin;