# Two Passions

A single page about poetry and boxing, written in Swedish. Two cards sit side by side, one for each interest, and a short section underneath names what they share: rhythm, precision and presence. It began as an early two-column layout exercise and was later rebuilt with a cleaner structure.

**Live:** [abdimannor.github.io/two-passions](https://abdimannor.github.io/two-passions/)

## How it is built

Plain HTML and CSS, no build step and no JavaScript.

- `index.html`: the hero, the two cards and the shared-core section
- `style.css`: layout, colours and the small motion loops
- `assets/gifs/`: the animated card images, as GIF and as a lighter WebP copy
- `assets/images/`: one still frame of each animation, also used as the social preview image

The cards use a two-column CSS grid that collapses to one column below 760 px, and the shared-core section does the same with three columns.

## Motion

Each card image is animated, and a small badge in its corner runs a CSS loop: three lines drawing themselves for poetry, three dots shifting like footwork for boxing.

The images are served through `<picture>`:

1. visitors who ask for reduced motion get a still JPG frame,
2. other browsers get an animated WebP (about 0.5 MB each, down from 1.8 and 2.6 MB for the GIFs),
3. the GIF stays as the fallback.

Under `prefers-reduced-motion: reduce`, the cards show a still frame instead of the animation, the CSS loops are cut to a near-instant single run, and the hover zoom is switched off.

## Running it locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Pushes to `master` deploy to GitHub Pages through `.github/workflows/deploy.yml`.

## Possible next steps

A closing reflection or a longer essay in the page's own voice, a gallery or timeline, and an accessibility and performance pass.

## License

Released under the MIT License. See [LICENSE](LICENSE).
