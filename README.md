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

## Rounds, tempo and poster

- `rhythm.js` frames the scroll as three rounds (Rond 1, 2, 3) with a short rest between them, shown in a slim bar at the top. Each round owns a third of the poetry lines; during a rest the jabs stop.
- The tempo dial (60 to 140 BPM, remembered in `localStorage`) sets how many jabs land per line and, with sound on, the metronome tick. `sound.js` rings a bell at the start of each round.
- `poster.js` draws the diptych (headline, both still frames, the three shared keywords) to a 1080 x 1350 canvas in the page's colours and fonts and downloads it as a PNG. Everything stays in the browser.

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

## Audio test

`PLAYWRIGHT=/path/to/playwright/index.mjs node tests/audio.mjs` renders the bell, tick and thud from `synth.js` in an OfflineAudioContext and checks that each is audible, below clipping, free of edge clicks and distinct in pitch and length.
