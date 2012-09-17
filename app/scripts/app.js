var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

define(['lodash', 'jquery', 'sylvester'], function(_, $, Sylvester) {
  return $(function() {
    var Game, HEIGHT, Player, Resources, WIDTH, clearCanvas, ctx, game, requestAnimationFrame;
    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
    ctx = document.getElementById('game').getContext('2d');
    WIDTH = $('#game').width();
    HEIGHT = $('#game').height();
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
        this.drawFPS = __bind(this.drawFPS, this);

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
        this.fps = 0;
        this.fpsFilter = 50;
        this.player.listenInput();
        this.tick();
        return this.fpsID = setInterval(this.drawFPS, 1000);
      };

      Game.prototype.stop = function() {
        this.player.stopInput();
        if (this.tickID) {
          window.webkitClearAnimationFrame(this.tickID);
        }
        if (this.fpsID) {
          return clearInterval(this.fpsID);
        }
      };

      Game.prototype.tick = function() {
        clearCanvas();
        this.player.tick();
        this.player.draw();
        if (this.debug) {
          this.drawDebug();
        }
        return this.tickID = requestAnimationFrame(this.tick);
      };

      Game.prototype.drawDebug = function() {
        var x, y;
        x = 4;
        y = 10;
        this.drawFPS(x, y);
        return this.player.drawStats(x, y + 10);
      };

      Game.prototype.drawFPS = function() {
        var frameTime, now;
        frameTime = 1000 / (+(now = new Date) - this.lastUpdate);
        this.fps += (frameTime - this.fps) / this.fpsFilter;
        this.lastUpdate = now;
        ctx.fillStyle = '#fff';
        return ctx.fillText("" + (Math.floor(this.fps)) + " fps", 4, 10);
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

      Player.prototype.accelerationFactor = 1 / 4;

      Player.prototype.maxVelocity = 4;

      Player.prototype.reset = function() {
        this.zero = Vector.Zero(2);
        this.position = $V([WIDTH / 2, HEIGHT / 2]);
        this.velocity = Vector.Zero(2);
        this.acceleration = Vector.Zero(2);
        this.angle = $V([0, 1]);
        this.VX = $V([1, 0]);
        return this.VnegX = $V([-1, 0]);
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
        return this.velocity = $V([-this.velocity.e(1), this.velocity.e(2)]);
      };

      Player.prototype.reverseY = function() {
        return this.velocity = $V([this.velocity.e(1), -this.velocity.e(2)]);
      };

      Player.prototype.tick = function() {
        this.velocity = this.velocity.add(this.acceleration).toUnitVector().x(this.maxVelocity);
        this.position = this.position.add(this.velocity);
        if (this.rotation) {
          this.angle = this.angle.rotate(this.rotation * (Math.PI / 180), this.zero);
        }
        if (this.accelerationScalar) {
          this.acceleration = this.angle.x(this.accelerationScalar);
        } else {
          this.acceleration = this.zero;
        }
        if (this.position.e(1) < 0) {
          this.position.setElements([0, this.position.e(2)]);
          return this.reverseX();
        } else if (this.position.e(1) > WIDTH - this.sprite.width) {
          this.position.setElements([WIDTH - this.sprite.width, this.position.e(2)]);
          return this.reverseX();
        } else if (this.position.e(2) < 0) {
          this.position.setElements([this.position.e(1), 0]);
          return this.reverseY();
        } else if (this.position.e(2) > HEIGHT - this.sprite.height) {
          this.position.setElements([this.position.e(1), HEIGHT - this.sprite.height]);
          return this.reverseY();
        }
      };

      Player.prototype.draw = function() {
        ctx.save();
        ctx.translate(this.position.e(1), this.position.e(2));
        ctx.rotate(Math.atan2(this.angle.e(2), this.angle.e(1)) + Math.PI / 2);
        ctx.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        return ctx.restore();
      };

      Player.prototype.drawStats = function(x, y) {
        ctx.fillText("velocity: " + (this.velocity.e(1)) + ", " + (this.velocity.e(2)), x, y);
        ctx.fillText("acceleration: " + (this.acceleration.e(1)) + ", " + (this.acceleration.e(2)), x, y + 10);
        return ctx.fillText("angle: " + (this.angle.e(1)) + ", " + (this.angle.e(2)), x, y + 30);
      };

      return Player;

    })();
    return game = new Game();
  });
});
