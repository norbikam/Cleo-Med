import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json({ points: [] });

  try {
    const res = await fetch(
      `https://api-shipx-pl.easypack24.net/v1/points?name=${encodeURIComponent(q)}&type=parcel_locker&per_page=15`,
      { headers: { Accept: "application/json" }, next: { revalidate: 0 } }
    );
    if (!res.ok) return NextResponse.json({ points: [] });
    const data = await res.json();

    const points = (data.items ?? []).map((p: Record<string, unknown>) => {
      const ad = p.address_details as Record<string, string> | undefined;
      const a  = p.address      as Record<string, string> | undefined;
      return {
        code:     p.name as string,
        label:    `${p.name} — ${a?.line1 ?? ""}`,
        street:   ad ? `${ad.street ?? ""} ${ad.building_number ?? ""}`.trim() : (a?.line1 ?? ""),
        postcode: ad?.post_code  ?? "",
        city:     ad?.city       ?? "",
      };
    });

    return NextResponse.json({ points });
  } catch {
    return NextResponse.json({ points: [] });
  }
}
