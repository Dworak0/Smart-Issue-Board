"use client";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
    const { user, loading } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <header className="sticky top-0 z-50 w-full glass mb-8 border-b border-border/40">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Smart Issue Board
                </Link>

                <nav className="flex gap-6 items-center">
                    {!loading && (
                        <>
                            {user ? (
                                <>
                                    <span className="text-sm text-slate-400 hidden sm:inline-block">{user.email}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm font-medium hover:text-white transition-colors text-slate-300"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                                        Login
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
                                    </Link>
                                    <Link href="/signup" className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-full shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
