import GameScene from './gameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 800 // Adjust gravity as needed
            }
        }
    },
    scene: [GameScene],
};

window.game = new Phaser.Game(config);

