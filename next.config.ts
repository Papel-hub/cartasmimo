/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Bing
      { protocol: 'https', hostname: 'tse1.mm.bing.net' },
      { protocol: 'https', hostname: 'tse2.mm.bing.net' },
      { protocol: 'https', hostname: 'tse3.mm.bing.net' },
      { protocol: 'https', hostname: 'tse4.mm.bing.net' },
      { protocol: 'https', hostname: 'th.bing.com' },

      // Google
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },

      // Gravatar
      { protocol: 'https', hostname: 'www.gravatar.com' },
      { protocol: 'https', hostname: 'secure.gravatar.com' },

      // Facebook
      { protocol: 'https', hostname: 'graph.facebook.com' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },

      // GitHub
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },

      // Apple
      { protocol: 'https', hostname: 'appleid.apple.com' },

      // Twitter
      { protocol: 'https', hostname: 'pbs.twimg.com' },

      // Discord
      { protocol: 'https', hostname: 'cdn.discordapp.com' },

      // LinkedIn
      { protocol: 'https', hostname: 'media.licdn.com' },

      // Cloudinary
      { protocol: 'https', hostname: 'res.cloudinary.com' },

      // Imgur
      { protocol: 'https', hostname: 'i.imgur.com' },

      // Outros domínios que você usa
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'img.evbuc.com', pathname: '/**' },
      { protocol: 'https', hostname: 'yourdomain.com' },
    ],
  },
};

module.exports = nextConfig;
