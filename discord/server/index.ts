import express from "express";

import { configure } from "./routes";

const app = express();

app.use(express.json());

app.use("/configure", configure);

export default app;
