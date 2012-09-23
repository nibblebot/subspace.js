var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

define(['lodash', 'jquery', 'gl-matrix'], function(_, $, vec3) {
  return $(function() {
    var FPS, Game, HEIGHT, Player, Resources, WIDTH, clearCanvas, ctx, rotationMatrix;
    rotationMatrix = _.memoize(function(theta) {
      return mat2.createFrom(Math.cos(theta), -Math.sin(theta), Math.sin(theta), Math.cos(theta));
    });
    vec2.rotate = function(vec, theta) {
      return mat2.multiplyVec2(rotationMatrix(theta), vec);
    };
    ctx = document.getElementById('game').getContext('2d');
    WIDTH = $('#game').width();
    HEIGHT = $('#game').height();
    FPS = 1000 / 16;
    clearCanvas = function() {
      ctx.fillStyle = '#000';
      return ctx.fillRect(0, 0, WIDTH, HEIGHT);
    };
    Resources = (function() {

      function Resources(options) {
        var all_resources, basename, complete, i, img, _i, _len, _ref, _ref1;
        all_resources = (_ref = options.images) != null ? _ref.length : void 0;
        complete = _.after(all_resources, function() {
          return options.complete();
        });
        if (options.images) {
          this.images = {};
          _ref1 = options.images;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            img = _ref1[_i];
            i = new Image();
            i.onload = complete;
            i.src = img;
            basename = i.src.split('/').pop().split('.')[0];
            this.images[basename] = i;
          }
        }
      }

      return Resources;

    })();
    Game = (function() {

      Game.prototype.debug = true;

      function Game() {
        this.drawDebug = __bind(this.drawDebug, this);

        this.tick = __bind(this.tick, this);

        this.stop = __bind(this.stop, this);

        this.start = __bind(this.start, this);

        var _this = this;
        this.$el = $('#game');
        this.resources = new Resources({
          images: ['images/warbird.png', 'images/bullets.png', 'images/bombs.png'],
          complete: function() {
            _this.player = new Player({
              sprite: _this.resources.images.warbird
            });
            return _this.start();
          }
        });
      }

      Game.prototype.start = function() {
        this.lastUpdate = +(new Date) - 1;
        this.player.listenInput();
        return this.tick();
      };

      Game.prototype.stop = function() {
        this.player.stopInput();
        if (this.tickID) {
          return clearInterval(this.tickID);
        }
      };

      Game.prototype.tick = function() {
        window.webkitRequestAnimationFrame(this.tick);
        return clearCanvas();
      };

      Game.prototype.drawDebug = function() {
        return this.player.drawStats(4, 60);
      };

      return Game;

    })();
    Player = (function() {

      function Player(options) {
        this.drawStats = __bind(this.drawStats, this);

        this.draw = __bind(this.draw, this);

        this.tick = __bind(this.tick, this);

        this.listenInput = __bind(this.listenInput, this);

        this.stopInput = __bind(this.stopInput, this);

        this.reset = __bind(this.reset, this);
        this.sprite = options.sprite;
        this.reset();
      }

      Player.prototype.rotationFactor = 6;

      Player.prototype.accelerationFactor = 1 / 2;

      Player.prototype.maxVelocity = 4;

      Player.prototype.reset = function() {
        this.zero = vec2.createFrom(0, 0);
        this.position = vec2.createFrom(WIDTH / 2, HEIGHT / 2);
        this.velocity = vec2.create(this.zero);
        this.acceleration = vec2.create(this.zero);
        this.angle = vec2.createFrom(0, 1);
        this.negY = vec2.createFrom(1, -1);
        return this.negX = vec2.createFrom(-1, 1);
      };

      Player.prototype.stopInput = function() {
        var el;
        el = $(document.body);
        return el.off('keydown keyup');
      };

      Player.prototype.listenInput = function() {
        var el,
          _this = this;
        el = $(document.body);
        el.on('keydown', function(e) {
          switch (e.keyCode) {
            case 37:
              _this.rotation = -_this.rotationFactor;
              break;
            case 39:
              _this.rotation = _this.rotationFactor;
              break;
            case 38:
              _this.accelerationScalar = _this.accelerationFactor;
              break;
            case 40:
              _this.accelerationScalar = -_this.accelerationFactor;
              break;
            default:
              return;
          }
          return e.preventDefault();
        });
        return el.on('keyup', function(e) {
          switch (e.keyCode) {
            case 38:
            case 40:
              _this.accelerationScalar = 0;
              break;
            case 37:
            case 39:
              _this.rotation = 0;
              break;
            default:
              return;
          }
          return e.preventDefault();
        });
      };

      Player.prototype.reverseX = function() {
        return vec2.multiply(this.negX, this.velocity);
      };

      Player.prototype.reverseY = function() {
        return vec2.multiply(this.negY, this.velocity);
      };

      Player.prototype.tick = function() {
        console.log(this.angle);
        vec2.add(this.acceleration, this.velocity);
        vec2.normalize(this.velocity);
        vec2.scale(this.velocity, this.maxVelocity);
        vec2.add(this.velocity, this.position);
        if (this.rotation) {
          vec2.rotate(this.angle, this.rotation * (Math.PI / 180));
        }
        if (this.accelerationScalar) {
          vec2.scale(this.angle, this.accelerationScalar, this.acceleration);
        } else {
          vec2.set(this.zero, this.acceleration);
        }
        if (this.position[0] < 0) {
          this.position[0] = 0;
          return this.reverseX();
        } else if (this.position[0] > WIDTH - this.sprite.width) {
          this.position[0] = WIDTH - this.sprite.width;
          return this.reverseX();
        } else if (this.position[1] < 0) {
          this.position[1] = 0;
          return this.reverseY();
        } else if (this.position[1] > HEIGHT - this.sprite.height) {
          this.position[1] = HEIGHT - this.sprite.height;
          return this.reverseY();
        }
      };

      Player.prototype.draw = function() {
        ctx.save();
        ctx.translate(this.position[0], this.position[1]);
        ctx.rotate(Math.atan2(this.angle[1], this.angle[0]) + Math.PI / 2);
        ctx.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        return ctx.restore();
      };

      Player.prototype.drawStats = function(x, y) {
        ctx.fillText("velocity: " + this.velocity[0] + ", " + this.velocity[1], x, y);
        ctx.fillText("acceleration: " + this.acceleration[0] + ", " + this.acceleration[1], x, y + 10);
        return ctx.fillText("angle: " + this.angle[0] + ", " + this.angle[1], x, y + 30);
      };

      return Player;

    })();
    return window.game = new Game();
  });
});
