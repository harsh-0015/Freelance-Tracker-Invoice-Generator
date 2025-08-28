"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err) {
      console.error("Google sign-in error", err);
      alert(err.message || "Google sign-in failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (err) {
      console.error("Auth error", err);
      alert(err.message || "Authentication failed");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {mode === "register" ? "Create Account" : "Welcome Back"}
        </h2>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white border border-gray-300 py-3 rounded-lg mb-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <img
            src="/google-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-gray-700 font-medium">Sign in with Google</span>
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              style={{ color: '#222' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              style={{ color: '#222' }}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {mode === "register" ? "Create Account" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          {mode === "register" ? "Already have an account?" : "New here?"}{" "}
          <button
            className="text-blue-600 font-medium hover:underline focus:outline-none"
            onClick={() => setMode(mode === "register" ? "login" : "register")}
          >
            {mode === "register" ? "Login" : "Create account"}
          </button>
        </p>

        <div className="mt-6 text-center">
          <button
            onClick={handleSignOut}
            className="text-sm text-red-600 font-medium hover:underline focus:outline-none"
          >
            Sign out 
          </button>
        </div>
      </div>
    </div>
  );
}
