import TagFeedClient from "@/components/page/TagFeedClient";

export default async function TagPage({ params }) {
  const { tag } = await params;

  return <TagFeedClient tag={tag} />;
}
