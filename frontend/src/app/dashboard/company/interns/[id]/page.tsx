import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import InternProfileClient from "./ProfileClient";
import { getInternById, fetchInterns } from "@/app/services/internService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

// Fetch additional data including progress and rating
async function getAdditionalInternData(internId: number) {
  try {
    // Get all interns to find progress and rating data
    const internsResponse = await fetchInterns(0, 100);
    const allInterns = internsResponse.interns || [];
    
    // Find the specific intern in the list
    const internWithProgress = allInterns.find((item: any) => 
      item.intern && item.intern.id === internId
    );
    
    if (internWithProgress) {
      return {
        progress: internWithProgress.project?.progress || 0,
        reportsSubmitted: internWithProgress.reportProgress?.totalReports || 0,
        totalReports: 12, // Default value
        rating: internWithProgress.reportProgress?.averageRating || 0
      };
    }
    
    // Fallback if intern not found in the list
    return {
      progress: 0,
      reportsSubmitted: 0,
      totalReports: 12,
      rating: 0
    };
  } catch (error) {
    console.error("Error fetching additional intern data:", error);
    return {
      progress: 0,
      reportsSubmitted: 0,
      totalReports: 12,
      rating: 0
    };
  }
}

export default async function InternProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await getUser();
  const internId = Number.parseInt(params.id);

  let internData;
  let additionalData;
  
  try {
    // Fetch intern data using the service
    internData = await getInternById(internId);
    
    // Fetch additional data including progress and rating
    additionalData = await getAdditionalInternData(internId);
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
        additionalData={additionalData || null}
        internId={internId}
      />
    </DashboardLayout>
  );
}