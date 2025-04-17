const db = require("../config/db");
const {
  fetchFacultyData,
  generateFacultyPDF,
  sendEmailWithPDF,
  logReportSent,
} = require("./reportService");

async function recoverMissedReports() {
  const [facultyList] = await db.query(
    `SELECT id FROM users WHERE role = 'faculty' AND is_deleted = 0`
  );

  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  for (const f of facultyList) {
    const [logs] = await db.query(
      `SELECT report_date FROM report_logs WHERE faculty_id = ? ORDER BY report_date DESC LIMIT 1`,
      [f.id]
    );

    const lastDate = logs.length > 0 ? logs[0].report_date : null;

    if (lastDate !== today) {
      const faculty = await fetchFacultyData(f.id);
      if (!faculty) continue;
      const pdf = await generateFacultyPDF(faculty);
      await sendEmailWithPDF(
        faculty.email,
        pdf,
        `${faculty.first_name}_${faculty.last_name}`
      );
      await logReportSent(f.id);
    }
  }
}

module.exports = recoverMissedReports;
