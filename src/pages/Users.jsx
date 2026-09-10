
import { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
    getAuth,
    connectAuthEmulator,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
} from "firebase/auth";
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
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            User Management
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage users and their roles.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setError("");
                        }}
                        className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        {showForm ? "Cancel" : "+ Create User"}
                    </button>
                </div>

                {/* Create User Form */}
                {showForm && (
                    <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xl font-semibold text-slate-900">
                            Create New User
                        </h2>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleCreateUser}
                            className="grid gap-5 md:grid-cols-2"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
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
                                    className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? "Creating..." : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Users Table */}
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            All Users
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500">
                            Loading users...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No users found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                                            Name
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                                            Email
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                                            Role
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {user.fullName || "Unnamed User"}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {user.email}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded - full px - 3 py - 1 text - xs font - semibold ${user.role === "admin"
                                                            ? "bg-purple-100 text-purple-700"
                                                            : user.role === "staff"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-slate-100 text-slate-700"
                                                        } `}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-sm font-medium text-red-600 hover:text-red-800"
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
        </div>
    );
}

export default Users;

