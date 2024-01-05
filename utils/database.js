const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "yesbhautikx",
    useNewUrlParser: true,
    UseUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((err) => {
    console.log(err);
  });
