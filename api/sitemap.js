// Quét sitemap của web gốc: /api/sitemap?url=https://example.com
export default async function handler(req, res) {
  const u = new URL(req.url, "http://x");
  const site = (u.searchParams.get("url") || "").replace(/\/$/, "");
  if (!site.startsWith("http")) return res.status(400).json({ ok: false, msg: "Thiếu ?url=https://..." });
  const found = new Set();
  async function getText(t) {
    const r = await fetch(t, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!r.ok) throw new Error(r.status);
    return await r.text();
  }
  try {
    let xml = "";
    try { xml = await getText(site + "/sitemap.xml"); }
    catch { xml = await getText(site + "/sitemap_index.xml"); }
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()).slice(0, 200);
    const submaps = locs.filter(l => l.endsWith(".xml"));
    for (const s of submaps.slice(0, 5)) {
      try {
        const x2 = await getText(s);
        [...x2.matchAll(/<loc>([^<]+)<\/loc>/g)].forEach(m => found.add(m[1].trim()));
      } catch {}
    }
    locs.filter(l => !l.endsWith(".xml")).forEach(l => found.add(l));
    // Nếu sitemap chỉ có 1 trang, thử robots.txt
    if (found.size === 0) {
      try {
        const robots = await getText(site + "/robots.txt");
        [...robots.matchAll(/Sitemap:\s*(\S+)/gi)].forEach(m => found.add("map:" + m[1]));
      } catch {}
    }
    const pages = [...found].slice(0, 200).map(full => {
      try { return { full, path: new URL(full).pathname || "/" }; }
      catch { return { full, path: full }; }
    });
    return res.json({ ok: true, site, count: pages.length, pages });
  } catch (e) {
    return res.json({ ok: false, site, msg: "Không đọc được sitemap, sẽ dùng chế độ quét thủ công. Lỗi: " + e.message, pages: [{ full: site + "/", path: "/" }] });
  }
}
