import { HomeChat } from '@/components/home/HomeChat';
import { getHomeData } from '@/data';
import { formatPostDate, getAllPosts } from '@/lib/blog/posts';

/** How many recent posts the home page lists before the "All posts" link. */
const HOME_POSTS = 5;

export default function Home() {
  const home = getHomeData();
  const posts = getAllPosts()
    .slice(0, HOME_POSTS)
    .map((p) => ({ slug: p.slug, title: p.title, date: formatPostDate(p.date) }));
  return <HomeChat skills={home.techStack} posts={posts} />;
}
