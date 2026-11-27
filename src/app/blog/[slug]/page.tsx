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
      ...(post.image
        ? { images: [{ url: post.image, width: 1200, height: 627, alt: post.title }] }
        : {}),
    },
    twitter: {
      card: post.image ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.summary,
      ...(post.image ? { images: [post.image] } : {}),
    },
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
        {post.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={post.imageDark ? 'bl-hero bl-hero-light' : 'bl-hero'}
              src={post.image}
              alt=""
              width={1200}
              height={627}
            />
            {post.imageDark ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="bl-hero bl-hero-dark"
                src={post.imageDark}
                alt=""
                width={1200}
                height={627}
                loading="lazy"
              />
            ) : null}
          </>
        ) : (
          <hr className="bl-rule" />
        )}
        <div className="bl-body" dangerouslySetInnerHTML={{ __html: post.html }} />
        <div className="bl-end">
          <span>Want to know more about my work?</span>
          <Link href="/">Ask Jamey</Link>
        </div>
      </article>
    </BlogShell>
  );
}
