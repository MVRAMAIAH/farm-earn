import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import CropCard from '../../components/crops/CropCard';
import { Plus, X, Upload, Loader2, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const FarmerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        cropName: '',
        quantity: '',
        price: '',
        harvestDate: '',
        cropImage: '',
        description: '',
        category: 'Available Crops',
        latitude: '',
        longitude: '',
        address: ''
    });

    useEffect(() => {
        fetchMyCrops();
    }, []);

    const fetchMyCrops = async () => {
        try {
            setLoading(true);
            const res = await api.get('/crops/farmer-crops');
            setCrops(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Optionally try to capture geolocation (not mandatory)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({ ...prev, latitude, longitude }));
                    toast.info(`Location captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                },
                () => {
                    // Location denied - that's fine, not required
                    toast.info('Location not captured. You can still list your crop.');
                }
            );
        }

        const imgData = new FormData();
        imgData.append('image', file);

        try {
            setUploading(true);
            const res = await api.post('/upload', imgData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, cropImage: res.data.imageUrl }));
            toast.success('Image uploaded successfully!');
        } catch (error) {
            toast.error('Image upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/crops/add-crop', formData);
            toast.success('Crop listed successfully!');
            setIsModalOpen(false);
            setFormData({
                cropName: '',
                quantity: '',
                price: '',
                harvestDate: '',
                cropImage: '',
                description: '',
                category: 'Available Crops',
                latitude: '',
                longitude: '',
                address: ''
            });
            fetchMyCrops();
        } catch (error) {
            // handled by interceptor
        }
    };

    const stats = [
        { label: 'Total Crops', value: crops.length, icon: <Package />, color: 'text-blue-600' },
        { label: 'Verified', value: crops.filter(c => c.status === 'Verified').length, icon: <CheckCircle />, color: 'text-green-600' },
        { label: 'Pending', value: crops.filter(c => c.status === 'Pending verification').length, icon: <Clock />, color: 'text-yellow-600' },
        { label: 'Rejected', value: crops.filter(c => c.status === 'Rejected').length, icon: <AlertCircle />, color: 'text-red-600' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage your crop listings and track their verification status.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center justify-center space-x-2"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add New Crop</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="card p-6 flex items-center space-x-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-gray-50 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Crop Listings */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Listings</h2>
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                </div>
            ) : crops.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {crops.map((crop) => (
                        <CropCard key={crop._id} crop={crop} role="Farmer" />
                    ))}
                </div>
            ) : (
                <div className="card p-20 text-center bg-gray-50 border-dashed border-2">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">No crops listed yet</h3>
                    <p className="text-gray-500 mt-2">Start by clicking the "Add New Crop" button above.</p>
                </div>
            )}

            {/* Add Crop Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold">List a New Crop</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                                    <input required name="cropName" value={formData.cropName} onChange={handleInputChange} className="input-field" placeholder="e.g. Basmati Rice" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} className="input-field">
                                        <option value="Available Crops">Available Crops</option>
                                        <option value="Useful Crops">Useful Crops</option>
                                        <option value="Crops Going To Sell">Crops Going To Sell</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Quintals)</label>
                                    <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="input-field" placeholder="50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (per Quintal ₹)</label>
                                    <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="input-field" placeholder="2500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                                    <input required type="date" name="harvestDate" value={formData.harvestDate} onChange={handleInputChange} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address / Location</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="input-field" placeholder="Village, District (optional)" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Description</label>
                                <textarea required name="description" value={formData.description} onChange={handleInputChange} className="input-field h-24 resize-none" placeholder="Details about quality, variety, etc."></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Image <span className="text-gray-400 font-normal">(optional)</span></label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-500 transition-colors">
                                    {formData.cropImage ? (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                            <img src={formData.cropImage} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, cropImage: '' })}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center">
                                            <div className="mx-auto h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                                                <Upload className="h-8 w-8" />
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <label className="relative cursor-pointer rounded-md font-bold text-primary-600 hover:text-primary-500">
                                                    <span>Click to upload image</span>
                                                    <input type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                                {uploading && <div className="mt-2 flex items-center text-sm text-primary-600"><Loader2 className="animate-spin h-4 w-4 mr-2" /> Uploading...</div>}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full btn-primary py-3 text-lg"
                                >
                                    List Crop Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerDashboard;
