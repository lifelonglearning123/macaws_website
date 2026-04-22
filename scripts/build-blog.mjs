import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BLOG_DIR,
  SITE_URL,
  ensureDir,
  escapeHtml,
  formatDisplayDate,
  readPosts,
  renderTags
} from './blog-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const posts = readPosts(rootDir);
const blogDir = path.join(rootDir, BLOG_DIR);
ensureDir(blogDir);

if (!posts.length) {
  throw new Error('No blog posts found in content/blog.');
}

const latestDate = posts[0].date;
fs.writeFileSync(path.join(blogDir, 'blog.css'), buildCss(), 'utf8');
fs.writeFileSync(path.join(blogDir, 'index.html'), buildBlogIndex(posts), 'utf8');
for (const post of posts) {
  fs.writeFileSync(post.outputPath, buildPostPage(post, posts[0]), 'utf8');
}
fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), buildSitemap(posts, latestDate), 'utf8');

console.log(`Built ${posts.length} blog post(s).`);

function buildShell({ title, description, canonical, ogType = 'article', bodyClass = '', schema, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="Macaws.ai Ltd" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="Macaws.ai" />
  <meta property="og:locale" content="en_GB" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${SITE_URL}/brand/macaws_logo.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${SITE_URL}/brand/macaws_logo.png" />
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <link rel="icon" href="/favicon.ico" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,600;1,700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/blog/blog.css" />
</head>
<body class="${bodyClass}">
${body}
</body>
</html>`;
}

function buildNav(active) {
  return `<nav class="nav">
    <div class="nav-inner">
      <a class="nav-logo" href="/"><img src="/brand/macaws_logo.png" alt="Macaws.ai" /></a>
      <ul class="nav-links">
        <li><a href="/#features">Features</a></li>
        <li><a href="/#how-it-works">How it works</a></li>
        <li><a href="/#pricing">Pricing</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/blog/index.html"${active === 'blog' ? ' class="active"' : ''}>Blog</a></li>
      </ul>
      <a href="https://chao.macaws.ai" class="btn-nav">Get started</a>
    </div>
  </nav>`;
}

function buildFooter() {
  return `<footer class="footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <img src="/brand/macaws_logo.png" alt="Macaws.ai" />
          <p>Bespoke 24/7 AI receptionists for businesses that can't afford to miss a call.</p>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="/about.html">About</a></li>
            <li><a href="/blog/index.html">Blog</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="/privacy-policy.html">Privacy Policy</a></li>
            <li><a href="/terms-of-service.html">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Macaws.ai Ltd. All rights reserved.</span>
        <span>Made in Cambridge, UK</span>
      </div>
    </div>
  </footer>`;
}

function buildBlogIndex(posts) {
  const latest = posts[0];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Macaws.ai Blog',
    url: `${SITE_URL}/blog/index.html`,
    description: 'Insights on AI receptionists, missed-call recovery, and customer service automation.',
    blogPost: posts.map((post) => ({ '@type': 'BlogPosting', headline: post.title, url: post.canonicalUrl, datePublished: post.date }))
  };

  return buildShell({
    title: 'Macaws.ai Blog | AI receptionist insights for UK businesses',
    description: 'Practical articles from Macaws.ai on AI receptionists, call handling, bookings, and growth for UK businesses.',
    canonical: `${SITE_URL}/blog/index.html`,
    ogType: 'website',
    schema,
    body: `${buildNav('blog')}
  <header class="page-hero">
    <div class="page-hero-inner">
      <span class="eyebrow">Macaws.ai blog</span>
      <h1>Advice for businesses that want every enquiry answered.</h1>
      <p>We share practical lessons on AI receptionists, missed-call recovery, appointment booking, and how small teams can sound bigger without hiring a full front desk.</p>
    </div>
  </header>

  <main>
    <section class="section section-tight">
      <div class="section-inner">
        <div class="featured-post-card">
          <div>
            <span class="eyebrow">Latest post</span>
            <h2><a href="/blog/${latest.slug}.html">${escapeHtml(latest.title)}</a></h2>
            <p>${escapeHtml(latest.summary)}</p>
            <div class="meta-row"><span>${formatDisplayDate(latest.date)}</span><span>By ${escapeHtml(latest.author)}</span></div>
          </div>
          <a class="btn-primary" href="/blog/${latest.slug}.html">Read article</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-inner post-grid">
        ${posts.map((post) => `<article class="post-card">
          <span class="eyebrow">${formatDisplayDate(post.date)}</span>
          <h3><a href="/blog/${post.slug}.html">${escapeHtml(post.title)}</a></h3>
          <p>${escapeHtml(post.summary)}</p>
          <div class="tag-row">${renderTags(post.tags)}</div>
          <a class="text-link" href="/blog/${post.slug}.html">Read more</a>
        </article>`).join('')}
      </div>
    </section>
  </main>
  ${buildFooter()}`
  });
}

function buildPostPage(post, latestPost) {
  const nextRead = latestPost.slug === post.slug ? null : latestPost;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'Macaws.ai', logo: { '@type': 'ImageObject', url: `${SITE_URL}/brand/macaws_logo.png` } },
    description: post.summary,
    mainEntityOfPage: post.canonicalUrl
  };

  return buildShell({
    title: `${post.title} | Macaws.ai Blog`,
    description: post.summary,
    canonical: post.canonicalUrl,
    schema,
    bodyClass: 'blog-post-page',
    body: `${buildNav('blog')}
  <header class="article-hero">
    <div class="article-hero-inner">
      <a class="back-link" href="/blog/index.html">← Back to blog</a>
      <span class="eyebrow">${escapeHtml(post.heroEyebrow)}</span>
      <h1>${escapeHtml(post.heroTitle)}</h1>
      <p>${escapeHtml(post.summary)}</p>
      <div class="meta-row"><span>${formatDisplayDate(post.date)}</span><span>By ${escapeHtml(post.author)}</span></div>
      <div class="tag-row">${renderTags(post.tags)}</div>
    </div>
  </header>

  <main class="article-shell">
    <article class="article-card prose">
      ${post.bodyHtml}
    </article>

    <aside class="article-sidebar">
      <div class="sidebar-card">
        <span class="eyebrow">Need help now?</span>
        <h3>${escapeHtml(post.ctaTitle)}</h3>
        <p>${escapeHtml(post.ctaBody)}</p>
        <a class="btn-primary" href="${post.ctaLink}">Book a demo</a>
      </div>
      <div class="sidebar-card">
        <span class="eyebrow">${nextRead ? 'Next read' : 'Explore more'}</span>
        <h3>${escapeHtml(nextRead ? nextRead.title : 'Browse the Macaws.ai blog')}</h3>
        <p>${escapeHtml(nextRead ? nextRead.summary : 'Start at the blog index to see every published article and future posts generated from the content workflow.')}</p>
        <a class="text-link" href="${nextRead ? `/blog/${nextRead.slug}.html` : '/blog/index.html'}">${nextRead ? 'Open article' : 'Open blog index'}</a>
      </div>
    </aside>
  </main>
  ${buildFooter()}`
  });
}

function buildSitemap(posts, latestDate) {
  const staticPages = [
    { loc: `${SITE_URL}/`, lastmod: latestDate, changefreq: 'weekly', priority: '1.0' },
    { loc: `${SITE_URL}/about.html`, lastmod: latestDate, changefreq: 'monthly', priority: '0.8' },
    { loc: `${SITE_URL}/blog/index.html`, lastmod: latestDate, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE_URL}/privacy-policy.html`, lastmod: latestDate, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE_URL}/terms-of-service.html`, lastmod: latestDate, changefreq: 'yearly', priority: '0.3' }
  ];
  const allPages = [
    ...staticPages,
    ...posts.map((post) => ({ loc: post.canonicalUrl, lastmod: post.date, changefreq: 'monthly', priority: '0.7' }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => `
  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}

