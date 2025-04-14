import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserIcon } from "@heroicons/react/solid";
import RegularButton from "../components/RegularButton";

const RegisteredTopic = ({ topic }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full rounded-2xl bg-white p-4 shadow-lg hover:shadow-xl sm:p-6">
      {/* Title & Dates */}
      <h3 className="text-lg font-semibold text-gray-800 sm:text-xl">
        {topic.title}
      </h3>
      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
        {new Date(topic.start_date).toLocaleDateString()} -{" "}
        {new Date(topic.end_date).toLocaleDateString()}
      </p>

      {/* Status & Buttons */}
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <span
          className={`rounded-md px-4 py-1 text-sm font-medium ${
            topic.status === "Approved"
              ? "bg-green-100 text-green-700"
              : topic.status === "Ongoing"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-200 text-gray-700"
          }`}
        >
          {topic.status}
        </span>

        <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
          <RegularButton
            className="w-full sm:w-auto"
            onClick={() => navigate("/manage")}
          >
            <UserIcon className="mr-2 inline-block h-5 w-5" /> Manage Members
          </RegularButton>

          {/* Status Update Dialog */}
          <div className="w-full sm:w-auto">
            <RegularButton
              className="w-full sm:w-auto"
              onClick={() => setIsDialogOpen(true)}
            >
              Update Status
            </RegularButton>
            {isDialogOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                  <h2 className="text-lg font-semibold">
                    Confirm Status Change
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Are you sure you want to update the topic status?
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      className="rounded-md bg-gray-200 px-4 py-2 text-gray-700"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-md bg-blue-600 px-4 py-2 text-white"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisteredTopic;
