import { pressStart2PConfig } from "../ui/fontConfig.js";
let sky_menu;
let background_menu;
let menu_music;
let hover_sound;
let click_sound;
let shop_bell_sound;

export { hover_sound, click_sound };

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
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

    this.load.image("sky_menu", "assets/sky.png");
    this.load.image("background_menu", "assets/background.png");

    this.load.bitmapFont(
      pressStart2PConfig.key,
      pressStart2PConfig.texture,
      pressStart2PConfig.fontData
    );

    this.load.audio("menu_music", "music/Cowboy Bebop OST 1 - Cat Blues.mp3");
    this.load.audio("hover", "music/hover.mp3");
    this.load.audio("click", "music/click.mp3");
    this.load.audio("shop_bell", "music/shop_door_bell.mp3");
  }

  create() {
    console.log("Main Menu");

    menu_music = this.sound.add("menu_music", {
      loop: true,
      volume: 0.5,
    });

    hover_sound = this.sound.add("hover", {
      volume: 0.3,
    });

    click_sound = this.sound.add("click", {
      volume: 0.3,
    });

    shop_bell_sound = this.sound.add("shop_bell", {
      volume: 0.3,
    });

    menu_music.play();
    // Add the menuBackground image
    sky_menu = this.add.image(0, 0, "sky_menu").setOrigin(0, 0);
    // Scale sky to fit the window
    sky_menu.setScale(
      game.config.width / sky_menu.width,
      game.config.height / sky_menu.height
    );

    background_menu = this.add
      .tileSprite(
        0,
        40,
        game.config.width,
        game.config.height - 50,
        "background_menu"
      )
      .setOrigin(0, 0)
      .setScale(
        game.config.width / sky_menu.width,
        game.config.height / sky_menu.height
      );

    // Create and display the "Dough of the Dead" title with the "Press Start 2P" font
    const titleText = this.add.bitmapText(
      this.game.config.width / 2,
      this.game.config.height / 2 - 100,
      pressStart2PConfig.key,
      "Dough of the Dead",
      40
    );
    titleText.setTint(0xffffff);
    titleText.setOrigin(0.5);

    // Create the "Play" text with the "Press Start 2P" font
    const playText = this.add.bitmapText(
      this.game.config.width / 2,
      this.game.config.height / 2,
      "pressStart2P",
      "Play",
      21
    );
    playText.setTint(0xffffff);
    playText.setOrigin(0.5);
    playText.setDepth(3);

    const playButton = this.add.sprite(
      this.game.config.width / 2,
      this.game.config.height / 2,
      "ui_large_buttons"
    );

    playButton.setScale(5.4);

    const frameNormal = 0; // Frame 3
    const frameHover = 1; // Frame 4

    playButton.setFrame(frameNormal);

    playButton.setInteractive();

    // Position the "Play" text on the button
    playText.setPosition(playButton.x, playButton.y);

    playButton.on("pointerover", () => {
      playButton.setFrame(frameHover);
      playText.y = playText.y + 10;
      hover_sound.play();
    });

    playButton.on("pointerout", () => {
      playButton.setFrame(frameNormal);
      playText.y = playText.y - 10;
    });

    playButton.on("pointerup", () => {
      shop_bell_sound.play();
      menu_music.stop();

      this.scene.start("GameScene");
      this.scene.get("GameScene").resetScore();

      sky_menu.destroy();
      background_menu.destroy();
    });

    const controlsText = this.add.bitmapText(
      this.game.config.width / 2,
      this.game.config.height / 2 + 50, // Adjust y-position
      "pressStart2P",
      "Controls",
      21
    );

    controlsText.setTint(0xffffff);
    controlsText.setOrigin(0.5);
    controlsText.setDepth(3);

    const controlsButton = this.add.sprite(
      this.game.config.width / 2,
      playButton.y + 90, // Adjust y-position
      "ui_large_buttons"
    );

    controlsButton.setScale(5.4);

    const frameNormalcontrols = 0; // Frame 3
    const frameHovercontrols = 1; // Frame 4

    controlsButton.setFrame(frameNormalcontrols);

    controlsButton.setInteractive();

    // Position the "How 2 Play" text on the button
    controlsText.setPosition(controlsButton.x, controlsButton.y);

    controlsButton.on("pointerover", () => {
      controlsButton.setFrame(frameHovercontrols);
      controlsText.y = controlsText.y + 10;
      hover_sound.play();
    });

    controlsButton.on("pointerout", () => {
      controlsButton.setFrame(frameNormalcontrols);
      controlsText.y = controlsText.y - 10;
    });

    controlsButton.on("pointerup", () => {
      click_sound.play({ seek: 0.3 });
      // Open up a frame with text
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
        "Controls",

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
    });
  }

  update() {
    background_menu.tilePositionX += 1.3;
  }
}
