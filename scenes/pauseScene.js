import { pressStart2PConfig } from "../ui/fontConfig.js";

export default class PauseScene extends Phaser.Scene {
    constructor() {
      super("PauseScene");
    }

    preload() {
        this.load.spritesheet(
          "ui_large_buttons",
          "ui/ui-large-buttons-horizontal.png",
          {
            frameWidth: 480 / 10,
            frameHeight: 80 / 5,
          }
        );
    
        this.load.spritesheet("ui_frames", "ui/ui-frames.png", {
          frameWidth: 96 / 3,
          frameHeight: 64 / 2,
        });
    
        this.load.spritesheet("ui_small_buttons", "ui/ui-small-buttons.png", {
          frameWidth: 160 / 10,
          frameHeight: 256 / 16,
        });
    
    
        this.load.bitmapFont(
          pressStart2PConfig.key,
          pressStart2PConfig.texture,
          pressStart2PConfig.fontData
        );

    };

    create(){

        const frame = this.add.sprite(
            this.game.config.width / 2,
            this.game.config.height / 2,
            "ui_frames"
          );
          frame.setScale(11);
          frame.setFrame(1); // Change to the appropriate frame number
          frame.setDepth(4);
    
          // Add text to the frame
          const frameText = this.add.bitmapText(
            frame.x,
            frame.y - 80,
            "pressStart2P",
            "Pause",
    
            18
          );
          frameText.setTint(0xffffff);
          frameText.setOrigin(0.5);
          frameText.setDepth(5);
    
          const keyText = this.add.bitmapText(
            frame.x,
            frameText.y + 60, // Adjust the y-position based on the size of the existing text
            "pressStart2P",
            "W - Jump\n\nW,W - Double Jump\n\nS - Force Fall",
            16
          );
          keyText.setTint(0xffffff);
          keyText.setOrigin(0.5);
          keyText.setDepth(5);
    
          const closeButton = this.add.sprite(
            frame.x - 135,
            frame.y - 130,
            "ui_small_buttons"
          );
    
          closeButton.setScale(3);
          closeButton.setOrigin(0.5);
          closeButton.setDepth(5);
    
          const frameNormalClose = 128; // Frame 3
          const frameHoverClose = 129; // Frame 4
    
          closeButton.setFrame(frameNormalClose);
    
          closeButton.setInteractive();
    
          closeButton.on("pointerover", () => {
            closeButton.setFrame(frameHoverClose);
          });
    
          closeButton.on("pointerout", () => {
            closeButton.setFrame(frameNormalClose);
          });
    
          closeButton.on("pointerup", () => {
            // Handle closing the frame when hovered
            frame.destroy();
            frameText.destroy();
            keyText.destroy();
            closeButton.destroy();
          });
    
    }
    



};