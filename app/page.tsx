import { redirect } from "next/navigation";

// Middleware handles unauthenticated redirects to /login.
// Authenticated users landing here get sent to /home.
export default function Page() {
  redirect("/home");
}
