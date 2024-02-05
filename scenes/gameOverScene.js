import MainMenuScene from "./mainMenuScene.js"; // Make sure to import the MainMenuScene or use the correct path
import { pressStart2PConfig } from "../ui/fontConfig.js";
let game_over_music;

import {
 click_sound,
 hover_sound
} from '../scenes/mainMenuScene.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    // Retrieve the final score from the data object
    this.score = data.score || 0;
  }

  preload(){
    this.load.audio(
      "game_over_music",
      "music/game_over (1).mp3"
    );

    this.load.bitmapFont(
      pressStart2PConfig.key,
      pressStart2PConfig.texture,
      pressStart2PConfig.fontData
    );

    this.load.image(
      "blood_splatter",
      "ui/blood_splatter.png"
    )
  }


  create() {
    console.log("Game Over");

    game_over_music = this.sound.add("game_over_music", { volume: 0.6, loop: false });


    game_over_music.play();

    const bloodSplatter = this.add.image(
      this.game.config.width / 2 + 300,
      this.game.config.height / 2 + 160,
      "blood_splatter"
    );

    bloodSplatter.setScale(0.6);


    // Display "Game Over" message
    const gameOverText = this.add.bitmapText(
      this.game.config.width / 2,
      this.game.config.height / 2 - 100,
      pressStart2PConfig.key,
      "Game Over",
      40
    );
    gameOverText.setTint(0xffffff);
    gameOverText.setOrigin(0.5);

    // Display the final score
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 30,
        "Score: " + this.score,
        {
          fontSize: "32px",
          fill: "#fff",
        }
      )
      .setOrigin(0.5);

    // Reuse the Play button from MainMenuScene for Restart
    const restartButton = this.add.sprite(
      this.game.config.width / 2,
      this.game.config.height / 2 + 120,
      "ui_large_buttons"
    );

    restartButton.setScale(5.4);

    const frameNormal = 0; 
    const frameHover = 1; 

    restartButton.setFrame(frameNormal);
    restartButton.setInteractive();

    // Handle hovering over button
    restartButton.on("pointerover", () => {
      hover_sound.play();
      restartButton.setFrame(frameHover);
      restartText.y = restartText.y + 10;

    });

    // Handle hovering off button
    restartButton.on("pointerout", () => {
      restartButton.setFrame(frameNormal);
      restartText.y = restartText.y - 10;

    });
    
    // Handle clicking button
    restartButton.on("pointerup", () => {
      click_sound.play();
      game_over_music.stop();
      this.scene.start('GameScene');
      this.scene.get("GameScene").resetScore();
    });

    // Add Restart text on top of the Restart button
    const restartText = this.add.bitmapText(
      this.game.config.width / 2,
      this.game.config.height / 2 + 120,
      "pressStart2P",
      "Restart",
      21
    );
    restartText.setOrigin(0.5);
    restartText.setTint(0xffffff);
    restartText.setDepth(3);

    // Add Main Menu button below Restart button
    const mainMenuButton = this.add.sprite(
      this.game.config.width / 2,
      restartButton.y + 90,
      "ui_large_buttons"
    );

    mainMenuButton.setScale(5.4);

    mainMenuButton.setFrame(frameNormal);
    mainMenuButton.setInteractive();

    // Handle hovering over button
    mainMenuButton.on("pointerover", () => {
      hover_sound.play();
      mainMenuButton.setFrame(frameHover);
      mainMenuText.y = mainMenuText.y + 10;

    });


    // Handle hovering off button
    mainMenuButton.on("pointerout", () => {
      mainMenuButton.setFrame(frameNormal);
      mainMenuText.y = mainMenuText.y - 10;

    });


    // Handle clicking button
    mainMenuButton.on("pointerup", () => {
      click_sound.play();
      game_over_music.stop();
      this.scene.start('MainMenuScene');
    });

    // Add Main Menu text on top of the Main Menu button
    const mainMenuText = this.add.bitmapText(
      this.game.config.width / 2,
      this.game.config.height / 2 + 210,
      "pressStart2P",
      "Main Menu",
      21
    );
    mainMenuText.setOrigin(0.5);
    mainMenuText.setTint(0xffffff);
    mainMenuText.setDepth(3);
  }
}
