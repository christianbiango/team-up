import EditEventPage from "@/components/EditEventPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <EditEventPage id={id} />;
}
