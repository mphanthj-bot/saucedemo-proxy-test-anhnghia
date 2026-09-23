// Bản TEST của Anh Nghĩa - proxy toàn trang saucedemo.com
// Giữ nguyên giao diện + trang con, chỉ thêm tài khoản anhnghia/123456
export default async function handler(req, res) {
  const ORIGIN = "https://www.saucedemo.com";
  const host = req.headers.host || "localhost";
  const MY_HOST = "https://" + host;

  let path = req.url || "/";
  if (path.startsWith("/api/proxy")) path = path.slice("/api/proxy".length) || "/";
  if (!path.startsWith("/")) path = "/" + path;
  const cleanPath = path.split("?")[0];

  // Trang quản trị data TEST của Anh Nghĩa: /__admin
  if (cleanPath === "/__admin") {
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.send(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bảng chỉnh data TEST - Anh Nghĩa</title>
<style>body{font-family:sans-serif;max-width:720px;margin:24px auto;padding:0 16px}input{width:100%;padding:8px;margin:4px 0 12px}button{padding:10px 16px;border:0;border-radius:10px;background:#111;color:#fff;cursor:pointer}.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.card{border:1px solid #ddd;border-radius:12px;padding:12px;margin-bottom:12px}</style></head><body>
<h2>Bảng chỉnh data TEST</h2><p>Đổi tên + giá ở đây, bấm Lưu, rồi mở trang <a href="/inventory.html">/inventory.html</a> sẽ thấy đổi. Web gốc không ảnh hưởng.</p>
<div id="list"></div>
<button onclick="save()">Lưu lại</button> <button onclick="resetAll()" style="background:#666">Về lại gốc</button>
<script>
const GOC = [
 ["Sauce Labs Backpack","29.99"],["Sauce Labs Bike Light","9.99"],["Sauce Labs Bolt T-Shirt","15.99"],
 ["Sauce Labs Fleece Jacket","49.99"],["Sauce Labs Onesie","7.99"],["Test.allTheThings() T-Shirt (Red)","15.99"]
];
let cur = JSON.parse(localStorage.getItem("anhnghia_overrides") || "null") || GOC;
function render(){ document.getElementById("list").innerHTML = cur.map((p,i)=>'<div class="card"><b>Món '+(i+1)+'</b><input id="n'+i+'" value="'+p[0]+'"><div class="row"><div>Giá $<input id="p'+i+'" value="'+p[1]+'"></div></div></div>').join(""); }
function save(){ cur = cur.map((_,i)=>[document.getElementById("n"+i).value, document.getElementById("p"+i).value]); localStorage.setItem("anhnghia_overrides", JSON.stringify(cur)); alert("Đã lưu! Mở trang hàng sẽ thấy giá mới."); }
function resetAll(){ localStorage.removeItem("anhnghia_overrides"); cur = [...GOC]; render(); alert("Đã về lại gốc."); }
render();
</script></body></html>`);
  }
  // Trang .html con là route giả của app một trang: lấy vỏ app ở "/" để router tự vẽ
  let fetchPath = path;
  if (cleanPath.endsWith(".html") && cleanPath !== "/" && cleanPath !== "/index.html") fetchPath = "/";
  const target = ORIGIN + fetchPath;

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
      `<script>
(function(){
  try{
    const ov = JSON.parse(localStorage.getItem("anhnghia_overrides")||"null");
    if(!ov) return;
    function apply(){
      const names = document.querySelectorAll('[data-test="inventory-item-name"]');
      const prices = document.querySelectorAll('[data-test="inventory-item-price"]');
      names.forEach((el,i)=>{ if(ov[i]) el.textContent = ov[i][0]; });
      prices.forEach((el,i)=>{ if(ov[i]) el.textContent = "$"+ov[i][1]; });
    }
    new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
    const t = setInterval(()=>{ apply(); if(document.querySelector('[data-test="inventory-item-name"]')) clearInterval(t); }, 500);
    apply();
  }catch(e){}
})();
</script><div id="anhnghia-test" style="position:fixed;bottom:12px;right:12px;background:#111;color:#fff;padding:10px 14px;border-radius:12px;z-index:99999;font-family:sans-serif;font-size:13px">Bản TEST của Anh Nghĩa - tk: anhnghia / 123456 <a href="/__admin" style="color:#ffd66b;margin-left:8px">Chỉnh giá</a> <button style="margin-left:8px" onclick="alert('Tính năng mới chạy OK!')">Thử nút mới</button></div></body>`);
    res.setHeader("content-type", "text/html");
    res.setHeader("cache-control", "no-store");
    return res.send(html);
  }

  // 3. Ảnh, css còn lại: trả nguyên
  const buf = Buffer.from(await r.arrayBuffer());
  res.setHeader("content-type", type);
  return res.send(buf);
}
