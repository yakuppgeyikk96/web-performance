import type { FastifyPluginAsync } from "fastify";
import { setTimeout as sleep } from "node:timers/promises";
import { findProductBySlug, products } from "./catalog.ts";
import { catalogPage, notFoundPage, productImage, productPage } from "./html.ts";

// Simulated database think time. Real queries arrive in phase 3.
const CATALOG_QUERY_MS = 400;
const PRODUCT_QUERY_MS = 250;

export const pages: FastifyPluginAsync = async (app) => {
  app.get("/", async (_request, reply) => {
    await sleep(CATALOG_QUERY_MS);
    return reply.type("text/html; charset=utf-8").send(catalogPage(products));
  });

  app.get<{ Params: { slug: string } }>("/products/:slug", async (request, reply) => {
    await sleep(PRODUCT_QUERY_MS);
    const product = findProductBySlug(request.params.slug);
    if (!product) return reply.code(404).type("text/html; charset=utf-8").send(notFoundPage());
    return reply.type("text/html; charset=utf-8").send(productPage(product));
  });

  app.get<{ Params: { id: string } }>("/img/product/:id.svg", async (request, reply) => {
    const product = products[Number(request.params.id) - 1];
    if (!product) return reply.code(404).send();
    return reply.type("image/svg+xml").send(productImage(product));
  });
};
