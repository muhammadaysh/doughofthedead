// Declare necessary variables
let sky;
let background;
let midground;
let foreground;
let ground;
let invisibleGround;
let buildingsGroup;
let survivorsGroup;
let jesseSprite;
let cursors;
let jumpKey;
let score = 0;
let scoreText;

let jumpCount = 0;
let jumpKeyJustPressed = false;

let wobbleFrequency = 0.01;
let wobbleAmplitude = 7;

// Constants
const foregroundSpeed = 1.8;
const midgroundSpeed = 1.2;
const backgroundSpeed = 0.6;
const groundSpeed = 2.0;

export default class GameScene extends Phaser.Scene {
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

    this.load.image("building_1", "assets/building_1.png");
    this.load.image("building_2", "assets/building_2.png");
    this.load.image("building_3", "assets/building_3.png");
    this.load.image("building_4", "assets/building_4.png");
    this.load.image("building_5", "assets/building_5.png");
  }

  create() {
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

    // Set up the invisible ground
    invisibleGround = this.physics.add
      .sprite(0, game.config.height - 35, "ground")
      .setOrigin(0, 0);
    invisibleGround.setAlpha(0);
    this.physics.world.enable(invisibleGround);

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

    jesseSprite.setCollideWorldBounds(true);
    jesseSprite.setBounce(0.2);
    this.physics.add.collider(jesseSprite, invisibleGround);

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

    survivorsGroup = this.physics.add.group();

    cursors = this.input.keyboard.createCursorKeys();
    jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    jumpKeyJustPressed = false;

    // this.physics.add.collider(jesseSprite, survivor);

    // this.physics.add.overlap(player, stars, collectStar, null, this);

    // Generate initial building
    generateBuilding(
      this,
      getRandomBuildingType(),
      game.config.width / 2,
      game.config.height - 140
    );

    scoreText = this.add.text(30, 50, "score: 0", {
      fontSize: "32px",
      fill: "#000",
    });

    jesseSprite.setDepth(6);
    ground.setDepth(1);
    buildingsGroup.setDepth(0);
    scoreText.setDepth(10);

    jumpCount = 0;
  }

  update() {
    // The tilePositionX property can be directly set on tile sprites
    foreground.tilePositionX += foregroundSpeed;
    midground.tilePositionX += midgroundSpeed;
    background.tilePositionX += backgroundSpeed;
    ground.tilePositionX += groundSpeed;

    // Move the buildings at the same pace as the ground
    buildingsGroup.getChildren().forEach((building) => {
      building.x -= groundSpeed * ground.scaleX;

      building.windows.forEach((window) => {
        window.x -= groundSpeed * ground.scaleX;
      });

      building.survivors.forEach((survivor) => {
        survivor.x -= groundSpeed * ground.scaleX;
      });

      // Despawn buildings that are off-screen
      if (building.x + building.width < 0 - offScreenMargin) {
        despawnBuilding(building);
      }
    });

    // Sync the positions and velocities of the visible and invisible grounds
    invisibleGround.x = ground.x;
    invisibleGround.setVelocityX(-groundSpeed * 100);

    if (jumpKey.isDown && !jumpKeyJustPressed) {
      if (jumpCount < 2) {
        // Jump only if Jesse is on the ground
        jesseSprite.setVelocityY(-650);
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
      const newBuildingType = getRandomBuildingType();
      const lastBuilding = getLastBuilding();
      const newX = lastBuilding
        ? lastBuilding.x + lastBuilding.width
        : game.config.width + 300;
      generateBuilding(this, newBuildingType, newX, game.config.height - 70);
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

function generateBuilding(scene, buildingType, x, y) {
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

    if (building.survivors.length === 0 && Phaser.Math.Between(0, 6) === 1) {
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
  survivor.setDepth(5); // Set a depth higher than the buildings
  survivor.body.allowGravity = false;

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
