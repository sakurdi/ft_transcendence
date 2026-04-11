// import NavBar from "./NavBar"

// export default function Layout({ children }) {
//   return (
//     <div className="min-h-screen flex flex-col bg-g_black-950 text-g_white font-sans relative">

//       {/* Subtle teal grid */}
//       <div className="fixed inset-0 pointer-events-none z-0"
//         style={{
//           backgroundImage: `
//             linear-gradient(rgba(3,181,170,0.03) 1px, transparent 1px),
//             linear-gradient(90deg, rgba(3,181,170,0.03) 1px, transparent 1px)`,
//           backgroundSize: "48px 48px"
//         }}
//       />

//       {/* Ambient top glow */}
//       <div className="fixed top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[280px] pointer-events-none z-0"
//         style={{ background: "radial-gradient(ellipse, rgba(3,181,170,0.12) 0%, transparent 70%)" }}
//       />

//       {/* Nav */}
//       <NavBar />

//       {/* Page content */}
//       <main className="relative z-10 flex-1 w-full max-w-[1200px] mx-auto px-7 py-10 pb-16">
//         {children}
//       </main>

//       {/* Footer */}
//       <footer className="relative z-10 border-t border-white/5 px-7 py-4 flex items-center justify-between text-xs text-g_white/25 font-mono">
//         <span className="text-g_seagreen/60">BoardHub</span>
//         <span>© 2026 · built with React + Tailwind</span>
//       </footer>
//     </div>
//   )
// }