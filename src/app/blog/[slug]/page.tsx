import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogShell } from '@/components/blog/BlogShell';
import { formatPostDate, getAllPosts, getPost } from '@/lib/blog/posts';

type Props = { params: Promise<{ slug: string }> };

/** Posts are files in the repo, so every page is built ahead of time. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: `${post.title} | Jamey McElveen`,
    description: post.summary,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      url,
      publishedTime: `${post.date}T12:00:00Z`,
      authors: ['Jamey McElveen'],
    },
    twitter: { card: 'summary', title: post.title, description: post.summary },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <BlogShell>
      <article>
        <Link className="bl-back" href="/blog">
          ← All posts
        </Link>
        <div className="bl-meta">
          {formatPostDate(post.date)} · {post.minutes} min read
        </div>
        <h1 className="bl-title">{post.title}</h1>
        <hr className="bl-rule" />
        <div className="bl-body" dangerouslySetInnerHTML={{ __html: post.html }} />
        <div className="bl-end">
          <span>Want to know more about my work?</span>
          <Link href="/">Ask Jamey</Link>
        </div>
      </article>
    </BlogShell>
  );
}
