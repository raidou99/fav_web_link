export interface Link {
  title: string;
  url: string;
  icon?: string;
  description?: string;
  rowIndex?: number;
}

export interface LinkCategory {
  name: string;
  description: string;
  links: Link[];
}

export const linkCategories: LinkCategory[] = [
  {
    name: "Works",
    description: "RINA fav Links",
    links: [
      { title: "Leonardo Info", url: "https://www.leonardoinfo.com" },
      { title: "Stack Overflow", url: "https://stackoverflow.com" },
      { title: "MDN Web Docs", url: "https://developer.mozilla.org" },
      { title: "VS Code", url: "https://code.visualstudio.com" },
    ],
  },
  {
    name: "Learning",
    description: "Educational resources and courses",
    links: [
      { title: "freeCodeCamp", url: "https://freecodecamp.org" },
      { title: "Udemy", url: "https://udemy.com" },
      { title: "Coursera", url: "https://coursera.org" },
      { title: "Codecademy", url: "https://codecademy.com" },
    ],
  },
  {
    name: "Productivity",
    description: "Productivity and collaboration tools",
    links: [
      { title: "Notion", url: "https://notion.so" },
      { title: "Trello", url: "https://trello.com" },
      { title: "Slack", url: "https://slack.com" },
      { title: "Google Drive", url: "https://drive.google.com" },
    ],
  },
  {
    name: "Design",
    description: "Design and creative tools",
    links: [
      { title: "Figma", url: "https://figma.com" },
      { title: "Unsplash", url: "https://unsplash.com" },
      { title: "Tailwind CSS", url: "https://tailwindcss.com" },
      { title: "Dribbble", url: "https://dribbble.com" },
    ],
  },
];
