import { UtensilsCrossed } from 'lucide-react';

export default function LoadingSpinner() {
    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="relative flex flex-col items-center gap-8">
                {/* Animated Food Icon Container */}
                <div className="relative w-32 h-32 glass-card flex items-center justify-center animate-float">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-red-500/20 rounded-2xl blur-xl" />

                    {/* Rotating Food Emojis */}
                    <div className="relative z-10 text-4xl animate-spin-slow">
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2">🥐</span>
                        <span className="absolute top-1/2 -right-8 -translate-y-1/2">🥩</span>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2">☕</span>
                        <span className="absolute top-1/2 -left-8 -translate-y-1/2">🥙</span>
                    </div>

                    <div className="z-20 p-4 bg-black/50 rounded-full backdrop-blur-md border border-white/10">
                        <UtensilsCrossed className="w-8 h-8 text-white" />
                    </div>

                    {/* Spinning Ring */}
                    <div className="absolute inset-0 rounded-2xl border border-white/5" />
                    <div className="absolute -inset-2 rounded-3xl border border-orange-500/30 animate-spin" style={{ animationDuration: '4s' }} />
                </div>

                {/* Text */}
                <div className="space-y-3 text-center z-10">
                    <h1 className="text-4xl font-black tracking-widest bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 bg-clip-text text-transparent animate-pulse filter drop-shadow-lg">
                        ADISTOW
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-white/40 text-sm font-medium tracking-wide uppercase">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce delay-100" />
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-200" />
                        <span>Lezzet Yükleniyor</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
