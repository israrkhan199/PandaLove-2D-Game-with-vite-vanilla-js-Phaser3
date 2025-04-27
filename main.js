// main.js
import Phaser from 'phaser'
import MainMenuScene from './scenes/MainMenuScene.js'
import GameScene from './scenes/GameScene.js'


const config = {
  type: Phaser.AUTO,
  width: `100vw`,
  height: `100vh`,
 
  
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y:1000 },
      debug: false,
    }
  },
  scene: [  MainMenuScene, GameScene ],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  
  }
  
}

const game = new Phaser.Game(config);
