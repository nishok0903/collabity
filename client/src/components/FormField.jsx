import React from "react";

// Reusable form input component
const FormField = ({ label, type, name, value, onChange, error }) => (
  <div className="mb-6">
    <label className="block text-lg font-medium text-gray-700">{label}</label>
    {type === "textarea" ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="4"
        className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    )}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default FormField;
