
P4.GameScene = function()
{
	P4.GameScene.superproto.constructor.call(this)

	P4.Enemy.count = 0

	this.layers.starfield = new GO.Layer
	P4.Starfield.create(this.layers.starfield)

	this.layers.handlers = new GO.Layer
	this.layers.bg = new GO.Layer /* background */
	this.layers.txt = new GO.Layer
	this.layers.fg = new GO.Layer /* foreground */
	this.layers.transition = new GO.Layer

	this.player = new P4.Player(this)
	this.player.ondied = {
		fn: this.onPlayerDied
		,ctx: this
	}
	this.layers.fg.push(this.player)

	this.level = new P4.Level(this)
}

GO.Util.extend(P4.GameScene, GO.Scene)

P4.GameScene.prototype.activate = function()
{
	var timer

	this.warmup = true

	if (GO.debug) {
		this.warmup = false
	}
	
	timer = new GO.Timer(1000, function() {
		this.warmup = false
		return false
	}, this)

	this.layers.handlers.push(timer)
}

P4.GameScene.prototype.onPlayerDied = function()
{
	if (this.player.lives <= 0) {
		GO.scenes.end = new P4.EndScene
		GO.setScene(GO.scenes.end)
		P4.track('gameover')
		return false
	}

	var t = new GO.Transition
	t.v = 2
	t.ondone = {
		fn: function() {
			this.player.reset()
			this.level.gotoLast()
		}, ctx: this
	}
	this.layers.transition.push(t)
}

P4.GameScene.prototype.process = function()
{
	var x, y, a
		,scheme

	this.clear()

	if (this.warmup) {
		GO.ctx.font = '12px ' + GO.config.fontName
		GO.ctx.textAlign = 'center'
		GO.ctx.fillStyle = 'white'
		x = (GO.Screen.width / 2)
		y = (GO.Screen.height / 2)
		GO.ctx.fillText('get ready', x, y)

		this.layers.handlers.process()
		this.player.drawShip(this.player.x, this.player.y, this.player.angle, 1)
		return
	}

	if (!P4.GameScene.superproto.process.call(this)) {
		return
	}

	if (GO.Event.Keyboard.code == 27) {
		GO.setScene(GO.scenes.menu)
		return
	}

	this.drawHUD()

	if (this.level) {
		this.level.process()
	}
	
	if (this.player.hit) {
		GO.ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'
		GO.ctx.fillRect(0, 0, GO.Screen.width, GO.Screen.height)
		this.player.hit = false
	}
}

P4.GameScene.prototype.drawHUD = function()
{
	GO.ctx.textBaseline = 'alphabetic'
	
	GO.ctx.textAlign = 'right'
	GO.ctx.font = '8px ' + GO.config.fontName
	GO.ctx.fillStyle = 'white'
	GO.ctx.fillText('Player x ' + this.player.lives, GO.Screen.width - 10, GO.Screen.height - 10)

	GO.ctx.textAlign = 'left'
	GO.ctx.fillText('Energy:', 100, GO.Screen.height - 10)

	if (this.level.levelText) {
		GO.ctx.fillText(this.level.levelText, 10, GO.Screen.height - 10)
	}

	GO.ctx.fillStyle = (this.player.energy <= 3 ? 'red' : 'white')
	GO.ctx.strokeStyle = GO.ctx.fillStyle
	GO.ctx.lineWidth = 1
	GO.ctx.strokeRect(165, GO.Screen.height - 16, 1 + 100, 5)
	GO.ctx.fillRect(165, GO.Screen.height - 16, 1 + (10 * this.player.energy), 5)
}

