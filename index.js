var Spritesmith = require('spritesmith');
var minimatch = require('minimatch');
var templater = require('spritesheet-templates');
var streamToBuffer = require('stream-to-buffer');
var path = require('path');

module.exports = function metalsmith_spritesmith(options) {
  options = options || {};
  options.templater = options.templater || {};
  options.spritesmith = options.spritesmith || {};
  options.removeSrc = options.removeSrc || false;

  if(!options.src) {
    done(new Error('Metalsmith-Spritesmith missing required parameter: src'));
  }
  if(!options.image_dest) {
    done(new Error('Metalsmith-Spritesmith missing required parameter: image_dest'));
  }
  if(!options.css_dest) {
    done(new Error('Metalsmith-Spritesmith missing required parameter: css_dest'));
  }

  return function(files, metalsmith, done) {

    // Get a list of paths to send to spritesmith
    var paths;
    try {
      paths = Object.keys(files).filter(minimatch.filter(options.src, {dot: true})).map((name) => 'src/' + name);
    } catch (err) {
      return done(err);
    }

    var spritesmith = new Spritesmith();
    spritesmith.createImages(paths, (err, images) => {
      if (err) {
        return done(err);
      }

      var result = spritesmith.processImages(images, options.spritesmith);

      var coordinates_formatted = Object.keys(result.coordinates).map(
        (key) => ({
          name: path.basename( key, path.extname( key ) ),
          x: result.coordinates[key].x,
          y: result.coordinates[key].y,
          width: result.coordinates[key].width,
          height: result.coordinates[key].height
        })
      );


      var css_output = templater({
        sprites: coordinates_formatted,
        spritesheet: {
          width: result.properties.width, height: result.properties.height, image: path.posix.relative( path.dirname( options.css_dest ), options.image_dest )
        }
      }, options.templater);


      files[options.css_dest] = {
        contents: new Buffer(css_output),
        mode: '0644'
      }; 

      streamToBuffer(result.image, (err, buffer) => {
        files[options.image_dest] = {
          contents: buffer,
          mode: '0644'
        };
        done();
      });

      if(options.removeSrc){
        Object.keys(result.coordinates).forEach((file) => {delete files[file.slice(4)];});
      }

    });
  };
};
