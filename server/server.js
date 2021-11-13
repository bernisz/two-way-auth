/* eslint-disable import/first */
require("dotenv").config();
import path from "path";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
const port = process.env.PORT || 5000;
const buildPath = path.join(__dirname, "..", "build");

const app = express();
app.use(helmet());

const whitelist = ["http://localhost:3000", "http://localhost:5000"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log("Origin rejected");
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(buildPath));
}

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  next();
});

app.post("/files/:name", validateToken, download);

if (process.env.NODE_ENV === "production") {
  app.get("/*", function (req, res) {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

app.listen(port, () => {
  console.log(buildPath);
  console.log(path.join(__dirname, "..", "server"));
  console.log(`${process.cwd()}/server/files/`);
  console.log(`Server is listening on port ${port}`);
});
