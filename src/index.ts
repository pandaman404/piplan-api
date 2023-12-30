import "reflect-metadata";
import app from "./app";
import { AppDataSource } from "./db/db";

const port = Number(process.env.PORT) | 3000;
const server = () => {
  return app.listen(port);
};

const main = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");
    server();
    console.log(`Server is listen on port ${port}`);
  } catch (error) {
    console.log(error);
  }
};

main();

export default server;
