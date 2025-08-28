import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import ClientAuthWrapper from "@/components/ClientAuthWrapper";

export const metadata = {
  title: "FreelanceTrack - Time & Invoice Manager",
  description: "Professional time tracking and invoice generation for freelancers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 text-slate-800 antialiased">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-cyan-100/20 pointer-events-none"></div>
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Main Content */}
        <div className="relative z-10 h-screen flex flex-col">
          <AuthProvider>
            <ClientAuthWrapper>
              <Navbar />
              <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
                  <div className="max-w-7xl mx-auto h-full">{children}</div>
                </div>
              </main>
            </ClientAuthWrapper>
          </AuthProvider>

          {/* Compact Footer */}
          {/* <footer className="border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span>© 2025 FreelanceTrack</span>
                  <span className="text-slate-400">•</span>
                  <span>Built for productivity</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </footer> */}
        </div>
      </body>
    </html>
  );
}