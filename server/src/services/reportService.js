const PDFDocument = require("pdfkit");
const db = require("../config/db");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

async function fetchFacultyData(facultyId) {
  const [facultyRows] = await db.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, f.department, f.designation
     FROM users u 
     JOIN faculty_details f ON u.id = f.user_id 
     WHERE u.id = ? AND u.is_deleted = 0 AND f.is_deleted = 0`,
    [facultyId]
  );

  const faculty = facultyRows[0];
  if (!faculty) return null;

  const [topics] = await db.query(
    `SELECT t.id, t.title, t.start_date, t.end_date, t.status
     FROM topics t 
     WHERE t.creator_id = ? AND t.is_deleted = 0`,
    [facultyId]
  );

  for (let topic of topics) {
    const [participants] = await db.query(
      `SELECT u.first_name, u.last_name, p.status 
       FROM participants p
       JOIN users u ON u.id = p.student_id
       WHERE p.topic_id = ? AND p.is_deleted = 0`,
      [topic.id]
    );
    topic.participants = participants;
  }

  faculty.topics = topics;
  return faculty;
}

async function generateFacultyPDF(facultyData) {
  const doc = new PDFDocument();
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  doc.font("Helvetica"); // You can try other fonts as well
  doc.fontSize(20).text(`Faculty Daily Report`, { align: "center" });
  doc.moveDown();

  doc
    .fontSize(14)
    .text(`Name: ${facultyData.first_name} ${facultyData.last_name}`);
  doc.text(`Email: ${facultyData.email}`);
  doc.text(`Department: ${facultyData.department}`);
  doc.text(`Designation: ${facultyData.designation}`);
  doc.moveDown();

  if (facultyData.topics.length === 0) {
    doc.text("No topics to report.");
  } else {
    facultyData.topics.forEach((topic, index) => {
      doc.fontSize(13).text(`Topic #${index + 1}: ${topic.title}`);
      doc
        .fontSize(12)
        .text(
          `Start: ${topic.start_date} \n End: ${topic.end_date} \n Status: ${topic.status}`
        );
      doc.text("Participants:");
      topic.participants.forEach((p) =>
        doc.text(` - ${p.first_name} ${p.last_name} (${p.status})`)
      );
      doc.moveDown();
    });
  }

  doc.end();

  const pdfBuffer = await new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(buffers)))
  );

  return pdfBuffer;
}

async function sendEmailWithPDF(facultyEmail, pdfBuffer, name) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Collabity Reports" <reports@collabity.com>',
    to: facultyEmail,
    subject: "📊 Your Daily Faculty Report",
    text: "Attached is your report.",
    attachments: [
      {
        filename: `report_${name}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

async function logReportSent(facultyId) {
  const [res] = await db.query(
    `INSERT INTO report_logs (faculty_id, report_date, status) VALUES (?, CURDATE(), 'success')`,
    [facultyId]
  );
}

module.exports = {
  fetchFacultyData,
  generateFacultyPDF,
  sendEmailWithPDF,
  logReportSent,
};
