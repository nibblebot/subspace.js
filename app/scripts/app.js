var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

define(['lodash', 'jquery'], function(_, $) {
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
        this.ROTATION_STEP = 3;
        this.CLOCKWISE = this.ROTATION_STEP;
        this.COUNTER_CLOCKWISE = -this.ROTATION_STEP;
      }

      Player.prototype.reset = function() {
        this.x = WIDTH / 2;
        this.y = HEIGHT / 2;
        this.velocity = 0;
        this.acceleration = 0;
        this.rotation = 0;
        return this.angle = 0;
      };

      Player.prototype.stopInput = function(el) {
        return el.off('keydown keyup');
      };

      Player.prototype.listenInput = function() {
        var el,
          _this = this;
        el = $(document.body);
        el.on('keydown', function(e) {
          e.preventDefault();
          switch (e.keyCode) {
            case 37:
              return _this.rotation = _this.COUNTER_CLOCKWISE;
            case 39:
              return _this.rotation = _this.CLOCKWISE;
            case 38:
              return _this.acceleration = 1;
            case 40:
              return _this.acceleration = -1;
          }
        });
        return el.on('keyup', function(e) {
          e.preventDefault();
          switch (e.keyCode) {
            case 37:
            case 39:
              return _this.rotation = 0;
            case 38:
            case 40:
              return _this.acceleration = 0;
          }
        });
      };

      Player.prototype.updateAngle = function() {
        return this.angle = (this.angle + 360 + this.rotation) % 360;
      };

      Player.prototype.tick = function() {
        return this.updateAngle();
      };

      Player.prototype.draw = function() {
        ctx.save();
        ctx.translate(WIDTH / 2, HEIGHT / 2);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        return ctx.restore();
      };

      Player.prototype.drawStats = function(x, y) {
        ctx.fillText("velocity: " + this.velocity, x, y);
        ctx.fillText("acceleration: " + this.acceleration, x, y + 10);
        ctx.fillText("rotation: " + this.rotation, x, y + 20);
        return ctx.fillText("angle: " + this.angle, x, y + 30);
      };

      return Player;

    })();
    return game = new Game();
  });
});
