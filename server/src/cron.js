const cron = require("node-cron");
const sendFacultyReports = require("./services/sendFacultyReports");

// 10 AM

cron.schedule("0 10 * * *", async () => {
  console.log("Running daily report job...");
  await sendFacultyReports();
});

// Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("⏳ Running job every 5 minutes...");
  await sendFacultyReports();
});
