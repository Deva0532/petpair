import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/solid';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Home', path: '/' },
        { name: 'Find Pets', path: '/' },
        { name: 'Find Vets', path: '/vets' },
        { name: 'Pet Stores', path: '/stores' },
    ];

    const supportLinks = [
        { name: 'Help Center', path: '#' },
        { name: 'Safety Tips', path: '#' },
        { name: 'Contact Us', path: '#' },
        { name: 'FAQs', path: '#' },
    ];

    const legalLinks = [
        { name: 'Privacy Policy', path: '#' },
        { name: 'Terms of Service', path: '#' },
        { name: 'Cookie Policy', path: '#' },
    ];

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10">
                                <svg viewBox="0 0 50 50" className="w-full h-full">
                                    <defs>
                                        <linearGradient id="footerPawGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#8B5CF6" />
                                            <stop offset="100%" stopColor="#A855F7" />
                                        </linearGradient>
                                        <linearGradient id="footerPawGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#EC4899" />
                                            <stop offset="100%" stopColor="#F472B6" />
                                        </linearGradient>
                                    </defs>
                                    <g transform="translate(5, 0) rotate(-20, 15, 12)">
                                        <ellipse cx="6" cy="6" rx="3.5" ry="4" fill="url(#footerPawGrad1)" />
                                        <ellipse cx="15" cy="4" rx="3" ry="3.5" fill="url(#footerPawGrad1)" />
                                        <ellipse cx="24" cy="6" rx="3.5" ry="4" fill="url(#footerPawGrad1)" />
                                        <ellipse cx="15" cy="16" rx="8" ry="7" fill="url(#footerPawGrad1)" />
                                    </g>
                                    <g transform="translate(15, 22) rotate(20, 15, 12)">
                                        <ellipse cx="6" cy="6" rx="3.5" ry="4" fill="url(#footerPawGrad2)" />
                                        <ellipse cx="15" cy="4" rx="3" ry="3.5" fill="url(#footerPawGrad2)" />
                                        <ellipse cx="24" cy="6" rx="3.5" ry="4" fill="url(#footerPawGrad2)" />
                                        <ellipse cx="15" cy="16" rx="8" ry="7" fill="url(#footerPawGrad2)" />
                                    </g>
                                </svg>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                                Peto
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Your trusted platform for buying, selling, and finding the perfect pet companion.
                            Connect with verified sellers and veterinarians near you.
                        </p>
                        {/* Social Links */}
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 bg-gray-700/50 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-700/50 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-700/50 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-700/50 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-violet-400 transition-colors duration-200 flex items-center group"
                                    >
                                        <span className="w-0 group-hover:w-2 h-0.5 bg-violet-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
                        <ul className="space-y-3">
                            {supportLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-violet-400 transition-colors duration-200 flex items-center group"
                                    >
                                        <span className="w-0 group-hover:w-2 h-0.5 bg-violet-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Stay Updated</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Subscribe to our newsletter for pet care tips and updates.
                        </p>
                        <div className="flex flex-col space-y-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                            />
                            <button className="w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-violet-500/25">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="flex items-center text-gray-400 text-sm">
                            <span>© {currentYear} Peto. Made with</span>
                            <HeartIcon className="w-4 h-4 mx-1 text-pink-500" />
                            <span>for pet lovers</span>
                        </div>

                        {/* Legal Links */}
                        <div className="flex flex-wrap justify-center gap-6">
                            {legalLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="text-gray-400 hover:text-violet-400 text-sm transition-colors duration-200"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
