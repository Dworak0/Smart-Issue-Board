"use client";

import { useState, useEffect } from "react";
import { addDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Issue } from "@/lib/types";

export default function CreateIssuePage() {
    const { user } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
    const [status, setStatus] = useState<"Open" | "In Progress" | "Done">("Open");
    const [assignedTo, setAssignedTo] = useState("");

    const [loading, setLoading] = useState(false);
    const [similarIssues, setSimilarIssues] = useState<Issue[]>([]);
    const [existingIssues, setExistingIssues] = useState<Issue[]>([]);

    // Street-smart: Load recent issues once to check against on client side. 
    // For a massive app, use backend search (Algolia/Elastic). For this scope, exact/fuzzy client match is enough.
    useEffect(() => {
        const loadIssues = async () => {
            const q = query(collection(db, "issues"), orderBy("createdAt", "desc"), limit(100)); // check last 100
            const snap = await getDocs(q);
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Issue[];
            setExistingIssues(docs);
        };
        loadIssues();
    }, []);

    // Check similarity when title changes
    useEffect(() => {
        if (!title || title.length < 3) {
            setSimilarIssues([]);
            return;
        }

        // Simple heuristic: Word overlap + substring match
        const words = title.toLowerCase().split(' ').filter(w => w.length > 2);

        const matches = existingIssues.filter(issue => {
            const existingTitle = issue.title.toLowerCase();
            // Direct substring
            if (existingTitle.includes(title.toLowerCase())) return true;
            // Reverse substring
            if (title.toLowerCase().includes(existingTitle)) return true;

            // Word overlap count
            const issueWords = existingTitle.split(' ');
            const commonWords = words.filter(w => issueWords.some(iw => iw.includes(w)));
            return commonWords.length >= 2; // At least 2 significant words in common
        });

        setSimilarIssues(matches);
    }, [title, existingIssues]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            await addDoc(collection(db, "issues"), {
                title,
                description,
                priority,
                status,
                assignedTo: assignedTo, // Empty string means "Unassigned" / Open to all
                createdAt: Date.now(),
                createdBy: user.email,
            });
            router.push("/");
        } catch (err) {
            console.error(err);
            alert("Failed to create issue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Board
            </Link>

            <div className="glass p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
                <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Create New Issue</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                            placeholder="e.g. Fix login bug on Safari"
                        />
                        {similarIssues.length > 0 && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-2">
                                <div className="flex items-center gap-2 text-yellow-500 font-medium mb-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Potential duplicates detected:
                                </div>
                                <ul className="space-y-1">
                                    {similarIssues.slice(0, 3).map(issue => (
                                        <li key={issue.id} className="text-xs text-slate-400 truncate">
                                            • {issue.title} ({issue.status})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors resize-none"
                            placeholder="Describe the issue in detail..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Priority</label>
                            <select
                                aria-label="Issue Priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Status</label>
                            <select
                                aria-label="Issue Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Assigned To (Email)</label>
                        <input
                            type="email"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                            placeholder="Leave blank to assign to yourself"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 transform hover:-translate-y-1 hover:shadow-blue-500/30"
                    >
                        {loading ? "Creating..." : (
                            <>
                                <Save className="w-5 h-5" />
                                Create Issue
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
