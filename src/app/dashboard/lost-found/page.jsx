"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  PhoneCall,
  User,
  Loader2,
  X,
  ImageIcon,
  Trash2,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LostAndFoundPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "lost",
    image: "",
    contactInfo: "",
    description: "",
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/lost-found");
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load items", err);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
                // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    fetchItems();
  }, []);

  const handleDelete = async (itemId) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    setDeletingId(itemId);
    try {
      const res = await fetch(`/api/lost-found?id=${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Item deleted successfully!");
        fetchItems();
      } else {
        toast.error(data.message || "Failed to delete item");
      }
    } catch (err) {
      toast.error("Something went wrong while deleting");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/lost-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Report posted successfully!");
        setIsModalOpen(false);
        setFormData({
          title: "",
          type: "lost",
          image: "",
          contactInfo: "",
          description: "",
        });
        fetchItems();
      } else {
        toast.error(data.message || "Failed to post report");
      }
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-3"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HelpCircle className="text-amber-400" /> Lost & Found
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Report lost belongings or help returned items to their rightful owners
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-lg shadow-amber-600/20"
          >
            <Plus size={18} /> Report Item
          </button>
        </div>
      </div>

  
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>
        <div className="flex gap-2">
          {["all", "lost", "found"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold capitalize transition ${
                typeFilter === t
                  ? "bg-amber-600 text-white"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

  
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-amber-400" size={36} />
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition"
            >
            
              <div className="w-full h-48 bg-slate-950 relative border-b border-slate-800">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                    <ImageIcon size={32} />
                    <span className="text-xs">No image uploaded</span>
                  </div>
                )}

            
                <span
                  className={`absolute top-3 right-3 text-white font-bold text-xs px-3 py-1 rounded-lg uppercase shadow-md ${
                    item.type === "lost" ? "bg-rose-600" : "bg-emerald-600"
                  }`}
                >
                  {item.type}
                </span>

       
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={deletingId === item._id}
                  className="absolute top-3 left-3 bg-rose-500/80 hover:bg-rose-600 text-white p-2 rounded-xl backdrop-blur-md transition shadow-md disabled:opacity-50"
                  title="Delete Item"
                >
                  {deletingId === item._id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>

  
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-100 line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-500" />
                    <span>{item.userName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-medium bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                    <PhoneCall size={14} />
                    <span>{item.contactInfo}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <HelpCircle size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-slate-400 font-medium">No lost or found items reported</p>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white">Report Lost or Found Item</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "lost" })}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      formData.type === "lost"
                        ? "bg-rose-600 border-rose-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    I Lost Something
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "found" })}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      formData.type === "found"
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    I Found Something
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter item name..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Contact Info *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Phone number / Email"
                  value={formData.contactInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, contactInfo: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="Paste image link..."
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Write a brief description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-xs font-semibold transition flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={14} />}
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}