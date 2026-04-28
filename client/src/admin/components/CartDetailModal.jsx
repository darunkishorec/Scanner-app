import { useState } from 'react';
import { X, RotateCcw, User, Phone, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
    waiting: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Waiting' },
    'checked-out': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Checked-Out' },
    error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Error' }
  };

  const config = statusConfig[status] || statusConfig.error;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const StatusTimeline = ({ statusHistory }) => {
  if (!statusHistory || statusHistory.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Status History</h4>
      <div className="space-y-2">
        {statusHistory.map((entry, index) => (
          <div key={index} className="flex items-center text-sm">
            <div className="flex items-center">
              <StatusBadge status={entry.status} />
              {index < statusHistory.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
            </div>
            <span className="text-gray-500 ml-2">
              {new Date(entry.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CartDetailModal({ cart, onClose, onResetCart, onOverrideStatus }) {
  const [overrideStatus, setOverrideStatus] = useState(cart.status);
  const [isOverriding, setIsOverriding] = useState(false);

  const handleOverrideStatus = async () => {
    if (overrideStatus === cart.status) {
      toast.info('Status is already set to this value');
      return;
    }

    setIsOverriding(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/override-cart-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.cartId,
          newStatus: overrideStatus
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        onOverrideStatus();
        onClose();
      } else {
        toast.error('Failed to override status');
      }
    } catch (error) {
      toast.error('Network error occurred');
    } finally {
      setIsOverriding(false);
    }
  };

  const calculateGST = (subtotal) => {
    return subtotal * 0.05; // 5% GST
  };

  const subtotal = cart.total || 0;
  const gst = calculateGST(subtotal);
  const grandTotal = subtotal + gst;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">{cart.cartId}</h2>
            <StatusBadge status={cart.status} />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-medium text-gray-900">{cart.customerName || 'Not connected'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium text-gray-900">{cart.customerPhone || 'Not available'}</p>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Cart Items</h3>
              <span className="text-sm text-gray-500">({cart.items?.length || 0} items)</span>
            </div>
            
            {cart.items && cart.items.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cart.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">×{item.qty}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">₹{item.price.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{(item.price * item.qty).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Totals */}
                <div className="bg-gray-50 px-4 py-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (5%):</span>
                    <span className="text-gray-900">₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                    <span className="text-gray-900">Grand Total:</span>
                    <span className="text-gray-900">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No items in cart</p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Connected At</p>
                <p className="font-medium text-gray-900">
                  {cart.connectedAt ? new Date(cart.connectedAt).toLocaleString() : 'Not connected'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {cart.lastUpdated ? new Date(cart.lastUpdated).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Manual Override */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Manual Override</h4>
            <div className="flex items-center space-x-3">
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="waiting">Waiting</option>
                <option value="active">Active</option>
                <option value="checked-out">Checked-Out</option>
              </select>
              <button
                onClick={handleOverrideStatus}
                disabled={isOverriding || overrideStatus === cart.status}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isOverriding ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Status History */}
          <StatusTimeline statusHistory={cart.statusHistory} />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => onResetCart(cart.cartId)}
            className="flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset This Cart
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}