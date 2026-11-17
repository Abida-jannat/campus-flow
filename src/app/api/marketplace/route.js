import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireUser, json } from "@/lib/api";

export const dynamic = "force-dynamic";

const COLLECTION = "marketplace";

const isHttpUrl = (v) => typeof v === "string" && /^https?:\/\/\S+$/i.test(v) && v.length <= 500;

export async function GET() {
  try {
    const { error } = await requireUser();
    if (error) return error;

    const db = await getDb();
    const items = await db
      .collection(COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return json({ success: true, items });
  } catch (err) {
    console.error("GET marketplace error:", err);
    return json({ success: false, message: "Failed to load items" }, 500);
  }
}

export async function POST(request) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const contactInfo = typeof body.contactInfo === "string" ? body.contactInfo.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const image = body.image ? String(body.image).trim() : "";

    const price = Number(body.price);
    if (!title || !contactInfo || !Number.isFinite(price) || price < 0) {
      return json({ success: false, message: "Title, Price, and Contact Info are required" }, 400);
    }

    if (title.length > 120 || contactInfo.length > 200 || description.length > 1000) {
      return json({ success: false, message: "One of the fields is too long" }, 400);
    }
    if (image && !isHttpUrl(image)) {
      return json({ success: false, message: "Image must be a valid http(s) link" }, 400);
    }

    const newItem = {
      title,
      price,
      image,
      description,
      contactInfo,
      userEmail: user.email,
      userName: user.name || "Student",
      status: "available",
      createdAt: new Date(),
    };

    const db = await getDb();
    const result = await db.collection(COLLECTION).insertOne(newItem);

    return json({ success: true, message: "Product posted successfully!", itemId: result.insertedId });
  } catch (err) {
    console.error("POST marketplace error:", err);
    return json({ success: false, message: "Failed to save item" }, 500);
  }
}

export async function DELETE(request) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return json({ success: false, message: "Item ID is required" }, 400);
    if (!ObjectId.isValid(id)) return json({ success: false, message: "Invalid item ID" }, 400);

    const db = await getDb();
    const result = await db.collection(COLLECTION).deleteOne({
      _id: new ObjectId(id),
      userEmail: user.email, // owners can only delete their own posts
    });

    if (result.deletedCount === 0) {
      return json({ success: false, message: "Item not found or permission denied" }, 404);
    }
    return json({ success: true, message: "Item deleted successfully!" });
  } catch (err) {
    console.error("DELETE marketplace error:", err);
    return json({ success: false, message: "Failed to delete item" }, 500);
  }
}
