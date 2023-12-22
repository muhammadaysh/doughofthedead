import GameScene from "./gameScene.js";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    // Retrieve the final score from the data object
    this.score = data.score || 0;
  }

  create() {
    console.log("Game Over");
    // Display "Game Over" message
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 - 50,
        "Game Over",
        {
          fontSize: "48px",
          fill: "#fff",
        }
      )
      .setOrigin(0.5);

    // Display the final score
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 50,
        "Score: " + this.score,
        {
          fontSize: "32px",
          fill: "#fff",
        }
      )
      .setOrigin(0.5);

    // Add a restart button
    const restartButton = this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2 + 120,
        "Restart",
        {
          fontSize: "24px",
          fill: "#fff",
        }
      )
      .setOrigin(0.5);

    // Enable button interactivity
    restartButton.setInteractive();

    // Restart the game when the button is clicked
    restartButton.on("pointerup", () => {
      this.scene.start('GameScene'); 
      this.scene.get("GameScene").resetScore();
    });
  }
}
