import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeOffIcon,
} from "@heroicons/react/solid";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!email) newErrors.email = "Email is required.";
    else if (!isValidEmail(email)) newErrors.email = "Invalid email format.";

    if (!password) newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      const role = await login(email, password);
      alert(role + " logged in successfully! ✅");
      console.log("here: " + role);

      // Redirect user based on their role
      if (role === "student") {
        navigate("/feed"); // Redirect to student dashboard or component
      } else if (role === "faculty") {
        navigate("/create-topic"); // Redirect to faculty dashboard or component
      }
    } catch {
      alert("Failed to log in");
      setErrors("Failed to log in");
    }
  };

  return (
    <div className="m-0 flex h-screen w-full items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Login Form */}
        <div className="relative z-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 p-8 shadow-lg">
          <h2 className="mb-4 text-center text-3xl font-bold text-white">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <UserIcon className="h-5 w-5 text-gray-300" />
              </div>
              <input
                type="email"
                className={`w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : ""}`}
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
                className={`w-full rounded-lg border border-gray-300 py-2 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : ""}`}
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

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Login
            </button>
          </form>

          {/* Sign-Up Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-white">
              Don't have an account?{" "}
              <Link to="/signup" className="underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
