import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

const app = express();
/**
 * Middlewares
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors());
app.use(morgan("combined"));
const parentDir = path.dirname(__dirname);
app.use(express.static(path.join(parentDir, "public")));
app.use("/uploads", express.static("uploads"));

// catch 400
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(400).send(`Error: ${res.originUrl} not found`);
  next();
});

// catch 500
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send(`Error: ${err}`);
  next();
});

/**
 * Register the routes
 */
import routes from "./routes/index.js";
app.use("/", routes);

const port = process.env.PORT || "3000";

import { createServer } from "http";
const http_server = createServer(app);

http_server.listen(port, () => {});

console.log(`Listening on port ${port}`);
