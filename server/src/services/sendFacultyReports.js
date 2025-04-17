const db = require("../config/db");
const {
  fetchFacultyData,
  generateFacultyPDF,
  sendEmailWithPDF,
  logReportSent,
} = require("./reportService");

async function sendFacultyReports() {
  const [facultyList] = await db.query(
    `SELECT id FROM users WHERE role = 'faculty' AND is_deleted = 0`
  );

  for (const f of facultyList) {
    try {
      const faculty = await fetchFacultyData(f.id);
      if (!faculty) continue;

      const pdf = await generateFacultyPDF(faculty);
      await sendEmailWithPDF(
        faculty.email,
        pdf,
        `${faculty.first_name}_${faculty.last_name}`
      );
      await logReportSent(f.id);
    } catch (err) {
      console.error(`Failed to send report to faculty_id=${f.id}:`, err);
    }
  }
}

module.exports = sendFacultyReports;
