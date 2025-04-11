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

  // Authentication functions
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
      setCurrentUser(firebaseUser); // Store the Firebase user in the state

      // Get the Firebase JWT Token
      const idToken = await firebaseUser.getIdToken();

      // Send the token to the backend to verify and get the user role
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`, // Send the token in the authorization header
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Role:", data.role);
        setCurrentUser({ ...firebaseUser, role: data.role }); // Store the role in the user object
        // Do something with the role, such as redirecting based on the role
      } else {
        console.error("Error:", data.message);
      }

      // Notify user of successful login
      return data;
    } catch (error) {
      console.error("Login error:", error);
      alert("Error logging in. Please try again.");
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

  useEffect(() => {
    const fetchUserRole = async (user) => {
      if (user) {
        try {
          // Fetch the user role from the backend
          const response = await fetch("/api/checkRole", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ firebase_uid: user.uid }), // Send the firebase UID
          });

          const data = await response.json();

          // Check if the role was fetched successfully
          if (response.ok) {
            setCurrentUser({ ...user, role: data.role });
          } else {
            setCurrentUser(null);
            console.error("Error fetching role:", data.message);
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setCurrentUser(null);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      fetchUserRole(user); // Fetch user role when auth state changes
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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
