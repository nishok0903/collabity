import React, { useState, useRef, useEffect } from "react";
import FormField from "../components/FormField";
import DateInput from "../components/DateInput";
import RegularButton from "../components/RegularButton";
import { useAuth } from "../context/AuthContext";

const CreateTopic = () => {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    researchTopic: "",
    topicDescription: "",
    vacancies: "",
    document: null,
    startDate: "",
    endDate: "",
    compensation: "",
    tags: [], // Only tag IDs
  });

  const [errors, setErrors] = useState({});
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [predefinedTags, setPredefinedTags] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/tags`);
        const data = await response.json();
        setPredefinedTags(data);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };
    fetchTags();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          document: "File size should not exceed 4MB.",
        }));
        fileInputRef.current.value = "";
        return;
      }
      if (file.type !== "application/pdf") {
        setErrors((prev) => ({
          ...prev,
          document: "Only PDF files are allowed.",
        }));
        fileInputRef.current.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, document: file }));
      setErrors((prev) => ({ ...prev, document: "" }));
    }
  };

  const handleInputChange = (e) => {
    const inputVal = e.target.value;
    setInput(inputVal);
    setSuggestions(
      predefinedTags.filter((tag) =>
        tag.name.toLowerCase().includes(inputVal.toLowerCase()),
      ),
    );
  };

  const handleTagAdd = (tag) => {
    if (formData.tags.includes(tag.id)) {
      setError("Tag already added!");
      return;
    }

    if (formData.tags.length >= 5) {
      setError("You can only add up to 5 tags.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag.id],
    }));
    setInput("");
    setSuggestions([]);
    setError("");
  };

  const handleTagRemove = (idToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((id) => id !== idToRemove),
    }));
  };

  const validateFormData = () => {
    const newErrors = {};
    if (!formData.researchTopic) newErrors.researchTopic = "Topic is required.";
    if (!formData.topicDescription)
      newErrors.topicDescription = "Description is required.";
    if (!formData.vacancies) newErrors.vacancies = "Vacancies are required.";
    if (!formData.document) newErrors.document = "Document is required.";
    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.endDate) newErrors.endDate = "End date is required.";
    if (!formData.compensation)
      newErrors.compensation = "Compensation is required.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateFormData();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const token = currentUser.accessToken;
      const formPayload = new FormData();

      formPayload.append("researchTopic", formData.researchTopic);
      formPayload.append("topicDescription", formData.topicDescription);
      formPayload.append("vacancies", formData.vacancies);
      formPayload.append("startDate", formData.startDate);
      formPayload.append("endDate", formData.endDate);
      formPayload.append("compensation", formData.compensation);
      formPayload.append("tags", JSON.stringify(formData.tags));
      formPayload.append("user", currentUser.uid);
      if (formData.document) {
        formPayload.append("document", formData.document);
      }

      const response = await fetch(`http://localhost:3000/api/faculty`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      if (!response.ok) {
        const raw = await response.text();
        try {
          const errorData = JSON.parse(raw);
          console.error("Error:", errorData);
        } catch {
          console.error("Non-JSON error:", raw);
        }
        return;
      }

      alert("Topic successfully submitted!");
      // Reset form
      setFormData({
        researchTopic: "",
        topicDescription: "",
        vacancies: "",
        document: null,
        startDate: "",
        endDate: "",
        compensation: "",
        tags: [],
      });
      setInput("");
      setSuggestions([]);
      setErrors({});
      setError("");
      fileInputRef.current.value = "";
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div className="mx-auto my-8 max-w-4xl rounded-lg bg-white p-8 shadow-lg">
      <form onSubmit={handleSubmit}>
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Create Research Topic
        </h1>

        <FormField
          label="Research Topic"
          type="text"
          name="researchTopic"
          value={formData.researchTopic}
          onChange={handleChange}
          error={errors.researchTopic}
        />

        <FormField
          label="Topic Description"
          type="textarea"
          name="topicDescription"
          value={formData.topicDescription}
          onChange={handleChange}
          error={errors.topicDescription}
        />

        <FormField
          label="Vacancies"
          type="number"
          name="vacancies"
          value={formData.vacancies}
          onChange={handleChange}
          error={errors.vacancies}
        />

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700">
            Upload Document (.pdf, Max 4MB)
          </label>
          <input
            type="file"
            name="document"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
          />
          {errors.document && (
            <p className="text-sm text-red-500">{errors.document}</p>
          )}
        </div>

        <TagsSection
          input={input}
          suggestions={suggestions}
          error={error}
          onInputChange={handleInputChange}
          onTagAdd={handleTagAdd}
          onTagRemove={handleTagRemove}
          tagIds={formData.tags}
          allTags={predefinedTags}
        />

        <div className="mb-6 flex flex-col sm:flex-row sm:space-x-6">
          <DateInput
            label="Start Date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
          />
          <DateInput
            label="End Date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            error={errors.endDate}
          />
        </div>

        <FormField
          label="Compensation (INR)"
          type="number"
          name="compensation"
          value={formData.compensation}
          onChange={handleChange}
          error={errors.compensation}
        />

        <div className="mt-8 flex justify-center">
          <RegularButton type="submit">Publish Topic</RegularButton>
        </div>
      </form>
    </div>
  );
};

const TagsSection = ({
  input,
  suggestions,
  error,
  onInputChange,
  onTagAdd,
  onTagRemove,
  tagIds,
  allTags,
}) => (
  <div className="mb-6">
    <label className="block text-lg font-medium text-gray-700">Tags</label>
    <div className="relative mt-2 flex flex-wrap gap-2">
      <input
        type="text"
        value={input}
        onChange={onInputChange}
        className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
        placeholder="Add a tag"
      />

      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-12 max-h-40 w-full overflow-y-auto rounded-lg border bg-white shadow-lg">
          {suggestions.map((tag) => (
            <div
              key={tag.id}
              onClick={() => onTagAdd(tag)}
              className="cursor-pointer p-2 hover:bg-gray-100"
            >
              {tag.name}
            </div>
          ))}
        </div>
      )}

      {tagIds.map((id) => {
        const tag = allTags.find((t) => t.id === id);
        return (
          <div
            key={id}
            className="flex items-center gap-2 rounded-lg p-2 text-white"
            style={{ backgroundColor: tag?.color || "#6b7280" }}
          >
            <span>{tag?.name || "Unknown"}</span>
            <button
              onClick={() => onTagRemove(id)}
              className="cursor-pointer border-none bg-transparent text-white"
            >
              &times;
            </button>
          </div>
        );
      })}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  </div>
);

export default CreateTopic;
