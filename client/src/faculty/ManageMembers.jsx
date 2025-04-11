import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckIcon, XIcon } from "@heroicons/react/outline";
import RegularButton from "../components/RegularButton";

// Dummy list of applicants
const applicants = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com" },
  { id: 2, name: "Bob Smith", email: "bob@example.com" },
  { id: 3, name: "Charlie Davis", email: "charlie@example.com" },
  { id: 4, name: "David Lee", email: "david@example.com" },
];

const ManageMembers = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [selections, setSelections] = useState({});
  const vacancies = 2; // Example vacancy count

  const handleSelection = (id, status) => {
    const selectedCount = Object.values(selections).filter(
      (s) => s === "selected",
    ).length;

    if (status === "selected" && selectedCount >= vacancies) return;

    setSelections((prev) => ({
      ...prev,
      [id]: prev[id] === status ? null : status,
    }));
  };

  return (
    <div className="flex h-fit flex-col rounded-lg bg-gray-100 p-4">
      {/* Title */}
      <div className="px-6 py-4">
        <h1 className="text-lg font-semibold">
          Manage Members for Topic {topicId}
        </h1>
      </div>

      {/* List of Applicants */}
      <div className="flex flex-col gap-4 p-6">
        {applicants.map((applicant) => (
          <div
            key={applicant.id}
            className={`flex items-center justify-between rounded-lg p-4 shadow-md transition-all ${
              selections[applicant.id] === "selected"
                ? "bg-green-100"
                : selections[applicant.id] === "rejected"
                  ? "bg-red-100"
                  : "bg-white"
            }`}
          >
            {/* Applicant Details */}
            <div>
              <h3 className="text-lg font-medium">{applicant.name}</h3>
              <p className="text-sm text-gray-500">{applicant.email}</p>
            </div>

            {/* Approve & Reject Buttons */}
            <div className="flex gap-2">
              <button
                className={`flex items-center justify-center rounded-md p-2 transition-all ${
                  selections[applicant.id] === "selected"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => handleSelection(applicant.id, "selected")}
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                className={`flex items-center justify-center rounded-md p-2 transition-all ${
                  selections[applicant.id] === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => handleSelection(applicant.id, "rejected")}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Update Button */}
      <div className="sticky bottom-5 flex justify-center p-4">
        <RegularButton onClick={() => navigate("/faculty-registered")}>
          Update Selection
        </RegularButton>
      </div>
    </div>
  );
};

export default ManageMembers;
