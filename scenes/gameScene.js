import { pressStart2PConfig } from "../ui/fontConfig.js";
import GameOverScene from "./gameOverScene.js";
import * as buildingUtil from "../utils/buildingUtil.js";
import * as zombieUtil from "../utils/zombieUtil.js";

// Audio variables
let game_music;
let deliver_sound;
let jump_1;
let jump_2;
let land_sound;
let game_over_music;
let blood_spurt;
let zombie_growl;

// Background variables
let sky;
let background;
let midground;
let foreground;
let ground;
let invisibleGround;

// Group variables
let buildingsGroup;
let survivorsGroup;
let zombiesGroundGroup;
let zombiesFlyGroup;

// Player variables
let jesseSprite;
let cursors;
let jumpKey;
let forceFallKey;

// Game variables
let score = 0;
let scoreText;

// Jumping variables
let jumpCount = 0;
let jumpKeyJustPressed = false;

// Wobbling variables
const wobbleFrequency = 0.01;
const wobbleAmplitude = 7;

// Spawn probabilities
let survivorSpawnProbability = 0.7;
let zombieGroundSpawnProbability = 0.01;

// Zombie spawn cooldowns
const baseZombieSpawnCooldown = 3000;
let lastZombieSpawnTime = 0;
let zombieSpawnCooldown = baseZombieSpawnCooldown;

const baseFlyingZombieSpawnCooldown = 5000;
let lastFlyingZombieSpawnTime = 0;
let flyingZombieSpawnCooldown = baseFlyingZombieSpawnCooldown;

// Constants
const foregroundSpeed = 1.8;
const midgroundSpeed = 1.2;
const backgroundSpeed = 0.6;
const groundSpeed = 2.2;
const offScreenMargin = 300;

export {
  game_music,
  deliver_sound,
  ground,
  invisibleGround,
  buildingsGroup,
  survivorsGroup,
  zombiesGroundGroup,
  zombiesFlyGroup,
  jesseSprite,
  score,
  scoreText,
  cursors,
  jumpKey,
  forceFallKey,
  survivorSpawnProbability,
  zombieGroundSpawnProbability,
};

export function getScore() {
  return score;
}

