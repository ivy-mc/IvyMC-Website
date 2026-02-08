import { Guide } from '@/lib/server/guides/GuideManager';
import Link from 'next/link';
import React from 'react';

export default function GuideCard({ guide }: { guide: Guide }) {
    // Her rehber için farklı gradient renkleri
    const gradientMap: Record<string, string> = {
        'baslangic-rehberi': 'from-purple-900/40 via-purple-800/20 to-purple-700/10',
        'ekonomi-sistemi': 'from-amber-900/40 via-amber-800/20 to-amber-700/10',
        'neden-biz': 'from-cyan-900/40 via-cyan-800/20 to-cyan-700/10',
        'kurallar': 'from-rose-900/40 via-rose-800/20 to-rose-700/10',
    };

    const borderMap: Record<string, string> = {
        'baslangic-rehberi': 'border-purple-500/30 hover:border-purple-400/60',
        'ekonomi-sistemi': 'border-amber-500/30 hover:border-amber-400/60',
        'neden-biz': 'border-cyan-500/30 hover:border-cyan-400/60',
        'kurallar': 'border-rose-500/30 hover:border-rose-400/60',
    };

    const gradient = gradientMap[guide.attributes.path] || 'from-purple-900/40 via-purple-800/20 to-purple-700/10';
    const border = borderMap[guide.attributes.path] || 'border-purple-500/30 hover:border-purple-400/60';

    return (
        <Link
            data-aos="fade-up"
            href={`/rehber/${guide.attributes.path}`}
            className="lg:w-full flex-[1_0_0%] w-full">
            <div className={`relative h-64 md:h-56 rounded-xl overflow-hidden group cursor-pointer
                bg-gradient-to-br ${gradient} border-2 ${border}
                transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20
                flex items-center justify-center p-6`}>
                
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="relative z-10 text-center flex flex-col items-center justify-center h-full gap-4">
                    <h2 className="text-3xl md:text-2xl font-bold text-white text-balance leading-tight
                        group-hover:text-purple-200 transition-colors duration-300">
                        {guide.attributes.title}
                    </h2>
                    <p className="text-sm text-purple-300/70 group-hover:text-purple-300 transition-colors duration-300">
                        {guide.attributes.sub_title}
                    </p>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full group-hover:translate-x-full duration-700"></div>
                </div>
            </div>
        </Link>
    )
}