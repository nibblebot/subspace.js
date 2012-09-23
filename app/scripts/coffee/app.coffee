define ['lodash', 'jquery', 'gl-matrix'], (_, $, vec3) -> 
  $ ->
    rotationMatrix = _.memoize (theta) ->
      mat2.createFrom Math.cos(theta), -Math.sin(theta), Math.sin(theta), Math.cos(theta)

    vec2.rotate = (vec, theta) ->
      mat2.multiplyVec2 rotationMatrix(theta), vec

    ctx = document.getElementById('game').getContext('2d')
    WIDTH = $('#game').width()
    HEIGHT = $('#game').height()
    FPS = 1000 / 16

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
        @player.listenInput()
        @tick()
        

      stop: => 
        @player.stopInput()
        if @tickID
          clearInterval @tickID

      tick: =>
        window.webkitRequestAnimationFrame @tick
        clearCanvas()
        @player.tick()
        @player.draw()
        # @drawDebug() if @debug

      drawDebug: =>
        @player.drawStats 4, 60

    class Player
      constructor: (options) ->
        @sprite = options.sprite
        @reset()

      rotationFactor: 6
      accelerationFactor: 1/2
      maxVelocity: 4
      reset: =>
        @zero = vec2.createFrom 0, 0
        @position = vec2.createFrom WIDTH/2, HEIGHT/2
        @velocity = vec2.create @zero
        @acceleration = vec2.create @zero
        @angle = vec2.createFrom 0, 1
        @negY = vec2.createFrom 1, -1
        @negX = vec2.createFrom -1, 1

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
        vec2.multiply @negX, @velocity
      reverseY: ->
        vec2.multiply @negY, @velocity

      tick: =>
        console.log @angle
        vec2.add @acceleration, @velocity
        vec2.normalize @velocity
        vec2.scale @velocity, @maxVelocity
        vec2.add @velocity, @position

        if @rotation
          vec2.rotate @angle, @rotation*(Math.PI / 180)

        if @accelerationScalar
          vec2.scale @angle, @accelerationScalar, @acceleration
        else 
          vec2.set @zero, @acceleration

        if @position[0] < 0
          @position[0] = 0
          @reverseX()

        else if @position[0] > WIDTH - @sprite.width
          @position[0] = WIDTH - @sprite.width
          @reverseX()

        else if @position[1] < 0
          @position[1] = 0
          @reverseY()

        else if @position[1] > HEIGHT - @sprite.height 
          @position[1] = HEIGHT - @sprite.height
          @reverseY()

      draw: =>
        ctx.save()
        ctx.translate @position[0], @position[1]
        ctx.rotate Math.atan2(@angle[1], @angle[0]) + Math.PI/2
        ctx.drawImage @sprite, -@sprite.width/2, -@sprite.height/2 
        ctx.restore()

      drawStats: (x, y) =>
        ctx.fillText "velocity: #{@velocity[0]}, #{@velocity[1]}", x, y 
        ctx.fillText "acceleration: #{@acceleration[0]}, #{@acceleration[1]}", x, y + 10
        ctx.fillText "angle: #{@angle[0]}, #{@angle[1]}", x, y + 30


    window.game = new Game()
