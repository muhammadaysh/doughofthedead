import {
    ground,
    invisibleGround,
    buildingsGroup,
    survivorsGroup,
    zombiesGroundGroup,
    zombiesFlyGroup,
    jesseSprite,
    scoreText,
    cursors,
    jumpKey,
    forceFallKey,
    deliver_sound,
    game_music,
    survivorSpawnProbability,
    updateScore 
  } from '../scenes/gameScene.js';
  
const minDistance = 20;
const maxDistance = 200;

function shouldSpawnSurvivor() {
    return Math.random() < survivorSpawnProbability;
  }

export function createGroups(scene, ground) {
  let buildingsGroup = scene.physics.add.group();
  let survivorsGroup = scene.physics.add.group();

  // Enable physics on groups
  scene.physics.world.enable([buildingsGroup, survivorsGroup]);

  // Add collider to buildingsGroup
  scene.physics.add.collider(buildingsGroup, ground);

  return {
    buildingsGroup: buildingsGroup,
    survivorsGroup: survivorsGroup,
  };
}

export function shouldGenerateNewBuilding() {
  const lastBuilding = getLastBuilding(buildingsGroup);
  return lastBuilding && lastBuilding.x < game.config.width - 10;
}

export function getLastBuilding() {
  return buildingsGroup.getLast(true);
}

export function generateBuilding(
  scene,
  buildingType,
  x,
  y,
  
) {
  if (!buildingsGroup || !buildingsGroup.children) {
    console.error("buildingsGroup is not properly defined.");
  }

  const distance = Phaser.Math.Between(minDistance, maxDistance);
  const newX = x + distance;

  const building = scene.add.sprite(newX, y, buildingType).setOrigin(0.5, 1);
  building.setScale(1.1);

  building.windows = [];
  building.survivors = [];

  const groundLevel = game.config.height - 70;
  building.y = groundLevel;

  buildingsGroup.children.iterate((existingBuilding) => {
    const buildingDistance = Math.abs(existingBuilding.x - newX);
    if (buildingDistance < minDistance) {
      generateBuilding(
        scene,
        buildingType,
        x,
        y,
        shouldSpawnSurvivor,
        buildingsGroup,
        survivorsGroup
      );
    }
  });

  buildingsGroup.add(building);

  const windowPositions = getWindowPositions(buildingType);

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

    if (shouldSpawnSurvivor() && building.survivors.length === 0) {
      const randomWindow = Phaser.Math.RND.pick(building.windows);
      addSurvivor(scene, randomWindow.x, randomWindow.y, building.survivors);
    }
  });

  scene.physics.add.collider(building, ground);
}

export function getRandomBuildingType() {
  const buildingTypes = [
    "building_1",
    "building_2",
    "building_3",
    "building_4",
    "building_5",
  ];
  return Phaser.Math.RND.pick(buildingTypes);
}

export function getWindowPositions(buildingType) {
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

export function addSurvivor(scene, x, y, building_survivors) {
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

export function deliverSurvivor(scene, survivor, score) {
    console.log("Score: " + score);
  if (!scene || typeof scene.tweens !== "object") {
    console.error("Invalid scene or missing tweens object.");
    return;
  }

  if (survivor.isDisappearing) {
    return;
  }

  survivor.isDisappearing = true;

  survivor.play("disappearing_survivor");

  // Remove the survivor from the group
  scene.anims.create({
    key: "disappearing_survivor",
    frames: [{ key: "survivor", frame: 2 }],
  });

  deliver_sound.play();
  updateScore(10);
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

export function despawnBuilding(building) {
  building.setActive(false).setVisible(false);
  buildingsGroup.remove(building, true, true);

  // Also despawn survivors associated with the building
  building.survivors.forEach((survivor) => {
    despawnSurvivor(survivor);
  });

  console.log("building despawned")
}

export function despawnSurvivor(survivor) {
  survivor.setActive(false).setVisible(false);
  survivorsGroup.remove(survivor, true, true);

}
