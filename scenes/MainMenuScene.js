import Phaser from 'phaser'

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene')
  }

  preload() {
    this.load.spritesheet('backgrounds', '/assets/sprites/level-sheet0.png', {
      frameWidth: 350, frameHeight: 250
    })
    this.load.image('startBtn', '/assets/sprites/startBtn.png')
    this.load.image('continueBtn', '/assets/sprites/continueBtn.png')
    this.load.image('heartBubble', '/assets/sprites/heart.png') // red face bubble
  }

  create() {
    const { width, height } = this.scale

    // Background
    this.background = this.add.image(this.scale.width*0.1, 0, 'backgrounds', 0).setOrigin(0)
    this.background.setDisplaySize(this.scale.width*0.86, this.scale.height*1.2)
    this.background.setFrame(1)

   

    // Start button
    const startBtn = this.add.image(this.scale.width * 0.3, this.scale.height * 0.55, 'startBtn')
    .setInteractive()
    .setScale(this.scale.width / 400,this.scale.height/300) // Responsive scaling
  startBtn.on('pointerdown', () => {
    localStorage.setItem('currentLevel', 0)
    this.scene.start('GameScene')
  })
  

    // Continue button
    const continueBtn = this.add.image(this.scale.width * 0.71, this.scale.height * 0.55, 'continueBtn')
    .setInteractive()
    .setScale(this.scale.width / 400,this.scale.height/300) // Same scaling as startBtn
  continueBtn.on('pointerdown', () => {
    this.scene.start('GameScene')
  })
  
   

    // Heart bubble above panda
    const bubble = this.add.image(this.scale.width * 0.553, this.scale.height * 0.76, 'heartBubble')
    .setOrigin(0.5)
    .setScale(this.scale.width / 320,this.scale.height/300) // Adjust 250 based on your design
  

    // Gentle bounce animation for bubble
    this.tweens.add({
      targets: bubble,
      y: bubble.y - 5,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
}
