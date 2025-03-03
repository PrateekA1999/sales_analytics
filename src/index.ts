import "dotenv/config";
import express, { Application } from "express";
import { ApolloServer, ServerRegistration } from "apollo-server-express";
import mongoose from "mongoose";
import cors from "cors";
import typeDefs from "./graphql/schema";
import resolvers from "./graphql/resolvers";

const app: Application = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI as string;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(
      `🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer();
