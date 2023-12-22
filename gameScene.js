import GameOverScene from "./gameOverScene.js";

let sky;
let background;
let midground;
let foreground;
let ground;

let invisibleGround;
let buildingsGroup;
let survivorsGroup;
let zombiesGroundGroup;
let zombiesFlyGroup;

let jesseSprite;

let cursors;
let jumpKey;
let forceFallKey;
let score = 0;
let scoreText;

let jumpCount = 0;
let jumpKeyJustPressed = false;

let wobbleFrequency = 0.01;
let wobbleAmplitude = 7;

let survivorSpawnProbability = 0.8;
let zombieGroundSpawnProbability = 0.01;

const baseZombieSpawnCooldown = 3000;
let lastZombieSpawnTime = 0;
let zombieSpawnCooldown = baseZombieSpawnCooldown;

let lastFlyingZombieSpawnTime = 0;
const baseFlyingZombieSpawnCooldown = 5000;
let flyingZombieSpawnCooldown = baseFlyingZombieSpawnCooldown;


// Constants
const foregroundSpeed = 1.8;
const midgroundSpeed = 1.2;
const backgroundSpeed = 0.6;
const groundSpeed = 2.2;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  resetScore() {
    score = 0;
    scoreText.setText("Score: " + score);
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("foreground", "assets/foreground.png");
    this.load.image("midground", "assets/midground.png");
    this.load.image("background", "assets/background.png");
    this.load.image("ground", "assets/ground.png");
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

    this.load.image("building_1", "assets/building_1.png");
    this.load.image("building_2", "assets/building_2.png");
    this.load.image("building_3", "assets/building_3.png");
    this.load.image("building_4", "assets/building_4.png");
    this.load.image("building_5", "assets/building_5.png");
  }

  create() {
    var score = 0;

    // Set the sky background
    sky = this.add.image(0, 0, "sky").setOrigin(0, 0);
    // Scale sky to fit the window
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

    // Create group for buildings
    buildingsGroup = this.physics.add.group();
    this.physics.world.enable(buildingsGroup);
    this.physics.add.collider(buildingsGroup, ground);

    // Enable physics for ground
    this.physics.world.enable(ground);

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

    zombiesGroundGroup = this.physics.add.group();
    this.physics.world.enable(zombiesGroundGroup);
    this.physics.add.collider(zombiesGroundGroup, invisibleGround);

    zombiesFlyGroup = this.physics.add.group();
    this.physics.world.enable(zombiesFlyGroup);

    survivorsGroup = this.physics.add.group();

    cursors = this.input.keyboard.createCursorKeys();
    jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    forceFallKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    generateBuilding(
      this,
      getRandomBuildingType(),
      game.config.width / 2,
      game.config.height - 140
    );

    scoreText = this.add.text(30, 50, "score: 0", {
      fontSize: "32px",
      fill: "#255",
    });

    scoreText.tint = 0x000000;

    jesseSprite.setDepth(6);
    ground.setDepth(1);
    invisibleGround.setDepth(2);

    buildingsGroup.setDepth(0);
    scoreText.setDepth(10);

    jumpCount = 0;
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
        despawnBuilding(building);
      }
    });

    if (forceFallKey.isDown) {
      this.physics.world.gravity.y = 4500;
    } else {
      // Reset gravity when S key is released
      this.physics.world.gravity.y = 1200;
    }

    if (jumpKey.isDown && !jumpKeyJustPressed) {
      if (jumpCount < 1) {
        // Jump only if Jesse is on the ground
        jesseSprite.setVelocityY(-725);
        jumpCount++; // Increment jump count
        jumpKeyJustPressed = true; // Set the flag to true
        console.log(jumpCount);
      } else if (jumpCount > 0 && jumpCount < 2) {
        // Jump only if Jesse is on the ground
        jesseSprite.setVelocityY(-925);
        jumpCount++; // Increment jump count
        jumpKeyJustPressed = true; // Set the flag to true
        console.log(jumpCount);
      }
    }

    // Check if the jump key was released
    if (jumpKey.isUp) {
      jumpKeyJustPressed = false; // Reset the flag when the key is released
    }

    // Reset jump count when Jesse touches the invisible ground
    if (jesseSprite.body.onFloor() && jumpKey.isUp) {
      jumpCount = 0;
    }

    if (!jesseSprite.body.onFloor()) {
      // Use a sine function to create a wobbling effect
      let wobble = Math.sin(this.time.now * wobbleFrequency) * wobbleAmplitude;
      jesseSprite.rotation = Phaser.Math.DegToRad(wobble);
    } else {
      // Reset rotation to the regular position when Jesse touches the ground
      jesseSprite.rotation = 0;
    }

    // Check if a new building needs to be generated
    if (shouldGenerateNewBuilding()) {
      survivorSpawnProbability = Math.max(
        0.2,
        survivorSpawnProbability - 0.0001 * score
      );

      // Generate a random number to determine whether to spawn a survivor
      const shouldSpawnSurvivor = Math.random() < survivorSpawnProbability;

      const newBuildingType = getRandomBuildingType();
      const lastBuilding = getLastBuilding();
      const newX = lastBuilding
        ? lastBuilding.x + lastBuilding.width
        : game.config.width + 300;
      generateBuilding(
        this,
        newBuildingType,
        newX,
        game.config.height - 70,
        shouldSpawnSurvivor
      );
    }

    this.physics.overlap(
      jesseSprite,
      survivorsGroup,
      (scene, survivor) => deliverSurvivor(this, survivor),
      null,
      this,
      null,
      this
    );

    if (
      Math.random() < zombieGroundSpawnProbability &&
      this.time.now - lastZombieSpawnTime > zombieSpawnCooldown
    ) {
      spawnGroundZombie(this);


      // Update the last spawn time
      lastZombieSpawnTime = this.time.now;
      // Reset the zombie spawn cooldown
      zombieSpawnCooldown = baseZombieSpawnCooldown - 100 * score;
      zombieSpawnCooldown = Phaser.Math.Clamp(
        zombieSpawnCooldown,
        500,
        baseZombieSpawnCooldown
      );
    }

    if (score >= 80) {
      // Spawn flying zombies with a cooldown
      if (this.time.now - lastFlyingZombieSpawnTime > flyingZombieSpawnCooldown) {
          spawnFlyingZombie(this);
          lastFlyingZombieSpawnTime = this.time.now;
          flyingZombieSpawnCooldown = baseFlyingZombieSpawnCooldown;
      }
  }

    this.physics.overlap(
      jesseSprite,
      zombiesGroundGroup,
      () => {
        // Trigger the game over scene
        this.scene.start("GameOverScene", { score: score });
      },
      null,
      this
    );

    this.physics.overlap(
      jesseSprite,
      zombiesFlyGroup,
      () => {
        // Trigger the game over scene
        this.scene.start("GameOverScene", { score: score });
      },
      null,
      this
    );
  }
}

