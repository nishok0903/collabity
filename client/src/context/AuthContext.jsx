import React, { createContext, useState, useContext, useEffect } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------- Auth Functions -----------------

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;
      setCurrentUser(firebaseUser);

      // 🔐 Get the ID token
      const token = await firebaseUser.getIdToken();

      // 🎯 Prepare the request data
      const requestData = {
        firebase_uid: firebaseUser.uid, // Send UID in body
      };

      const requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include token
      };

      // Log the request before sending it
      console.log("Sending login request:");
      console.log("URL: http://localhost:5000/api/auth/login");
      console.log("Headers:", requestHeaders);
      console.log("Body:", JSON.stringify(requestData));

      // 🎯 Send the request to the backend
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Role:", data.role);
        setCurrentUser({ ...firebaseUser, role: data.role });
        return data.role;
      } else {
        console.error("Backend error:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Error logging in. Please try again.");
      return null;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateEmail = (email) => {
    if (!currentUser) throw new Error("No user logged in");
    return currentUser.updateEmail(email);
  };

  const updatePassword = (password) => {
    if (!currentUser) throw new Error("No user logged in");
    return currentUser.updatePassword(password);
  };

  // ----------------- Auth State Listener -----------------

  useEffect(() => {
    const fetchUserRole = async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(); // 🔐 Get token again

          const response = await fetch(
            "http://localhost:5000/api/auth/checkRole?firebase_uid=" + user.uid,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // ✅ Send token here too
              },
            },
          );

          const data = await response.json();
          console.log("Role fetched:", data.role);
          if (response.ok) {
            setCurrentUser({ ...user, role: data.role });
          } else {
            console.error("Error fetching role:", data.message);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error fetching role:", error.message);
          setCurrentUser(null);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      fetchUserRole(user);
    });

    return () => unsubscribe();
  }, []);

  // ----------------- Context Value -----------------

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
