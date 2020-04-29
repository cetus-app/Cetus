// Entry point for backend
import "reflect-metadata";
import app from "./app";

const port = process.env.port || 4000;

app.listen(port, () => console.log(`App listening on port ${port}`));
