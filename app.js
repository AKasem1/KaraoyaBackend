require("dotenv").config();
const cors = require("cors");
const path = require("path");
const express = require("express");
const { default: mongoose } = require("mongoose");
const userRoute = require("./routes/user");
const adminRoute = require("./routes/admin");
const useragent = require("express-useragent");

mongoose.set("strictQuery", false);
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://karaoya-frontend.vercel.app/", ""],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(useragent.express());

app.use("/user", userRoute);
app.use("/admin", adminRoute);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("connected to db & listening on port:", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });

console.log("Hello World");
