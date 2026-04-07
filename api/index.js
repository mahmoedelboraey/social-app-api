// const serverless = require("serverless-http");
// const app = require("../app");
// const connectDB = require("../config/db");

// let isConnected = false;

// const connect = async () => {
//   if (!isConnected) {
//     await connectDB();
//     isConnected = true;
//   }
// };

module.exports = async (req, res) => {
  await connect();
  return serverless(app)(req, res);
};
const app = require("./app"); // تأكد من المسار الصحيح لملف app.js
const connectDB = require("./config/db");

// الاتصال بالقاعدة
connectDB();

// هذا السطر مهم جداً لـ Vercel ليتمكن من تشغيل التطبيق كـ Serverless
module.exports = app;