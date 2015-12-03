var Spritesmith = require('spritesmith');
var minimatch = require('minimatch');
var templater = require('spritesheet-templates');
var streamToBuffer = require('stream-to-buffer');

module.exports = function makeSprites(options) {
  options = options || {};
  options.src = options.src || '**/*.png';
  const SPRITE_URL = './images/sprites.png';
  const SPRITESHEET_URL = './sprites.css';

  return function(files, metalsmith, done) {
    var err, paths;
    try {
      paths = Object.keys(files).filter(minimatch.filter(options.src, {dot: true})).map((name) => 'src/' + name);
    } catch (_error) {
      err = _error;
      return done(err);
    }


    var spritesmith = new Spritesmith();
    spritesmith.createImages(paths, (_error, images) => {
      if (_error) {
        err = _error;
        return done(err);
      }

      var result = spritesmith.processImages(images, { padding: 2 });

      var coordinates_formatted = Object.keys(result.coordinates).map(
        (key) => ({
          name: key.replace(/\.png$/, '').split('/')[key.split('/').length - 1],
          x: result.coordinates[key].x,
          y: result.coordinates[key].y,
          width: result.coordinates[key].width,
          height: result.coordinates[key].height
        })
      );


      var css_output = templater({
        sprites: coordinates_formatted,
        spritesheet: {
          width: result.properties.width, height: result.properties.height, image: SPRITE_URL
        }
      }, {
        format: 'css',
        formatOpts: {
          cssSelector: function(sprite) {
            return sprite.name.replace(/\:\:/g, ':');
          }
        }
      });

      files[SPRITESHEET_URL] = {
        contents: new Buffer(css_output),
        mode: '0644'
      }; 

      streamToBuffer(result.image, (err, buffer) => {
        files[SPRITE_URL] = {
          contents: buffer,
          mode: '0644'
        };
        done();
      });

    });
  };
};

