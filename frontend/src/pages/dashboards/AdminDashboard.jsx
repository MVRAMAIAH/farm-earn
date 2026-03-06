import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    Users, Sprout, TrendingUp, BarChart3, ShieldAlert, CheckCircle,
    Trash2, UserX, UserCheck, Loader2, Search
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'analytics') {
                const res = await api.get('/users/analytics');
                setStats(res.data);
            } else if (activeTab === 'users') {
                const res = await api.get('/users');
                setUsers(res.data);
            } else if (activeTab === 'crops') {
                const res = await api.get('/crops/all-crops');
                setCrops(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (id, currentStatus) => {
        try {
            await api.put(`/users/${id}/block`);
            toast.success(`User ${currentStatus ? 'blocked' : 'unblocked'} successfully`);
            fetchData();
        } catch (error) {
            // handled
        }
    };

    const handleDeleteCrop = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await api.delete(`/crops/${id}`);
            toast.success('Crop listing removed');
            fetchData();
        } catch (error) {
            // handled
        }
    };

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredCrops = crops.filter(c => c.cropName.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
                <p className="text-gray-600 mt-1">Global management of users, listings, and system health.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl mb-8 max-w-md">
                {['analytics', 'users', 'crops'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all capitalize ${activeTab === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                </div>
            ) : activeTab === 'analytics' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card p-8 text-center">
                        <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8" />
                        </div>
                        <p className="text-gray-500 font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalUsers}</p>
                    </div>
                    <div className="card p-8 text-center">
                        <div className="h-14 w-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Sprout className="h-8 w-8" />
                        </div>
                        <p className="text-gray-500 font-medium">Farmers</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.farmers}</p>
                    </div>
                    <div className="card p-8 text-center">
                        <div className="h-14 w-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="h-8 w-8" />
                        </div>
                        <p className="text-gray-500 font-medium">Buyers</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.buyers}</p>
                    </div>
                    <div className="card p-8 text-center">
                        <div className="h-14 w-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="h-8 w-8" />
                        </div>
                        <p className="text-gray-500 font-medium">Agents</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.agents}</p>
                    </div>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="input-field pl-10 py-1.5 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider">
                                <tr>
                                    {activeTab === 'users' ? (
                                        <>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4">Crop Name</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeTab === 'users' ? filteredUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{user.role}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {user.isVerified ? 'Active' : 'Blocked'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleBlockUser(user._id, user.isVerified)}
                                                className={`p-2 rounded-lg transition-colors ${user.isVerified ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={user.isVerified ? 'Block User' : 'Unblock User'}
                                            >
                                                {user.isVerified ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                                            </button>
                                        </td>
                                    </tr>
                                )) : filteredCrops.map(crop => (
                                    <tr key={crop._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={crop.cropImage} className="h-10 w-10 rounded-lg object-cover" alt="" />
                                                <span className="font-medium text-gray-900">{crop.cropName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">₹{crop.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${crop.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {crop.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteCrop(crop._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Listing"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
