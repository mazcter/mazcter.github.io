# ohmydata

A learn-along-with-me site for machine learning.

## structure

```
index.html      → landing (hero, about, buttons, topic carousel)
socials.html    → links to your profiles
projects.html   → things you've built
style.css       → all styling (shared across pages)
script.js       → carousel + footer year
```

## customize

- **about text** — edit the `.about` paragraph in `index.html`
- **socials** — update the `href` values in `socials.html`
- **projects** — duplicate or edit `<article class="project">` blocks in `projects.html`

## adding gifs / videos to the carousel

Each topic is a `<article class="card">` in `index.html`. To swap a placeholder image for a gif or video:

**gif (works as an image):**
```html
<div class="media">
  <img src="assets/linear-regression.gif" alt="Linear regression animation" />
</div>
```

**video (mp4 / webm — looping, muted, autoplay):**
```html
<div class="media">
  <video autoplay muted loop playsinline>
    <source src="assets/gradient-descent.mp4" type="video/mp4" />
  </video>
</div>
```

Put your media in an `assets/` folder at the repo root.

## adding a new topic

Copy any `<article class="card">` block, bump the number, swap the media and copy.

## deploy

This is plain HTML/CSS/JS — push to GitHub and enable Pages (Settings → Pages → Deploy from branch → `main` / `root`).