export function updateScore(points) {
  score += points;
  scoreText.setText("Score: " + score);
}

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  // Reset the player's score and update the score display
  resetScore() {
    score = 0;
  }

  preload() {
    // Load audio
    this.load.audio(
      "game_music",
      "music/Cowboy Bebop OST 1 - Bad Dog No Biscuits.mp3"
    );
    this.load.audio("deliver_sound", "music/deliver_sound.mp3");
    this.load.audio("jump_1", "music/jump_1.mp3");
    this.load.audio("jump_2", "music/jump_2.mp3");
    this.load.audio("land_sound", "music/land.mp3");
    this.load.audio("blood_spurt", "music/blood_spurt.mp3");
    this.load.audio("zombie_growl", "music/zombie_growl.mp3");

    this.load.bitmapFont(
      pressStart2PConfig.key,
      pressStart2PConfig.texture,
      pressStart2PConfig.fontData
    );

    // Load images
    this.load.image("sky", "assets/sky.png");
    this.load.image("foreground", "assets/foreground.png");
    this.load.image("midground", "assets/midground.png");
    this.load.image("background", "assets/background.png");
    this.load.image("ground", "assets/ground.png");

    // Load spritesheets
    this.load.spritesheet("jesse", "assets/jesse.png", {
      frameWidth: 1200 / 6,
      frameHeight: 200,
    });
    this.load.spritesheet("survivor", "assets/survivor.png", {
      frameWidth: 1200 / 3,
      frameHeight: 274,
    });
    this.load.spritesheet("zombie_ground", "assets/zombie_sprite.png", {
      frameWidth: 288 / 9,
      frameHeight: 256 / 4,
    });
    this.load.spritesheet("zombie_fly", "assets/zombiefly_sprite.png", {
      frameWidth: 224 / 7,
      frameHeight: 128 / 4,
    });

    // Load building images
    this.load.image("building_1", "assets/building_1.png");
    this.load.image("building_2", "assets/building_2.png");
    this.load.image("building_3", "assets/building_3.png");
    this.load.image("building_4", "assets/building_4.png");
    this.load.image("building_5", "assets/building_5.png");
  }

  create() {
    // Add game music
    game_music = this.sound.add("game_music", { loop: true, volume: 0.4 });
    deliver_sound = this.sound.add("deliver_sound", { volume: 0.4 });
    jump_1 = this.sound.add("jump_1", { volume: 0.6 });
    jump_2 = this.sound.add("jump_2", { volume: 0.4 });
    land_sound = this.sound.add("land_sound", { volume: 0.6 });
    blood_spurt = this.sound.add("blood_spurt", { volume: 0.6 });
    zombie_growl = this.sound.add("zombie_growl", { volume: 0.6 });

    // Set the sky background
    sky = this.add.image(0, 0, "sky").setOrigin(0, 0);
    sky.setScale(
      game.config.width / sky.width,
      game.config.height / sky.height
    );

    // Set the background layers with tileSprites for infinite scrolling
    background = this.add
      .tileSprite(
        0,
        0,
        game.config.width,
        game.config.height - 70,
        "background"
      )
      .setOrigin(0, 0)
      .setScale(game.config.width / sky.width, game.config.height / sky.height);

    midground = this.add
      .tileSprite(0, 0, game.config.width, game.config.height - 70, "midground")
      .setOrigin(0, 0)
      .setScale(game.config.width / sky.width, game.config.height / sky.height);

    foreground = this.add
      .tileSprite(
        0,
        0,
        game.config.width,
        game.config.height - 70,
        "foreground"
      )
      .setOrigin(0, 0)
      .setScale(game.config.width / sky.width, game.config.height / sky.height);

    ground = this.add
      .tileSprite(0, game.config.height - 70, game.config.width, 70, "ground")
      .setOrigin(0, 0)
      .setScale(game.config.width / sky.width, game.config.height / sky.height);
    this.physics.world.enable(ground, Phaser.Physics.Arcade.STATIC_BODY);

    invisibleGround = this.add
      .tileSprite(0, game.config.height - 30, game.config.width, 70, "ground")
      .setOrigin(0, 0)
      .setScale(game.config.width / sky.width, game.config.height / sky.height);
    this.physics.world.enable(
      invisibleGround,
      Phaser.Physics.Arcade.STATIC_BODY
    );
    invisibleGround.setAlpha(0);

    // Sync the initial positions
    invisibleGround.x = ground.x;

    // Create building and zombie groups
    const buildingGroups = buildingUtil.createGroups(this, ground);
    const zombieGroups = zombieUtil.createGroups(this, invisibleGround);

    buildingsGroup = buildingGroups.buildingsGroup;
    survivorsGroup = buildingGroups.survivorsGroup;

    zombiesGroundGroup = zombieGroups.zombiesGroundGroup;
    zombiesFlyGroup = zombieGroups.zombiesFlyGroup;

    this.physics.world.enable(ground);

    // Create Jesse sprite
    jesseSprite = this.physics.add.sprite(
      300,
      game.config.height - 120,
      "jesse"
    );
    jesseSprite.setScale(0.75);
    jesseSprite.body.setSize(
      jesseSprite.width * 0.8,
      jesseSprite.height * 0.5,
      true
    );
    jesseSprite.setCollideWorldBounds(true);
    this.physics.world.enable(jesseSprite);
    this.physics.add.collider(jesseSprite, invisibleGround);
    jesseSprite.setBounce(0.2);

    // Animations for alternating between the third and last sprites
    this.anims.create({
      key: "alternate",
      frames: [
        { key: "jesse", frame: 2 },
        { key: "jesse", frame: 5 },
      ],
      frameRate: 6,
      repeat: -1,
    });

    jesseSprite.play("alternate");

    // Input keys
    cursors = this.input.keyboard.createCursorKeys();
    jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    forceFallKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // Generate initial building
    buildingUtil.generateBuilding(
      this,
      buildingUtil.getRandomBuildingType(),
      game.config.width / 2,
      game.config.height - 140
    );

    // Score text
    scoreText = this.add.text(30, 50, "Score: 0", {
      fontSize: "32px",
      fill: "#ffffff",
      fontWeight: "bold",
    });

    // Set depths for rendering order
    jesseSprite.setDepth(6);
    ground.setDepth(1);
    invisibleGround.setDepth(2);
    buildingsGroup.setDepth(0);
    scoreText.setDepth(10);

    // Initialize jump count
    jumpCount = 0;

    // Start playing game music
    game_music.play();
  }

  update() {
    const speedMultiplier = Math.min(1 + score * 0.001, 3.5);

    // Move the foreground, midground, background, and ground
    foreground.tilePositionX += foregroundSpeed * speedMultiplier;
    midground.tilePositionX += midgroundSpeed * speedMultiplier;
    background.tilePositionX += backgroundSpeed * speedMultiplier;
    ground.tilePositionX += groundSpeed * speedMultiplier;

    // Move the buildings at the same pace as the ground
    buildingsGroup.getChildren().forEach((building) => {
      const buildingSpeed = groundSpeed * speedMultiplier * ground.scaleX;

      building.x -= buildingSpeed;

      building.windows.forEach((window) => {
        window.x -= buildingSpeed;
      });

      building.survivors.forEach((survivor) => {
        survivor.x -= buildingSpeed;
      });

      // Despawn buildings that are off-screen
      if (building.x + building.width < 0 - offScreenMargin) {
        buildingUtil.despawnBuilding(building);
      }
    });

    // Adjust gravity based on forceFallKey input
    if (forceFallKey.isDown) {
      this.physics.world.gravity.y = 4500;
    } else {
      // Reset gravity when S key is released
      this.physics.world.gravity.y = 1200;
    }

    // Handle jumping logic
    if (jumpKey.isDown && !jumpKeyJustPressed) {
      if (jumpCount < 1) {
        jesseSprite.setVelocityY(-725);
        jumpCount++;
        jumpKeyJustPressed = true;
        jump_1.play();
      } else if (jumpCount > 0 && jumpCount < 2) {
        jesseSprite.setVelocityY(-925);
        jumpCount++;
        jumpKeyJustPressed = true;
        jump_1.play();
      }
    }

    // Check if the jump key was released
    if (jumpKey.isUp) {
      jumpKeyJustPressed = false;
    }

    // Reset jump count when Jesse touches the invisible ground
    if (jesseSprite.body.onFloor() && jumpKey.isUp) {
      if (jumpCount > 0) {
        land_sound.play();
      }
      jumpCount = 0;
    }

    // Apply wobbling effect when in the air
    if (!jesseSprite.body.onFloor()) {
      let wobble = Math.sin(this.time.now * wobbleFrequency) * wobbleAmplitude;
      jesseSprite.rotation = Phaser.Math.DegToRad(wobble);
    } else {
      // Reset rotation when Jesse touches the ground
      jesseSprite.rotation = 0;
    }

    // Check if a new building needs to be generated
    if (buildingUtil.shouldGenerateNewBuilding()) {
      survivorSpawnProbability = Math.max(
        0.2,
        survivorSpawnProbability - 0.0001 * score
      );

      const newBuildingType = buildingUtil.getRandomBuildingType();
      const lastBuilding = buildingUtil.getLastBuilding();
      const newX = lastBuilding
        ? lastBuilding.x + lastBuilding.width
        : game.config.width + 300;

      buildingUtil.generateBuilding(
        this,
        newBuildingType,
        newX,
        game.config.height - 70
      );
    }

    // Deliver survivor and update score on overlap
    this.physics.overlap(
      jesseSprite,
      survivorsGroup,
      (scene, survivor) => buildingUtil.deliverSurvivor(this, survivor, score),
      null,
      this,
      null,
      this
    );

    // Spawn ground zombie
    if (
      Math.random() < zombieGroundSpawnProbability &&
      this.time.now - lastZombieSpawnTime > zombieSpawnCooldown
    ) {
      zombieUtil.spawnGroundZombie(this);

      lastZombieSpawnTime = this.time.now;
      zombieSpawnCooldown = baseZombieSpawnCooldown - 100 * score;
      zombieSpawnCooldown = Phaser.Math.Clamp(
        zombieSpawnCooldown,
        500,
        baseZombieSpawnCooldown
      );
    }

    // Spawn flying zombie when score is >= 80
    if (
      score >= 80 &&
      this.time.now - lastFlyingZombieSpawnTime > flyingZombieSpawnCooldown
    ) {
      zombieUtil.spawnFlyingZombie(this);
      lastFlyingZombieSpawnTime = this.time.now;
      flyingZombieSpawnCooldown = baseFlyingZombieSpawnCooldown;
    }

    // Despawn off-screen ground zombies
    zombiesGroundGroup.getChildren().forEach((zombie) => {
      if (zombie.x < 0 - offScreenMargin) {
        zombieUtil.despawnGroundZombie(zombie);
      }
    });

    // Despawn off-screen flying zombies
    zombiesFlyGroup.getChildren().forEach((zombie) => {
      if (zombie.x < 0 - offScreenMargin) {
        zombieUtil.despawnFlyZombie(zombie);
      }
    });

    // Check collisions with ground and flying zombies
    const gameOverCallback = () => {
      // Stop the game music
      game_music.stop();

      blood_spurt.play();
      zombie_growl.play();

      // Stop all game objects
      this.physics.world.timeScale = 0;

      this.scene.start("GameOverScene", { score: score });
    };

    this.physics.overlap(
      jesseSprite,
      zombiesGroundGroup,
      gameOverCallback,
      null,
      this
    );
    this.physics.overlap(
      jesseSprite,
      zombiesFlyGroup,
      gameOverCallback,
      null,
      this
    );
  }
}
