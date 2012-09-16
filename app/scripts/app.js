var Game, Player, Resources, clearCanvas, game, requestAnimationFrame,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

define(['lodash', 'jquery', 'keymaster'], function($, key) {
  return $(function() {});
});

requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

window.requestAnimationFrame = requestAnimationFrame;

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
        basename = wb.src.split('/').pop().split('.')[0];
        this.images[basename] = i;
      }
    }
  }

  return Resources;

})();

Game = (function() {

  function Game() {
    this.drawFPS = __bind(this.drawFPS, this);

    this.tick = __bind(this.tick, this);

    this.stop = __bind(this.stop, this);

    this.start = __bind(this.start, this);
    this.player = new Player();
  }

  Game.prototype.ctx = document.getElementById('game').getContext('2d');

  Game.prototype.resources = new Resources({
    images: ['images/warbird.png', 'images/bullets.png', 'images/bombs.png'],
    complete: Game.start
  });

  Game.prototype.WIDTH = 400;

  Game.prototype.HEIGHT = 300;

  Game.prototype.start = function() {
    this.tick();
    return this.fpsID = setInterval(this.drawFPS, 1000);
  };

  Game.prototype.stop = function() {
    if (this.tickID) {
      window.webkitClearAnimationFrame(this.tickID);
    }
    if (this.fpsID) {
      return clearInterval(this.fpsID);
    }
  };

  Game.prototype.tick = function() {
    clearCanvas();
    player.tick();
    player.draw();
    return this.tickID = requestAnimationFrame(this.tick);
  };

  Game.prototype.drawFPS = function() {};

  return Game;

})();

Player = (function() {

  function Player() {
    this.sprite = resources.images.warbird;
    this.x = WIDTH / 2 - this.sprite.width / 2;
    this.y = HEIGHT / 2 - this.sprite.height / 2;
  }

  Player.prototype.tick = function() {
    var xstep, ystep;
    xstep = this.x < WIDTH - this.sprite.width ? 2 : -2;
    ystep = this.y < HEIGHT - this.sprite.height ? 3 : -3;
    this.x += xstep;
    return this.y += ystep;
  };

  Player.prototype.draw = function() {
    return ctx.drawImage(this.sprite, this.x, this.y);
  };

  return Player;

})();

game = new Game();
