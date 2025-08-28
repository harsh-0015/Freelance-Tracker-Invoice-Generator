"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

export default function ClientAuthWrapper({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        // Only redirect to login if not already on login page
        if (!isLoginPage) {
          router.push("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, isLoginPage]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If on login page, show it regardless of auth state
  if (isLoginPage) {
    return (
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    );
  }

  // If not logged in and not on login page, don't render anything 
  // (will redirect to login)
  if (!user) {
    return null;
  }

  // User is authenticated, show protected content
  return children;
}