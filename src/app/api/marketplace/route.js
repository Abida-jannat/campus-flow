import { route, ok, created, objectId, notFound } from "@/lib/api";
import { validate, listingSchema } from "@/lib/schemas";

export const GET = route(async ({ db }) => {
  const items = await db.collection("marketplace").find({}).sort({ createdAt: -1 }).limit(100).toArray();
  return ok({ items });
});

export const POST = route(async ({ db, user, json }) => {
  const data = validate(await json(), {
    ...listingSchema,
    price: { type: "number", required: true, label: "Price", min: 0, max: 100_000_000 },
  });

  const item = {
    ...data,
    status: "available",
    userEmail: user.email,
    userName: user.name || "Student",
    createdAt: new Date(),
  };
  const result = await db.collection("marketplace").insertOne(item);

  return created({ itemId: result.insertedId }, { message: "Product posted successfully!" });
});

export const DELETE = route(async ({ db, user, query }) => {
  const result = await db
    .collection("marketplace")
    .deleteOne({ _id: objectId(query.get("id"), "item id"), userEmail: user.email });
  if (result.deletedCount === 0) throw notFound("Item not found or permission denied");
  return ok({}, { message: "Item deleted successfully!" });
});
