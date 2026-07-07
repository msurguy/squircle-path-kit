export interface NavItem {
  id: string;
  label: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: "Getting started",
    items: [
      { id: "overview", label: "Overview" },
      { id: "installation", label: "Installation" },
      { id: "quick-start", label: "Quick start" },
    ],
  },
  {
    title: "Guides",
    items: [
      { id: "rectangles", label: "Rectangles" },
      { id: "per-corner-radii", label: "Per-corner radii" },
      { id: "arbitrary-polygons", label: "Arbitrary polygons" },
      { id: "css-clipping", label: "CSS & clipping" },
      { id: "react", label: "React" },
      { id: "react-native", label: "React Native" },
    ],
  },
  {
    title: "API",
    items: [
      { id: "api-getsquirclepath", label: "getSquirclePath()" },
      { id: "api-getsquirclerectpath", label: "getSquircleRectPath()" },
      { id: "api-types", label: "Types" },
    ],
  },
  {
    title: "Internals",
    items: [
      { id: "how-it-matches-figma", label: "How it matches Figma" },
      { id: "budget-clamping", label: "Budget clamping" },
      { id: "precision", label: "Precision" },
    ],
  },
  {
    title: "Development",
    items: [
      { id: "contributing", label: "Contributing" },
      { id: "scripts", label: "Scripts" },
    ],
  },
];

export const allSectionIds = navGroups.flatMap((group) => group.items.map((item) => item.id));
