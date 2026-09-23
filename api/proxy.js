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

  // XƯỞNG REWRITE của Anh Nghĩa: /__studio
  // Nhập URL gốc -> tự quét sitemap -> mapping trang + tạo TK riêng + sinh code
  if (cleanPath === "/__studio") {
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.send(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Xưởng Rewrite - Anh Nghĩa</title>
<style>body{font-family:sans-serif;max-width:860px;margin:20px auto;padding:0 14px}input,textarea{width:100%;padding:9px;margin:5px 0 10px;border:1px solid #ccc;border-radius:8px}button{padding:10px 16px;border:0;border-radius:10px;background:#111;color:#fff;cursor:pointer;margin:4px 6px 4px 0}table{width:100%;border-collapse:collapse;font-size:13px}td,th{border:1px solid #ddd;padding:6px;text-align:left}.card{border:1px solid #ddd;border-radius:12px;padding:12px;margin:12px 0}pre{background:#111;color:#0f0;padding:12px;border-radius:10px;overflow:auto;font-size:12px}</style></head><body>
<h2>Xưởng Rewrite của Anh Nghĩa</h2>
<p>Bước 1: dán link web gốc. Bước 2: bấm Quét. Bước 3: tạo tài khoản riêng + xem code mang đi xài.</p>
<div class="card"><b>1. Web gốc</b><input id="origin" value="https://www.saucedemo.com"><button onclick="scan()">Quét toàn bộ trang con</button><span id="st"></span><div id="pages"></div></div>
<div class="card"><b>2. Tạo tài khoản riêng cho bản demo</b><div style="display:flex;gap:8px"><input id="u" placeholder="Tên mới, vd: anhnghia"><input id="p" placeholder="Mật khẩu, vd: 123456"><button onclick="addAcc()">Thêm</button></div><div id="accs"></div></div>
<div class="card"><b>3. Code mang đi xài (đã tự điền link gốc + TK của anh)</b><button onclick="gen()">Sinh code</button><pre id="code">Bấm Sinh code...</pre></div>
<script>
let site="", list=[];
async function scan(){
  site=document.getElementById("origin").value.replace(/\\/$/,"");
  document.getElementById("st").textContent=" Đang quét...";
  const r=await fetch("/api/sitemap?url="+encodeURIComponent(site)); const j=await r.json();
  list=j.pages||[]; document.getElementById("st").textContent=" Xong: "+(j.count||list.length)+" trang";
  document.getElementById("pages").innerHTML="<table><tr><th>Đường dẫn</th><th>Bản demo</th></tr>"+list.slice(0,100).map(p=>"<tr><td>"+p.path+"</td><td>Giữ nguyên giao diện, data của mình</td></tr>").join("")+"</table>"+(list.length>100?"<p>... hiện 100/"+list.length+" trang đầu</p>":"");
  save();
}
function getAccs(){ try{return JSON.parse(localStorage.getItem("studio_accs")||"[]")}catch(e){return[]} }
function addAcc(){ const u=document.getElementById("u").value.trim(),p=document.getElementById("p").value.trim(); if(!u||!p) return alert("Gõ tên + mật khẩu đã anh"); const a=getAccs(); a.push([u,p]); localStorage.setItem("studio_accs",JSON.stringify(a)); renderAccs(); }
function delAcc(i){ const a=getAccs(); a.splice(i,1); localStorage.setItem("studio_accs",JSON.stringify(a)); renderAccs(); }
function renderAccs(){ document.getElementById("accs").innerHTML=getAccs().map((a,i)=>"<div>"+(i+1)+". "+a[0]+" / "+a[1]+' <button onclick="delAcc('+i+)">Xóa</button></div>').join("")||"<p>Chưa có, đang dùng: anhnghia / 123456</p>"; }
function save(){ try{localStorage.setItem("studio_site",site);localStorage.setItem("studio_pages",JSON.stringify(list.slice(0,200)))}catch(e){} }
function gen(){
  const accs=getAccs(); const accStr=accs.length?accs.map(a=>'"'+a[0]+'"').join(","):'"anhnghia"';
  const o=site||document.getElementById("origin").value;
  document.getElementById("code").textContent='ORIGIN = "'+o+'"\\nSố trang quét được: '+(list.length||"?")+'\\nTK riêng: '+accStr+'\\n\\nvercel.json:\\n{ "rewrites": [ { "source": "/api/:p*", "destination": "/api/:p*" }, { "source": "/(.*)", "destination": "/api/proxy" } ] }\\n\\napi/proxy.js: lấy HTML gốc về, thay "'+o+'" thành host mình, vá thêm TK, chèn backend riêng.\\nFile mẫu đầy đủ trong repo: github.com/mphanthj-bot/saucedemo-proxy-test-anhnghia';
}
site=localStorage.getItem("studio_site")||""; if(site) document.getElementById("origin").value=site; renderAccs();
</script></body></html>`);
  }
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
    function getOv(){ try{ return JSON.parse(localStorage.getItem("anhnghia_overrides")||"null"); }catch(e){ return null; } }
    let busy = false;
    function apply(){
      if(busy) return;
      const ov = getOv();
      if(!ov) return;
      busy = true;
      try{
        const names = document.querySelectorAll('[data-test="inventory-item-name"]');
        const prices = document.querySelectorAll('[data-test="inventory-item-price"]');
        names.forEach((el,i)=>{ if(ov[i] && ov[i][0] && el.textContent !== ov[i][0]) el.textContent = ov[i][0]; });
        prices.forEach((el,i)=>{ if(ov[i] && ov[i][1] && el.textContent !== "$"+ov[i][1]) el.textContent = "$"+ov[i][1]; });
      }finally{ busy = false; }
    }
    let n = 0;
    const t = setInterval(()=>{ apply(); n++; if(n > 20) clearInterval(t); }, 800);
    if(document.readyState !== "loading") apply();
    else document.addEventListener("DOMContentLoaded", apply);
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
