# Metalsmith-Spritesmith

`npm install metalsmith-spritesmith`

This plugin lets you use Metalsmith to sprite images through spritesmith

# Usage

```
var spritesmith = require('metalsmith-spritesmith');

metalsmith(__dirname)
  .destination(...)

  .use(spritesmith({
    src: '**/*.png'
    image_dest: './images/sprites.png',
    css_dest: './sprites.css',

    spritesmith: { // Options for spritesmith.processImages
      padding: 2
    },

    templater: { // Options for spritesmith templater
      format: 'css',
      formatOpts: {
        cssSelector: function(sprite) {
          return sprite.name.replace(/\:\:/g, ':');
        }
      }
    }
  }))

  .build(function(err) {
    if(err) {
      console.dir(err);
    }
  });
```

# Options
`src`: Minimatch selector for input files (e.g. `**/*.png`)
`image_dest`: Output path for spritesheet
`css_dest`: Output path for CSS file
`spritesmith`: Options that will be passed to `spritesmith.processImages`
`templater`: Options for spritesmith templater