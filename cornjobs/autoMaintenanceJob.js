const cron = require("node-cron");
const {
  handlePeriodicRequests,
  handleSeasonalRequests,
} = require("../controllers/requestController");

// Periodic maintenance check: runs every day at 00:10
cron.schedule("10 0 * * *", async () => {
  console.log("🔁 Running periodic maintenance check...");
  await handlePeriodicRequests(
    { body: {}, method: "CRON" },
    { status: () => ({ json: () => {} }) }
  );
});


// Seasonal maintenance check: runs only on 1st day of each month at 00:15
cron.schedule("15 0 1 * *", async () => {
    console.log("📅 Running seasonal maintenance check (1st of month)...");
    await handleSeasonalRequests(
      { body: {}, method: "CRON" },
      { status: () => ({ json: () => {} }) }
    );
  });
  