import { redirect } from "next/navigation";

// Dashboard moved to /dashboard — redirect for any direct hits
export default function AppRootPage() {
  redirect("/dashboard");
}
