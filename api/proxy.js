// Bản TEST của Anh Nghĩa - proxy toàn trang saucedemo.com
// Giữ nguyên giao diện + trang con, chỉ thêm tài khoản anhnghia/123456
export default async function handler(req, res) {
  const ORIGIN = "https://www.saucedemo.com";
  const host = req.headers.host || "localhost";
  const MY_HOST = "https://" + host;

  let path = req.url || "/";
  if (path.startsWith("/api/proxy")) path = path.slice("/api/proxy".length) || "/";
  if (!path.startsWith("/")) path = "/" + path;
  const target = ORIGIN + path;

  let r;
  try {
    r = await fetch(target, { headers: { "user-agent": req.headers["user-agent"] || "Mozilla/5.0" } });
  } catch (e) {
    return res.status(502).send("Không lấy được web gốc: " + e.message);
  }
  const type = r.headers.get("content-type") || "";

  // 1. File JS: vá thêm tài khoản mới vào danh sách cho phép
  if (type.includes("javascript") || path.endsWith(".js")) {
    let js = await r.text();
    js = js.replace("`visual_user`]", "`visual_user`,`anhnghia`]");
    js = js.replace(
      "t===`secret_sauce`?ba.includes(e):!1",
      "(t===`secret_sauce`&&ba.includes(e))||(e===`anhnghia`&&t===`123456`)"
    );
    res.setHeader("content-type", type);
    res.setHeader("cache-control", "no-store");
    return res.send(js);
  }

  // 2. Trang HTML: giữ nguyên, đổi link gốc sang host mình + chèn banner TEST
  if (type.includes("text/html")) {
    let html = await r.text();
    html = html.split(ORIGIN).join(MY_HOST);
    html = html.replace("</body>",
      `<div id="anhnghia-test" style="position:fixed;bottom:12px;right:12px;background:#111;color:#fff;padding:10px 14px;border-radius:12px;z-index:99999;font-family:sans-serif;font-size:13px">Bản TEST của Anh Nghĩa - tk: anhnghia / 123456 <button style="margin-left:8px" onclick="alert('Tính năng mới chạy OK!')">Thử nút mới</button></div></body>`);
    res.setHeader("content-type", "text/html");
    res.setHeader("cache-control", "no-store");
    return res.send(html);
  }

  // 3. Ảnh, css còn lại: trả nguyên
  const buf = Buffer.from(await r.arrayBuffer());
  res.setHeader("content-type", type);
  return res.send(buf);
}
