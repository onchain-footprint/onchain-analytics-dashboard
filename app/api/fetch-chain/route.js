import axios from "axios";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const explorer = searchParams.get("explorer");

  if (!address || !explorer) {
    return new Response("Missing address or explorer", { status: 400 });
  }

  try {
    const url = `${explorer}/api?module=account&action=txlist&address=${address}&page=1&offset=10000&sort=asc`;
    const { data } = await axios.get(url, { timeout: 20000 });
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Server proxy failed:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
