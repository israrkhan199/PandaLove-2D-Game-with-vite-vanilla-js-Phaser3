import Phaser from 'phaser'

let currentLevel = parseInt(localStorage.getItem('currentLevel')) || 0

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  preload() {
    this.load.spritesheet('backgrounds', '/assets/sprites/level-sheet0.png', { frameWidth: 512, frameHeight: 256 })
    this.load.spritesheet('player', '/assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 })
    this.load.image('platform', '/assets/sprites/platform.png')
    this.load.spritesheet('platform2', '/assets/sprites/platform2.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('grassPlatform', '/assets/sprites/sprite-sheet0.png', { frameWidth: 128, frameHeight: 32 })
    this.load.image('goal', '/assets/sprites/goal.png')
    this.load.spritesheet('knife', '/assets/sprites/knife.png', { frameWidth: 32, frameHeight: 16 })
    this.load.image('coin', '/assets/sprites/coin.png')
    this.load.spritesheet('wall', '/assets/sprites/wall.png', { frameWidth: 32, frameHeight: 128 })
    this.load.json('levels', '/data/levels.json')

    this.load.audio('jump', ['/assets/audio/fall.m4a', '/assets/audio/fall.ogg'])
    this.load.audio('goal', ['/assets/audio/start.m4a', '/assets/audio/start.ogg'])
    this.load.audio('levelup', ['/assets/audio/start.m4a', '/assets/audio/start.ogg'])
    this.load.audio('song', ['/assets/audio/song.m4a'])
    this.load.audio('gameover', ['/assets/audio/wrong.m4a', '/assets/audio/wrong.ogg'])
    this.load.audio('coinSound', '/assets/audio/coin.ogg')
  }

  create() {
    this.scale.scaleMode = Phaser.Scale.RESIZE
    this.scale.on('resize', this.resize, this)

    this.levels = this.cache.json.get('levels')
    this.cursors = this.input.keyboard.createCursorKeys()
    this.direction = 1
    this.isMuted = false
    this.isPaused = false

    this.jumpSound = this.sound.add('jump')
    this.goalSound = this.sound.add('goal')
    this.levelUpSound = this.sound.add('levelup')
    this.gameoverSound = this.sound.add('gameover')
    this.coinSound = this.sound.add('coinSound')
    this.song = this.sound.add('song', { loop: true, volume: 0.3 })

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    })

    this.background = this.add.image(this.scale.width * 0.1, 0, 'backgrounds', 0).setOrigin(0)
    this.background.setDisplaySize(this.scale.width * 0.86, this.scale.height * 1.3)

    const margin = 32;
    this.playArea = {
      x: margin,
      y: margin,
      width: this.scale.width - margin * 4,
      height: this.scale.height - margin * 4
    }

    this.startButton = this.add.text(this.scale.width / 2, this.scale.height / 2, 'START GAME', {
      fontSize: '32px', fill: '#fff', backgroundColor: '#000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.startGame())

    const fontSize = Math.round(this.scale.height * 0.03);
    this.levelText = this.add.text(this.scale.width * 0.137, this.scale.height * 0.11, '', {
      fontSize, fill: '#f27c52', fontStyle: 'bolder'
    }).setVisible(false)

    this.autoSaveText = this.add.text(this.scale.width * 0.13, this.scale.height * 0.04, '', {
      fontSize: `${Math.round(this.scale.width * 0.018)}px`,
      fill: '#444'
    }).setVisible(false)

    this.pauseButton = this.add.text(this.scale.width / 1.159, this.scale.height * 0.09, '⏸', {
      fontSize: `${Math.round(this.scale.width * 0.025)}px`,
      fill: '#fff', backgroundColor: '#000'
    }).setOrigin(1, 0).setScale(this.scale.width / 1000, this.scale.height / 550)
      .setAlpha(0.00000000000000001).setInteractive().setVisible(false)
      .on('pointerdown', () => this.togglePause())

    this.pauseOverlay = this.add.container(this.scale.width / 2, this.scale.height / 2).setVisible(false)
    const bgBox = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.8)
    const muteBtn = this.add.text(0, -40, '🔇 MUTE & START', {
      fontSize: '20px', fill: '#fff', backgroundColor: '#444', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
      this.isMuted = true
      this.sound.setMute(true)
      this.resumeGame()
    })
    const startBtn = this.add.text(0, 40, '▶ START', {
      fontSize: '20px', fill: '#fff', backgroundColor: '#444', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
      this.isMuted = false
      this.sound.setMute(false)
      this.resumeGame()
    })
    this.pauseOverlay.add([bgBox, muteBtn, startBtn])
  }

  startGame() {
    this.background.setFrame(0)
    this.startButton.setVisible(false)
    this.levelText.setVisible(true)
    this.autoSaveText.setVisible(true)
    this.pauseButton.setVisible(true)
    this.song.play()
    this.loadLevel(currentLevel)

    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: () => {
        localStorage.setItem('currentLevel', currentLevel)
        this.autoSaveText.setText('Progress auto-saved')
        this.time.delayedCall(2000, () => this.autoSaveText.setText(''))
      }
    })
  }

  togglePause() {
    if (this.isPaused) return
    this.physics.world.pause()
    this.isPaused = true
    this.pauseOverlay.setVisible(true)
  }

  resumeGame() {
    this.pauseOverlay.setVisible(false)
    this.physics.world.resume()
    this.isPaused = false
  }

  resize(gameSize) {
    const { width, height } = gameSize
    this.cameras.resize(width, height)
    this.playArea = { x: 32, y: 32, width: width - 64, height: height - 64 }
    this.levelText.setPosition(10, 10)
    this.autoSaveText.setPosition(10, 35)
    this.pauseButton.setPosition(width - 20, 20)
    this.pauseOverlay.setPosition(width / 2, height / 2)
    this.background.setDisplaySize(width / 4, height / 4)
  }

  loadLevel(index) {
    const level = this.levels[index % this.levels.length]
  if (!level || typeof level !== 'object') return

  this.player?.destroy()
  this.goal?.destroy()
  this.coin?.destroy()
  this.platforms?.clear(true, true)
  this.knives?.clear(true, true)
  this.walls?.clear(true, true)

  this.platforms = this.physics.add.staticGroup()
  this.walls = this.physics.add.staticGroup()

  // Platforms (with type + frame)
  level.platforms?.forEach(p => {
    const px = this.playArea.x + p.x * this.playArea.width
    const py = this.playArea.y + p.y * this.playArea.height
    let key = 'platform'
    if (p.type === 'platform2') key = 'platform2'
    else if (p.type === 'grassPlatform') key = 'grassPlatform'
    const platform = this.platforms.create(px, py, key)
    if (p.frame !== undefined) platform.setFrame(p.frame)
  
    // 💡 Responsive scale
    const platformScaleX = this.scale.width / 500
    const platformScaleY = this.scale.height / 800
    platform.setScale(platformScaleX, platformScaleY)
    platform.refreshBody()
  })
  

  // Walls (with frame)
  level.walls?.forEach(w => {
    const wx = this.playArea.x + w.x * this.playArea.width
    const wy = this.playArea.y + w.y * this.playArea.height
    const wall = this.walls.create(wx, wy, 'wall', w.frame || 0)
    wall.setScale(w.scale || 1)
    wall.refreshBody()
  })

  // Player
  let groundY = this.playArea.y + this.playArea.height - (this.playArea.height * 0.05);
  const maxY = this.scale.height * 0.8;
  groundY = Math.min(groundY, maxY);
  const playerX = this.playArea.x + (this.playArea.width * 0.15);
  const playerScale = this.scale.width / 400;
  this.player = this.physics.add.sprite(playerX, groundY, 'player').setScale(playerScale)
  this.player.setCollideWorldBounds(true)
  this.player.anims.play('run', true)

  this.physics.add.collider(this.player, this.platforms)
  this.physics.add.collider(this.player, this.walls)

  this.patrolLeftX = this.player.x - this.scale.width / 800;
  this.patrolRightX = this.player.x + this.scale.width / 1.5;

  // Goal (normalized)
  this.goal = this.physics.add.staticImage(
    this.playArea.x + level.goal.x * this.playArea.width,
    this.playArea.y + level.goal.y * this.playArea.height,
    'goal'
  ).setVisible(false).setScale(this.scale.width / 400, this.scale.height / 400)
  this.goal.body.enable = false
  this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this)

  // Coin (normalized)
  if (level.coin) {
    this.coin = this.physics.add.staticImage(
      this.playArea.x + level.coin.x * this.playArea.width,
      this.playArea.y + level.coin.y * this.playArea.height,
      'coin'
    ).setScale(this.scale.width / 400, this.scale.height / 400)
    this.physics.add.overlap(this.player, this.coin, this.collectCoin, null, this)
  }

  // Knives (normalized)
  this.knives = this.physics.add.group()
  level.knives?.forEach(k => {
    const knife = this.knives.create(
      this.playArea.x + k.x * this.playArea.width,
      this.playArea.y + k.y * this.playArea.height,
      'knife',
      k.frame || 0
    )
    knife.setScale(this.scale.width / 500,this.scale.height / 500)
    knife.body.setAllowGravity(false)
    knife.setImmovable(true)
  })

  this.physics.add.overlap(this.player, this.knives, this.playerFail, null, this)
  this.levelText.setText((currentLevel + 1).toString().padStart(3, '0'))
  this.player.setVelocityX(500 * this.direction)
  this.canJump = true
  }

  collectCoin(player, coin) {
    coin.destroy()
    this.coinSound.play()
    this.goal.setVisible(true)
    this.goal.body.enable = true
  }

  update() {
    if (!this.player || this.player.disabled || this.isPaused) return
    this.player.setVelocityX(200 * this.direction)

    if (this.player.body.blocked.left) this.direction = 1
    else if (this.player.body.blocked.right) this.direction = -1

    if (this.player.x <= this.patrolLeftX) {
      this.direction = 1
      this.player.x = this.patrolLeftX
    } else if (this.player.x >= this.patrolRightX) {
      this.direction = -1
      this.player.x = this.patrolRightX
    }

    if (this.player.body.blocked.down || this.player.body.touching.down) {
      this.canJump = true
    }

    const jumpInput = this.cursors.up.isDown || this.input.activePointer.isDown
    if (jumpInput && this.canJump) {
      const jumpForce = -this.scale.height * 0.99
      this.player.setVelocityY(jumpForce)
      this.jumpSound.play()
      this.canJump = false
    }

    if (this.player.y > this.scale.height) {
      this.playerFail()
    }
  }

  playerFail() {
    if (!this.player || this.player.disabled) return
    this.player.disabled = true
    this.gameoverSound.play()
    this.tweens.add({
      targets: this.player,
      angle: 780,
      scale: 0,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeIn',
      onComplete: () => this.loadLevel(currentLevel)
    })
  }

  reachGoal() {
    if (!this.player || !this.goal.visible) return; // Prevent early collection
    this.player.disableBody(true, true)
    this.goalSound.play()
    const completeText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Level Complete!', {
      fontSize: '32px', fill: '#fff', backgroundColor: '#000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5)

    this.time.delayedCall(1500, () => {
      completeText.destroy()
      currentLevel++
      localStorage.setItem('currentLevel', currentLevel)
      this.levelUpSound.play()
      this.loadLevel(currentLevel)
    })
  }
}
