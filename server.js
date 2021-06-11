import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import indexRouter from "./routers/index.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use("/", indexRouter);

mongoose
  .connect("mongodb+srv://admin:admin@luban-0.d972k.mongodb.net/backstoreDB", {
    useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
  })
  .then(() => {
    console.log("connected to the database...");
    app.listen(5000, () => {
      console.log("server started, listening on port 5000...");
    });
  })
  .catch((e) => {
    console.log('failed to connect to database', e);
  });

// app.post("/login", (request, response) => {
//   console.log(request.headers);
//   console.log(request.body);

//   response.setHeader("Access-Control-Allow-Origin", "*");
//   response.setHeader("Access-Control-Allow-Headers", "*");

//   const { username, password } = request.body;
//   let ret;
//   if (username === "admin" && password === "admin") {
//     ret = { status: 0, data: { _id: "001", username: "admin" } };
//   } else {
//     ret = { status: 1, msg: "wrong credentials!" };
//   }
//   response.send(JSON.stringify(ret));
// });
