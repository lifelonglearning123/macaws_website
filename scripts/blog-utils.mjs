import fs from 'fs';
import path from 'path';

export const SITE_URL = 'https://macaws.ai';
export const BLOG_DIR = 'blog';
export const CONTENT_DIR = path.join('content', 'blog');
export const DEFAULT_AUTHOR = 'Macaws.ai Team';

export function slugify(input = '') {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function parseFrontMatter(raw) {
  const normalised = raw.replace(/^\uFEFF/, '');
  if (!normalised.startsWith('---')) return { data: {}, content: normalised.trim() };

  const end = normalised.indexOf('\n---', 3);
  if (end === -1) return { data: {}, content: normalised.trim() };

  const frontMatter = normalised.slice(3, end).trim();
  const content = normalised.slice(end + 4).trim();
  const data = {};

  for (const line of frontMatter.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const rawValue = line.slice(colonIndex + 1).trim();
    data[key] = parseFrontMatterValue(rawValue);
  }

  return { data, content };
}

function parseFrontMatterValue(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/^['"]|['"]$/g, ''));
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function inlineMarkdown(text = '') {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

export function markdownToHtml(markdown = '') {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const html = [];
  let paragraph = [];
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(heading[1].length + 1, 4);
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const list = trimmed.match(/^[-*]\s+(.+)$/);
    if (list) {
      flushParagraph();
      listItems.push(list[1]);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return html.join('\n');
}

export function formatDisplayDate(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

export function readPosts(rootDir) {
  const contentDir = path.join(rootDir, CONTENT_DIR);
  ensureDir(contentDir);
  const files = fs.readdirSync(contentDir)
    .filter((file) => file.endsWith('.md'))
    .sort();

  return files.map((file) => {
    const filePath = path.join(contentDir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = parseFrontMatter(raw);
    const slug = data.slug || slugify(path.basename(file, '.md'));
    const tags = Array.isArray(data.tags)
      ? data.tags
      : String(data.tags || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

    return {
      sourceFile: file,
      slug,
      title: data.title || slug,
      summary: data.summary || '',
      date: data.date || new Date().toISOString().slice(0, 10),
      author: data.author || DEFAULT_AUTHOR,
      tags,
      heroTitle: data.heroTitle || data.title || slug,
      heroEyebrow: data.heroEyebrow || 'Macaws.ai blog',
      ctaTitle: data.ctaTitle || 'Want an AI receptionist that turns missed calls into booked appointments?',
      ctaBody: data.ctaBody || 'Macaws.ai builds bespoke AI receptionists for UK businesses that want every enquiry handled professionally, day and night.',
      ctaLink: data.ctaLink || 'https://chao.macaws.ai',
      bodyHtml: markdownToHtml(content),
      canonicalUrl: `${SITE_URL}/${BLOG_DIR}/${slug}.html`,
      outputPath: path.join(rootDir, BLOG_DIR, `${slug}.html`)
    };
  }).sort((a, b) => b.date.localeCompare(a.date));
}

export function renderTags(tags = []) {
  return tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
}
