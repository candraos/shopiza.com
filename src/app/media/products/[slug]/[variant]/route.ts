const palettes = [
  ["#0b1022", "#f447a1", "#7b4dff"],
  ["#131a35", "#ff77bf", "#7b4dff"],
  ["#0f1630", "#f447a1", "#9a6fff"],
  ["#111a3b", "#ff91cd", "#6a48ff"],
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; variant: string }> },
) {
  const { slug, variant } = await params;
  const [base, accent, tertiary] =
    palettes[(Number(variant) - 1 + palettes.length) % palettes.length];
  const label = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="hero" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${base}" />
          <stop offset="50%" stop-color="${tertiary}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="#f5f7fb" />
      <rect x="64" y="64" width="1072" height="1072" rx="120" fill="url(#hero)" />
      <circle cx="950" cy="230" r="140" fill="rgba(255,255,255,0.14)" />
      <circle cx="280" cy="1000" r="190" fill="rgba(255,255,255,0.08)" />
      <rect x="180" y="240" width="840" height="620" rx="56" fill="rgba(255,255,255,0.18)" />
      <text x="180" y="960" font-family="Arial, Helvetica, sans-serif" font-size="52" fill="white" opacity="0.84">
        ${label}
      </text>
      <text x="180" y="1032" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="white" opacity="0.66">
        Shopiza premium catalog image ${variant}
      </text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
