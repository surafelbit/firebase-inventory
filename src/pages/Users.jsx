
import { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
    getAuth,
    connectAuthEmulator,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
} from "firebase/auth";
import Navbar from "../components/Navbar";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { firebaseConfig, db } from "../firebase";

function Users() {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "staff",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Load users
    const loadUsers = async () => {
        try {
            setLoading(true);

            const snapshot = await getDocs(collection(db, "users"));

            const usersList = snapshot.docs.map((userDoc) => ({
                id: userDoc.id,
                ...userDoc.data(),
            }));

            setUsers(usersList);
        } catch (error) {
            console.error("Load users error:", error);
            setError("Unable to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Create user
    const handleCreateUser = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.fullName || !formData.email || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setSaving(true);

            /*
             * Create a SECOND Firebase app/auth instance.
             * This prevents the Admin from being logged out.
             */
            const appName = `admin - user - creator - ${Date.now()} `;

            const secondaryApp = initializeApp(firebaseConfig, appName);
            const secondaryAuth = getAuth(secondaryApp);

            if (window.location.hostname === "localhost") {
                connectAuthEmulator(
                    secondaryAuth,
                    "http://127.0.0.1:9099",
                    { disableWarnings: true }
                );
            }

            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                formData.email,
                formData.password
            );

            const newUser = userCredential.user;

            await updateProfile(newUser, {
                displayName: formData.fullName,
            });

            // Create Firestore user document
            await setDoc(doc(db, "users", newUser.uid), {
                uid: newUser.uid,
                fullName: formData.fullName,
                email: formData.email,
                role: formData.role,
                createdAt: serverTimestamp(),
            });

            // Sign out the secondary auth instance
            await signOut(secondaryAuth);

            // Reset form
            setFormData({
                fullName: "",
                email: "",
                password: "",
                role: "staff",
            });

            setShowForm(false);

            await loadUsers();
        } catch (error) {
            console.error("Create user error:", error);

            if (error.code === "auth/email-already-in-use") {
                setError("A user with this email already exists.");
            } else if (error.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            } else if (error.code === "auth/weak-password") {
                setError("Password must be at least 6 characters.");
            } else {
                setError(error.message || "Unable to create user.");
            }
        } finally {
            setSaving(false);
        }
    };

    // Delete user
    const handleDeleteUser = async (userId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, "users", userId));

            setUsers((previousUsers) =>
                previousUsers.filter((user) => user.id !== userId)
            );
        } catch (error) {
            console.error("Delete user error:", error);
            setError("Unable to delete user.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navbar />

            <main className="lg:pl-64">
                <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">

                    {/* Header */}
                    <header className="mb-8 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-indigo-400">Admin</p>
                            <h1 className="mt-1 text-3xl font-bold">
                                User Management
                            </h1>
                            <p className="mt-2 text-slate-500">
                                Manage users and their roles.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setShowForm(!showForm);
                                setError("");
                            }}
                            className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
                        >
                            {showForm ? "Cancel" : "+ Create User"}
                        </button>
                    </header>

                    {/* Create User Form */}
                    {showForm && (
                        <div className="mb-8 rounded-xl border border-white/10 bg-slate-900 p-6">
                            <h2 className="mb-5 text-xl font-semibold">
                                Create New User
                            </h2>

                            {error && (
                                <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            <form
                                onSubmit={handleCreateUser}
                                className="grid gap-5 md:grid-cols-2"
                            >
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-400">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                fullName: e.target.value,
                                            })
                                        }
                                        placeholder="Enter full name"
                                        className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-400">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="Enter email"
                                        className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-400">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password: e.target.value,
                                            })
                                        }
                                        placeholder="Minimum 6 characters"
                                        className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-400">
                                        Role
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                role: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="staff">Staff</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? "Creating..." : "Create User"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                        <div className="border-b border-white/10 px-6 py-5">
                            <h2 className="font-semibold">All Users</h2>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-slate-400">
                                Loading users...
                            </div>
                        ) : users.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                No users found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10 text-left text-xs uppercase text-slate-500">
                                            <th className="px-6 py-4 font-semibold">Name</th>
                                            <th className="px-6 py-4 font-semibold">Email</th>
                                            <th className="px-6 py-4 font-semibold">Role</th>
                                            <th className="px-6 py-4 text-right font-semibold">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-white/5">
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 font-medium">
                                                    {user.fullName || "Unnamed User"}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {user.email}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                                            user.role === "admin"
                                                                ? "bg-purple-500/10 text-purple-400"
                                                                : user.role === "staff"
                                                                    ? "bg-indigo-500/10 text-indigo-400"
                                                                    : "bg-slate-500/10 text-slate-400"
                                                        }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="text-sm font-medium text-red-400 transition hover:text-red-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Users;

