import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Loader2, ClipboardCheck, AlertCircle, Search, Filter, Warehouse } from 'lucide-react';
import CropCard from '../../components/crops/CropCard';
import VerificationModal from '../../components/crops/VerificationModal';

const AgentDashboard = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Pending verification');
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ latitude, longitude });
            }, (error) => {
                console.error("Location access denied");
            });
        }
    }, []);

    useEffect(() => {
        fetchCrops();
    }, [coords]);

    const fetchCrops = async () => {
        try {
            setLoading(true);
            let url = '/crops/all-crops';
            const params = {};
            
            if (coords) {
                params.latitude = coords.latitude;
                params.longitude = coords.longitude;
                params.radius = 5; // 5km radius
            }

            const res = await api.get(url, { params });
            setCrops(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyClick = (crop) => {
        setSelectedCrop(crop);
        setIsModalOpen(true);
    };

    const filteredCrops = crops.filter(crop => {
        const matchesSearch = crop.cropName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || crop.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Agent Verification Center</h1>
                <p className="text-gray-600 mt-1">Review and verify agricultural listings to ensure quality standards.</p>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search crops..."
                        className="input-field pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        className="input-field w-auto"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="Pending verification">Pending Verification</option>
                        <option value="Verified">Verified</option>
                        <option value="Rejected">Rejected</option>
                        <option value="All">All Statuses</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600 mb-4" />
                    <p className="text-gray-500">Fetching listings for you...</p>
                </div>
            ) : filteredCrops.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCrops.map((crop) => (
                        <div key={crop._id} onClick={() => crop.status === 'Pending verification' && handleVerifyClick(crop)} className={crop.status === 'Pending verification' ? 'cursor-pointer' : ''}>
                            <CropCard crop={crop} role="Agent" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card p-20 text-center bg-gray-50 border-dashed border-2">
                    <Warehouse className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">No matching crops found</h3>
                    <p className="text-gray-500 mt-2">Try changing your filters or searching for something else.</p>
                </div>
            )}

            {selectedCrop && (
                <VerificationModal
                    crop={selectedCrop}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onRefresh={fetchCrops}
                />
            )}
        </div>
    );
};

export default AgentDashboard;
