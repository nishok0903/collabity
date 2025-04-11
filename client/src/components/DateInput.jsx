import React from "react";

// Reusable Date Input Component
const DateInput = ({ label, name, value, onChange, error }) => (
  <div className="w-full sm:w-1/2">
    <label className="block text-lg font-medium text-gray-700">{label}</label>
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default DateInput;
