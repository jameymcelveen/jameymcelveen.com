import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BlogShell } from '@/components/blog/BlogShell';
import { formatPostDate, getAllPosts } from '@/lib/blog/posts';

const DESCRIPTION =
  'Notes from Jamey McElveen on building software, working beside AI, faith and the job search.';

export const metadata: Metadata = {
  title: 'Blog | Jamey McElveen',
  description: DESCRIPTION,
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Jamey McElveen',
    description: DESCRIPTION,
    type: 'website',
    url: '/blog',
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <BlogShell>
      <div className="bl-head">
        <div className="bl-meta">Blog</div>
        <h1>Notes from the workbench</h1>
        <p>{DESCRIPTION}</p>
      </div>
      {posts.length === 0 ? (
        <p>Nothing here yet. Check back soon.</p>
      ) : (
        <ul className="bl-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                className={post.image ? 'bl-card bl-card-thumb' : 'bl-card'}
                href={`/blog/${post.slug}`}
              >
                {post.image ? (
                  <span className="bl-thumb" aria-hidden="true">
                    <Image
                      className={post.imageDark ? 'bl-thumb-light' : undefined}
                      src={post.image}
                      alt=""
                      width={1200}
                      height={627}
                      sizes="(max-width: 600px) 100vw, 220px"
                    />
                    {post.imageDark ? (
                      <Image
                        className="bl-thumb-dark"
                        src={post.imageDark}
                        alt=""
                        width={1200}
                        height={627}
                        sizes="(max-width: 600px) 100vw, 220px"
                      />
                    ) : null}
                  </span>
                ) : null}
                <div className="bl-card-text">
                  <div className="bl-meta">
                    {formatPostDate(post.date)} · {post.minutes} min read
                  </div>
                  <h2>{post.title}</h2>
                  {post.summary ? <p>{post.summary}</p> : null}
                  <span className="bl-more">Read it</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </BlogShell>
  );
}
