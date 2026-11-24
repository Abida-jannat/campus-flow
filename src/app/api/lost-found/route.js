import { route, ok, created, objectId, notFound } from "@/lib/api";
import { validate, listingSchema } from "@/lib/schemas";

export const GET = route(async ({ db }) => {
  const items = await db.collection("lost_found").find({}).sort({ createdAt: -1 }).limit(100).toArray();
  return ok({ items });
});

export const POST = route(async ({ db, user, json }) => {
  const body = await json();
  const data = validate(body, {
    ...listingSchema,
    type: { type: "string", oneOf: ["lost", "found"], default: "lost", label: "Type" },
  });

  const item = { ...data, userEmail: user.email, userName: user.name || "Student", createdAt: new Date() };
  const result = await db.collection("lost_found").insertOne(item);

  return created({ itemId: result.insertedId }, { message: "Report published successfully!" });
});

export const DELETE = route(async ({ db, user, query }) => {
  const result = await db
    .collection("lost_found")
    .deleteOne({ _id: objectId(query.get("id"), "item id"), userEmail: user.email });
  if (result.deletedCount === 0) throw notFound("Item not found or permission denied");
  return ok({}, { message: "Report deleted successfully!" });
});
