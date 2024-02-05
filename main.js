import GameScene from './scenes/gameScene.js';
import GameOverScene from './scenes/gameOverScene.js';
import MainMenuScene from './scenes/mainMenuScene.js';
import PauseScene from './scenes/pauseScene.js';



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
    scene: [MainMenuScene, GameScene, GameOverScene, PauseScene],
};

window.game = new Phaser.Game(config);