function shouldGenerateNewBuilding() {
  const lastBuilding = getLastBuilding();
  return lastBuilding && lastBuilding.x < game.config.width - 10;
}

function getLastBuilding() {
  return buildingsGroup.getLast(true);
}

const offScreenMargin = 100; // Adjust as needed

function despawnBuilding(building) {
  building.setActive(false).setVisible(false);
}

// Min and maxx distance between buildings

const minDistance = 20;
const maxDistance = 200;

function generateBuilding(scene, buildingType, x, y, shouldSpawnSurvivor) {
  // Randomize the distance between buildings
  const distance = Phaser.Math.Between(minDistance, maxDistance);

  // Calculate the new x-coordinate for the building
  const newX = x + distance;

  // Create the building at the new position
  const building = scene.add.sprite(newX, y, buildingType).setOrigin(0.5, 1);
  building.setScale(1.1);

  building.windows = [];
  building.survivors = [];

  // Adjust the position of the sprite to spawn on the ground
  const groundLevel = game.config.height - 70;
  building.y = groundLevel;

  // Check for overlap and reposition if necessary
  buildingsGroup.children.iterate((existingBuilding) => {
    const buildingDistance = Math.abs(existingBuilding.x - newX);
    if (buildingDistance < minDistance) {
      generateBuilding(scene, buildingType, x, y); // Recursive call to try again
    }
  });

  buildingsGroup.add(building);

  // Define window positions based on building type
  const windowPositions = getWindowPositions(buildingType);

  // Create black rectangles as windows
  windowPositions.forEach((position) => {
    const window = scene.add.rectangle(
      building.x + position.x,
      building.y - position.y,
      position.width,
      position.height,
      0x0a0b10
    );

    window.setDepth(building.depth + 1);

    building.windows.push(window);

    if (shouldSpawnSurvivor && building.survivors.length === 0) {
      const randomWindow = Phaser.Math.RND.pick(building.windows);
      addSurvivor(scene, randomWindow.x, randomWindow.y, building.survivors);
    }
  });

  scene.physics.add.collider(building, ground);
}

