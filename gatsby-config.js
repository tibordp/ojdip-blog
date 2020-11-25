module.exports = {
  siteMetadata: {
    title: "Tibor Djurica Potpara",
    author: {
      name: "Tibor Djurica Potpara",
      summary: "a software engineer based in Dublin, Ireland.",
    },
    description:
      "Ojdip.net - My thoughts on programming, networking and technology in general.",
    siteUrl: "https://ojdip.net",
    defaultImage: "/images/ojdip.png",
    social: {
      github: "tibordp",
      linkedin: "tibordp",
    },
  },
  plugins: [
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "UA-35130447-2",
        head: true,
        anonymize: true,
        respectDNT: true,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content/blog`,
        name: "blog",
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content/assets`,
        name: "assets",
      },
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-embed-video",
            options: {
              width: 600,
              ratio: 1.77, // Optional: Defaults to 16/9 = 1.77
              related: false, //Optional: Will remove related videos from the end of an embedded YouTube video.
              noIframeBorder: true, //Optional: Disable insertion of <style> border: 0
              urlOverrides: [
                {
                  id: "youtube",
                  embedURL: (videoId) =>
                    `https://www.youtube-nocookie.com/embed/${videoId}`,
                },
              ], //Optional: Override URL of a service provider, e.g to enable youtube-nocookie support
            },
          },
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 690,
              quality: 100,
            },
          },
          {
            resolve: "gatsby-remark-responsive-iframe",
            options: {
              wrapperStyle: "margin-bottom: 1.0725rem",
            },
          },
          {
            resolve: "gatsby-remark-katex",
            options: {
              strict: "ignore",
            },
          },
          "gatsby-remark-embed-snippet",
          "gatsby-remark-prismjs",
          "gatsby-remark-copy-linked-files",
          "gatsby-remark-smartypants",
        ],
      },
    },
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    "gatsby-plugin-feed",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "Tibor Djurica Potpara",
        short_name: "Blog",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#174fc9",
        display: "minimal-ui",
        icon: "content/assets/ojdip.png",
      },
    },
    {
      resolve: "gatsby-plugin-next-seo",
      options: {
        titleTemplate: "%s | Tibor Djurica Potpara",
        openGraph: {
          type: "website",
          locale: "en_IE",
          url: "https://ojdip.net",
          site_name: "Tibor Djurica Potpara",
          images: [
            {
              url: "https://ojdip.net/images/ojdip.png",
            },
          ],
        },
        twitter: {
          handle: "@tibordp",
          cardType: "summary_large_image",
        },
      },
    },
    {
      resolve: "gatsby-plugin-typography",
      options: {
        pathToConfigModule: "src/utils/typography",
      },
    },
    {
      resolve: "gatsby-plugin-s3",
      options: {
        bucketName: "ojdip-net-blog",
        protocol: "https",
        hostname: "www.ojdip.net",
        generateRedirectObjectsForPermanentRedirects: true,
      },
    },
    "gatsby-plugin-sitemap",
    `gatsby-plugin-catch-links`,
  ],
}
