// require('dotenv').config();
// const app = require('./app');
// const connectDB = require('./config/db');

// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB then start server
// connectDB()
// // .then(() => {
// //   app.listen(PORT, () => {
// //     console.log(`🚀 Server running on http://localhost:${PORT}`);
// //     console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
// //   });
// // });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.error('💥 Unhandled Rejection:', err.message);
//   process.exit(1);
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   console.error('💥 Uncaught Exception:', err.message);
//   process.exit(1);
// });
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// الاتصال بقاعدة البيانات
connectDB();

// هذا هو الجزء الناقص الذي يسبب خطأ Vercel
module.exports = app; 

// ملاحظة: Vercel يتجاهل app.listen()، لذا لا حاجة لها هنا 
// ولكن إذا كنت تريد تشغيله محلياً أيضاً يمكنك تركها داخل شرط
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

// معالجة الأخطاء
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err.message);
  // في بيئة Serverless لا نفضل عمل process.exit
});