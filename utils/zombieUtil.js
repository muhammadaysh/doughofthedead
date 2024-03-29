import {
  ground,
  invisibleGround,
  buildingsGroup,
  survivorsGroup,
  zombiesGroundGroup,
  zombiesFlyGroup,
  jesseSprite,
  score,
  scoreText,
  jumpKey,
  forceFallKey,
  deliver_sound,
  game_music,
} from "../scenes/gameScene.js";

const baseZombieSpawnCooldown = 3000;
let lastZombieSpawnTime = 0;
let zombieSpawnCooldown = baseZombieSpawnCooldown;
const groundZombieScale = Phaser.Math.Between(2.1 * 100, 2.6 * 100) / 100;
const flyZombieScale = Phaser.Math.Between(3 * 100, 3.5 * 100) / 100;



export function createGroups(scene, invisibleGround) {
  let zombiesGroundGroup = scene.physics.add.group();
  scene.physics.world.enable([zombiesGroundGroup]);

  // Add collider to zombiesGroundGroup
  scene.physics.add.collider(zombiesGroundGroup, invisibleGround);

  let zombiesFlyGroup = scene.physics.add.group();
  scene.physics.world.enable([zombiesFlyGroup]);

  // Return the groups object
  return {
    zombiesGroundGroup: zombiesGroundGroup,
    zombiesFlyGroup: zombiesFlyGroup,
  };
}

export function spawnGroundZombie(scene) {
  const zombieGround = zombiesGroundGroup.create(
    game.config.width + 80,
    game.config.height - 10,
    "zombie_ground"
  );

  zombieGround.body.setSize(
    zombieGround.width * 0.35,
    zombieGround.height * 0.50,
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
  zombieGround.setScale(groundZombieScale);
  zombieGround.setDepth(jesseSprite.depth);

  console.log("zombie spawned!");
}

export function spawnFlyingZombie(scene) {
  const spawnY = Phaser.Math.Between(
    game.config.height - 200,
    game.config.height - 600
  );

  const zombieFly = zombiesFlyGroup.create(
    game.config.width + 50,
    spawnY,
    "zombie_fly"
  );

  zombieFly.body.setSize(zombieFly.width * 0.30, zombieFly.height * 0.5, true);

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
  zombieFly.setScale(flyZombieScale);
  zombieFly.setFlipX(true);
  zombieFly.setDepth(jesseSprite.depth);

  console.log("Flying zombie spawned!");
}

export function despawnGroundZombie(zombie) {
  zombie.setActive(false).setVisible(false);
  zombiesGroundGroup.remove(zombie, true, true);
}

export function despawnFlyZombie(zombie) {
  zombie.setActive(false).setVisible(false);
  zombiesFlyGroup.remove(zombie, true, true);
}
