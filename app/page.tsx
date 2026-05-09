import { createServiceClient } from "@/app/lib/supabaseClient";
import { HomeClient } from "./HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  let itemsResold = 0;
  try {
    const db = createServiceClient();
    const { count } = await db
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["paid", "shipped", "delivered"]);
    itemsResold = count ?? 0;
  } catch {
    // Non-fatal — show page without counter
  }

  return <HomeClient itemsResold={itemsResold} />;
}
