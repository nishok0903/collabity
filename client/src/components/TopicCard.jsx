import React from "react";
import { Link } from "react-router-dom";

const TopicCard = ({ t }) => {
  return (
    <div className="m-4 box-border flex w-11/12 flex-col items-center justify-center rounded-2xl border-4 border-black bg-white p-4">
      <h2 className="text-center text-2xl font-bold">{t.title}</h2>
      <div className="flex w-full flex-col sm:flex-row">
        <div className="h-full flex-grow p-4">
          <div className="mx-auto aspect-square w-1/2 overflow-hidden rounded-full bg-slate-400">
            {/* <img src={src} alt={alt} className="h-full w-full object-cover" /> */}
          </div>
          <h2 className="text-center">Prof. Sunil Kumar PV</h2>
          <h3 className="text-center">this and that</h3>
        </div>
        <div className="h-full flex-grow-3">
          <p>{t.description}</p>
          <div className="mt-4">
            <p>
              <strong>Vacancies:</strong> {t.vacancies}
            </p>
            <p>
              <strong>Dates:</strong> {t.dates}
            </p>
            <p>
              <strong>Compensation:</strong> {t.compensation}
            </p>
            <div className="mt-2">
              <strong>Tags:</strong>
              <ul className="list-inside list-disc">
                {t.tags.map((tag, index) => (
                  <li key={index}>{tag}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <button className="w-fit rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        <Link to="/topic">View Topic</Link>
      </button>
    </div>
  );
};

export default TopicCard;
