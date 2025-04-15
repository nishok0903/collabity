import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../firebase";

const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const currentUser = auth.currentUser;

  // Fetch profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${username}`);
      if (!res.ok) throw new Error("Profile fetch failed");
      const data = await res.json();
      setProfile(data);
      if (currentUser?.email === data.email) {
        setFormData(data); // Populate form with profile data
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isOwner = currentUser?.email === profile?.email;

  const validate = () => {
    const newErrors = {};
    if (profile?.role === "faculty") {
      if (!formData.department?.trim()) newErrors.department = "Required";
      if (!formData.designation?.trim()) newErrors.designation = "Required";
      if (
        formData.googleScholarLink &&
        !/^https?:\/\/.+$/.test(formData.googleScholarLink)
      )
        newErrors.googleScholarLink = "Must be a valid URL";
    } else {
      if (!formData.enrollmentNumber?.trim())
        newErrors.enrollmentNumber = "Required";
      if (!formData.major?.trim()) newErrors.major = "Required";
      if (formData.gpa && (formData.gpa < 0 || formData.gpa > 10))
        newErrors.gpa = "GPA must be between 0 and 10";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const token = await auth.currentUser.getIdToken();
      console.log("Form Data to be sent:", formData); // Debugging: Log the form data
      const res = await fetch(`/api/profile/${username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Update failed");
      await fetchProfile(); // Refresh profile after update
      setIsEditing(false); // Exit edit mode after success
      console.log("Profile updated successfully"); // Success message
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (!profile)
    return <div className="mt-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 border-b pb-2 text-3xl font-bold text-gray-800">
          {profile.username}'s Profile
        </h1>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {profile.role === "faculty" ? (
              <>
                <Field
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  error={errors.department}
                />
                <Field
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  error={errors.designation}
                />
                <TextArea
                  label="Courses Teaching"
                  name="coursesTeaching"
                  value={formData.courses_teaching}
                  onChange={handleChange}
                />
                <TextArea
                  label="Research Interests"
                  name="researchInterests"
                  value={formData.research_interests}
                  onChange={handleChange}
                />
                <Field
                  label="Office Location"
                  name="officeLocation"
                  value={formData.office_location}
                  onChange={handleChange}
                />
                <Field
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contact_number}
                  onChange={handleChange}
                />
                <Field
                  label="Google Scholar Link"
                  name="googleScholarLink"
                  type="url"
                  value={formData.google_scholar_link}
                  onChange={handleChange}
                  error={errors.googleScholarLink}
                />
              </>
            ) : (
              <>
                <Field
                  label="Enrollment Number"
                  name="enrollmentNumber"
                  value={formData.enrollment_number}
                  onChange={handleChange}
                  error={errors.enrollmentNumber}
                />
                <Field
                  label="Major"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  error={errors.major}
                />
                <div className="flex flex-col">
                  <label className="mb-1 font-medium text-gray-700">
                    Academic Year
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academic_year}
                    onChange={handleChange}
                    className="rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                  >
                    <option value="">Select Year</option>
                    <option value="first_year">First Year</option>
                    <option value="second_year">Second Year</option>
                    <option value="third_year">Third Year</option>
                    <option value="fourth_year">Fourth Year</option>
                    <option value="graduate">Graduate</option>
                  </select>
                </div>
                <Field
                  label="GPA"
                  name="gpa"
                  type="number"
                  value={formData.gpa}
                  onChange={handleChange}
                  error={errors.gpa}
                />
              </>
            )}
            <div className="mt-4 text-right">
              <button
                type="submit"
                className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="ml-3 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-gray-700">
            {profile.role === "faculty" ? (
              <>
                <Info label="Department" value={profile.department} />
                <Info label="Designation" value={profile.designation} />
                <Info
                  label="Courses Teaching"
                  value={profile.courses_teaching}
                />
                <Info
                  label="Research Interests"
                  value={profile.research_interests}
                />
                <Info label="Office Location" value={profile.office_location} />
                <Info label="Contact Number" value={profile.contact_number} />
                {profile.google_scholar_link && (
                  <p>
                    <strong>Google Scholar:</strong>{" "}
                    <a
                      href={profile.google_scholar_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {profile.google_scholar_link}
                    </a>
                  </p>
                )}
                {profile.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="mb-2 mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-sm font-semibold text-blue-800"
                  >
                    {tag.name}
                  </span>
                ))}
              </>
            ) : (
              <>
                <Info
                  label="Enrollment Number"
                  value={profile.enrollmentNumber}
                />
                <Info label="Major" value={profile.major} />
                <Info label="Academic Year" value={profile.academicYear} />
                <Info label="GPA" value={profile.gpa} />
                {profile.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="mb-2 mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-sm font-semibold text-blue-800"
                  >
                    {tag.name}
                  </span>
                ))}
              </>
            )}
            {isOwner && (
              <div className="mt-6 text-right">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-800"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Field component
const Field = ({ label, name, value, onChange, type = "text", error }) => (
  <div className="flex flex-col">
    <label className="mb-1 font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`rounded border px-3 py-2 ${
        error ? "border-red-500" : "border-gray-300"
      } focus:outline-none focus:ring focus:ring-blue-300`}
    />
    {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
  </div>
);

// TextArea component
const TextArea = ({ label, name, value, onChange }) => (
  <div className="flex flex-col">
    <label className="mb-1 font-medium text-gray-700">{label}</label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={3}
      className="resize-none rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
    />
  </div>
);

// Info component to display profile details
const Info = ({ label, value }) => (
  <p>
    <strong>{label}:</strong>{" "}
    {value || <span className="text-gray-400">N/A</span>}
  </p>
);

export default ProfilePage;
