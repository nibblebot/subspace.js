define ['lodash', 'jquery', 'sylvester'], (_, $, Sylvester) -> 
  $ ->
    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame
    ctx = document.getElementById('game').getContext('2d')
    WIDTH = $('#game').width()
    HEIGHT = $('#game').height()

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
            basename = i.src.split('/').pop().split('.')[0]
            @images[basename] = i



    class Game
      debug: true
      constructor: ->
        @$el = $('#game')
        @resources = new Resources
          images: [
            'images/warbird.png'
            'images/bullets.png'
            'images/bombs.png'
          ]
          complete: =>
            @player = new Player
              sprite: @resources.images.warbird
            @start()


      start: =>
        @lastUpdate = +(new Date) - 1
        @fps = 0
        @fpsFilter = 50
        @player.listenInput()

        @tick()
        @fpsID = setInterval @drawFPS, 1000

      stop: => 
        @player.stopInput()
        if @tickID
          window.webkitClearAnimationFrame @tickID
        if @fpsID
          clearInterval @fpsID

      tick: =>
        clearCanvas()
        @player.tick()
        @player.draw()
        @drawDebug() if @debug
        @tickID = requestAnimationFrame @tick

      drawDebug: =>
        x = 4
        y = 10
        @drawFPS x, y
        @player.drawStats x, y + 10

      drawFPS: =>
        frameTime = 1000 / (+(now=new Date) - @lastUpdate)
        @fps += (frameTime - @fps) / @fpsFilter
        @lastUpdate = now
        ctx.fillStyle = '#fff'
        ctx.fillText "#{Math.floor @fps} fps", 4, 10

    class Player
      constructor: (options) ->
        @sprite = options.sprite
        @reset()

      rotationFactor: 6
      accelerationFactor: 1/4
      maxVelocity: 4
      reset: =>
        @zero = Vector.Zero 2
        @position = $V [WIDTH/2, HEIGHT/2]
        @velocity = Vector.Zero 2 
        @acceleration = Vector.Zero 2 
        @angle = $V [0, 1]
        @VX = $V [1, 0]
        @VnegX = $V [-1, 0]

      stopInput: =>
        el = $ document.body
        el.off 'keydown keyup'

      listenInput: =>
        el = $ document.body
        el.on 'keydown', (e) => 
          switch e.keyCode
            when 37 then @rotation = -@rotationFactor
            when 39 then @rotation = @rotationFactor
            when 38 then @accelerationScalar = @accelerationFactor
            when 40 then @accelerationScalar = -@accelerationFactor
            else return
          e.preventDefault()

        el.on 'keyup', (e) =>
          switch e.keyCode
            when 38, 40 then @accelerationScalar = 0
            when 37, 39 then @rotation = 0
            else return
          e.preventDefault()

      reverseX: ->
        @velocity = $V([-@velocity.e(1), @velocity.e(2)])
      reverseY: ->
        @velocity = $V([@velocity.e(1), -@velocity.e(2)])

      tick: =>
        @velocity = @velocity.add(@acceleration).toUnitVector().x(@maxVelocity)
        @position = @position.add(@velocity)
        if @rotation
          @angle = @angle.rotate @rotation*(Math.PI / 180), @zero
        if @accelerationScalar
          @acceleration = @angle.x @accelerationScalar
        else 
          @acceleration = @zero

        if @position.e(1) < 0
          @position.setElements [0, @position.e(2)]
          @reverseX()

        else if @position.e(1) > WIDTH - @sprite.width
          @position.setElements [WIDTH - @sprite.width, @position.e(2)]
          @reverseX()

        else if @position.e(2) < 0
          @position.setElements [@position.e(1), 0]
          @reverseY()

        else if @position.e(2) > HEIGHT - @sprite.height 
          @position.setElements [@position.e(1), HEIGHT - @sprite.height]
          @reverseY()

      draw: =>
        ctx.save()
        ctx.translate @position.e(1), @position.e(2)
        ctx.rotate Math.atan2(@angle.e(2), @angle.e(1)) + Math.PI/2
        ctx.drawImage @sprite, -@sprite.width/2, -@sprite.height/2 
        ctx.restore()

      drawStats: (x, y) =>
        ctx.fillText "velocity: #{@velocity.e(1)}, #{@velocity.e(2)}", x, y 
        ctx.fillText "acceleration: #{@acceleration.e(1)}, #{@acceleration.e(2)}", x, y + 10
        ctx.fillText "angle: #{@angle.e(1)}, #{@angle.e(2)}", x, y + 30


    game = new Game()
