import { HomeChat } from '@/components/home/HomeChat';
import { getHomeData } from '@/data';

export default function Home() {
  const home = getHomeData();
  return <HomeChat skills={home.techStack} />;
}
