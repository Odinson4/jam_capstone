// next.config.js
module.exports = (phase, { defaultConfig }) => {
  const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['flowbite.com', 'images.unsplash.com'],

    },
  };

  const rewrites = () => {
    return [
      {
        source: "/:path*",
        destination: "http://localhost:5000/:path*",
      },
    ];
  };

  return {
    ...nextConfig,
    rewrites,
  };
};
