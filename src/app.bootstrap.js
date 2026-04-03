import express from "express";
import cors from "cors";
import helmet from "helmet";

import { connectDB, connectRedis } from "./DB/index.js";
import { PORT } from "../config/config.service.js";
import { requestLogger } from "./middlewares/index.js";
import { GlobalErrorHandler } from "./common/utils/response/error.response.js";
import { globalLimiter } from "./middlewares/rateLimit/global.rateLimit.middleware.js";
import {
  activityRouter,
  authRouter,
  contactRouter,
  dealRouter,
  taskRouter,
} from "./modules/index.js";
import { reportRouter } from "./modules/report/index.js";

async function bootstrap() {
  //DB
  await connectDB();
  await connectRedis();
  //app
  const app = express();
  app.set("trust proxy", true);
  //middlewares
  app.use(cors(), helmet(), express.json(), requestLogger, globalLimiter);
  //routes
  app.use("/api/auth", authRouter);
  app.use("/api", contactRouter);
  app.use("/api", dealRouter);
  app.use("/api", activityRouter);
  app.use("/api", taskRouter);
  app.use("/api", reportRouter);
  //not found page
  app.all("{/*dummy}", (req, res, next) => {
    res.status(404).json({ message: "Page Not Found" });
  });
  //global error handler
  app.use(GlobalErrorHandler);
  //server listening
  app.listen(PORT, () => {
    console.log(`Server Is Running On PORT ${PORT}`);
  });
}

export default bootstrap;
