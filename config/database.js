const mongoose = require("mongoose");

const { MONGODB_URL } = process.env;

exports.connect = () => {
  mongoose
    .connect(MONGODB_URL)
    .then(console.log("DB Connected Sucessfully"))
    .catch((error) => {
      console.log("DB Connection Failed");
      console.log(error);
      process.exit(1);
    });
};
