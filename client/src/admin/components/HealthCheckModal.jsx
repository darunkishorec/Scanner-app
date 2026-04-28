import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';

export default function HealthCheckModal({ onClose }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performHealthCheck();
  }, []);

  const performHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/health');
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
      } else {
        setHealthData({
          status: 'degraded',
          services: {
            fastapi: { status: 'error', error: 'HTTP ' + response.status },
            mongodb: { status: 'error', error: 'Connection failed' },
            cartService: { status: 'error', error: 'Service unavailable' },
            tokenGenerator: { status: 'error', error: 'Service unavailable' }
          }
        });
      }
    } catch (error) {
      setHealthData({
        status: 'degraded',
        services: {
          fastapi: { status: 'error', error: error.message },
          mongodb: { status: 'error', error: 'Connection failed' },
          cartService: { status: 'error', error: 'Service unavailable' },
          tokenGenerator: { status: 'error', error: 'Service unavailable' }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const ServiceStatus = ({ name, service }) => {
    const isOperational = service.status === 'operational';
    
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-3">
          {isOperational ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <div>
            <p className="font-medium text-gray-900">{name}</p>
            {service.error && (
              <p className="text-sm text-red-600">{service.error}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${isOperational ? 'text-green-600' : 'text-red-600'}`}>
            {isOperational ? 'Operational' : 'Error'}
          </p>
          {service.responseTime !== undefined && (
            <p className="text-xs text-gray-500">{service.responseTime}ms</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">System Health Check</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Running health checks...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overall Status */}
              <div className={`p-4 rounded-lg ${
                healthData.status === 'operational' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {healthData.status === 'operational' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <p className={`font-semibold ${
                      healthData.status === 'operational' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {healthData.status === 'operational' ? 'All Systems Operational' : 'Degraded — Check Server Logs'}
                    </p>
                    {healthData.totalResponseTime && (
                      <p className="text-sm text-gray-600">
                        Total response time: {healthData.totalResponseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-3">
                <ServiceStatus 
                  name="FastAPI Server" 
                  service={healthData.services.fastapi} 
                />
                <ServiceStatus 
                  name="MongoDB Connection" 
                  service={healthData.services.mongodb} 
                />
                <ServiceStatus 
                  name="Cart Session Service" 
                  service={healthData.services.cartService} 
                />
                <ServiceStatus 
                  name="QR Token Generator" 
                  service={healthData.services.tokenGenerator} 
                />
              </div>

              {/* Timestamp */}
              {healthData.timestamp && (
                <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Checked at {new Date(healthData.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={performHealthCheck}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Checking...' : 'Recheck'}
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