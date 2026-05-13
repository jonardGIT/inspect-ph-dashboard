import InspectionWorkspace from "@/components/inspection-workspace";

interface InspectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InspectionPage({ params }: InspectionPageProps) {
  const { id } = await params;

  return <InspectionWorkspace inspectionId={id} />;
}
