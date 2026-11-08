import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../dashboard-api-client";
import { anhNen } from "../shared/background-image";
import { SecretInput } from "../shared/secret-input";
import { useTheme } from "../shared/use-theme";

export function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { theme } = useTheme();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.login(password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không kết nối được server");
    } finally {
      setBusy(false);
    }
  }

  // Cùng ảnh nền với vùng nội dung sau khi đăng nhập - vào thẳng trang trắng
  // trơn rồi mới thấy nền ở màn sau thì hai màn trông như hai sản phẩm
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-canvas bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${anhNen(theme)})` }}
    >
      <form onSubmit={submit} className="gc-card w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-1">
          {/* Logo bản đầy đủ phong cách Claude Tech Studio */}
          <img
            src="/zalo-agent-logo.svg"
            alt="Zalo Agent"
            width={420}
            height={120}
            className="h-20 w-auto mb-2"
          />
          <div className="text-[12.5px] font-medium text-ink-soft">Hệ thống Quản trị Trợ lý AI</div>
        </div>

        <label className="mb-1.5 block text-[13px] font-medium text-ink">Mật khẩu dashboard</label>
        <SecretInput value={password} onChange={setPassword} autoFocus className="mb-4" />
        {error && <p className="mb-3 text-[13px] text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy || password.length === 0}
          className="w-full rounded-full bg-[#18181B] py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#27272A] hover:shadow-md disabled:opacity-50"
        >
          {busy ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
