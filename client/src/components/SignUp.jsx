import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeOffIcon,
  AcademicCapIcon,
  BriefcaseIcon,
} from "@heroicons/react/solid";

const SignUp = () => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!email) newErrors.email = "Email is required.";
    else if (!isValidEmail(email)) newErrors.email = "Invalid email format.";

    if (!password) newErrors.password = "Password is required.";
    else if (!isValidPassword(password))
      newErrors.password =
        "Min 8 chars, 1 uppercase, 1 number, 1 special character.";

    if (!confirmPassword) newErrors.confirmPassword = "Confirm password.";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      // Sign up user with Firebase
      const userCredential = await signup(email, password);
      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;

      // Send user data (uid, email, role) to backend for registration
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseUid: uid,
          email: firebaseUser.email,
          role: role, // Get the role selected by the user
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Sign-up successful! ✅");
      } else {
        console.error("Error registering user:", data.message);
        setErrors({ firebase: data.message });
      }
    } catch (error) {
      console.error("Error signing up:", error.message);
      setErrors({ firebase: error.message });
    }
  };

  return (
    <div
      className={`flex h-screen w-full items-center justify-center p-4 ${
        role === "student" ? "bg-blue-100" : "bg-purple-100"
      }`}
    >
      <div className="relative w-full max-w-md">
        {/* Role Selection Tabs */}
        <div className="absolute inset-x-0 -top-12 flex justify-center">
          <div className="flex overflow-hidden rounded-full bg-white shadow-md">
            <button
              className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold transition ${
                role === "student"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setRole("student")}
            >
              <AcademicCapIcon className="h-5 w-5" /> Student
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold transition ${
                role === "faculty"
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setRole("faculty")}
            >
              <BriefcaseIcon className="h-5 w-5" /> Faculty
            </button>
          </div>
        </div>

        {/* Sign-Up Form */}
        <div
          className={`relative z-10 rounded-lg p-8 shadow-lg transition ${
            role === "student"
              ? "bg-gradient-to-r from-blue-500 to-blue-700"
              : "bg-gradient-to-r from-purple-500 to-purple-700"
          }`}
        >
          {errors.firebase && (
            <p className="mt-1 text-sm text-red-500">{errors.firebase}</p>
          )}
          <h2 className="mb-4 text-center text-3xl font-bold text-white">
            {role === "student" ? "Student Sign Up" : "Faculty Sign Up"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <UserIcon className="h-5 w-5 text-gray-300" />
              </div>
              <input
                type="email"
                className={`w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 ${
                  role === "student"
                    ? "focus:ring-blue-500"
                    : "focus:ring-purple-500"
                } ${errors.email ? "border-red-500" : ""}`}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <LockClosedIcon className="h-5 w-5 text-gray-300" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full rounded-lg border border-gray-300 py-2 pl-10 pr-12 focus:outline-none focus:ring-2 ${
                  role === "student"
                    ? "focus:ring-blue-500"
                    : "focus:ring-purple-500"
                } ${errors.password ? "border-red-500" : ""}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <LockClosedIcon className="h-5 w-5 text-gray-300" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full rounded-lg border border-gray-300 py-2 pl-10 pr-12 focus:outline-none focus:ring-2 ${
                  role === "student"
                    ? "focus:ring-blue-500"
                    : "focus:ring-purple-500"
                } ${errors.confirmPassword ? "border-red-500" : ""}`}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Sign Up
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-white">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
