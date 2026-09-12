import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fastifyStatic from "@fastify/static";
import { pages } from "./pages.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({ logger: true });

await app.register(fastifyStatic, {
  root: path.join(dirname, "..", "public"),
  prefix: "/",
});

await app.register(pages);

app.get("/health", (_request, reply) => {
  reply.send({
    health: "ok",
  });
});

app.listen({ port: 3000 }, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }

  console.log(`Server is listening on: ${address}`);
});