function getRandomBuildingType() {
  const buildingTypes = [
    "building_1",
    "building_2",
    "building_3",
    "building_4",
    "building_5",
  ];
  return Phaser.Math.RND.pick(buildingTypes);
}

function getWindowPositions(buildingType) {
  const windowPositionsMap = {
    building_1: [
      { x: -70, y: 230, width: 95, height: 60 },
      { x: -70, y: 90, width: 95, height: 60 },
    ],
    building_2: [
      { x: -75, y: 355, width: 105, height: 75 },
      { x: 75, y: 355, width: 105, height: 75 },
      { x: 75, y: 210, width: 105, height: 75 },
      { x: -75, y: 210, width: 105, height: 75 },
      { x: -75, y: 80, width: 107, height: 75 },
    ],
    building_3: [
      { x: -110, y: 470, width: 72, height: 75 },
      { x: 12, y: 475, width: 72, height: 70 },
      { x: 120, y: 470, width: 72, height: 75 },
      { x: -110, y: 342, width: 70, height: 70 },
      { x: 120, y: 342, width: 74, height: 78 },
      { x: 12, y: 342, width: 70, height: 80 },

      { x: -110, y: 210, width: 70, height: 80 },
      { x: 12, y: 210, width: 85, height: 75 },
      { x: 120, y: 210, width: 70, height: 80 },

      { x: -105, y: 80, width: 80, height: 80 },
    ],
    building_4: [
      { x: -70, y: 470, width: 103, height: 75 },
      { x: 78, y: 465, width: 93, height: 80 },

      { x: -70, y: 320, width: 103, height: 75 },
      { x: 78, y: 320, width: 93, height: 80 },

      { x: -70, y: 180, width: 103, height: 75 },
      { x: 78, y: 180, width: 93, height: 80 },
    ],
    building_5: [
      { x: -107, y: 498, width: 80, height: 75 },
      { x: 100, y: 498, width: 80, height: 75 },

      { x: -107, y: 355, width: 80, height: 75 },
      { x: 100, y: 355, width: 80, height: 75 },

      { x: -107, y: 230, width: 80, height: 75 },
      { x: 100, y: 230, width: 80, height: 75 },

      { x: -107, y: 90, width: 80, height: 75 },
      { x: 100, y: 90, width: 80, height: 75 },
    ],
  };

  return windowPositionsMap[buildingType] || [];
}

