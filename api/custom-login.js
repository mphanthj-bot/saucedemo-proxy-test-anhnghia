// Backend TEST riêng của Anh Nghĩa - không chạm web gốc
// Tài khoản mới chỉ có trên bản demo này
const USERS = { "anhnghia": "123456" };

export default function handler(req, res) {
  const { username, password } = req.query;
  if (USERS[username] === password) {
    // Gắn cờ đăng nhập riêng cho bản test
    res.setHeader("Set-Cookie", "test_auth=anhnghia_ok; Path=/; HttpOnly");
    return res.json({ ok: true, msg: "Đăng nhập bản TEST thành công", user: username });
  }
  return res.status(401).json({ ok: false, msg: "Sai tài khoản test" });
}
