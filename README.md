# Two Passions

Live: [abdimannor.github.io/two-passions](https://abdimannor.github.io/two-passions/)

A single page in Swedish about poetry and boxing. Two cards sit side by side, one for each interest, and a short section underneath names what they share: rhythm, precision and presence. It began as an early two-column layout exercise and has grown into a small study in giving a page a beat.

## What you can do on the page

- **Scroll through three rounds.** The scroll is framed as Rond 1, 2 and 3 with a short rest between them, shown in a slim bar at the top. Each round owns a third of the poetry lines and the boxing jabs move with them; during a rest everything holds still.
- **Set the tempo.** A dial from 60 to 140 BPM sets how many jabs land per line. It is remembered between visits.
- **Turn the sound on.** Off by default and never autoplaying: a soft metronome tick, a muffled thud per jab and a boxing bell at the start of each round, all synthesised with the Web Audio API (there are no audio files).
- **Save it as a poster.** "Spara som affisch" draws the diptych (headline, both still frames, the three shared keywords) to a 1080 x 1350 canvas in the page's own colours and fonts and downloads a PNG. Nothing leaves the browser.
- **Switch motion off or on.** Motion is on by default; the pause button turns it off and remembers the choice.

## How it is built

Plain HTML, CSS and a few ES modules, no build step and no dependencies.

- `index.html`, `style.css`: the hero, the two cards and the shared-core section. The cards use a two-column grid that collapses to one column below 760 px.
- `rhythm.js`: the shared beat and the rounds
- `sound.js`, `synth.js`: the sound layer; `synth.js` holds the tick, thud and bell so they can also be rendered offline for testing
- `poster.js`: the PNG poster
- `controls.js`: on narrow screens, tempo and poster fold behind a "Mer" button
- `motion.js`: the motion switch, run in `<head>` so the first paint is already right
- `assets/`: the animated card images (GIF plus a lighter animated WebP, about 0.5 MB each instead of 1.8 and 2.6 MB) and one still frame of each, which is also the social preview

The images are served through `<picture>`: animated WebP by default, still JPG frames when motion is off, GIF as the fallback. With motion off the CSS loops and the hover zoom stop too.

## Running it locally

```sh
python3 -m http.server 8000
```

Pushes to `master` deploy to GitHub Pages through `.github/workflows/deploy.yml`.

## Audio test

`PLAYWRIGHT=/path/to/playwright/index.mjs node tests/audio.mjs` renders the bell, tick and thud from `synth.js` in an OfflineAudioContext and checks that each is audible, below clipping, free of edge clicks and distinct in pitch and length.

## Possible next steps

A closing reflection or a longer essay in the page's own voice, and a gallery or timeline.

## License

Released under the MIT License. See [LICENSE](LICENSE).
