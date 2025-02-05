import React, { useState } from "react";
import { Link } from "react-router-dom";

const CreateTopic = () => {
  const [formData, setFormData] = useState({
    researchTopic: "",
    professorName: "",
    professorByline: "",
    topicDescription: "",
    vacancies: "",
    documentLink: "",
    requirements: "",
    startDate: "",
    endDate: "",
    compensation: "",
    tags: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple validation
    const newErrors = {};
    if (!formData.researchTopic) newErrors.researchTopic = "Topic is required.";
    if (!formData.professorName)
      newErrors.professorName = "Professor name is required.";
    if (!formData.topicDescription)
      newErrors.topicDescription = "Description is required.";
    if (!formData.vacancies) newErrors.vacancies = "Vacancies are required.";
    if (!formData.documentLink)
      newErrors.documentLink = "Document link is required.";
    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.endDate) newErrors.endDate = "End date is required.";
    if (!formData.compensation)
      newErrors.compensation = "Compensation is required.";

    if (Object.keys(newErrors).length === 0) {
      alert("Topic successfully submitted!");
      // Reset form after submission

      window.location.href = "/";
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="mx-auto my-4 w-4/5 rounded-lg border-4 border-black bg-white p-8 shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="topic-info">
          <h1 className="mb-6 text-4xl font-extrabold text-gray-800">
            Research Topic Name
          </h1>

          {/* Research Topic Name */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700">
              Research Topic:
            </label>
            <input
              type="text"
              name="researchTopic"
              value={formData.researchTopic}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            />
            {errors.researchTopic && (
              <p className="text-red-500">{errors.researchTopic}</p>
            )}
          </div>

          {/* Professor Info */}
          <div className="prof-info mb-6 flex items-center space-x-6">
            <img
              src="prof-photo-url"
              alt="Professor"
              className="aspect-square w-1/4 rounded-full border-2 border-gray-200 shadow-md"
            />
            <div className="prof-details w-full">
              <input
                type="text"
                name="professorName"
                value={formData.professorName}
                onChange={handleChange}
                className="w-full text-2xl font-semibold text-gray-800 sm:w-3/4 md:w-1/2 lg:w-1/3"
                placeholder="Professor Name"
              />
              {errors.professorName && (
                <p className="text-red-500">{errors.professorName}</p>
              )}
              <input
                type="text"
                name="professorByline"
                value={formData.professorByline}
                onChange={handleChange}
                className="mt-2 w-full text-lg text-gray-600"
                placeholder="Professor Byline"
              />
            </div>
          </div>
          {/* Research Topic Description */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700">
              Topic Description:
            </label>
            <textarea
              name="topicDescription"
              value={formData.topicDescription}
              onChange={handleChange}
              rows="4"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            />
            {errors.topicDescription && (
              <p className="text-red-500">{errors.topicDescription}</p>
            )}
          </div>

          {/* Vacancies */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700">
              Vacancies:
            </label>
            <input
              type="number"
              name="vacancies"
              value={formData.vacancies}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            />
            {errors.vacancies && (
              <p className="text-red-500">{errors.vacancies}</p>
            )}
          </div>

          {/* Document Link */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700">
              Document Link:
            </label>
            <input
              type="url"
              name="documentLink"
              value={formData.documentLink}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            />
            {errors.documentLink && (
              <p className="text-red-500">{errors.documentLink}</p>
            )}
          </div>

          {/* Start and End Dates */}
          <div className="dates mb-6 flex space-x-6">
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Start Date:
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
              />
              {errors.startDate && (
                <p className="text-red-500">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">
                End Date:
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2"
              />
              {errors.endDate && (
                <p className="text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Compensation */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700">
              Compensation:
            </label>
            <input
              type="text"
              name="compensation"
              value={formData.compensation}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            />
            {errors.compensation && (
              <p className="text-red-500">{errors.compensation}</p>
            )}
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700">
              Tags:
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              placeholder="Comma-separated tags"
            />
          </div>

          {/* Submit Button */}
          <div className="flex w-full justify-center">
            <button
              type="submit"
              className="relative mx-auto w-fit rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Publish Topic
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTopic;
