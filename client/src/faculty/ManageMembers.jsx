import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckIcon, XIcon } from "@heroicons/react/outline";
import RegularButton from "../components/RegularButton";
import { auth } from "../firebase"; // Adjust path if needed
import { onAuthStateChanged, getIdToken } from "firebase/auth";

const ManageMembers = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topicTitle, setTopicTitle] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [selections, setSelections] = useState({});
  const [vacancies, setVacancies] = useState(2);
  const [token, setToken] = useState("");
  const [uid, setUid] = useState("");

  // Get current user token and UID on load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await getIdToken(user);
        setUid(user.uid);
        setToken(token);
        await fetchApplicants(token);
        await fetchTopicVacancies(token);
      } else {
        alert("User not authenticated");
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [topicId]);

  // Fetch applicants
  const fetchApplicants = async (token) => {
    try {
      const res = await fetch(`/api/faculty/participants/${topicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch participants");

      const data = await res.json();
      setApplicants(data);

      const initialSelections = {};
      data.forEach((a) => {
        if (a.status === "accepted") initialSelections[a.user_id] = "selected";
        if (a.status === "rejected") initialSelections[a.user_id] = "rejected";
      });
      setSelections(initialSelections);
    } catch (err) {
      console.error("Fetch applicants error:", err);
    }
  };

  // Fetch topic vacancies
  const fetchTopicVacancies = async (token) => {
    try {
      const res = await fetch(`/api/faculty/topics/${topicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch topic");

      const data = await res.json();
      setVacancies(data.total_vacancies);
      setTopicTitle(data.title); // ✅ Save the title
    } catch (err) {
      console.error("Fetch topic data error:", err);
    }
  };

  // Selected count
  const selectedCount = Object.values(selections).filter(
    (s) => s === "selected",
  ).length;

  // Handle selection
  const handleSelection = (id, status) => {
    if (status === "selected" && selectedCount >= vacancies) {
      alert(
        "You cannot select more participants than the available vacancies.",
      );
      return;
    }
    setSelections((prev) => ({
      ...prev,
      [id]: prev[id] === status ? null : status,
    }));
  };

  const updateSelection = async () => {
    try {
      let acceptedCount = 0;

      for (const [userId, newStatusKey] of Object.entries(selections)) {
        const applicant = applicants.find(
          (a) => a.user_id === parseInt(userId),
        );
        const prevStatus = applicant?.status;

        const newStatus =
          newStatusKey === "selected"
            ? "accepted"
            : newStatusKey === "rejected"
              ? "rejected"
              : null;

        // Skip if no status or status hasn't changed
        if (!newStatus || prevStatus === newStatus) continue;

        if (newStatus === "accepted") acceptedCount++;

        const response = await fetch(
          `/api/faculty/participants/${topicId}/${userId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              newStatus,
              changedBy: uid,
              reason: "Updated via Manage UI",
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to update user ${userId}`);
        }
      }

      alert("Participant statuses updated.");
      navigate("/faculty-registered");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update participants.");
    }
  };

  return (
    <div className="flex h-fit flex-col rounded-lg bg-gray-100 p-4">
      <div className="px-6 py-4">
        <h1 className="text-lg font-semibold">
          Manage Members for: {topicTitle || `Topic #${topicId}`}
        </h1>
        <p className="text-sm text-gray-600">
          Selected: {selectedCount} / {vacancies}
        </p>
        <p className="text-sm text-gray-500">
          Remaining Vacancies: {vacancies - selectedCount}
        </p>
      </div>

      <div className="flex flex-col gap-4 p-6">
        {applicants.map((applicant) => (
          <div
            key={applicant.user_id}
            className={`flex items-center justify-between rounded-lg p-4 shadow-md transition-all ${
              selections[applicant.user_id] === "selected"
                ? "bg-green-100"
                : selections[applicant.user_id] === "rejected"
                  ? "bg-red-100"
                  : "bg-white"
            }`}
          >
            <div>
              <h3 className="text-lg font-medium">
                {applicant.first_name} {applicant.last_name}
              </h3>
              <p className="text-sm text-gray-500">{applicant.email}</p>
            </div>

            <div className="flex gap-2">
              <button
                className={`flex items-center justify-center rounded-md p-2 transition-all ${
                  selections[applicant.user_id] === "selected"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => handleSelection(applicant.user_id, "selected")}
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                className={`flex items-center justify-center rounded-md p-2 transition-all ${
                  selections[applicant.user_id] === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => handleSelection(applicant.user_id, "rejected")}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-5 flex justify-center p-4">
        <RegularButton
          onClick={updateSelection}
          disabled={selectedCount > vacancies}
          className={
            selectedCount > vacancies ? "cursor-not-allowed opacity-50" : ""
          }
        >
          Update Selection
        </RegularButton>
      </div>

      {selectedCount > vacancies && (
        <p className="mt-2 text-sm font-medium text-red-600">
          Too many selected participants. Please unselect{" "}
          {selectedCount - vacancies}.
        </p>
      )}
    </div>
  );
};

export default ManageMembers;
