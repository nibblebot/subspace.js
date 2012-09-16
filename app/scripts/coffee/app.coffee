define ['lodash', 'jquery'], (_, $) -> 
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
        @ROTATION_STEP = 3
        @CLOCKWISE = @ROTATION_STEP
        @COUNTER_CLOCKWISE = -@ROTATION_STEP

      reset: =>
        @x = WIDTH/2
        @y = HEIGHT/2
        @velocity = 0
        @acceleration = 0
        @rotation = 0
        @angle = 0

      stopInput: (el) =>
        el.off 'keydown keyup'

      listenInput: =>
        el = $ document.body
        el.on 'keydown', (e) => 
          e.preventDefault()

          switch e.keyCode
            when 37
              @rotation = @COUNTER_CLOCKWISE
            when 39
              @rotation = @CLOCKWISE
            when 38
              @acceleration = 1
            when 40 
              @acceleration = -1

        el.on 'keyup', (e) =>
          e.preventDefault()
          switch e.keyCode
            when 37, 39
              @rotation = 0
            when 38, 40
              @acceleration = 0

      updateAngle: ->
        @angle = (@angle + 360 + @rotation) % 360

      tick: =>
        @updateAngle()

      draw: =>
        ctx.save()
        ctx.translate WIDTH/2, HEIGHT/2
        ctx.rotate @angle * Math.PI / 180
        ctx.drawImage @sprite, -@sprite.width/2, -@sprite.height/2 
        ctx.restore()

      drawStats: (x, y) =>
        ctx.fillText "velocity: #{@velocity}", x, y 
        ctx.fillText "acceleration: #{@acceleration}", x, y + 10
        ctx.fillText "rotation: #{@rotation}", x, y + 20
        ctx.fillText "angle: #{@angle}", x, y + 30


    game = new Game()
