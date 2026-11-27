# Blog posts

Each post is one Markdown file in this folder. Adding a file and pushing to `main` publishes it.

- File name: `YYYY-MM-DD-some-title.md`. The part after the date becomes the address: `/blog/some-title`.
- The top of the file holds the title, date and summary between two `---` lines.
- Add `draft: true` there to keep a post off the site until it is ready.
- Optional `image: /blog/name.png` shows a header image on the post and in link previews. Put the file in `public/blog/` (1200 x 627 works well).

```
---
title: My post title
date: 2026-11-26
summary: One or two sentences. Shown on the blog list and when the link is shared.
---

The post goes here, in Markdown.
```
