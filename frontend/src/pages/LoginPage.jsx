import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, Sprout, Loader2, Tractor, ShoppingBag, UserCheck, ShieldCheck } from 'lucide-react';

const ROLES = [
    { id: 'Farmer', label: 'Farmer', icon: Tractor, desc: 'List and sell your crops' },
    { id: 'Buyer', label: 'Buyer', icon: ShoppingBag, desc: 'Browse and purchase crops' },
    { id: 'Agent', label: 'Agent', icon: UserCheck, desc: 'Verify crop listings' },
];

const LoginPage = () => {
    const [step, setStep] = useState('role'); // 'role' | 'user' | 'admin'
    const [selectedRole, setSelectedRole] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, adminLogin, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(`/dashboard/${user.role.toLowerCase()}`);
        }
    }, [user, navigate]);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setStep('user');
    };

    const handleUserLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        try {
            setIsSubmitting(true);
            await login(email, password);
        } catch (error) {
            // toast handled by api interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        try {
            setIsSubmitting(true);
            await adminLogin(email, password);
        } catch (error) {
            // toast handled by api interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="flex justify-center text-primary-600">
                    <Sprout className="h-12 w-12" />
                </div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    {step === 'admin' ? 'Admin Login' : step === 'user' ? `Login as ${selectedRole}` : 'Welcome Back'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {step === 'role' && (
                        <>Don&apos;t have an account?{' '}
                            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                                Register here
                            </Link>
                        </>
                    )}
                    {(step === 'user' || step === 'admin') && (
                        <button onClick={() => { setStep('role'); setEmail(''); setPassword(''); }}
                            className="font-medium text-primary-600 hover:text-primary-500">
                            ← Back to role selection
                        </button>
                    )}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">

                    {/* Step 1: Role Selection */}
                    {step === 'role' && (
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-center mb-6">Select your role to continue</p>
                            <div className="grid grid-cols-1 gap-4">
                                {ROLES.map(({ id, label, icon: Icon, desc }) => (
                                    <button
                                        key={id}
                                        onClick={() => handleRoleSelect(id)}
                                        className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all text-left group"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{label}</p>
                                            <p className="text-sm text-gray-500">{desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Admin login separator */}
                            <div className="relative mt-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-400">or</span>
                                </div>
                            </div>

                            <button
                                onClick={() => { setStep('admin'); setEmail(''); setPassword(''); }}
                                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-700 font-semibold"
                            >
                                <ShieldCheck className="h-5 w-5 text-gray-500" />
                                Admin Login
                            </button>
                        </div>
                    )}

                    {/* Step 2a: User Login Form (Farmer/Buyer/Agent) */}
                    {step === 'user' && (
                        <form className="space-y-5" onSubmit={handleUserLogin}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email address</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : `Log in as ${selectedRole}`}
                            </button>
                        </form>
                    )}

                    {/* Step 2b: Admin Login Form */}
                    {step === 'admin' && (
                        <form className="space-y-5" onSubmit={handleAdminLogin}>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <ShieldCheck className="h-8 w-8 text-gray-600" />
                                <p className="text-sm text-gray-500 text-center">Enter admin credentials to access the control panel.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="admin@farmearn.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Admin Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login as Admin'}
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
};

export default LoginPage;
