import type { NextConfig } from 'next';
import profileData from './src/data/profile.json';

const nextConfig: NextConfig = {
  async redirects() {
    const { domain } = profileData.site;
    
    // Only add redirect if www domain is configured
    if (domain.www && domain.canonical) {
      return [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: domain.www,
            },
          ],
          destination: `https://${domain.canonical}/:path*`,
          permanent: true,
        },
      ];
    }
    
    return [];
  },
};

export default nextConfig;
