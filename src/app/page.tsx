import { getUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  } else {
    redirect("/homes");
  }
}