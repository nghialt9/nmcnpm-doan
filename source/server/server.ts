import express, { Express } from "express";

import cors from "cors";
import routes from "./src/routes";
import bodyParser from "body-parser";


const app: Express = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api", routes);

export default app;
