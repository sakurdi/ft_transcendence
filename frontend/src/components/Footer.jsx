export default function Footer() {
    return (
        <footer className="border-t border-surface-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center text-white font-black text-xs">
                            T
                        </div>
                        <span className="text-sm font-bold text-surface-900 uppercase tracking-tight">
                            Transcendence
                        </span>
                    </div>
                    <p className="text-xs text-surface-400">
                        &copy; {new Date().getFullYear()} FT_TRANSCENDENCE &mdash; All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
