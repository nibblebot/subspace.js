define ['lodash', 'jquery', 'keymaster'], ($, key) -> $ ->
requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame

clearCanvas = ->
  ctx.fillStyle = '#000'
  ctx.fillRect 0, 0, WIDTH, HEIGHT

class Resources
  constructor: (options) ->
    all_resources = options.images?.length
    complete = _.after all_resources, ->
      options.complete()
    if options.images
      @images = {}
      for img in options.images
        i = new Image()
        i.onload = complete
        i.src = img
        basename = wb.src.split('/').pop().split('.')[0]
        @images[basename] = i



class Game
  constructor: ->
    @player = new Player()

  ctx: document.getElementById('game').getContext('2d')
  resources: new Resources
    images: [
      'images/warbird.png'
      'images/bullets.png'
      'images/bombs.png'
    ]
    complete: @start
  WIDTH: 400
  HEIGHT: 300
  start: =>
    @tick()
    @fpsID = setInterval @drawFPS, 1000

  stop: => 
    if @tickID
      window.webkitClearAnimationFrame @tickID
    if @fpsID
      clearInterval @fpsID
  tick: =>
    clearCanvas()
    player.tick()
    player.draw()
    @tickID = requestAnimationFrame @tick

  drawFPS: =>



class Player
  constructor: ->
    @sprite = resources.images.warbird
    @x = WIDTH/2 - @sprite.width/2
    @y = HEIGHT/2 - @sprite.height/2

  tick: ->
    # console.log 'tick: ', (new Date).getTime()
    xstep = if @x < WIDTH - @sprite.width then 2 else -2
    ystep = if @y < HEIGHT - @sprite.height then 3 else -3
    @x += xstep
    @y += ystep

  draw: ->
    ctx.drawImage(@sprite, @x, @y)

game = new Game()
