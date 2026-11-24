import { route, ok, ApiError, badRequest } from "@/lib/api";

const MAX_IMAGE_CHARS = 300_000; 

// The session already contains the user, so no extra database query is needed.
export const GET = route(async ({ user }) => ok({ ...user }));

export const PUT = route(async ({ db, user, json }) => {
  const body = await json();
  const update = { updatedAt: new Date() };

  // Only these fields can be changed here (role/email can never be).
  for (const [field, max] of [["name", 100], ["studentId", 50], ["department", 80]]) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== "string") throw badRequest(`${field} must be text`);
    update[field] = body[field].trim().slice(0, max);
  }
  if (update.name !== undefined && !update.name) throw badRequest("Name cannot be empty");

  if (body.image !== undefined) {
    const image = body.image;
    const valid =
      image === null ||
      image === "" ||
      (typeof image === "string" && (/^https?:\/\//i.test(image) || image.startsWith("data:image/")));
    if (!valid) throw badRequest("Invalid image");
    if (typeof image === "string" && image.length > MAX_IMAGE_CHARS) {
      throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Image is too large. Please choose a smaller picture.");
    }
    update.image = image;
  }

  await db.collection("user").updateOne({ email: user.email }, { $set: update });
  return ok({}, { message: "Profile updated successfully" });
});
