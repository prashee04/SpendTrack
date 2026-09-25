import { Github, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t bg-white px-6 py-4 text-xs text-gray-500 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                    <span>© 2026 SpendTrack</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        Developed by <strong className="font-bold text-purple-900">Prasheetha T K G</strong>
                    </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                    <a
                        href="https://github.com/prashee04"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition bg-gray-50 hover:bg-purple-50 px-2.5 py-1 rounded-md border border-gray-200"
                    >
                        <Github className="h-3.5 w-3.5 text-gray-800" />
                        <span>GitHub</span>
                    </a>

                    <a
                        href="https://www.linkedin.com/in/prasheetha-tkg-0889081a9/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition bg-gray-50 hover:bg-purple-50 px-2.5 py-1 rounded-md border border-gray-200"
                    >
                        <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                        <span>LinkedIn</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
