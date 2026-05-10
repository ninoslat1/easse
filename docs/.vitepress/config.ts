import { defineConfig } from "vitepress";

export default defineConfig({
  transformHead({ pageData }) {
    return [["meta", { name: "description", content: pageData.description }]];
  },
  sitemap: {
    hostname: "https://ninoslat1.github.io/easse/",
  },
  base: "/easse/",
  title: "Easse",
  description: "Lightweight SSE adapters for your backend",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Quickstart", link: "/onboard" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Intro", link: "/intro" },
          { text: "Quickstart", link: "/onboard" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/vuejs/vitepress" }],
  },
});
