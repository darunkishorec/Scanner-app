import { useState, useEffect } from 'react';
import { Eye, RotateCcw, ShoppingCart, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
    waiting: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Waiting' },
    'checked-out': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Checked-Out' },
    error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Error' }
  };

  const config = statusConfig[status] || statusConfig.error;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const UptimeIndicator = ({ cart }) => {
  const [uptime, setUptime] = useState('');

  useEffect(() => {
    const updateUptime = () => {
      if (!cart.lastUpdated) return;
      
      const now = new Date();
      const lastUpdate = new Date(cart.lastUpdated);
      const diffMs = now - lastUpdate;
      
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      
      setUptime(`${minutes}m ${seconds}s`);
    };

    updateUptime();
    const interval = setInterval(updateUptime, 1000);
    
    return () => clearInterval(interval);
  }, [cart.lastUpdated]);

  return (
    <span className="text-xs text-gray-500">
      {uptime}
    </span>
  );
};

export default function CartsTable({ carts, onViewCart, onResetCart }) {
  if (carts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No carts found</h3>
          <p className="text-gray-500">No cart sessions are currently active. Carts will appear here once customers start connecting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-base font-semibold text-gray-900">Carts Table</h3>
        <p className="text-sm text-gray-600 mt-1">{carts.length} cart{carts.length !== 1 ? 's' : ''} found</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Cart ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Total (₹)
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Connected At
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Uptime
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carts.map((cart) => (
              <tr key={cart.cartId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">{cart.cartId}</div>
                    {cart.isAbandoned && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Abandoned
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={cart.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{cart.customerName || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{cart.customerPhone || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 text-center">{cart.items?.length || 0}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {cart.total ? `₹${cart.total.toFixed(2)}` : '₹0.00'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-600">
                    {cart.connectedAt ? new Date(cart.connectedAt).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <UptimeIndicator cart={cart} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewCart(cart)}
                      className="text-blue-600 hover:text-blue-900 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onResetCart(cart.cartId)}
                      className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                      title="Reset Cart"
                    >
                      <RotateCcw className="w-4 h-4" />
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
}