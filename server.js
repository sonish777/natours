const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log({
    status: 'error',
    name: err.name,
    error: err,
    message: err.message
  });
  console.log('\n UNCAUGHT EXCEPTION ! SHUTTING DOWN . . . ');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');
// Start Server

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log(`DB Connection Successful`);
  });

// console.log(process.env);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Listening at ${port} . . .`);
});

process.on('unhandledRejection', err => {
  console.log({
    status: 'error',
    name: err.name,
    error: err,
    message: err.message
  });
  console.log('\n UNHANDLED REJECTION ! SHUTTING DOWN . . . ');
  server.close(() => {
    process.exit(1);
  });
});
