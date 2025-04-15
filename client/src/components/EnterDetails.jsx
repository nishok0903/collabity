import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase"; // Import Firebase auth

const EnterDetails = () => {
  const [formData, setFormData] = useState({
    firebase_uid: "",
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    linkedin_link: "",
    gender: "prefer_not_to_say",
    date_of_birth: "",
    rating: 0.0,
    raters: 0,
    approved: false,
    role: "",
    tags: [], // Array to hold selected tag IDs
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagsList, setTagsList] = useState([]); // For storing fetched tags
  const { currentUser } = useAuth(); // Get auth context
  const { role } = useParams(); // Get role from URL params
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags"); // Assuming you have an API endpoint for tags
        const data = await response.json();
        setTagsList(data);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };
    fetchTags();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTagSelect = (tagId) => {
    if (formData.tags.length < 5 && !formData.tags.includes(tagId)) {
      setFormData((prevState) => ({
        ...prevState,
        tags: [...prevState.tags, tagId],
      }));
    } else {
      setError("You can only select up to 5 tags.");
    }
  };

  const handleTagRemove = (tagId) => {
    setFormData((prevState) => ({
      ...prevState,
      tags: prevState.tags.filter((tag) => tag !== tagId),
    }));
  };

  const validateForm = () => {
    const { username, first_name, last_name } = formData;
    if (!username || !first_name || !last_name) {
      setError("Please fill in all required fields.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormData((prevState) => ({
      ...prevState,
      firebase_uid: currentUser.uid, // Get the current user's UID from Firebase
      role: role, // Get the role from local storage
      email: currentUser.email, // Get the email from Firebase
    }));

    setIsSubmitting(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error registering user");
      }

      const data = await response.json();
      console.log("User registered successfully:", data);
      alert("User registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Error registering user:", err);
      alert("There was an error while registering the user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 bg-main-gradient p-4">
      <div className="w-full max-w-xl space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="text-center text-3xl font-semibold text-gray-900">
          Register User
        </h2>

        {error && (
          <div className="text-center text-sm text-red-500">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* LinkedIn Link */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              LinkedIn Link
            </label>
            <input
              type="url"
              name="linkedin_link"
              value={formData.linkedin_link}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="prefer_not_to_say">Prefer Not to Say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags Section */}
          <div>
            <label className="text-sm font-medium text-gray-700">Tags</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {tagsList.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagSelect(tag.id)}
                  className={`${
                    formData.tags.includes(tag.id)
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  } rounded p-2 text-white`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="mt-2">
              {formData.tags.map((tagId) => {
                const tag = tagsList.find((t) => t.id === tagId);
                return (
                  <div key={tagId} className="mt-2 flex items-center gap-2">
                    <span className="text-sm">{tag?.name}</span>
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tagId)}
                      className="text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isSubmitting ? "Submitting..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnterDetails;
