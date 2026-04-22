# Macaws.ai blog workflow

This site is a simple static HTML website. The blog workflow stays equally simple:

- source posts live in `content/blog/*.md`
- generated public pages live in `blog/*.html`
- `scripts/build-blog.mjs` rebuilds the blog index, post pages, shared blog CSS, and `sitemap.xml`
- `scripts/new-blog-post.mjs` creates a new Markdown draft from a title, summary, and WhatsApp brief

## Typical assistant workflow from a WhatsApp topic

When a new WhatsApp message arrives with a topic or rough brief, do this:

### 1. Create a draft source file

```bash
node scripts/new-blog-post.mjs \
  --title "How dental clinics can stop losing leads after hours" \
  --summary "A practical guide to handling missed calls, urgent enquiries, and appointment bookings outside normal opening hours." \
  --tags "AI receptionist, dental clinic, missed calls" \
  --brief "WhatsApp brief pasted here"
```

This creates a Markdown file in `content/blog/` with front matter and a starter structure.

### 2. Turn the brief into a real article

Open the new file and replace the placeholder sections with a polished blog post.

Recommended shape:

- lead with the customer problem
- explain why it matters commercially
- give practical advice, not just promotion
- keep Macaws.ai relevant but not pushy
- end with a soft CTA to book a demo

## Content rules

Front matter fields supported:

- `title`
- `slug`
- `date` (`YYYY-MM-DD`)
- `summary`
- `author`
- `tags` (array)
- `heroEyebrow`
- `heroTitle`
- `ctaTitle`
- `ctaBody`
- `ctaLink`

Body formatting supports:

- paragraphs
- `##` and `###` headings
- bullet lists using `-`
- inline `**bold**`, `*italic*`, and `` `code` ``
- links like `[label](https://example.com)`

## 3. Build the blog

```bash
node scripts/build-blog.mjs
```

This regenerates:

- `blog/index.html`
- `blog/blog.css`
- each `blog/<slug>.html` post page
- `sitemap.xml`

## 4. Quick verification

Run the local static server:

```bash
node serve.mjs
```

Then check:

- `http://localhost:3000/blog/index.html`
- the new blog post URL
- homepage nav shows `Blog`
- footer links include `Blog`

Optional screenshot helper:

```bash
node screenshot.mjs http://localhost:3000/blog/index.html blog-index
```

## Publishing checklist

- create or update the Markdown source file
- run `node scripts/build-blog.mjs`
- verify blog index and post page locally
- commit both the source file and generated output

## Notes

- The generated blog pages intentionally use a shared `blog/blog.css` file to keep maintenance simple.
- The homepage and about page include a direct blog link, but the blog itself is generated from source content.
- No extra build tool or framework is required.
