import { permanentRedirect } from "next/navigation";

export default function LegacyLoginPage() {
  // Redirect permanen ke halaman utama (Unified Login)
  permanentRedirect("/");
}