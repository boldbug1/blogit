import { Metadata } from "next";
import BlogDetailClient from "./BlogDetailClient";
import { api, extractCoverImage, extractExcerpt } from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const blog = await api.blogs.getBySlug(slug);
    if (!blog || !blog.title) {
      return {
        title: "Story | Blogit",
      };
    }

    const excerpt =
      extractExcerpt(blog.body, 160) || "Read this story on Blogit.";
    const coverImage = blog.banner_image || extractCoverImage(blog.body);

    return {
      title: blog.title,
      description: excerpt,
      openGraph: {
        title: blog.title,
        description: excerpt,
        type: "article",
        publishedTime: blog.created_at,
        authors: [blog.author_name || "Author"],
        images: coverImage ? [{ url: coverImage }] : [],
      },
      twitter: {
        card: coverImage ? "summary_large_image" : "summary",
        title: blog.title,
        description: excerpt,
        images: coverImage ? [coverImage] : [],
      },
    };
  } catch {
    return {
      title: "Blogit — A quiet home for thoughtful writing",
      description: "Read thoughtfully crafted stories, perspectives, and dispatches.",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <BlogDetailClient slug={slug} />;
}