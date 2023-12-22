import GameScene from './gameScene.js';
import GameOverScene from './gameOverScene.js';


const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 1200 // Adjust gravity as needed
            }
        }
    },
    scene: [GameScene, GameOverScene],
};

window.game = new Phaser.Game(config);

