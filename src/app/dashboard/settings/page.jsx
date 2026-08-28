"use client";

import { useState, useRef, useEffect } from "react";
import { authClient } from "@/lib/auth-client"; 
import {
  User,
  Bell,
  Shield,
  Save,
  Camera,
  Trash2,
  Key,
  Mail,
  IdCard,
  Building,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [savedMessage, setSavedMessage] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [avatar, setAvatar] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    inAppNotifs: true,
    emailNotifs: false,
    announcementAlerts: true,
  });

  useEffect(() => {
    async function getUserData() {
      try {
        const res = await fetch("/api/user", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();

        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          studentId: data.studentId || "",
          department: data.department || "",
        }));

        if (data.image) {
          setAvatar(data.image);
        }
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setPageLoading(false);
      }
    }
    getUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (activeTab === "security") {
        if (!formData.currentPassword || !formData.newPassword) {
          alert("Please enter both current and new passwords.");
          setSaving(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          alert("New passwords do not match.");
          setSaving(false);
          return;
        }

        const { error } = await authClient.changePassword({
          newPassword: formData.newPassword,
          currentPassword: formData.currentPassword,
          revokeOtherSessions: true,
        });

        if (error) {
          alert(error.message || "Failed to change password");
        } else {
          setSavedMessage("Password updated successfully!");
          setFormData((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
          setTimeout(() => setSavedMessage(""), 3000);
        }
        setSaving(false);
        return;
      }

      const { error: updateError } = await authClient.updateUser({
        name: formData.name,
        image: avatar,
      });

      if (updateError) {
        alert(updateError.message || "Failed to update profile via auth");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: avatar }),
      });

      if (res.ok) {
        setSavedMessage("Profile details saved successfully!");
        setTimeout(() => setSavedMessage(""), 3000);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-2">
        <p className="text-xs text-slate-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your profile picture, personal details, security settings, and notifications.
        </p>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs px-4 py-3 rounded-xl">
          <CheckCircle2 size={16} />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="flex border-b border-slate-800 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 ${
            activeTab === "profile"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <User size={16} /> Profile Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 ${
            activeTab === "security"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Shield size={16} /> Security & Password
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 ${
            activeTab === "notifications"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Bell size={16} /> Preferences
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-3">
                Profile Photo
              </label>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-slate-600" />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20"
                    >
                      <Camera size={14} /> Upload New Photo
                    </label>

                    {avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/15 border border-red-500/20 px-3 py-2.5 rounded-xl"
                      >
                        <Trash2 size={14} /> Remove Photo
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Supports JPG, PNG, or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white">Personal Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Full Name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Student ID</label>
                  <div className="relative">
                    <IdCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="e.g. 2026-102-044"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Department</label>
                  <div className="relative">
                    <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Key size={16} className="text-indigo-400" /> Change Password
            </h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white">System & Notifications</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-white">In-App Notifications</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Receive alerts for new dashboard activities and updates.</p>
                </div>
                <input
                  type="checkbox"
                  name="inAppNotifs"
                  checked={formData.inAppNotifs}
                  onChange={handleChange}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-white">Announcement Popups</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Show real-time notice alerts in the header bar.</p>
                </div>
                <input
                  type="checkbox"
                  name="announcementAlerts"
                  checked={formData.announcementAlerts}
                  onChange={handleChange}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end border-t border-slate-800 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <Save size={14} />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}