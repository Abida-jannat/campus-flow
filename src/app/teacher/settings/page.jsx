"use client";

import { useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import {
  Settings,
  Camera,
  User,
  Mail,
  Building2,
  Trash2,
  Save,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";

const departments = [
  "CSE",
  "EEE",
  "BBA",
  "English",
  "Law",
  "Data Science",
  "Software Engineering",

];



function resizeImage(file, maxSize = 300) {

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        let { width, height } = img;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not process image"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image"));
    };

    reader.readAsDataURL(file);
  });
}



export default function TeacherSettings() {
  const router = useRouter();
  const fileInputRef = useRef(null);


  const [form, setForm] = useState({
    name: "",
    department: "",
  });

  const [originalForm, setOriginalForm] = useState({
    name: "",
    department: "",
  });

  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);


  useEffect(() => {
    async function loadProfile() {
      try {
        const session = await authClient.getSession();

        if (!session?.data?.user) {
          router.push("/auth/login");
          return;
        }

        const user = session.data.user;

        const profile = {
          name: user.name || "",
          department: user.department || "",
        };

        setForm(profile);
        setOriginalForm(profile);

        setEmail(user.email || "");
        setImage(user.image || null);

        setLoading(false);
      } catch (error) {
        console.error("Profile loading error:", error);

        toast.error("Failed to load profile");

        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);



  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };



  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }


    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setUploadingImage(true);

    try {

      const resized = await resizeImage(file);

      const { error } = await authClient.updateUser({
        image: resized,
      });

      if (error) {
        throw new Error(error.message);
      }

      setImage(resized);

      toast.success("Profile photo updated successfully");
    } catch (error) {
      console.error("Photo update error:", error);
      toast.error(error.message || "Failed to update profile photo");
    } finally {
      setUploadingImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


  const handleDeletePhoto = async () => {
    if (!image) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile photo?"
    );

    if (!confirmed) return;

    setUploadingImage(true);

    try {
      const { error } = await authClient.updateUser({
        image: null,
      });

      if (error) {
        throw new Error(error.message);
      }

      setImage(null);

      toast.success("Profile photo removed");
    } catch (error) {
      console.error("Photo delete error:", error);
      toast.error(error.message || "Failed to remove profile photo");
    } finally {
      setUploadingImage(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!form.department) {
      toast.error("Please select a department");
      return;
    }

    setSaving(true);

    try {
      const updatedProfile = {
        name: form.name.trim(),
        department: form.department,
      };

      const { error } = await authClient.updateUser(updatedProfile);

      if (error) {
        throw new Error(error.message);
      }

      setForm(updatedProfile);

      setOriginalForm(updatedProfile);

      toast.success("Profile updated successfully");


      setTimeout(() => {
        router.push("/teacher");
      }, 1000);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };



  const handleCancel = () => {
    setForm(originalForm);

    toast.success("Changes cancelled");
  };


  const initials = form.name
    ? form.name
        .split(" ")
        .filter(Boolean)
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="p-6 lg:p-8 max-w-4xl mx-auto">


        <div className="flex items-center gap-4 mb-8">

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Settings size={23} className="text-indigo-400" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold">Profile Settings</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your teacher profile and personal information
            </p>
          </div>


          <button
            type="button"
            onClick={() => router.push("/teacher")}
            className="text-sm text-slate-400 hover:text-white transition px-4 py-2 rounded-xl hover:bg-slate-800"
          >
            ← Back to Dashboard
          </button>

        </div>



        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">



            <div className="relative shrink-0">           

              <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center border-4 border-slate-800 shadow-xl">

                {image ? (
                  <img
                    src={image}
                    alt="Teacher profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {initials}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 border-4 border-slate-900 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                title="Change profile photo"
              >
                <Camera size={17} />
              </button>


              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImagePick}
                className="hidden"
              />

            </div>


            <div className="flex-1 text-center sm:text-left">

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">

                <h2 className="text-xl font-semibold">
                  {form.name || "Teacher"}
                </h2>

                <span className="w-fit mx-auto sm:mx-0 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Teacher
                </span>

              </div>

              <p className="text-slate-400 text-sm mt-1">
                {form.department || "Department not selected"}
              </p>

              <p className="text-slate-500 text-xs mt-3">
                JPG or PNG · Maximum 5MB · Recommended square image
              </p>


              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-5">

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera size={16} />
                  {uploadingImage
                    ? "Processing..."
                    : image
                    ? "Change Photo"
                    : "Add Photo"}
                </button>

                {image && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Remove Photo
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>


        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >

          <div className="flex items-center gap-3 mb-7">

            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <User size={18} className="text-indigo-400" />
            </div>

            <div>
              <h2 className="font-semibold text-lg">Personal Information</h2>
              <p className="text-xs text-slate-500 mt-1">
                Update your basic teacher information
              </p>
            </div>

          </div>


          <div className="grid md:grid-cols-2 gap-5">

            <div>

              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Full Name
              </label>

              <div className="relative">

                <User
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                  required
                />

              </div>


            </div>


            <div>

              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Department
              </label>

              <div className="relative">

                <Building2
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10"
                />

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition appearance-none"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}

                </select>

              </div>

            </div>


            <div>

              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-slate-500 cursor-not-allowed"
                />

              </div>

              <p className="text-xs text-slate-600 mt-2">
                Email is managed by your CampusFlow account.
              </p>

            </div>


            <div>

              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Account Role
              </label>

              <div className="relative">
                <ShieldCheck
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
                />

                <input
                  type="text"
                  value="Teacher"
                  readOnly
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-slate-400 outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Your account role cannot be changed here.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              <RotateCcw size={16} />

              Cancel
            </button>


            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </form>



        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          


          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">

            <div className="flex items-center gap-2">
              <User size={15} className="text-indigo-400" />
              <p className="text-xs text-slate-500 uppercase">Profile</p>
            </div>

            <p className="text-sm text-slate-300 mt-2">
              {form.name || "Not available"}
            </p>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-indigo-400" />
              <p className="text-xs text-slate-500 uppercase">Department</p>
            </div>

            <p className="text-sm text-slate-300 mt-2">
              {form.department || "Not selected"}
            </p>

          </div>



          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">

            <div className="flex items-center gap-2">
              <Camera size={15} className="text-indigo-400" />
              <p className="text-xs text-slate-500 uppercase">Profile Photo</p>
            </div>

            <p
              className={`text-sm mt-2 ${
                image ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {image ? "Uploaded" : "No photo"}
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}