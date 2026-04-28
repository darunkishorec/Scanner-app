import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  LogOut, 
  RefreshCw, 
  RotateCcw, 
  Activity, 
  Eye, 
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Zap,
  Bell,
  Settings,
  BarChart3,
  PieChart
} from 'lucide-react';

import './admin.css';
import ProStatCard from './components/ProStatCard';
import ProCartsTable from './components/ProCartsTable';
import ProSystemLogs from './components/ProSystemLogs';
import CartDetailModal from './components/CartDetailModal';
import HealthCheckModal from './components/HealthCheckModal';
import ConfirmDialog from './components/ConfirmDialog';
import ProCharts from './components/ProCharts';

const API_BASE = 'http://localhost:8000';

export default function AdminDashboardPro() {
  const navigate = useNavigate();
  const [carts, setCarts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dailySummary, setDailySummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCart, setSelectedCart] = useState(null);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const cartsInterval = useRef(null);
  const logsInterval = useRef(null);
  const summaryInterval = useRef(null);

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem('smartcart_admin_session');
    if (!adminSession) {
      navigate('/admin');
      return;
    }

    try {
      const session = JSON.parse(adminSession);
      if (!session.timestamp || Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('smartcart_admin_session');
        navigate('/admin');
        return;
      }
    } catch (e) {
      localStorage.removeItem('smartcart_admin_session');
      navigate('/admin');
      return;
    }

    // Set admin body class
    document.body.className = 'admin-body';

    // Initial data load
    loadAllData();

    // Setup intervals
    cartsInterval.current = setInterval(loadCarts, 5000);
    logsInterval.current = setInterval(loadLogs, 4000);
    summaryInterval.current = setInterval(loadDailySummary, 30000);

    // Update time every second
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      document.body.className = '';
      clearInterval(cartsInterval.current);
      clearInterval(logsInterval.current);
      clearInterval(summaryInterval.current);
      clearInterval(timeInterval);
    };
  }, [navigate]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadCarts(),
      loadLogs(),
      loadDailySummary()
    ]);
    setLoading(false);
  };

  const loadCarts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/carts`);
      if (response.ok) {
        const data = await response.json();
        setCarts(data);
      }
    } catch (error) {
      console.error('Failed to load carts:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/logs`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const loadDailySummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/daily-summary`);
      if (response.ok) {
        const data = await response.json();
        setDailySummary(data);
      }
    } catch (error) {
      console.error('Failed to load daily summary:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smartcart_admin_session');
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  const handleResetAllCarts = () => {
    setConfirmAction({
      type: 'reset-all',
      title: 'Reset All Carts',
      message: 'Are you sure you want to reset all carts? This will disconnect all active customers and clear all cart sessions.',
      action: async () => {
        try {
          const response = await fetch(`${API_BASE}/api/admin/reset-all-carts`, {
            method: 'POST'
          });
          if (response.ok) {
            const data = await response.json();
            toast.success(data.message);
            loadCarts();
          } else {
            toast.error('Failed to reset carts');
          }
        } catch (error) {
          toast.error('Network error occurred');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleResetCart = (cartId) => {
    setConfirmAction({
      type: 'reset-single',
      title: `Reset ${cartId}`,
      message: `Reset ${cartId}? The connected customer will be disconnected.`,
      action: async () => {
        try {
          const response = await fetch(`${API_BASE}/api/admin/reset-cart/${cartId}`, {
            method: 'POST'
          });
          if (response.ok) {
            const data = await response.json();
            toast.success(data.message);
            loadCarts();
          } else {
            toast.error(`Failed to reset ${cartId}`);
          }
        } catch (error) {
          toast.error('Network error occurred');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleTestAPI = () => {
    setShowHealthModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Cart ID', 'Status', 'Customer Name', 'Customer Phone', 'Items Count', 'Cart Total (₹)', 'Connected At', 'Last Updated'];
    const csvData = [
      headers,
      ...filteredCarts.map(cart => [
        cart.cartId,
        cart.status,
        cart.customerName || '',
        cart.customerPhone || '',
        cart.items?.length || 0,
        cart.total || 0,
        cart.connectedAt ? new Date(cart.connectedAt).toLocaleString() : '',
        cart.lastUpdated ? new Date(cart.lastUpdated).toLocaleString() : ''
      ])
    ];

    const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartcart-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Cart data exported successfully');
  };

  // Filter carts
  const filteredCarts = carts.filter(cart => {
    const matchesSearch = !searchTerm || 
      cart.cartId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cart.customerName && cart.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || cart.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    totalCarts: carts.length,
    activeCarts: carts.filter(c => c.status === 'active').length,
    waitingCarts: carts.filter(c => c.status === 'waiting').length,
    checkedOutToday: dailySummary.totalCheckouts || 0,
    totalRevenue: dailySummary.totalRevenue || 0,
    avgCartValue: dailySummary.avgCartValue || 0
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header with Gradient */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="gradient-bg shadow-lg sticky top-0 z-50"
      >
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SmartCart AI</h1>
                <p className="text-sm text-purple-100">Admin Dashboard</p>
              </div>
            </motion.div>

            {/* Center - Store Info */}
            <div className="hidden md:block text-center">
              <p className="text-white font-semibold text-lg">SmartCart Store — ECR Chennai</p>
              <p className="text-purple-100 text-sm">
                {currentTime.toLocaleString('en-IN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-white" />
                <span className="notification-badge">3</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-white" />
                <span className="text-white font-medium">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ProStatCard
            title="Total Carts"
            value={stats.totalCarts}
            icon={<ShoppingCart className="w-6 h-6" />}
            color="blue"
            trend="+12%"
            delay={0}
          />
          <ProStatCard
            title="Active Carts"
            value={stats.activeCarts}
            icon={<Activity className="w-6 h-6" />}
            color="green"
            trend="+8%"
            delay={0.1}
          />
          <ProStatCard
            title="Waiting Carts"
            value={stats.waitingCarts}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
            trend="-3%"
            delay={0.2}
          />
          <ProStatCard
            title="Today's Revenue"
            value={`₹${stats.totalRevenue.toFixed(2)}`}
            icon={<TrendingUp className="w-6 h-6" />}
            color="purple"
            trend="+24%"
            delay={0.3}
          />
        </div>

        {/* Action Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6 mb-8 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search carts or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                />
              </div>
            </div>

            {/* Filter & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="waiting">Waiting</option>
                <option value="active">Active</option>
                <option value="checked-out">Checked-Out</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadAllData}
                className="modern-btn px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-lg flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTestAPI}
                className="modern-btn px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium shadow-lg flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Health</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToCSV}
                className="modern-btn px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium shadow-lg flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetAllCarts}
                className="modern-btn px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-lg flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <ProCharts carts={carts} dailySummary={dailySummary} />

        {/* Carts Table */}
        <ProCartsTable
          carts={filteredCarts}
          onViewCart={setSelectedCart}
          onResetCart={handleResetCart}
        />

        {/* System Logs */}
        <ProSystemLogs logs={logs} onClearLogs={loadLogs} />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedCart && (
          <CartDetailModal
            cart={selectedCart}
            onClose={() => setSelectedCart(null)}
            onResetCart={handleResetCart}
            onOverrideStatus={loadCarts}
          />
        )}

        {showHealthModal && (
          <HealthCheckModal
            onClose={() => setShowHealthModal(false)}
          />
        )}

        {showConfirmDialog && confirmAction && (
          <ConfirmDialog
            title={confirmAction.title}
            message={confirmAction.message}
            onConfirm={() => {
              confirmAction.action();
              setShowConfirmDialog(false);
              setConfirmAction(null);
            }}
            onCancel={() => {
              setShowConfirmDialog(false);
              setConfirmAction(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}