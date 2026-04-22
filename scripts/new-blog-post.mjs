import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONTENT_DIR, DEFAULT_AUTHOR, ensureDir, slugify } from './blog-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, CONTENT_DIR);
ensureDir(contentDir);

const options = parseArgs(process.argv.slice(2));
if (!options.title) {
  console.error('Usage: node scripts/new-blog-post.mjs --title "Post title" [--slug custom-slug] --summary "Short summary" [--brief "WhatsApp brief"] [--tags "tag one, tag two"]');
  process.exit(1);
}

const slug = options.slug || slugify(options.title);
const date = options.date || new Date().toISOString().slice(0, 10);
const summary = options.summary || options.brief || 'Add a clear two-sentence summary here.';
const brief = options.brief || 'Paste the WhatsApp topic or notes here and expand into a polished article.';
const tags = options.tags || 'AI receptionist, customer service';
const heroEyebrow = options.heroEyebrow || 'AI receptionist insights';
const fileName = `${date}-${slug}.md`;
const filePath = path.join(contentDir, fileName);

if (fs.existsSync(filePath)) {
  console.error(`Post already exists: ${fileName}`);
  process.exit(1);
}

const template = `---
title: ${options.title}
slug: ${slug}
date: ${date}
summary: ${summary}
author: ${options.author || DEFAULT_AUTHOR}
tags: [${tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => `"${tag}"`).join(', ')}]
heroEyebrow: ${heroEyebrow}
heroTitle: ${options.heroTitle || options.title}
ctaTitle: ${options.ctaTitle || 'Want Macaws.ai to handle every inbound enquiry for you?'}
ctaBody: ${options.ctaBody || 'Book a short demo and we will map an AI receptionist workflow around your calls, bookings, and FAQs.'}
ctaLink: ${options.ctaLink || 'https://chao.macaws.ai'}
---

## WhatsApp brief

${brief}

## Draft angle

Open with the customer problem in plain language. Explain what usually goes wrong today, why it matters commercially, and how an AI receptionist changes the outcome.

## Key points to cover

- Who this issue affects most
- What gets missed when calls go unanswered
- Practical steps a business can take next
- Where Macaws.ai fits naturally, without turning the article into a sales pitch

## Suggested CTA

Close with a calm invitation to speak to Macaws.ai if the reader wants to stop missed calls and improve response times.
`;

fs.writeFileSync(filePath, template, 'utf8');
console.log(`Created ${path.relative(rootDir, filePath)}`);

function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith('--')) {
      result[key] = 'true';
      continue;
    }
    result[key] = next;
    i += 1;
  }
  return result;
}
