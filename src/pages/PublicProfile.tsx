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
    const isAdmin = seller.role === 'admin';

    // Color theming — exact match with ProfileHeader.tsx
    const theme = isAdmin
      ? {
          heroBg1: 'bg-cyan-400/60', heroBg2: 'bg-blue-300/50', heroBg3: 'bg-sky-400/40',
          cardBg: 'bg-white/90', cardBorder: 'border-cyan-200/50', cardShadow: 'shadow-cyan-900/5',
          cardGlow: 'from-cyan-200/40 to-blue-200/40',
          avatarGrad: 'from-cyan-400 to-blue-500', avatarShadow: 'shadow-cyan-500/30',
          badgeBg: 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400',
          nameClass: 'bg-gradient-to-r from-cyan-900 to-blue-800 bg-clip-text text-transparent',
          tagBg: 'bg-cyan-50/80 border-cyan-100/50', tagIcon: 'text-cyan-500', tagText: 'text-cyan-700/80',
          bioColor: 'text-cyan-900/60',
          statBg: 'bg-white border-cyan-100 shadow-cyan-100/50',
          statAccent: 'text-cyan-600', statLabel: 'text-cyan-800/50',
          sectionIcon: 'from-cyan-500 to-blue-500 shadow-cyan-500/20',
          sectionTitle: 'text-cyan-900',
        }
      : isKennel
      ? {
          heroBg1: 'bg-amber-500/60', heroBg2: 'bg-rose-500/40', heroBg3: 'bg-yellow-600/35',
          cardBg: 'bg-white/90', cardBorder: 'border-amber-200/50', cardShadow: 'shadow-amber-900/5',
          cardGlow: 'from-amber-200/40 to-rose-200/40',
          avatarGrad: 'from-amber-400 to-rose-400', avatarShadow: 'shadow-amber-400/30',
          badgeBg: 'bg-gradient-to-r from-amber-100 to-rose-50 border border-amber-200 text-amber-800',
          nameClass: 'bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent',
          tagBg: 'bg-amber-50/80 border-amber-100/50', tagIcon: 'text-amber-500', tagText: 'text-amber-700/80',
          bioColor: 'text-amber-900/60',
          statBg: 'bg-gradient-to-b from-white to-amber-50/50 border-amber-100/60',
          statAccent: 'text-amber-700', statLabel: 'text-amber-900/50',
          sectionIcon: 'from-amber-500 to-orange-500 shadow-amber-500/20',
          sectionTitle: 'text-amber-900',
        }
      : {
          heroBg1: 'bg-violet-400/60', heroBg2: 'bg-fuchsia-400/50', heroBg3: 'bg-blue-300/35',
          cardBg: 'bg-white/80', cardBorder: 'border-white', cardShadow: 'shadow-violet-900/5',
          cardGlow: 'from-violet-400/20 to-fuchsia-400/20',
          avatarGrad: 'from-violet-500 to-fuchsia-500', avatarShadow: 'shadow-violet-500/30',
          badgeBg: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
          nameClass: 'text-slate-900',
          tagBg: 'bg-slate-100/80 border-slate-200/50', tagIcon: 'text-violet-500', tagText: 'text-slate-500',
          bioColor: 'text-slate-600',
          statBg: 'bg-white border-violet-100 shadow-violet-100/50',
          statAccent: 'text-violet-600', statLabel: 'text-slate-400',
          sectionIcon: 'from-violet-500 to-fuchsia-500 shadow-violet-500/20',
          sectionTitle: 'text-slate-900',
        };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden font-sans">
            {/* Hero Background */}
            <div className="relative h-[100px] md:h-[130px] w-full overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-[#0a0a0a]">
                    <div className={`absolute top-0 right-0 w-[800px] h-[800px] ${theme.heroBg1} rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 mix-blend-screen animate-blob`}></div>
                    <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] ${theme.heroBg2} rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 mix-blend-screen animate-blob animation-delay-2000`}></div>
                    <div className={`absolute top-1/2 left-1/2 w-[500px] h-[500px] ${theme.heroBg3} rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 mix-blend-screen animate-blob animation-delay-4000`}></div>
                </div>
                <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/20 to-transparent"></div>
            </div>
            
            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 md:-mt-18 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all font-semibold text-sm w-fit mb-3 shadow-sm group"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Back
                </button>

                <div className={`${theme.cardBg} backdrop-blur-2xl border ${theme.cardBorder} rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl ${theme.cardShadow} flex flex-col md:flex-row gap-6 md:gap-10 relative overflow-hidden`}>
                    {/* Decorative inner glow */}
                    <div className={`absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br ${theme.cardGlow} rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none opacity-70`}></div>
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-[3rem]"></div>
                    
                    {/* Avatar */}
                    <div className="relative mx-auto md:mx-0 flex-shrink-0 animate-fadeInUp">
                        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-tr ${theme.avatarGrad} p-1.5 shadow-2xl ${theme.avatarShadow} rotate-3 hover:rotate-0 transition-transform duration-500`}>
                            <img
                                src={seller.avatar || `https://ui-avatars.com/api/?name=${seller.name}&background=ffffff&color=8b5cf6&size=400`}
                                alt={seller.name}
                                className="w-full h-full rounded-[1.7rem] md:rounded-[2.2rem] object-cover bg-white"
                            />
                        </div>
                        {isVerified && (
                            <div className="absolute -bottom-3 -right-3 bg-emerald-500 rounded-2xl p-2.5 border-4 border-white shadow-xl rotate-12 hover:rotate-0 transition-transform duration-300">
                                <ShieldCheckIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left flex flex-col justify-center animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                        <div className="flex flex-col md:flex-row md:items-center gap-2.5 md:gap-4 mb-2.5">
                            <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${theme.nameClass}`}>{seller.name}</h1>
                            {isAdmin && (
                                <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm w-fit mx-auto md:mx-0 ${theme.badgeBg}`}>
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    System Administrator
                                </span>
                            )}
                            {isKennel && !isAdmin && (
                                <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm w-fit mx-auto md:mx-0 ${theme.badgeBg}`}>
                                    <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                                    Kennel Partner
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 mb-4 mt-1">
                            <div className={`flex items-center gap-2 ${theme.tagBg} px-3.5 py-1.5 rounded-xl border`}>
                                <MapPinIcon className={`w-4 h-4 ${theme.tagIcon}`} />
                                <span className={`font-semibold text-sm ${theme.tagText}`}>{seller.location || 'Location Not Provided'}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${theme.tagBg} px-3.5 py-1.5 rounded-xl border`}>
                                <CalendarIcon className={`w-4 h-4 ${theme.tagIcon}`} />
                                <span className={`font-semibold text-sm ${theme.tagText}`}>Joined {seller.joinedAt ? new Date(seller.joinedAt).getFullYear() : 'Recently'}</span>
                            </div>
                        </div>
                        
                        <p className={`max-w-2xl ${theme.bioColor} text-sm md:text-base leading-relaxed font-medium`}>
                            {seller.bio || seller.storeDescription || (isKennel ? 'A premium kennel offering high-quality, lovingly raised companions.' : 'A passionate pet lover active on our platform.')}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-row md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-200/60 pt-5 md:pt-0 md:pl-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <div className={`${theme.statBg} rounded-2xl p-4 flex-1 md:flex-none flex flex-col items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all`}>
                            {seller.reviewCount > 0 ? (
                                <>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-2xl font-black text-slate-900 leading-none">{seller.rating?.toFixed(1) || '0.0'}</span>
                                        <StarSolidIcon className="w-6 h-6 text-amber-500 drop-shadow-sm" />
                                    </div>
                                    <p className={`text-[10px] ${theme.statLabel} font-bold uppercase tracking-wider`}>{seller.reviewCount} Reviews</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center mb-1.5 text-slate-400">
                                        <StarIcon className="w-4 h-4" />
                                    </div>
                                    <p className={`text-[10px] ${theme.statLabel} font-bold uppercase tracking-wider text-center`}>No Rating</p>
                                </>
                            )}
                        </div>

                        <div className={`${theme.statBg} rounded-2xl p-4 flex-1 md:flex-none flex flex-col items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all`}>
                            <div className={`text-2xl font-black ${theme.statAccent} mb-1 leading-none`}>{pets.length}</div>
                            <p className={`text-[10px] ${theme.statLabel} font-bold uppercase tracking-wider`}>Active Pets</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seller's Pets Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.sectionTitle} flex items-center gap-3`}>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.sectionIcon} flex items-center justify-center shadow-lg text-white text-lg`}>
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
