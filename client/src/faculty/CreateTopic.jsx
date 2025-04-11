import React, { useState, useRef } from "react";
import FormField from "../components/FormField";
import DateInput from "../components/DateInput";
import RegularButton from "../components/RegularButton";

const CreateTopic = () => {
  // Form state initialization
  const [formData, setFormData] = useState({
    researchTopic: "",
    topicDescription: "",
    vacancies: "",
    document: null,
    startDate: "",
    endDate: "",
    compensation: "",
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null); // File input ref

  // Predefined tags with unique colors
  const predefinedTags = [
    { id: "ai", text: "AI", color: "#3498db" },
    { id: "ml", text: "Machine Learning", color: "#e74c3c" },
    { id: "ds", text: "Data Science", color: "#2ecc71" },
    { id: "bc", text: "Blockchain", color: "#f39c12" },
    { id: "cc", text: "Cloud Computing", color: "#9b59b6" },
    { id: "cy", text: "Cybersecurity", color: "#34495e" },
    { id: "bd", text: "Big Data", color: "#16a085" },
    { id: "ro", text: "Robotics", color: "#8e44ad" },
  ];

  // Generalized form field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle compensation change with INR formatting
  const handleCompensationChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
    setFormData({ ...formData, compensation: value });
  };

  // Handle file change with validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setErrors({ ...errors, document: "File size should not exceed 4MB." });
        setFormData({ ...formData, document: null });
        fileInputRef.current.value = ""; // Reset the file input
      } else if (file.type !== "application/pdf") {
        setErrors({ ...errors, document: "Only PDF files are allowed." });
        setFormData({ ...formData, document: null });
        fileInputRef.current.value = ""; // Reset the file input
      } else {
        setErrors({ ...errors, document: "" });
        setFormData({ ...formData, document: file });
      }
    }
  };

  // Handle tag suggestions based on user input
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (e.target.value) {
      const filteredSuggestions = predefinedTags.filter((tag) =>
        tag.text.toLowerCase().includes(e.target.value.toLowerCase()),
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Handle adding tags to the form
  const handleTagAdd = (tag) => {
    if (
      formData.tags.length < 5 &&
      !formData.tags.some((t) => t.text === tag.text)
    ) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setInput("");
      setSuggestions([]);
    } else {
      setError(
        formData.tags.length >= 5
          ? "You can only add up to 5 tags."
          : "Tag already added!",
      );
    }
  };

  // Handle removing tags
  const handleTagRemove = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag.id !== tagToRemove.id),
    });
  };

  // Handle form submission with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateFormData();
    if (Object.keys(newErrors).length === 0) {
      alert("Topic successfully submitted!");

      // Clear form on successful submission
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
      setErrors({});
      setInput("");
      setSuggestions([]);
      setError("");
      fileInputRef.current.value = ""; // Reset file input after form submission
    } else {
      setErrors(newErrors);
    }
  };

  // Form validation logic
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

  // Format compensation as INR
  const formatINR = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="mx-auto my-8 max-w-4xl rounded-lg bg-white p-8 shadow-lg">
      <form onSubmit={handleSubmit}>
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Create Research Topic
        </h1>

        {/* Research Topic */}
        <FormField
          label="Research Topic"
          type="text"
          name="researchTopic"
          value={formData.researchTopic}
          onChange={handleChange}
          error={errors.researchTopic}
        />

        {/* Topic Description */}
        <FormField
          label="Topic Description"
          type="textarea"
          name="topicDescription"
          value={formData.topicDescription}
          onChange={handleChange}
          error={errors.topicDescription}
        />

        {/* Vacancies */}
        <FormField
          label="Vacancies"
          type="number"
          name="vacancies"
          value={formData.vacancies}
          onChange={handleChange}
          error={errors.vacancies}
        />

        {/* Document Upload */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700">
            Upload Document (.pdf, Max 4MB)
          </label>
          <input
            type="file"
            name="document"
            onChange={handleFileChange}
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
            accept=".pdf"
            ref={fileInputRef} // Attach ref here
          />
          {errors.document && (
            <p className="text-sm text-red-500">{errors.document}</p>
          )}
        </div>

        {/* Tags */}
        <TagsSection
          input={input}
          suggestions={suggestions}
          error={error}
          onInputChange={handleInputChange}
          onTagAdd={handleTagAdd}
          onTagRemove={handleTagRemove}
          formData={formData}
        />

        {/* Start and End Dates */}
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

        {/* Compensation */}
        <FormField
          label="Compensation (INR)"
          type="text"
          name="compensation"
          value={formatINR(formData.compensation)}
          onChange={handleCompensationChange}
          error={errors.compensation}
        />

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <RegularButton type="submit">Publish Topic</RegularButton>
        </div>
      </form>
    </div>
  );
};

// Reusable Tags Section Component
const TagsSection = ({
  input,
  suggestions,
  error,
  onInputChange,
  onTagAdd,
  onTagRemove,
  formData,
}) => (
  <div className="mb-6">
    <label className="block text-lg font-medium text-gray-700">Tags</label>
    <div className="relative mt-2 flex flex-wrap gap-2">
      {/* Input field */}
      <input
        type="text"
        value={input}
        onChange={onInputChange}
        className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
        placeholder="Add a tag"
      />

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-12 max-h-40 w-full overflow-y-auto rounded-lg border bg-white shadow-lg">
          {suggestions.map((tag) => (
            <div
              key={tag.id}
              onClick={() => onTagAdd(tag)}
              className="cursor-pointer p-2 hover:bg-gray-100"
            >
              {tag.text}
            </div>
          ))}
        </div>
      )}

      {/* Selected tags */}
      {formData.tags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-2 rounded-lg bg-blue-600 p-2 text-white"
        >
          <span>{tag.text}</span>
          <button
            onClick={() => onTagRemove(tag)}
            className="cursor-pointer border-none bg-transparent text-white"
          >
            &times;
          </button>
        </div>
      ))}

      {/* Error message */}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  </div>
);

export default CreateTopic;
