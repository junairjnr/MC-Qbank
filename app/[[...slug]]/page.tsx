import { StudyApp } from "@/components/study-app";

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  return <StudyApp slug={slug} />;
}