function addSurvivor(scene, x, y, building_survivors) {
  const survivor = scene.physics.add
    .sprite(x, y, "survivor")
    .setOrigin(0.5, 0.6);
  survivor.setScale(0.3);
  survivor.setDepth(5);
  survivor.body.allowGravity = false;

  // Reduce hitbox size
  survivor.body.setSize(survivor.width * 0.55, survivor.height * 0.7, true);

  scene.physics.world.enable(survivor, Phaser.Physics.Arcade.STATIC_BODY);

  // Animations for alternating between the third and last sprites
  scene.anims.create({
    key: "alternate_survivor",
    frames: [
      { key: "survivor", frame: 0 },
      { key: "survivor", frame: 1 },
    ],
    frameRate: 2,
    repeat: -1,
  });

  survivor.play("alternate_survivor");

  // Add the survivor to the scene
  scene.physics.add.existing(survivor);
  survivorsGroup.add(survivor);
  survivorsGroup.children.iterate((survivor) => {
    survivor.body.allowGravity = false;
  });

  building_survivors.push(survivor);
}

function deliverSurvivor(scene, survivor) {
  if (!scene || typeof scene.tweens !== "object") {
    console.error("Invalid scene or missing tweens object.");
    return;
  }

  if (survivor.isDisappearing) {
    return;
  }

  // Set the flag to indicate that the survivor is disappearing
  survivor.isDisappearing = true;

  // Remove the survivor from the group
  scene.anims.create({
    key: "disappearing_survivor",
    frames: [{ key: "survivor", frame: 2 }],
  });

  survivor.play("disappearing_survivor");

  score += 10;
  scoreText.setText("Score: " + score);
  // Add fading animation (tween) for disappearance
  scene.tweens.add({
    targets: survivor,
    alpha: 0, // Target alpha (0 = fully transparent)
    duration: 1000, // Duration of the fade (in milliseconds)
    ease: "Linear", // Easing function
    delay: 400, // 2-second delay before starting the tween
    onComplete: () => {
      // Callback function when the tween completes (optional)
      survivorsGroup.remove(survivor, true, true);
    },
  });
}

function spawnGroundZombie(scene) {
  const spawnY = Phaser.Math.Between(
    game.config.height - 30,
    game.config.height - 50
  );

  const zombieGround = zombiesGroundGroup.create(
    game.config.width + 50,
    spawnY,
    "zombie_ground"
  );

  zombieGround.body.setSize(
    zombieGround.width * 0.55,
    zombieGround.height * 0.7,
    true
  );

  scene.anims.create({
    key: "zombie_running",
    frames: [
      { key: "zombie_ground", frame: 11 },
      { key: "zombie_ground", frame: 10 },
      { key: "zombie_ground", frame: 9 },
    ],
    frameRate: 6,
    repeat: -1,
  });

  zombieGround.play("zombie_running");

  zombieGround.setOrigin(0.5, 1);
  zombieGround.setScale(2.2);
  zombieGround.setVelocityX(-500);
  zombieGround.setDepth(jesseSprite.depth);

  console.log("zombie spawned!");
}

function spawnFlyingZombie(scene) {
  const spawnY = Phaser.Math.Between(
    game.config.height - 200,
    game.config.height - 600
  );

  const zombieFly = zombiesFlyGroup.create(
    game.config.width + 50,
    spawnY,
    "zombie_fly"
  );

  zombieFly.body.setSize(
    zombieFly.width * 0.55,
    zombieFly.height * 0.7,
    true
  );

  zombieFly.body.allowGravity = false;

  scene.anims.create({
    key: "zombie_flying",
    frames: [
      { key: "zombie_fly", frame: 7 },
      { key: "zombie_fly", frame: 8 },
      { key: "zombie_fly", frame: 9 },
    ],
    frameRate: 6,
    repeat: -1,
  });

  zombieFly.play("zombie_flying"); // Use "zombie_flying" animation key

  zombieFly.setOrigin(0.5, 1);
  zombieFly.setScale(3.0);
  zombieFly.setVelocityX(-500);
  zombieFly.setFlipX(true);
  zombieFly.setDepth(jesseSprite.depth);

  console.log("Flying zombie spawned!");
}