</urlset>
`;
}

function buildCss() {
  return `:root {
  --brand: #f05046;
  --brand-dark: #d63c33;
  --brand-light: #fff1f0;
  --dark: #1a1a1b;
  --mid: #3d3d3f;
  --muted: #6b7280;
  --border: #e5e7eb;
  --bg: #fdfdfd;
  --blue-accent: #2563eb;
  --navy: #060d1a;
}
* { box-sizing: border-box; }
html { font-family: 'Nunito', sans-serif; -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
body { margin: 0; color: var(--dark); background: var(--bg); }
body::before { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: .018; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px 200px; }
a { color: inherit; }
.nav { background: rgba(255,255,255,.94); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 50; }
.nav-inner { max-width: 1120px; margin: 0 auto; padding: 0 24px; min-height: 64px; display: flex; gap: 28px; align-items: center; }
.nav-logo img { height: 30px; display: block; }
.nav-links { list-style: none; margin: 0; padding: 0; display: flex; gap: 28px; flex: 1; }
.nav-links a { text-decoration: none; color: var(--mid); font-size: 14px; font-weight: 700; }
.nav-links a.active, .nav-links a:hover { color: var(--brand); }
.btn-nav, .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--brand); color: #fff; border-radius: 8px; padding: 11px 20px; text-decoration: none; font-weight: 700; transition: .2s ease; }
.btn-nav:hover, .btn-primary:hover { background: var(--brand-dark); transform: translateY(-1px); }
.page-hero, .article-hero { background: linear-gradient(180deg, #f0f4ff 0%, #fdfdfd 85%); padding: 88px 24px 56px; }
.article-hero { background: linear-gradient(180deg, #060d1a 0%, #0f172a 60%, #fdfdfd 100%); color: white; }
.page-hero-inner, .article-hero-inner, .section-inner, .footer-inner, .article-shell { max-width: 1120px; margin: 0 auto; }
.page-hero-inner { text-align: center; max-width: 820px; }
.article-hero-inner { max-width: 840px; }
.eyebrow { display: inline-flex; align-items: center; border: 1px solid rgba(240,80,70,.22); background: rgba(240,80,70,.10); color: var(--brand); border-radius: 999px; padding: 6px 14px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
h1 { margin: 18px 0 16px; font-size: clamp(36px, 5vw, 60px); line-height: 1.05; letter-spacing: -.03em; }
.page-hero p, .article-hero p { font-size: 19px; line-height: 1.7; max-width: 720px; color: inherit; opacity: .88; }
.section { padding: 32px 24px 84px; }
.section-tight { padding-top: 0; }
.featured-post-card, .post-card, .article-card, .sidebar-card { background: #fff; border: 1px solid var(--border); border-radius: 24px; box-shadow: 0 18px 50px rgba(15, 23, 42, .06); }
.featured-post-card { padding: 34px; display: flex; justify-content: space-between; gap: 24px; align-items: end; }
.post-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.post-card { padding: 28px; }
.post-card h3, .featured-post-card h2, .sidebar-card h3 { margin: 12px 0 12px; font-size: clamp(26px, 3vw, 34px); line-height: 1.15; }
.post-card p, .featured-post-card p, .sidebar-card p { margin: 0 0 18px; color: var(--mid); line-height: 1.7; }
.text-link, .back-link { color: var(--blue-accent); font-weight: 700; text-decoration: none; }
.meta-row { display: flex; flex-wrap: wrap; gap: 14px; color: var(--muted); font-size: 14px; font-weight: 700; }
.tag-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.tag { display: inline-flex; align-items: center; background: #f8fafc; border: 1px solid var(--border); color: var(--mid); border-radius: 999px; padding: 7px 12px; font-size: 12px; font-weight: 700; }
.article-shell { display: grid; grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr); gap: 28px; padding: 0 24px 84px; }
.article-card { padding: 40px; }
.sidebar-card { padding: 28px; margin-bottom: 20px; }
.prose p, .prose ul, .prose h2, .prose h3, .prose h4 { max-width: 720px; }
.prose p, .prose li { font-size: 18px; line-height: 1.9; color: #243042; }
.prose h2, .prose h3, .prose h4 { margin: 30px 0 14px; line-height: 1.2; letter-spacing: -.02em; }
.prose h2 { font-size: 34px; }
.prose h3 { font-size: 26px; }
.prose ul { padding-left: 22px; }
.prose code { background: #f8fafc; border: 1px solid var(--border); border-radius: 6px; padding: 1px 6px; font-size: .9em; }
.footer { background: #060d1a; color: #e2e8f0; }
.footer-inner { padding: 56px 24px 30px; }
.footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 28px; padding-bottom: 28px; border-bottom: 1px solid rgba(148,163,184,.15); }
.footer-brand img { height: 30px; margin-bottom: 18px; }
.footer-brand p, .footer-col a { color: #94a3b8; text-decoration: none; line-height: 1.8; }
.footer-col h4 { margin: 0 0 12px; color: white; }
.footer-col ul { list-style: none; margin: 0; padding: 0; }
.footer-bottom { display: flex; justify-content: space-between; gap: 16px; padding-top: 20px; color: #94a3b8; font-size: 14px; }
@media (max-width: 900px) {
  .nav-inner { flex-wrap: wrap; padding: 14px 24px; }
  .nav-links { width: 100%; flex-wrap: wrap; }
  .featured-post-card, .article-shell, .footer-top, .post-grid { grid-template-columns: 1fr; display: grid; }
  .featured-post-card { align-items: start; }
}
@media (max-width: 640px) {
  .page-hero, .article-hero { padding-top: 72px; }
  .article-card, .sidebar-card, .featured-post-card, .post-card { padding: 22px; border-radius: 18px; }
  .footer-bottom { flex-direction: column; }
}`;
}
