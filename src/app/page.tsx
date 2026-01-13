"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Issue } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Filter, AlertCircle, CheckCircle2, Clock, User, Calendar } from "lucide-react";
import clsx from "clsx";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [showMyIssues, setShowMyIssues] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");



  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Default sorting: Newest First (descending createdAt)
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Issue[];
      setIssues(msgs);
    });
    return () => unsubscribe();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    if (filterStatus !== "All" && issue.status !== filterStatus) return false;
    if (filterPriority !== "All" && issue.priority !== filterPriority) return false;
    if (showMyIssues && user && issue.assignedTo !== user.email) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getPriorityColor = (p: string) => {
    if (p === 'High') return 'text-red-400 border-red-400/30 bg-red-400/10';
    if (p === 'Medium') return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    return 'text-green-400 border-green-400/30 bg-green-400/10';
  };

  const getStatusColor = (s: string) => {
    if (s === 'Done') return 'bg-green-500/20 text-green-400';
    if (s === 'In Progress') return 'bg-blue-500/20 text-blue-400';
    return 'bg-slate-500/20 text-slate-400';
  };

  const updateStatus = async (id: string, currentStatus: string, newStatus: string) => {
    if (currentStatus === 'Open' && newStatus === 'Done') {
      alert("Rule: An issue cannot move directly from Open to Done.");
      return;
    }
    try {
      await updateDoc(doc(db, "issues", id), { status: newStatus });
    } catch (e) {
      console.error("Error updating status status", e);
    }
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center text-slate-400">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Issue Board
          </h1>
          <p className="text-slate-400 mt-1">Manage and track your team's tasks</p>
        </div>

        {user && (
          <Link href="/create" className="group flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Create Issue
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="glass p-4 rounded-xl flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mr-2">
          <Filter className="w-4 h-4" />
          Filters:
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-900/50 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none hover:bg-slate-900/80 transition-colors w-full sm:w-auto"
        />

        <select
          aria-label="Filter by Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-900/50 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none hover:bg-slate-900/80 transition-colors"
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <select
          aria-label="Filter by Priority"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-slate-900/50 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none hover:bg-slate-900/80 transition-colors"
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button
          onClick={() => setShowMyIssues(!showMyIssues)}
          className={clsx(
            "ml-auto px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
            showMyIssues
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              : "bg-slate-900/50 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200"
          )}
        >
          <User className="w-4 h-4" />
          My Issues
          {showMyIssues && <CheckCircle2 className="w-3.5 h-3.5 ml-1" />}
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="group relative rounded-xl p-[1px] bg-gradient-to-r from-transparent via-transparent to-transparent hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-300 shadow-xl hover:shadow-blue-500/20">
            <div className="glass rounded-xl p-6 h-full flex flex-col relative z-10 bg-slate-900/40">
              <div className="flex justify-between items-start mb-4">
                <span className={clsx("text-xs font-bold px-3 py-1 rounded-full border", getPriorityColor(issue.priority))}>
                  {issue.priority}
                </span>
                <div className="relative">
                  {/* Simple Status Dropdown for quick update */}
                  <select
                    aria-label="Update Issue Status"
                    value={issue.status}
                    onChange={(e) => updateStatus(issue.id, issue.status, e.target.value)}
                    className={clsx("text-xs font-semibold px-2 py-1 rounded-md cursor-pointer outline-none border border-transparent hover:border-white/10", getStatusColor(issue.status))}
                  >
                    <option className="bg-slate-800 text-slate-200" value="Open">Open</option>
                    <option className="bg-slate-800 text-slate-200" value="In Progress">In Progress</option>
                    <option className="bg-slate-800 text-slate-200" value="Done">Done</option>
                  </select>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2 text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2">{issue.title}</h3>
              <p className="text-slate-300 text-sm mb-6 flex-grow line-clamp-3">{issue.description}</p>

              <div className="pt-4 border-t border-slate-700/50 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">{issue.assignedTo || "Unassigned"}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                  <span>Created by {issue.createdBy.split('@')[0]}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredIssues.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500">
            <div className="inline-block p-4 rounded-full bg-slate-800/50 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium">No issues found</p>
            <p className="text-sm">Create a new issue to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
