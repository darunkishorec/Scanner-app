import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

import AdminHeader from './components/AdminHeader';
import StatCard from './components/StatCard';
import CartsTable from './components/CartsTable';
import SystemLogs from './components/SystemLogs';
import CartDetailModal from './components/CartDetailModal';
import HealthCheckModal from './components/HealthCheckModal';
import ConfirmDialog from './components/ConfirmDialog';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AdminDashboard() {
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
  
  const eventSourceRef = useRef(null);
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

    // Setup intervals - using polling for now (SSE can be added later)
    cartsInterval.current = setInterval(loadCarts, 5000);
    logsInterval.current = setInterval(loadLogs, 4000);
    summaryInterval.current = setInterval(loadDailySummary, 30000);

    return () => {
      document.body.className = '';
      clearInterval(cartsInterval.current);
      clearInterval(logsInterval.current);
      clearInterval(summaryInterval.current);
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

  // Filter carts based on search and status
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
    checkedOutToday: dailySummary.totalCheckouts || 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onLogout={handleLogout} />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Carts"
            value={stats.totalCarts}
            icon={<Activity className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Active Carts"
            value={stats.activeCarts}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Waiting Carts"
            value={stats.waitingCarts}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Checked-Out Today"
            value={stats.checkedOutToday}
            icon={<XCircle className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={loadAllData}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </button>
          <button
            onClick={handleResetAllCarts}
            className="inline-flex items-center px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All Carts
          </button>
          <button
            onClick={handleTestAPI}
            className="inline-flex items-center px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Activity className="w-4 h-4 mr-2" />
            Test API Connection
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by cart ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="active">Active</option>
              <option value="checked-out">Checked-Out</option>
            </select>
          </div>
        </div>

        {/* Carts Table */}
        <div className="mb-6">
          <CartsTable
            carts={filteredCarts}
            onViewCart={setSelectedCart}
            onResetCart={handleResetCart}
          />
        </div>

        {/* Daily Summary Bar */}
        {dailySummary.totalCheckouts > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Total Checkouts Today</p>
                <p className="text-xl font-bold text-gray-900">{dailySummary.totalCheckouts}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Total Revenue Today</p>
                <p className="text-xl font-bold text-green-600">₹{dailySummary.totalRevenue}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Average Cart Value</p>
                <p className="text-xl font-bold text-blue-600">₹{dailySummary.avgCartValue}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Busiest Cart Today</p>
                <p className="text-xl font-bold text-purple-600">{dailySummary.busiestCart || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* System Logs */}
        <SystemLogs logs={logs} onClearLogs={loadLogs} />
      </div>

      {/* Modals */}
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
    </div>
  );
}