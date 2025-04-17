import React, { createContext, useState, useContext, useEffect } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate(); // useNavigate for page redirection

  // ----------------- Auth Functions -----------------

  const signup = async (email, password, role) => {
    const credentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = credentials.user;
    setCurrentUser((prev) => ({
      ...prev,
      ...user,
      role: role,
    }));
    return user;
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;
      setCurrentUser((prev) => ({
        ...prev,
        ...firebaseUser,
      }));

      const token = await firebaseUser.getIdToken();

      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firebase_uid: firebaseUser.uid }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUser((prev) => ({
          ...prev,
          role: data.role,
          username: data.username,
          firstName: data.first_name,
          lastName: data.last_name,
        }));
        return { username: data.username, role: data.role };
      } else {
        console.error("Backend error:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Login error:", error.message);
      return null;
    }
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Check if the user's UID exists in the database
      const token = await firebaseUser.getIdToken();
      const response = await fetch(
        `/api/auth/checkRole?firebase_uid=${firebaseUser.uid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (response.ok) {
        // If user exists, log them in
        setCurrentUser((prev) => ({
          ...prev,
          ...firebaseUser,
          role: data.role,
          username: data.username,
          firstName: data.first_name,
          lastName: data.last_name,
        }));
        alert(userCredential.user.displayName + " logged in successfully!");
        if (data.role === "student") {
          navigate("/feed");
        } else if (data.role === "faculty") {
          navigate("/create-topic");
        }
      } else {
        // If user does not exist, redirect to EnterDetails page
        console.log(
          "User not found in database. Redirecting to EnterDetails...",
        );

        setCurrentUser((prev) => ({
          ...prev,
          ...firebaseUser,
        }));

        navigate("/enterDetails");
      }
    } catch (error) {
      console.error("Google login error:", error.message);
    }
  };

  const logout = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

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
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch(
          `/api/auth/checkRole?firebase_uid=${user.uid}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          setCurrentUser((prev) => ({
            ...prev,
            ...user,
            role: data.role,
            username: data.username,
            firstName: data.first_name,
            lastName: data.last_name,
          }));
        } else {
          console.error("Error fetching role:", data.message);
        }
      } catch (error) {
        console.error("Error fetching role:", error.message);
      }

      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, fetchUserRole);
    return () => unsubscribe();
  }, []);

  // ----------------- Context Value -----------------

  const value = {
    currentUser,
    login,
    signup,
    logout,
    googleLogin, // Expose googleLogin to the context
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
