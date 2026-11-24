import { route, notFound } from "@/lib/api";


const handler = route(
  async ({ request }) => {
    throw notFound(`No API endpoint for ${request.method} ${new URL(request.url).pathname}`);
  },
  { access: "public", db: false }
);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
