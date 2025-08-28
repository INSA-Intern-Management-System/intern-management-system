import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import InternProfileClient from "./ProfileClient";
import { getInternById } from "@/app/services/internService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

export default async function InternProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await getUser();
  const internId = Number.parseInt(params.id);

  let internData;
  try {
    internData = await getInternById(internId);
  } catch (error: any) {
    console.error("Failed to fetch intern:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    // Continue with null data, client will handle the error
  }

  return (
    <DashboardLayout requiredRole="company">
      <InternProfileClient 
        initialIntern={internData || null}
        internId={internId}
      />
    </DashboardLayout>
  );
}