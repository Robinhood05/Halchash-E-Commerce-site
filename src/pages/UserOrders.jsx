import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Package, Search } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const UserOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'all' 
        ? `${API_BASE_URL}/api/orders/user_orders.php?user_id=${user.id}&status=${statusFilter}`
        : `${API_BASE_URL}/api/orders/user_orders.php?user_id=${user.id}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending Payment',
      processing: 'Processing',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your orders</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => navigate('/profile/orders')}
              className={`px-6 py-3 ${statusFilter === 'all' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
            >
              All Orders
            </button>
            <button
              onClick={() => navigate('/profile/orders?status=pending')}
              className={`px-6 py-3 ${statusFilter === 'pending' ? 'border-b-2 border-yellow-500 text-yellow-600 font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Pending Payment
            </button>
            <button
              onClick={() => navigate('/profile/orders?status=delivered')}
              className={`px-6 py-3 ${statusFilter === 'delivered' ? 'border-b-2 border-green-500 text-green-600 font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Delivered
            </button>
            <button
              onClick={() => navigate('/profile/orders?status=processing')}
              className={`px-6 py-3 ${statusFilter === 'processing' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Processing
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-lg">Order #{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    {order.status === 'delivered' && order.tracking_number && (
                      <p className="text-sm text-gray-500 mt-1">
                        Tracking: {order.tracking_number}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Items ({order.items_count}):</p>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{item.product_name} × {item.quantity}</span>
                        <span className="text-sm font-semibold">৳{parseFloat(item.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">৳{parseFloat(order.total_amount).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;

