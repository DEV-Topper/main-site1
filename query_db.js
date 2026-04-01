const mongoose = require('mongoose');

async function checkDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/desocialplug'); // assuming local db? Or use env connection string
}
checkDB();
