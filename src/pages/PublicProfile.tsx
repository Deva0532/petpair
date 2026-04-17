import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pet } from '../types';
import { getPets } from '../services/petService';
import { useToast } from '../contexts/ToastContext';
import { PetCard } from '../components/pets/PetCard';
import { MapPinIcon, ShieldCheckIcon, CalendarIcon, ArrowLeftIcon, StarIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export const PublicProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [seller, setSeller] = useState<any>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    
    useEffect(() => {
        const fetchSellerData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                let userStats = { rating: 0, reviewCount: 0, successfulSales: 0 };
                try {
                    const statsRes = await fetch(`http://localhost:5000/api/users/${id}/stats`);
                    if (statsRes.ok) {
                        userStats = await statsRes.json();
                    }
                } catch (e) {
                    console.error('Could not fetch user stats:', e);
                }

                const { pets: allPets } = await getPets(1, 1000); 
                
                const userPets = allPets.filter(pet => {
                    const ownerIdStr = pet.owner?.id || (pet.owner as any)?._id;
                    return ownerIdStr === id;
                });
                
                setPets(userPets.filter(p => p.status !== 'sold' && p.status !== 'deleted'));

                if (userPets.length > 0) {
                    setSeller({
                        ...userPets[0].owner,
                        rating: userStats.rating || (userPets[0].owner as any).rating || 0,
                        reviewCount: userStats.reviewCount || (userPets[0].owner as any).reviewCount || 0,
                        successfulSales: userStats.successfulSales || 0,
                    });
                } else {
                    try {
                        const userRes = await fetch(`http://localhost:5000/api/users/${id}`);
                        if (userRes.ok) {
                            const userData = await userRes.json();
                            setSeller({
                                ...userData,
                                rating: userStats.rating || userData.rating || 0,
                                reviewCount: userStats.reviewCount || userData.reviewCount || 0,
                                successfulSales: userStats.successfulSales || 0,
                            });
                        } else {
                            showToast('Seller profile not found.', 'error');
                        }
                    } catch (err) {
                        showToast('Seller profile not found.', 'error');
                    }
                }
            } catch (error) {
                console.error("Failed to load seller", error);
                showToast("Failed to load seller profile", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchSellerData();
    }, [id, showToast]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-violet-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-[4px] border-violet-100 border-t-violet-600 relative z-10"></div>
                </div>
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 bg-rose-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm rotate-3">
                    <span className="text-4xl">😞</span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Profile Not Found</h2>
                <p className="text-slate-500 mb-8 text-center max-w-sm">We couldn't find the seller you're looking for. They might have removed their profile or listed no pets.</p>
                <button 
                    onClick={() => navigate(-1)}
                    className="px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform inline-block mr-2">←</span> Go Back
                </button>
            </div>
        );
    }

    const { emailVerified, mobileVerified } = seller;
    const isVerified = Boolean(emailVerified && mobileVerified);
    const isKennel = seller.userType === 'kennel';

    return (
        <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden font-sans">
            {/* Animated Hero Background */}
            <div className="relative h-[200px] md:h-[240px] w-full overflow-hidden bg-white">
                <div className="absolute inset-0 w-full h-full object-cover bg-[#0a0a0a]">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/60 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 mix-blend-screen animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-600/50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 mix-blend-screen animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-orange-500/40 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 mix-blend-screen animate-blob animation-delay-4000"></div>
                </div>
                {/* Noise overlay */}
                <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/20 to-transparent"></div>
            </div>
            
            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 md:-mt-24 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all font-semibold text-sm w-fit mb-8 md:mb-12 shadow-sm"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back
                </button>

                <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-violet-900/5 flex flex-col md:flex-row gap-8 md:gap-12 relative overflow-hidden">
                    {/* Glass Glare */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-[3rem]"></div>
                    
                    {/* Avatar Group */}
                    <div className="relative mx-auto md:mx-0 flex-shrink-0 animate-fadeInUp">
                        <div className="w-36 h-36 md:w-48 md:h-48 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-1.5 shadow-2xl shadow-violet-500/30 rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img
                                src={seller.avatar || `https://ui-avatars.com/api/?name=${seller.name}&background=ffffff&color=8b5cf6&size=400`}
                                alt={seller.name}
                                className="w-full h-full rounded-[1.7rem] md:rounded-[2.2rem] object-cover bg-white"
                            />
                        </div>
                        {isVerified && (
                            <div className="absolute -bottom-4 -right-4 bg-emerald-500 rounded-2xl p-3 border-4 border-white shadow-xl rotate-12 hover:rotate-0 transition-transform duration-300">
                                <ShieldCheckIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left flex flex-col justify-center animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-3">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{seller.name}</h1>
                            {isKennel && (
                                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-lg shadow-amber-500/20 w-fit mx-auto md:mx-0">
                                    <CheckBadgeIcon className="w-4 h-4" />
                                    Verified Kennel
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-slate-600 mb-6 mt-2">
                            <div className="flex items-center gap-2 bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/50">
                                <MapPinIcon className="w-4 h-4 text-violet-500" />
                                <span className="font-semibold text-sm">{seller.location || 'Location Not Provided'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/50">
                                <CalendarIcon className="w-4 h-4 text-fuchsia-500" />
                                <span className="font-semibold text-sm">Joined {seller.joinedAt ? new Date(seller.joinedAt).getFullYear() : 'Recently'}</span>
                            </div>
                        </div>
                        
                        <p className="max-w-2xl text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                            {seller.bio || seller.storeDescription || (isKennel ? 'A premium kennel offering high-quality, lovingly raised companions.' : 'A passionate pet lover active on our platform.')}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-row md:flex-col justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-200/60 pt-6 md:pt-0 md:pl-10 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 md:p-5 flex-1 md:flex-none flex flex-col items-center justify-center border border-amber-100/50 hover:shadow-lg hover:-translate-y-1 transition-all">
                            {seller.reviewCount > 0 ? (
                                <>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-3xl font-black text-slate-900 leading-none">{seller.rating?.toFixed(1) || '0.0'}</span>
                                        <StarSolidIcon className="w-7 h-7 text-amber-500 drop-shadow-sm" />
                                    </div>
                                    <p className="text-xs text-amber-900/60 font-bold uppercase tracking-wider">{seller.reviewCount} Reviews</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-slate-400">
                                        <StarIcon className="w-5 h-5" />
                                    </div>
                                    <p className="text-[10px] text-amber-900/60 font-bold uppercase tracking-wider text-center">No Rating</p>
                                </>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-4 md:p-5 flex-1 md:flex-none flex flex-col items-center justify-center border border-violet-100/50 hover:shadow-lg hover:-translate-y-1 transition-all">
                            <div className="text-3xl font-black text-violet-600 mb-1 leading-none">{pets.length}</div>
                            <p className="text-xs text-violet-900/50 font-bold uppercase tracking-wider">Active Pets</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seller's Pets Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="flex items-center justify-between mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white text-xl">
                            🐾
                        </div>
                        Companions Available
                    </h2>
                </div>

                {pets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pets.map((pet, idx) => (
                            <div key={pet.id} className="animate-fadeInUp" style={{ animationDelay: `${(idx % 4) * 0.15}s` }}>
                                <PetCard 
                                    pet={pet} 
                                    mode="sell" 
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-200/60 shadow-sm animate-fadeInUp">
                        <div className="w-24 h-24 mx-auto mb-6 bg-slate-50 border-8 border-white shadow-lg rounded-full flex items-center justify-center">
                            <span className="text-4xl opacity-50">😴</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">No Active Listings</h3>
                        <p className="text-slate-500 max-w-sm mx-auto text-base">
                            {seller.name} currently has no active pets listed for sale or adoption. Check back later!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
