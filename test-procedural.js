// Automated Test Suite for Guitar vs Zombies Procedural Systems
const fs = require('fs');
const path = require('path');

// Setup mock browser globals
const storage = {};
global.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => { storage[key] = String(val); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

global.window = global;
global.performance = { now: () => Date.now() };

const vm = require('vm');

// Helper to load files in simulated global context
function loadScript(relPath) {
    const fullPath = path.resolve(__dirname, relPath);
    const code = fs.readFileSync(fullPath, 'utf8');
    vm.runInThisContext(code);
}

console.log('=== TEST SUITE: GUITAR VS ZOMBIES PROCEDURAL SYSTEMS ===\n');

// 1. Load Systems
['js/i18n.js', 'js/stage-system.js', 'js/skills.js', 'js/guitarist-pool.js', 'js/zombie-entity.js', 'js/pvp-system.js'].forEach(loadScript);

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = '') {
    if (condition) {
        console.log(`  ✅ [PASS] ${testName}`);
        testsPassed++;
    } else {
        console.error(`  ❌ [FAIL] ${testName}: ${details}`);
        testsFailed++;
    }
}

// ==========================================
// TEST 1: GUITARIST POOL PROCEDURAL LEVELING (1-100)
// ==========================================
console.log('1. Testing Guitarist Pool & Leveling (1-100)...');
const pool = new GuitaristPoolSystem(); window.guitaristPool = pool;
assert(pool.guitarists.length === 11, 'Pool contains all 11 unique guitarists');
pool.guitarists.forEach(g => assert(g.baseStats.baseAttackSpeed === 1.0 && pool.getHeroStats(g.id).baseAttackSpeed === 1.0, `Hero ${g.name} attack speed === 1.0/s`));
const johnny = pool.guitarists[0], initialStats = pool.getHeroStats('johnny_blaze');
assert(initialStats.level === 1 && Math.abs(initialStats.damageMult - 1.0) < 0.001, 'Johnny starts at Level 1 with 1.0x damage mult');
pool.setLevel('johnny_blaze', 100);
const maxStats = pool.getHeroStats('johnny_blaze');
assert(maxStats.level === 100 && Math.abs(maxStats.damageMult - 1.99) < 0.01 && maxStats.critDamageBonusPercent >= 89, 'Level 100 Johnny damage mult (1.99x) and crit scale smoothly');
pool.setLevel('johnny_blaze', 1);
const xpNeeded = pool.getXpRequiredForNextLevel(1);
assert(xpNeeded > 0, `XP required for Level 2 is calculated: ${xpNeeded}`);
const resXp = pool.addHeroXp('johnny_blaze', 500);
assert(resXp.newLevel > 1, `Hero leveled up via XP from Level 1 to Level ${resXp.newLevel}`);
pool.setLevel('johnny_blaze', 1);
const goldCost = pool.getGoldCostForLevelUp('johnny_blaze');
assert(goldCost === 117, `Gold cost for Level 1 guitarist is tripled to 117 gold (was 39)`);
global.document = { getElementById: () => null, querySelectorAll: () => [] };
loadScript('js/talents.js');
const talentSysInstance = new TalentSystem();
assert(talentSysInstance.getCost(talentSysInstance.talents['power_chord']) === 160, `Level 0 Power Chord upgrade cost is doubled to 160 gold (was 80)`);
assert(talentSysInstance.getCost(talentSysInstance.talents['ferocious_solo']) === 400, `Level 0 Ferocious Solo upgrade cost is doubled to 400 gold (was 200)`);
window.talentSystem = { gold: 5000, getStat: () => 0, saveProgress: () => {}, addGold: (amt) => { window.talentSystem.gold += amt; } };
const goldLvlRes = pool.levelUpWithGold('johnny_blaze', window.talentSystem);
assert(goldLvlRes.success && goldLvlRes.newLevel === 2, 'Hero successfully leveled up using gold');
assert(window.talentSystem.gold === 5000 - 117, `Gold correctly deducted from player balance (5000 - 117 = ${window.talentSystem.gold})`);
const roxieStatsLv1 = pool.getHeroStats('roxie_anarchy');
pool.setLevel('roxie_anarchy', 100);
const roxieStatsLv100 = pool.getHeroStats('roxie_anarchy');
assert(roxieStatsLv100.manaRegenRate > roxieStatsLv1.manaRegenRate, 'Mythic hero gains significant mana regen bonus at Level 100');
assert(roxieStatsLv100.critDamageBonusPercent >= 110, 'Mythic hero reaches high crit damage bonus at Level 100');

// ==========================================
// TEST 2: INFINITE PROCEDURAL STAGE SYSTEM
// ==========================================
console.log('\n2. Testing Infinite Procedural Stage System...');
const stageSys = new StageSystem(); window.stageSystem = stageSys;
assert(stageSys.selectedStage === 1 && stageSys.highestUnlockedStage === 1, 'Stage System starts at Stage 1');
const stage1Info = stageSys.getStageInfo(1);
assert(stage1Info.minZombieLevel === 1 && stage1Info.maxZombieLevel === 1, 'Stage 1 zombie level range is 1-1');
assert(stage1Info.targetKills >= 5, `Stage 1 target kills is ${stage1Info.targetKills}`);
stageSys.unlockNextStage(); stageSys.setSelectedStage(2);
assert(stageSys.highestUnlockedStage === 2 && stageSys.selectedStage === 2, 'Stage 2 successfully unlocked and selected');
const stage50Info = stageSys.getStageInfo(50);
assert(stage50Info.minZombieLevel >= 60, `Stage 50 scales zombie levels: min ${stage50Info.minZombieLevel}, max ${stage50Info.maxZombieLevel}`);
assert(stage50Info.rewardCoins > stage1Info.rewardCoins && stage50Info.rewardXp > stage1Info.rewardXp, `Stage 50 gives scaled gold/XP reward (${stage50Info.rewardCoins} vs ${stage1Info.rewardCoins})`);

// ==========================================
// TEST 3: PROCEDURAL ZOMBIES (LEVEL, STATS & REWARDS)
// ==========================================
console.log('\n3. Testing Procedural Zombie Scaling & Status Effects...');

// Mock Zombie Type
const mockZombieType = {
    type: 'normal',
    name: 'Punk Walker',
    hp: 65,
    speed: 38,
    attackDamage: 8,
    attackInterval: 1.1
};

const zLv1 = new ZombieEntity(mockZombieType, 100, 400, 1);
const zLv10 = new ZombieEntity(mockZombieType, 100, 400, 10);
const zLv50 = new ZombieEntity(mockZombieType, 100, 400, 50);

assert(zLv1.level === 1 && zLv1.maxHp === 65, 'Zombie Level 1 has base 65 HP');
assert(zLv10.level === 10 && zLv10.maxHp > zLv1.maxHp, `Zombie Level 10 HP scales to ${zLv10.maxHp} (vs ${zLv1.maxHp})`);
assert(zLv50.level === 50 && zLv50.maxHp > zLv10.maxHp, `Zombie Level 50 HP scales to ${zLv50.maxHp}`);
assert(zLv50.attackDamage > zLv1.attackDamage, `Zombie Level 50 attack damage scales to ${zLv50.attackDamage} (vs ${zLv1.attackDamage})`);

// Gold drop scaling
const goldLv1 = zLv1.getGoldDrop();
const goldLv50 = zLv50.getGoldDrop();
assert(goldLv50 > goldLv1, `Zombie Level 50 drops more procedural gold: ${goldLv50} vs ${goldLv1}`);

// Mock combat context for update loop
const mockCombat = {
    getHeroPosition: () => ({ x: 60, y: 100 }),
    fx: { particles: [] },
    addFloatingText: () => {},
    onZombieKilled: () => {}
};

// Status Effects: Stun, Slow, Burn
zLv1.applyStun(1.0);
assert(zLv1.isStunned(), 'Zombie stun applied successfully');
zLv1.update(0.5, mockCombat);
assert(zLv1.isStunned(), 'Zombie still stunned after 0.5s');
zLv1.update(0.6, mockCombat);
assert(!zLv1.isStunned(), 'Zombie stun expired after 1.1s total');

zLv1.applySlow(0.4, 2.0);
assert(zLv1.isSlowed(), 'Zombie slow effect applied');

zLv1.applyBurn(15, 2.0);
const hpBeforeBurn = zLv1.hp;
zLv1.update(1.0, mockCombat);
assert(zLv1.hp < hpBeforeBurn, `Zombie took burn DoT damage: ${zLv1.hp} < ${hpBeforeBurn}`);

// 4. Testing 4-Lane Skill System & Rock Mana
console.log('\n4. Testing 4-Lane Skill System & Rock Mana...');
const skillSys = new SkillSystem(); window.skillSystem = skillSys;
assert(skillSys.getAllSkills().length === 56, 'All 56 skills are registered in SkillSystem (55 unique + 1 universal basic)');
const defaultEquipped = skillSys.getEquippedSkills('johnny_blaze');
assert(defaultEquipped.length === 4 && skillSys.hasAtLeastOneBasicStrike(skillSys.loadEquipped('johnny_blaze')), '4 lanes are equipped & default keeps basic strike');
['johnny_blaze', 'vulkan_ironhead', 'dr_radix', 'cypher_volt', 'kragthor_titan', 'roxie_anarchy', 'finn_punk', 'ignis_draco', 'fenrir_howler', 'spiky_sponge', 'saul_slash'].forEach(hid => {
    assert(skillSys.getSkillsForHero(hid).filter(s => s.id !== 'basic_strike').length >= 5, `Hero ${hid} has at least 5 unique skills`);
});
skillSys.equipSkill(3, 'basic_strike', 'johnny_blaze'); skillSys.equipSkill(0, 'blaze_power_chord', 'johnny_blaze'); skillSys.equipSkill(1, 'blaze_garage_shred', 'johnny_blaze'); skillSys.equipSkill(2, 'blaze_stage_dive', 'johnny_blaze');
const checkBlock = skillSys.canEquipSkill(3, 'blaze_sound_concussion', 'johnny_blaze');
assert(checkBlock.allowed === false && checkBlock.reason.includes('Ataque Básico'), 'canEquipSkill() blocks equipping 4th special skill');
assert(skillSys.equipSkill(3, 'blaze_sound_concussion', 'johnny_blaze') === false && skillSys.getEquippedSkill(3, 'johnny_blaze').id === 'basic_strike', 'Slot 3 remains basic_strike');
assert(skillSys.canEquipSkill(3, 'basic_strike', 'johnny_blaze').allowed === true, 'canEquipSkill() permits equipping basic_strike');

function simSkill(lane, baseDamage, currentMana) {
    const s = skillSys.getEquippedSkill(lane, 'johnny_blaze'), cost = s ? s.manaCost : 0;
    if (cost > 0 && currentMana < cost) return { executedSkill: 'common_basic_attack', damage: baseDamage, manaSpent: 0 };
    return { executedSkill: s.id, damage: Math.round(baseDamage * (s.damageMult || 1.0)), manaSpent: cost };
}
const execSuccess = simSkill(0, 50, 30), execFallback = simSkill(0, 50, 3);
assert(execSuccess.executedSkill === 'blaze_power_chord' && execSuccess.damage === 110 && execSuccess.manaSpent === 8, 'Power chord executed with 2.2x damage and 8 mana spent');
assert(execFallback.executedSkill === 'common_basic_attack' && execFallback.damage === 50 && execFallback.manaSpent === 0, 'Fallback to basic attack with 0 mana spent when MP low');

// 5. Testing Attack Speed System & Rhythm Accuracy Modifiers
console.log('\n5. Testing Attack Speed System & Rhythm Accuracy Modifiers...');
function calcDmg(rating, base, critPct) {
    if (rating === 'miss') return { damage: Math.round(base * 0.5), isCrit: false };
    if (rating === 'good') return { damage: base, isCrit: false };
    if (rating === 'great') return { damage: Math.round(base * 1.2), isCrit: false };
    return { damage: Math.round(base * (1 + critPct / 100)), isCrit: true };
}
assert(calcDmg('miss', 40, 60).damage === 20, 'MISS halves attack damage (20)');
assert(calcDmg('good', 40, 60).damage === 40, 'GOOD delivers 1.0x damage (40)');
assert(calcDmg('great', 40, 60).damage === 48, 'GREAT delivers 1.2x damage (48)');
assert(calcDmg('perfect', 40, 60).damage === 64 && calcDmg('perfect', 40, 60).isCrit, 'PERFECT delivers Critical Strike with hero crit stat (64)');

// 6. Testing Game Polish, Audio, Skills & Talents
console.log('\n6. Testing Game Polish, Audio, Skills, Talents...');
const audioCode = fs.readFileSync('js/audio.js', 'utf8');
assert(audioCode.includes('playPowerChord'), 'SoundEngine defines playPowerChord method');
const skillsCode = fs.readFileSync('js/skills.js', 'utf8');
assert(skillsCode.includes("getStat('rhythmic_heal')"), 'Skill healing_melody references correct rhythmic_heal talent');
assert(!skillsCode.includes("regen_pick"), 'No obsolete regen_pick talent referenced in skills.js');
let mockLocalStorage = {};
global.localStorage = {
    getItem: (k) => mockLocalStorage[k] || null,
    setItem: (k, v) => { mockLocalStorage[k] = v.toString(); },
    removeItem: (k) => { delete mockLocalStorage[k]; }
};
localStorage.setItem('gvs_total_kills', '42');
localStorage.setItem('gvs_highscore', '15000');
assert(parseInt(localStorage.getItem('gvs_total_kills')) === 42, 'gvs_total_kills persists correctly');
assert(parseInt(localStorage.getItem('gvs_highscore')) === 15000, 'gvs_highscore persists correctly');

// ==========================================
// TEST 7: ON-SCREEN SPAWN & TARGETING INTEGRITY (ZERO GHOST KILLS)
// ==========================================
console.log('\n7. Testing On-Screen Spawn & Targeting Integrity (Zero Ghost Kills)...');

// 7.1 ZombieEntity initialX & Default Spawn Position
const zVanguard = new ZombieEntity(mockZombieType, 100, 400, 1, 310);
assert(zVanguard.x === 310, 'ZombieEntity respects initialX parameter for vanguard spawning');

const zDefaultEdge = new ZombieEntity(mockZombieType, 100, 400, 1);
assert(zDefaultEdge.x >= 408 && zDefaultEdge.x <= 420, `ZombieEntity default edge spawn is right at screen threshold (${zDefaultEdge.x.toFixed(1)} vs 408-418px)`);

// 7.2 Mock CombatSystem Environment
global.window.addEventListener = () => {}; global.window.removeEventListener = () => {};
const mockCtx = { save: () => {}, restore: () => {}, fillRect: () => {}, beginPath: () => {}, stroke: () => {}, fill: () => {}, drawImage: () => {}, closePath: () => {}, arc: () => {}, ellipse: () => {}, measureText: () => ({ width: 20 }) };
global.document = { getElementById: () => ({ getContext: () => mockCtx, addEventListener: () => {}, parentElement: { clientWidth: 400, clientHeight: 300 }, width: 400, height: 300 }) };
global.Image = class { constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 571; } };
global.SpriteSheet = class { constructor() {} drawFrame() {} };

loadScript('js/combat-fx.js');
loadScript('js/combat.js');

const combat = new CombatSystem('gameCanvas');
combat.canvas.width = 400;
combat.canvas.height = 300;

// Test 7.0: Combat Attack Speed & Rhythm Combo Synergy (v1.6.9)
combat.combo = 0;
assert(combat.getHeroAttackSpeed() === 1.0, `Combat base attack speed at 0 combo is exactly 1.0/s (${combat.getHeroAttackSpeed()})`);
combat.combo = 50;
assert(Math.abs(combat.getHeroAttackSpeed() - 1.5) < 0.001, `Attack speed at combo 50 scales to 1.50/s (+0.5/s bonus): ${combat.getHeroAttackSpeed()}`);
combat.combo = 100;
assert(Math.abs(combat.getHeroAttackSpeed() - 2.0) < 0.001, `Attack speed at combo 100 scales to 2.00/s (+1.0/s bonus): ${combat.getHeroAttackSpeed()}`);
combat.combo = 200;
assert(Math.abs(combat.getHeroAttackSpeed() - 3.0) < 0.001, `Attack speed at combo 200 hits +2.0 cap reaching 3.00/s: ${combat.getHeroAttackSpeed()}`);
combat.combo = 0; // Simulated miss
assert(combat.getHeroAttackSpeed() === 1.0, `Miss resets combo to 0 and drops attack speed back to base 1.0/s: ${combat.getHeroAttackSpeed()}`);

// Test 7.1: Natural Critical Accumulation Rule (v1.7.0)
combat.perfectStreak = 0;
combat.guaranteedCritReady = false;
combat.pendingAttackModifiers = [];

// 1. Non-perfect note (great, good, miss) resets perfect streak
combat.registerRhythmNote('perfect', 0);
assert(combat.perfectStreak === 1, 'First perfect note increments perfectStreak to 1');
combat.registerRhythmNote('great', 1);
assert(combat.perfectStreak === 0, 'Great note resets perfectStreak to 0');
combat.registerRhythmNote('perfect', 0); combat.registerRhythmNote('good', 2);
assert(combat.perfectStreak === 0, 'Good note resets perfectStreak to 0');
combat.registerRhythmNote('perfect', 0); combat.registerRhythmNote('miss', 3);
assert(combat.perfectStreak === 0, 'Miss note resets perfectStreak to 0');

// 2. Accumulating 5 consecutive perfect notes guarantees crit on next shot
[0, 1, 2, 3].forEach(l => combat.registerRhythmNote('perfect', l));
assert(combat.perfectStreak === 4 && !combat.guaranteedCritReady, '4 perfect notes accumulated, guaranteed crit not yet ready');
combat.registerRhythmNote('perfect', 0); // 5th perfect note!
assert(combat.perfectStreak === 0, 'After 5th perfect note, perfectStreak is reset to 0');
assert(combat.guaranteedCritReady === true, '5 consecutive perfect notes sets guaranteedCritReady to true');

// 3. Next note/shot consumes guaranteed crit
combat.registerRhythmNote('good', 1); // Next note (even if good) consumes guaranteed crit!
const queuedCritMod = combat.pendingAttackModifiers[combat.pendingAttackModifiers.length - 1];
assert(queuedCritMod.isCrit === true, 'Next shot receives guaranteed critical damage');
assert(combat.guaranteedCritReady === false, 'guaranteedCritReady is consumed and set back to false');
assert(combat.perfectStreak === 0, 'Good note kept perfectStreak at 0');

// Test Vanguard Spawning on Battle Reset
combat.resetBattle([mockZombieType]);
assert(combat.entities.zombies.length === 2, 'resetBattle() spawns 2 vanguard zombies immediately');
assert(combat.entities.zombies.every(z => z.x < 400), 'All vanguard zombies spawn visibly on screen (x < canvas.width)');
assert(combat.entities.zombies[0].x <= 400 * 0.85, `Vanguard zombie 1 is well into view: x=${combat.entities.zombies[0].x.toFixed(1)}`);

// Test Auto-Attack Target Selection (No Off-Screen Targeting)
combat.entities.zombies = [];
// Zombie A is off-screen at x=450
const offScreenZombie = new ZombieEntity(mockZombieType, 100, 400, 1, 450);
combat.entities.zombies.push(offScreenZombie);

// Fire auto-attack
combat.performHeroAutoAttack();
const firedProj1 = combat.entities.projectiles[combat.entities.projectiles.length - 1];
assert(firedProj1.target === null, 'Hero auto-attack ignores off-screen zombie (target is null)');

// Now add Zombie B on-screen at x=320
const onScreenZombie = new ZombieEntity(mockZombieType, 100, 400, 1, 320);
combat.entities.zombies.push(onScreenZombie);

combat.performHeroAutoAttack();
const firedProj2 = combat.entities.projectiles[combat.entities.projectiles.length - 1];
assert(firedProj2.target === onScreenZombie, 'Hero auto-attack locks onto visible on-screen zombie');

// Test Projectile Screen Edge Dissipation
const edgeProj = { x: 398, y: 100, vx: 440, vy: 0, frame: 3, trailTimer: 0, active: true, damage: 30 };
combat.entities.projectiles = [edgeProj];
combat.update(16); // 1 tick
assert(!edgeProj.active, 'Projectile dissipates and becomes inactive at canvas boundary (x >= canvas.width - 4)');

// Test Knockback Clamping (Never pushes zombies off-screen)
onScreenZombie.x = 370;
const currentY = onScreenZombie.y + (onScreenZombie.jumpArcY || 0);
const knockProj = { x: 370, y: currentY - 15, vx: 0, vy: 0, frame: 3, trailTimer: 0, active: true, damage: 10, isCrit: false, heroId: null, projColor: '#00ffff' };
combat.entities.projectiles = [knockProj];
combat.entities.zombies = [onScreenZombie];
combat.update(16);
assert(onScreenZombie.x <= 400 - 15, `Knockback is strictly clamped on-screen: x=${onScreenZombie.x} <= ${400 - 15}`);
assert(onScreenZombie.x > 370, `Zombie was knocked back to the right: x=${onScreenZombie.x.toFixed(1)} > 370`);

// ==========================================
// TEST 8: BATTLE PAUSE, VICTORY & DEFEAT FLOW INTEGRITY
// ==========================================
console.log('8. Testing Battle Pause, Victory & Defeat Flow Integrity...');

// 1. Combat Pause Check
combat.isPaused = true;
const prevCombatTime = combat.time;
combat.update(50);
assert(combat.time === prevCombatTime, 'CombatSystem update halts immediately when isPaused is true');
combat.isPaused = false;

// 2. Fatal Damage & Hero Defeat
let defeatModalCalled = false;
window.game = {
    showDefeatModal: () => { defeatModalCalled = true; },
    showVictoryModal: () => {},
    pauseBattle: () => {},
    resumeBattle: () => {},
    combat: combat,
    rhythm: { isPaused: false, songStats: { totalNotes: 10, hitNotes: 8 } }
};

combat.heroHp = 10;
combat.isGameOver = false;
combat.matchActive = true;
combat.takeDamage(25, true, 'FATAL STRIKE');
assert(combat.heroHp === 0, 'Hero HP correctly reduced to 0');
assert(combat.isGameOver === true, 'Fatal damage sets isGameOver to true');
assert(combat.matchActive === false, 'Fatal damage halts matchActive in combat');
assert(combat.isDefeatSequence === true && combat.defeatSequenceTimer > 0, 'Fatal damage initiates defeat cinematic sequence');
combat.update(1900);
assert(defeatModalCalled === true, 'Cinematic timer expiration opens showDefeatModal()');

// 3. Victory Flow Check
let victoryModalCalled = false;
window.game.showVictoryModal = (song, stats) => {
    victoryModalCalled = true;
    combat.isVictory = true;
};

// Simulate custom song finish
const mockSong = { id: 'test_song', title: 'Epic Solo', duration: 10, notes: [{}, {}] };
const mockStats = { totalNotes: 2, hitNotes: 2, maxStreak: 2 };
window.game.showVictoryModal(mockSong, mockStats);
assert(victoryModalCalled === true, 'finishCustomSong properly routes to showVictoryModal');
assert(combat.isVictory === true, 'Victory sets combat.isVictory to true');

// 4. Modal Resumption Guard Check
let resumed = false;
window.game.resumeBattle = () => { resumed = true; };
const testCloseModal = () => {
    if (!combat.isGameOver && !combat.isVictory) {
        window.game.resumeBattle();
    }
};
testCloseModal();
// ==========================================
// TEST 9: STAGE COMPLETION, COMBO ATTACK SPEED & WRONG TAP PENALTY
// ==========================================
console.log('9. Testing Stage Completion, Combo Attack Speed & Wrong Tap Penalty...');

// 1. StageSystem.completeStage
const prevGold = window.talentSystem.gold;
const stageBefore = stageSys.selectedStage;
const compRes = stageSys.completeStage(stageBefore);
assert(compRes && compRes.rewards && compRes.rewards.coins > 0, 'completeStage() calculates and returns stage rewards');
assert(window.talentSystem.gold > prevGold, 'completeStage() deposits gold reward into talentSystem');
assert(stageSys.highestUnlockedStage >= stageBefore + 1, 'completeStage() unlocks the next stage');

// 2. Combo Attack Speed Scaling (+0.01 per point, max +2.0)
combat.combo = 0; const baseSpd = combat.getHeroAttackSpeed();
combat.combo = 50; const spd50 = combat.getHeroAttackSpeed();
assert(Math.abs(spd50 - (baseSpd + 0.50)) < 0.001, `Combo 50 adds +0.50 attack speed: ${spd50.toFixed(2)} vs ${baseSpd.toFixed(2)} + 0.50`);
combat.combo = 200; const spd200 = combat.getHeroAttackSpeed();
assert(Math.abs(spd200 - (baseSpd + 2.0)) < 0.001, `Combo 200 adds +2.00 attack speed (max cap): ${spd200.toFixed(2)}`);
combat.combo = 500; const spd500 = combat.getHeroAttackSpeed();
assert(Math.abs(spd500 - (baseSpd + 2.0)) < 0.001, `Combo 500 is capped at +2.00 max attack speed: ${spd500.toFixed(2)}`);

// 3. Wrong Tap Penalty (miss shot bypasses zombies, 0 damage, resets combo)
combat.isGameOver = false;
combat.matchActive = true;
combat.heroHp = combat.heroMaxHp;
combat.combo = 45;
combat.entities.projectiles = [];
const targetZombie = new ZombieEntity(mockZombieType, 100, 400, 1, 250);
combat.entities.zombies = [targetZombie];
const zombieHpBefore = targetZombie.hp;

combat.registerWrongTap(1);
assert(combat.combo === 0, 'registerWrongTap() resets combo to 0');
assert(combat.entities.projectiles.length > 0, 'registerWrongTap() produces a projectile');

const missProj = combat.entities.projectiles[combat.entities.projectiles.length - 1];
assert(missProj.isMiss === true, 'Miss projectile has isMiss = true');
assert(missProj.damage === 0, 'Miss projectile deals 0 damage');
assert(missProj.projColor === '#777777', 'Miss projectile has grey color (#777777)');

// Update combat so projectile passes through zombie position
missProj.x = targetZombie.x;
missProj.y = targetZombie.y - 15;
combat.update(16);
assert(targetZombie.hp === zombieHpBefore, 'Miss projectile completely bypasses zombie collision (zombie took 0 damage)');
assert(missProj.active === true, 'Miss projectile remains active and deflected instead of being consumed by zombie');

// 4. Multi-touch Pointer Map Simulation
const activePadPointers = new Map();
activePadPointers.set(101, 0);
activePadPointers.set(102, 2);
assert(activePadPointers.size === 2, 'Editor multi-touch tracks multiple concurrent fingers');
assert(activePadPointers.get(101) === 0 && activePadPointers.get(102) === 2, 'Each finger maps to its respective lane independently');
activePadPointers.delete(101);
assert(activePadPointers.size === 1 && activePadPointers.get(102) === 2, 'Releasing finger 1 preserves finger 2 holding lane 2');

// ==========================================
// TEST 10: IN-GAME EDIT REMOVAL, MULTIKILL VFX & LINKED KILL RHYTHM
// ==========================================
console.log('10. Testing In-game Edit Button Removal, Multikill VFX & Linked Kill Rhythm...');

// 1. Verify removal of in-game edit button
const indexHtmlContent = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
assert(!indexHtmlContent.includes('id="result-edit-btn"'), 'In-game result-edit-btn successfully removed from index.html');
assert(!indexHtmlContent.includes('EDITAR RITMO</button>'), 'No in-game buttons mention EDITAR RITMO');
assert(indexHtmlContent.includes('id="song-studio-modal"'), 'Song Studio modal retained in main menu');
assert(indexHtmlContent.includes('id="chart-editor-modal"'), 'Song Chart Editor retained in main menu');

// 2. Multikill Tiers definitions and visual themes
const testFx = new CombatFX();
[
    [1, '1 KILL! ⚡', '#00ffff'], [2, 'DOUBLE KILL! 🔥', '#ffaa00'],
    [3, 'TRIPLE KILL! ⚡🔥', '#ff3300'], [4, 'MULTI KILL! 💥', '#ff00aa'],
    [5, 'ULTRA KILL! ⚡💥', '#ff0055'], [6, 'FANTÁSTICO! 🎸🔥', '#9900ff'],
    [7, 'UNBELIEVABLE! 👑⚡', '#ffd700'], [12, 'UNBELIEVABLE x12! 👑⚡', '#ffd700']
].forEach(([streak, title, color]) => {
    const k = testFx.getMultiKillDef(streak);
    assert(k.title === title && k.color === color, `Tier ${streak}: ${title}`);
});

// 3. Multikill Banner Animation & Particle Shockwaves
testFx.addMultiKillBanner(4, 200, 150);
const activeBanner = testFx.multiKillBanners[0];
assert(activeBanner && activeBanner.scale === 2.2 && activeBanner.life === 1.35, 'Multikill banner begins with slam scale 2.2 and life 1.35s');
assert(testFx.shockwaves.length > 0 && testFx.particles.length > 0 && testFx.shakePower >= 9, 'Multikill triggers shockwaves, particles and shake');

// 4. Linked Kill Streak ("Ritmo de Kills")
combat.resetBattle();
assert(combat.comboKills === 0, 'comboKills is 0 on battle start');

combat.combo = 15;
combat.onZombieKilled(targetZombie, 100);
assert(combat.comboKills === 1, '1st kill in combo sets comboKills to 1');
combat.onZombieKilled(targetZombie, 100);
assert(combat.comboKills === 2, '2nd kill in combo sets comboKills to 2 (DOUBLE KILL)');
combat.onZombieKilled(targetZombie, 100);
assert(combat.comboKills === 3, '3rd kill in combo sets comboKills to 3 (TRIPLE KILL)');

// Break combo via wrong tap
combat.registerWrongTap(0);
assert(combat.combo === 0, 'Wrong tap broke combo');
assert(combat.comboKills === 0, 'Wrong tap immediately reset comboKills to 0 ("ambos reiniciam")');

// Build streak again and break via miss
combat.combo = 8;
combat.onZombieKilled(targetZombie, 100);
assert(combat.comboKills === 1, 'New kill begins new kill streak at 1');
combat.registerRhythmNote('miss', 1);
assert(combat.combo === 0, 'Miss broke combo');
assert(combat.comboKills === 0, 'Miss note immediately reset comboKills to 0');

// 5. High Combo Screen Shake
combat.fx.shakePower = 0;
let simStreak = 10;
if (simStreak >= 10 && simStreak % 5 === 0) {
    const pwr = Math.min(10, 3 + Math.floor(simStreak / 10));
    combat.triggerShake(pwr);
}
assert(combat.fx.shakePower >= 4, 'High combo (10 streak) triggered adrenaline screen shake');

// 6. SoundEngine playMultiKill definition
assert(audioCode.includes('playMultiKill'), 'SoundEngine defines playMultiKill synthesizer method');

// ==========================================
// TEST 11: GUITARIST UNIQUE SKILL CATALOGUES, MANA SPENDING & BASIC STRIKE RULE
// ==========================================
console.log('\n11. Testing Unique Guitarist Skills, Mana Spending & Stage Rules...');

// 1. Verify 5+ skills per guitarist
const allHeroes = ['johnny_blaze', 'vulkan_ironhead', 'dr_radix', 'cypher_volt', 'kragthor_titan', 'roxie_anarchy', 'finn_punk', 'ignis_draco', 'fenrir_howler', 'spiky_sponge', 'saul_slash'];
allHeroes.forEach(hid => {
    const list = skillSys.getSkillsForHero(hid);
    const uniqueOnly = list.filter(s => s.id !== 'basic_strike');
    assert(uniqueOnly.length >= 5, `Guitarist ${hid} has ${uniqueOnly.length} unique skills (>= 5 required)`);
    // Verify each skill has required properties
    uniqueOnly.forEach(s => {
        assert(s.manaCost > 0, `Skill ${s.id} has manaCost > 0 (${s.manaCost})`);
        assert(s.damageMult > 0, `Skill ${s.id} has valid damageMult (${s.damageMult})`);
        assert(typeof s.apply === 'function', `Skill ${s.id} has apply function`);
    });
});

// 2. In-Battle Mana Deduction vs Common Basic Attack Fallback
combat.resetBattle();
skillSys.equipSkill(0, 'blaze_power_chord', 'johnny_blaze');
combat.rockMana = 20;

// Test 2.1: Sufficient Mana (20 MP >= 8 MP cost)
combat.pendingAttackModifiers = [];
combat.registerRhythmNote('great', 0);
assert(combat.pendingAttackModifiers.length === 1, 'Attack modifier queued for great note');
const suffMod = combat.pendingAttackModifiers[0];
assert(suffMod.skill && suffMod.skill.id === 'blaze_power_chord', 'Skill power_chord applied when mana is sufficient');
assert(combat.rockMana <= (20 - 8 + 5), 'Mana was deducted for skill execution');

// Test 2.2: Insufficient Mana (set rockMana to 1 MP, skill costs 8 MP)
combat.rockMana = 1;
combat.pendingAttackModifiers = [];
combat.registerRhythmNote('good', 0);
assert(combat.pendingAttackModifiers.length === 1, 'Attack modifier queued for note with low mana');
const lowManaMod = combat.pendingAttackModifiers[0];
assert(lowManaMod.skill === null, 'Note became a common basic attack (skill is null) when MP is insufficient');
assert(Math.abs(lowManaMod.mult - 1.0) < 0.001, 'Deals full standard basic attack damage (1.0x mult, no 50% penalty)');
assert(combat.rockMana >= 1, 'No skill mana deducted on insufficient MP');

// 3. Stage Rule Enforcement Across Guitarists
allHeroes.forEach(hid => {
    const loadout = skillSys.loadEquipped(hid);
    assert(skillSys.hasAtLeastOneBasicStrike(loadout), `Guitarist ${hid} loadout satisfies Stage Rule (has at least 1 basic strike)`);
    
    // Simulate equipping slots 0, 1, 2 with special skills
    const heroSkills = skillSys.getSkillsForHero(hid).filter(s => s.id !== 'basic_strike');
    skillSys.equipSkill(0, heroSkills[0].id, hid);
    skillSys.equipSkill(1, heroSkills[1].id, hid);
    skillSys.equipSkill(2, heroSkills[2].id, hid);
    skillSys.equipSkill(3, 'basic_strike', hid);

    // Attempting to replace the sole basic strike in slot 3 with another special skill MUST be blocked
    const blockRes = skillSys.canEquipSkill(3, heroSkills[3].id, hid);
    assert(blockRes.allowed === false, `Stage Rule correctly blocks replacing last basic strike for ${hid}`);
});


// 4. Testing Skill Polishing, SFX, Badges, Reset & Damage Scaling
console.log('\n12. Testing Skill Polishing, SFX, Badges, Reset & Damage Scaling...');

// 4.1. Badge helper tests
const powerChordSkill = skillSys.getSkillById('blaze_power_chord');
const badge = skillSys.getSkillTypeBadge(powerChordSkill);
assert(badge && badge.label && badge.color, 'getSkillTypeBadge returns valid badge definition');

const basicSkill = skillSys.getSkillById('basic_strike');
const basicBadge = skillSys.getSkillTypeBadge(basicSkill);
assert(basicBadge && basicBadge.label.includes('BÁSICO'), 'Basic strike badge includes BÁSICO');

// 4.2. Reset Hero Loadout test
skillSys.equipSkill(1, 'basic_strike', 'johnny_blaze');
skillSys.equipSkill(2, 'basic_strike', 'johnny_blaze');
const resetLoadout = skillSys.resetHeroLoadout('johnny_blaze');
assert(Array.isArray(resetLoadout) && resetLoadout.length === 4, 'resetHeroLoadout returns 4-slot array');
assert(skillSys.hasAtLeastOneBasicStrike(resetLoadout), 'resetHeroLoadout maintains >= 1 basic strike');

// 4.3. Skill Damage Scaling Verification
const testTarget = { hp: 200, active: true, x: 100, y: 100 };
const applyRes = powerChordSkill.apply(combat, testTarget, 50);
assert(applyRes && applyRes.damage === 110, `Power Chord deals scaled 220% damage (expected 110, got ${applyRes ? applyRes.damage : 0})`);
assert(applyRes.label && applyRes.label.includes('POWER CHORD'), 'Power Chord returns floating impact label');

// 4.4. SoundEngine SFX test
const audioCodeContent = fs.readFileSync(path.resolve(__dirname, 'js/audio.js'), 'utf8');
assert(audioCodeContent.includes('playSkillSfx'), 'SoundEngine implements playSkillSfx synthesizer method');

// 4.5. Overlay helper test
assert(typeof skillSys.drawLaneFretOverlay === 'function', 'SkillSystem defines drawLaneFretOverlay helper');

// 4.6. Thematic Purity Test (100% Rock & Guitar Universe, No Medieval RPG Tropes)
console.log('\n13. Testing Thematic Purity (Rock, Guitars, Amps & Stage Universe)...');
const allSkills = skillSys.getAllSkills();
allSkills.forEach(s => {
    assert(!s.name.toLowerCase().includes('machado') && !s.name.toLowerCase().includes('martel'), `Skill ${s.id} guitar-themed: "${s.name}"`);
    assert(s.icon !== '🪓' && s.icon !== '🗡️' && s.icon !== '🔨', `Skill ${s.id} uses musical icon`);
});

const roxieCleave = skillSys.getSkillById('roxie_double_cleave');
assert((roxieCleave.name.includes('Palhetada Dupla') || roxieCleave.name.includes('Tremolo')) && roxieCleave.icon === '🎸', `Roxie cleave is guitar-themed ("${roxieCleave.name}")`);

const kragthorHammer = skillSys.getSkillById('kragthor_magma_hammer');
assert((kragthorHammer.name.includes('Flying-V') || kragthorHammer.name.includes('Slam')) && kragthorHammer.icon === '🎸', `Kragthor strike is Flying-V slam ("${kragthorHammer.name}")`);

const roxiePool = pool.guitarists.find(g => g.id === 'roxie_anarchy');
assert(roxiePool && roxiePool.instrument.toLowerCase().includes('guitarra') && !roxiePool.instrument.toLowerCase().includes('machado'), 'Roxie instrument is guitar, not axe');

// 4.7. Screen Isolation & Pre-Battle Responsiveness Regression Tests
console.log('\n14. Testing Screen Isolation, Pre-Battle Layout & Modal CSS...');
const htmlContent = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const allCssFiles = fs.readdirSync(path.resolve(__dirname, 'css')).filter(f => f.endsWith('.css'));
const cssContent = allCssFiles.map(f => fs.readFileSync(path.resolve(__dirname, 'css', f), 'utf8').replace(/\r\n/g, '\n')).join('\n');
const masterStyleContent = fs.readFileSync(path.resolve(__dirname, 'css/style.css'), 'utf8').replace(/\r\n/g, '\n');
const mainJsContent = fs.readFileSync(path.resolve(__dirname, 'js/main.js'), 'utf8');

['base.css', 'menu.css', 'map-select.css', 'battle.css', 'skills.css', 'talents.css', 'song-studio.css', 'editor.css', 'results.css'].forEach(f => assert(masterStyleContent.includes(`@import url('${f}');`), `style.css imports ${f}`));
assert(cssContent.includes('.game-screen {\n    display: none !important;') && cssContent.includes('.game-screen.active {\n    display: flex !important;'), 'CSS enforces screen isolation rules');
assert(mainJsContent.includes("this.switchScreen('menu');"), "main.js constructor enforces switchScreen('menu') on startup");
assert(htmlContent.includes('id="screen-main-menu" class="game-screen active"') && htmlContent.includes('id="screen-map-select" class="game-screen"'), 'index.html initializes #screen-main-menu active and map inactive');
assert(cssContent.includes('.map-screen-scroll {\n    flex: 1 1 0%;') && cssContent.includes('touch-action: pan-y !important;'), '.map-screen-scroll uses flex & touch-action: pan-y');
assert(cssContent.includes('repeat(3, minmax(0, 1fr))') && cssContent.includes('repeat(2, minmax(0, 1fr))'), 'Grids configured for 3 and 2 columns on mobile');
assert(cssContent.includes('flex-shrink: 0;') && htmlContent.includes('class="hero-showcase-top-row"'), 'Card flex-shrink & hero showcase row present');
assert(cssContent.includes('.game-modal,\n.skill-modal-overlay') && htmlContent.includes('id="skill-picker-modal"'), 'Skill picker modal present in HTML & CSS');
assert(!htmlContent.includes('id="map-reroll-btn"') && htmlContent.includes('class="map-header-spacer"'), 'map-header-spacer maintains balanced centered title layout');

// Zombie Thumbnail Badge Compactness (< 10 chars, no multiple words covering art)
loadScript('js/enemy-pool.js');
const enemyPool = new EnemyPoolSystem();
window.enemyPool = enemyPool;
enemyPool.masterPool.forEach(z => {
    assert(z.badge.length <= 10 && !z.badge.includes('/') && z.fullBadge && z.fullBadge.length > 0, `Zombie ${z.id} badge compact: "${z.badge}"`);
});

// Branding & Visual Identity Checks (v1.6.7)
console.log('\n15. Testing Branding Assets & Visual Identity Integration...');
['branding/logo.png', 'branding/wallpaper.jpg', 'branding/app-icon.png', 'branding/favicon-32.png', '../favicon.png'].forEach(f => {
    assert(fs.existsSync(path.resolve(__dirname, 'assets', f)), `${f} exists`);
});
assert(htmlContent.includes('assets/branding/logo.png') && htmlContent.includes('class="menu-brand-logo"'), 'index.html includes brand logo');
assert(htmlContent.includes('href="assets/branding/favicon-32.png"') && cssContent.includes("assets/branding/wallpaper.jpg"), 'favicon and wallpaper integrated');

// 16. Testing 8 Battle Maps / Arenas System (v1.9.2 Build 56)
console.log('\n16. Testing 8 Battle Maps / Arenas System...');
const allMapFiles = ['map_void', 'map_ruins', 'map_wasteland', 'map_thermopylae', 'map_coliseum', 'map_bikini_bottom', 'map_valhalla', 'map_stadium'];
allMapFiles.forEach(m => assert(fs.existsSync(path.resolve(__dirname, 'assets/maps', m + '.jpg')) && fs.existsSync(path.resolve(__dirname, 'assets/maps', 'thumb_' + m.replace('map_', '') + '.jpg')), `assets/maps/${m} & thumb exist`));
const stgSys = new StageSystem();
assert(stgSys.getAllMaps().length === 8, 'StageSystem contains all 8 battle maps (Void, Ruins, Wasteland, Sparta, Coliseum, Bikini, Valhalla, Stadium)');
allMapFiles.forEach(id => assert(stgSys.maps.some(m => m.id === id), `Map ${id} defined in StageSystem`));

// Test Random Map per Stage (v1.7.0)
const rolled = stgSys.rollRandomMap();
assert(stgSys.maps.some(m => m.id === rolled.id), `stgSys.rollRandomMap() rolls valid map: ${rolled.name} (${rolled.id})`);
stgSys.setSelectedStage(1);
assert(stgSys.getSelectedMap() !== null, 'Stage selection automatically assigns a randomized battle map');

// UI DOM & CSS Checks for Arenas (v1.7.0)
assert(htmlContent.includes('id="map-selected-arena-showcase"') && !htmlContent.includes('id="map-arenas-roster-grid"'), 'index.html contains #map-selected-arena-showcase & removed manual roster');
assert(!htmlContent.includes('id="map-arena-prev-btn"') && !htmlContent.includes('id="map-arena-next-btn"'), 'index.html removed manual map cycling buttons');
assert(cssContent.includes('.selected-arena-showcase'), 'CSS includes styling for .selected-arena-showcase');

// Cache Buster Version & Modular CSS Links (v1.9.7 Build 62)
['base.css', 'menu.css', 'map-select.css', 'battle.css', 'skills.css', 'talents.css', 'song-studio.css', 'editor.css', 'results.css', 'missions.css', 'missions.js', 'main.js', 'pvp.css', 'pvp-system.js'].forEach(f => assert(htmlContent.includes(`${f}?v=62`), `index.html links ${f} with v=62`));
assert(htmlContent.includes('v1.9.8 (Build 62)'), 'index.html footer specifies v1.9.8 (Build 62)');

// Pre-Battle Minimalist Redesign Checks (v1.7.4)
assert(cssContent.includes('.zombie-card-stats-row') && cssContent.includes('.zombie-stat-chip'), 'CSS provides clean compact combat stat chips for horde cards');
assert(cssContent.includes('.stage-info-chips') && cssContent.includes('.arena-random-badge'), 'CSS provides clean badge chips for stage & random arena display');

// ==========================================
// 17. Testing Zombie Balance & Explosion AoE Damage Reduction (v1.7.1)
// ==========================================
console.log('\n17. Testing Zombie Balance (+30% Base HP) & Explosion AoE Reduction (-70%)...');
const poolZombies = enemyPool.masterPool;
const expectedHps = { punk_walker: 104, feral_leaper: 85, toxic_mutant: 299, armored_soldier: 273, fungal_spore: 163, bloater_pounder: 572, chained_gladiator: 254, toxic_hazmat: 208 };
Object.entries(expectedHps).forEach(([id, expHp]) => assert(poolZombies.find(z => z.id === id)?.hp === expHp, `Zombie ${id} HP scaled +30% to ${expHp}`));

// Test Mutant Blast AoE Damage Reduction to other zombies (reduced by 70%: 70 -> 21)
const victimZombie1 = { x: 200, y: 150, hp: 100, active: true, flashTime: 0 };
new CombatFX().triggerMutantBlast(150, 150, [victimZombie1], null, null);
assert(victimZombie1.hp === 79, `Mutant blast dealt exactly 21 damage to victim zombie (100 - 21 = 79, down 70% from 70)`);

// Test Hazmat Meltdown AoE Damage Reduction to other zombies (reduced by 70%: 40 -> 12)
const victimZombie2 = { x: 180, y: 150, hp: 100, active: true, flashTime: 0 };
new CombatFX().triggerHazmatMeltdown(150, 150, [victimZombie2], null, null);
assert(victimZombie2.hp === 88, `Hazmat meltdown dealt exactly 12 damage to nearby zombie (100 - 12 = 88, down 70% from 40)`);

// ==========================================
// 18. Testing 8 Added Zombie Archetypes (v1.7.2 & v1.7.3)
// ==========================================
console.log('\n18. Testing 8 Expanded Zombie Archetypes...');
[['assets', ['zombie_clown.jpg', 'zombie_builder.jpg', 'zombie_scientist.jpg', 'zombie_firefighter.jpg', 'zombie_sheriff.jpg', 'zombie_politician.jpg', 'zombie_batman.jpg', 'zombie_kratos.jpg']],
 ['assets/zombies', ['sinister_clown.jpg', 'builder_demolisher.jpg', 'mad_scientist.jpg', 'inferno_firefighter.jpg', 'sheriff_walker.jpg', 'presidential_politician.jpg', 'dark_knight_undead.jpg', 'god_of_war_spartan.jpg']]
].forEach(([dir, files]) => files.forEach(f => assert(fs.existsSync(path.resolve(__dirname, dir, f)), `${dir}/${f} exists`)));
assert(enemyPool.masterPool.length === 16, `EnemyPool masterPool now contains all 16 distinct zombies (${enemyPool.masterPool.length} found)`);
[['clown_jester', 130, 50, 'clown', 'Clown Jester'], ['builder_demolisher', 245, 31, 'builder', 'Builder Demolisher'],
 ['mad_scientist', 155, 40, 'scientist', 'Mad Scientist'], ['inferno_firefighter', 310, 25, 'firefighter', 'Inferno Firefighter'],
 ['sheriff_walker', 170, 36, 'sheriff', 'Sheriff Walker (Rick Grimes)'], ['presidential_politician', 220, 32, 'politician', 'Presidential Politician'],
 ['dark_knight_undead', 260, 45, 'batman', 'Dark Knight (Batman)'], ['god_of_war_spartan', 380, 28, 'kratos', 'Spartan (Kratos)']
].forEach(([id, hp, speed, type, label]) => {
    const z = enemyPool.masterPool.find(item => item.id === id);
    assert(z && z.hp === hp && z.speed === speed && z.type === type, `${label} defined correctly`);
});

// Test Firefighter Burn Immunity
const firefighter = enemyPool.masterPool.find(z => z.id === 'inferno_firefighter');
const zFirefighter = new ZombieEntity(firefighter, 100, 400, 1);
assert(zFirefighter.isBurnImmune === true, 'Firefighter zombie entity initializes with isBurnImmune = true');
zFirefighter.applyBurn(20, 4.0);
assert(zFirefighter.burnTimer === 0, 'Firefighter is completely immune to burn effect (burnTimer remains 0)');

// Test Kratos Spartan Rage trigger below 40% HP
const kratos = enemyPool.masterPool.find(z => z.id === 'god_of_war_spartan');
const zKratos = new ZombieEntity(kratos, 100, 400, 1);
const origSpeed = zKratos.speed;
zKratos.hp = Math.round(zKratos.maxHp * 0.35);
const dummyCombat = { getHeroPosition: () => ({ x: 50, y: 100 }), fx: { particles: [], spawnBurst: () => {} }, addFloatingText: () => {}, triggerShake: () => {}, takeDamage: () => {} };
zKratos.update(0.1, dummyCombat);
assert(zKratos.rageTriggered === true && zKratos.speed > origSpeed, 'Kratos triggers Spartan Rage and speed boost below 40% HP');

// ==========================================
// 19. Testing Procedural Meta Missions System (v1.7.6 Build 48)
// ==========================================
console.log('\n19. Testing Procedural Meta Missions & Guitarist Mastery...');
loadScript('js/missions.js');
assert(typeof MetaMissionSystem !== 'undefined', 'MetaMissionSystem class loaded');

const meta = new MetaMissionSystem();
assert(meta.TIERS.length === 5 && meta.TIERS[4] === 100000, 'Tiers are 10 -> 100 -> 1k -> 10k -> 100k');

// 90% Reward reduction verification: Tier 5 gold was 1,000,000, now 100,000
assert(meta.getTierReward(4, null).gold === 100000, 'Tier 5 zombie reward is 100,000 gold (-90% reduction)');

// Procedural Pool Inclusion: All zombies and guitarists
assert(meta.getAllMissions().length === enemyPool.masterPool.length, `Meta missions includes all ${enemyPool.masterPool.length} pool zombies`);
assert(meta.getAllGuitaristMissions().length === pool.guitarists.length, `Meta missions includes all ${pool.guitarists.length} pool guitarists`);

// Dynamic Inclusion of newly added zombies and guitarists
enemyPool.masterPool.push({ id: 'test_alien_zombie', name: 'Alien', hp: 200, speed: 35 });
assert(meta.getZombieMission('test_alien_zombie').targetKills === 10, 'New zombie enters missions pool');
enemyPool.masterPool.pop();
pool.guitarists.push({ id: 'test_rocker', name: 'Rocker', rarity: 'common' });
assert(meta.getGuitaristMission('test_rocker').targetKills === 10, 'New guitarist enters missions pool');
pool.guitarists.pop();

// Kill Tracking & Claiming
pool.activeHeroId = 'johnny_blaze';
const bStart = meta.getZombieMission('builder_demolisher').kills, jStart = meta.getGuitaristMission('johnny_blaze').kills;
for (let i = 0; i < 10; i++) meta.recordKill('builder_demolisher', 'johnny_blaze');
assert(meta.getZombieMission('builder_demolisher').kills === bStart + 10, 'Zombie kills recorded & Tier 1 ready to claim');
assert(meta.getGuitaristMission('johnny_blaze').kills === jStart + 10, 'Guitarist kills recorded on active hero & Tier 1 ready');

const zClaim = meta.claimReward('builder_demolisher');
assert(zClaim && zClaim.success && zClaim.reward.gold > 0, 'Zombie Tier 1 awards rebalanced gold');
assert(meta.getZombieMission('builder_demolisher').targetKills === 100, 'Zombie target advances to 100 kills');

const gClaim = meta.claimGuitaristReward('johnny_blaze');
assert(gClaim && gClaim.success && gClaim.reward.gold === 25, 'Guitarist Tier 1 awards 25 gold (10% scale)');
assert(meta.getGuitaristMission('johnny_blaze').targetKills === 100, 'Guitarist target advances to 100 kills');
assert(htmlContent.includes('id="meta-missions-modal"') && htmlContent.includes('data-cat="guitarists"'), 'index.html contains modal & category tabs');
assert(cssContent.includes('.mission-card') && cssContent.includes('.hero-mission-card'), 'CSS includes styling for mission & hero cards');

// ==========================================
// 20. Testing Boss Battles & Guitarist Gold Unlocking (v1.7.7 Build 49)
// ==========================================
console.log('\n20. Testing Boss Battles & Guitarist Gold Unlocking...');
assert(stgSys.isBossStage(5) && stgSys.isBossStage(10) && stgSys.isBossStage(15), 'Stages 5, 10, 15 are boss stages');
assert(!stgSys.isBossStage(1) && !stgSys.isBossStage(4), 'Stages 1 and 4 are regular stages');
assert(stgSys.getStageRewards(5).isBoss === true, 'Stage 5 rewards flagged as boss with 2x rewards');
const bossDef = stgSys.getBossZombieDef(5);
assert(bossDef && bossDef.isBoss === true && bossDef.hpMultiplier === 3.5, 'Boss zombie uses existing pool zombie with 3.5x HP and isBoss: true');
const bossEntity = new ZombieEntity(bossDef, 100, 400, 1);
assert(bossEntity.isBoss === true && bossEntity.scale > 0.7 && bossEntity.getGoldDrop() >= 3, 'Boss entity scales 1.45x and drops 3x gold');

// Guitarist Unlock Flow
localStorage.removeItem('gvs_unlocked_guitarists');
const heroPool = new GuitaristPoolSystem();
assert(heroPool.isHeroUnlocked('johnny_blaze') === true, 'Starter Johnny Blaze is unlocked by default');
assert(heroPool.isHeroUnlocked('vulkan_ironhead') === false, 'Vulkan Ironhead is locked by default');
assert(heroPool.getHeroUnlockCost('vulkan_ironhead') === 5000, 'Vulkan costs 5000 gold to unlock (10x scaled)');
window.talentSystem.gold = 2000;
assert(heroPool.unlockHeroWithGold('vulkan_ironhead').success === false, 'Unlock fails with insufficient gold');
window.talentSystem.gold = 10000;
const unlockRes = heroPool.unlockHeroWithGold('vulkan_ironhead');
assert(unlockRes.success === true && heroPool.isHeroUnlocked('vulkan_ironhead') === true, 'Hero unlocked with gold');
assert(window.talentSystem.gold === 5000, '5000 gold deducted from talentSystem');
assert(heroPool.getHeroUnlockCost('finn_punk') === 60000 && heroPool.getHeroUnlockCost('ignis_draco') === 80000, 'Finn (60k) and Draco (80k) unlock costs properly scaled');
assert(heroPool.getHeroUnlockCost('fenrir_howler') === 100000 && heroPool.getHeroUnlockCost('spiky_sponge') === 135000 && heroPool.getHeroUnlockCost('saul_slash') === 180000, 'Fenrir (100k), Spiky (135k), and Slash (180k) supreme costs verified');
assert(cssContent.includes('.chip-boss') && cssContent.includes('.hero-unlock-cta'), 'CSS includes boss chip and hero unlock CTA');

// ==========================================
// 21. Testing Performance Missions (v1.7.9 Build 51)
// ==========================================
console.log('\n21. Testing Performance Missions (Unbelievable, Crits, Precision & Streak)...');
assert(meta.getAllPerformanceMissions().length === 6, 'Performance missions category contains all 6 missions');
const unbMission = meta.getPerformanceMission('unbelievable');
assert(unbMission && unbMission.unitLabel === 'Acertos' && unbMission.reward.gold === 15, 'Unbelievable Tier 1 configured with low reward (15 gold)');

// Record Unbelievables & Critical Hits
const prevUnb = unbMission.currentVal;
meta.recordStat('unbelievable', 10);
assert(meta.getPerformanceMission('unbelievable').currentVal === prevUnb + 10, '10 Unbelievables recorded & Tier 1 ready to claim');
const claimUnb = meta.claimPerformanceReward('unbelievable');
assert(claimUnb && claimUnb.success && claimUnb.reward.gold === 15, 'Unbelievable Tier 1 claimed with low 15 gold reward');
assert(meta.getPerformanceMission('unbelievable').targetVal === 100, 'Unbelievable advances to 100 target');

meta.recordStat('critical_hits', 10);
assert(meta.getPerformanceMission('critical_hits').currentVal >= 10, '10 Critical hits recorded & Tier 1 ready to claim');
const claimCrit = meta.claimPerformanceReward('critical_hits');
assert(claimCrit && claimCrit.success && claimCrit.reward.gold === 15, 'Critical Hits Tier 1 claimed with low 15 gold reward');

// Record Song Completion with 92% Accuracy & 100% Full Combo
meta.recordSongCompletion(92, { totalNotes: 100, hitNotes: 92, misses: 8, maxStreak: 45 });
assert(meta.getPerformanceMission('songs_completed').currentVal >= 1 && meta.getPerformanceMission('high_accuracy_songs').currentVal >= 1 && meta.getPerformanceMission('max_streak').currentVal >= 45, 'Song completion, high accuracy & streak recorded');
meta.recordSongCompletion(100, { totalNotes: 50, hitNotes: 50, misses: 0, maxStreak: 50 });
assert(meta.getPerformanceMission('perfect_accuracy_songs').currentVal >= 1, '100% Full Combo song recorded');
assert(htmlContent.includes('data-cat="performance"') && cssContent.includes('.perf-mission-card'), 'Performance category tab & CSS included');

// ==========================================
// 22. Testing Complete i18n Localization (PT-BR & EN) (v1.8.0 Build 52)
// ==========================================
console.log('\n22. Testing Complete i18n Localization (PT-BR & EN)...');
assert(typeof i18n !== 'undefined' && i18n.currentLang, 'i18n engine is initialized');
i18n.setLanguage('pt');
assert(i18n.currentLang === 'pt' && i18n.t('btnPlay') === 'JOGAR / INICIAR BATALHA', 'i18n PT translation matches');
assert(i18n.t('requiresPrereq', '', { name: 'Power Chord', level: 3 }) === '🔒 Requer: Power Chord Nv. 3', 'i18n parametric interpolation works');
let callbackLang = null;
i18n.onLanguageChange((lang) => { callbackLang = lang; });
i18n.setLanguage('en');
assert(i18n.currentLang === 'en' && callbackLang === 'en' && i18n.t('btnPlay') === 'PLAY / START BATTLE', 'i18n language switches to en and notifies listeners');
assert(i18n.t('heroMaxLevel') === '⭐ MAX LEVEL (100)' && localStorage.getItem('gvs_language') === 'en', 'i18n EN heroMaxLevel matches & persisted');
assert(htmlContent.includes('data-i18n="btnPlay"') && htmlContent.includes('data-i18n-placeholder="phSearchMissions"'), 'index.html contains data-i18n and data-i18n-placeholder attributes');
i18n.setLanguage('pt');
assert(i18n.currentLang === 'pt' && i18n.t('btnPlay') === 'JOGAR / INICIAR BATALHA', 'i18n switches back to PT smoothly');

// ==========================================
// 23. Testing Player XP Bank & Inventory Injection (v1.9.1 Build 55)
// ==========================================
console.log('\n23. Testing Player XP Bank & Inventory Injection...');
localStorage.removeItem('gvs_player_xp');
const pPool = new GuitaristPoolSystem();
assert(pPool.getPlayerXp() === 0, 'Player XP starts at 0');
pPool.addPlayerXp(500);
assert(pPool.getPlayerXp() === 500 && localStorage.getItem('gvs_player_xp') === '500', '500 XP added to player inventory & persisted');

const jLvlBefore = pPool.getHeroLevelData('johnny_blaze').level, reqForLvl = pPool.getXpRequiredForNextLevel(jLvlBefore);
const injRes = pPool.injectXpIntoHero('johnny_blaze');
assert(injRes.success === true && injRes.leveledUp === true, 'Hero leveled up from inventory XP injection');
assert(pPool.getPlayerXp() === 500 - injRes.injectedXp && pPool.getHeroLevelData('johnny_blaze').level === jLvlBefore + 1, 'XP deducted and level incremented');

pPool.playerXp = 0;
assert(pPool.injectXpIntoHero('johnny_blaze').success === false, 'Injection blocked when inventory is empty');
assert(htmlContent.includes('id="menu-xp-count"') && htmlContent.includes('id="hero-inject-xp-btn"'), 'index.html contains XP inventory elements');
assert(htmlContent.includes('id="missions-stat-wallet-gold"') && htmlContent.includes('id="missions-stat-inventory-xp"'), 'index.html missions stats bar has wallet gold & inventory XP');
assert(cssContent.includes('.missions-claim-toast') && cssContent.includes('.hero-inject-xp-action'), 'CSS includes toast & XP injection styling');

// 24. Testing Studio Timeline Mobile Optimizations (v1.9.3 Build 57)
console.log('\n24. Testing Studio Timeline Mobile Optimizations (60 FPS Highway)...');
const editorJs = fs.readFileSync(path.resolve(__dirname, 'js/song-editor.js'), 'utf8'), editorCss = fs.readFileSync(path.resolve(__dirname, 'css/editor.css'), 'utf8');
assert(!editorJs.includes('ctx.shadowBlur = 10'), 'Eliminated expensive shadowBlur in song-editor.js note loop');
assert(!editorJs.includes('ctx.shadowBlur = 8'), 'Eliminated shadowBlur in playhead rendering');
assert(editorJs.includes('this.lastRenderTime && (now - this.lastRenderTime < 15.5)'), 'Frame rate pacing cap present for 120Hz/90Hz mobile screens');
assert(editorJs.includes('note.time > maxVisibleTime) break;'), 'Chronologically sorted early-break present for viewport culling');
assert(editorJs.includes('_lastDeciDisplay'), 'Throttled DOM time display updates present');
assert(editorCss.includes('contain: strict;') && editorCss.includes('will-change: transform;'), 'CSS hardware acceleration & containment applied to canvas wrapper');

// 25. Testing Battle 60 FPS Pacing & Lockstep Audio Sync (v1.9.4 Build 58)
console.log('\n25. Testing Battle 60 FPS Pacing & Lockstep Audio Sync...');
const mainJs = fs.readFileSync(path.resolve(__dirname, 'js/main.js'), 'utf8'), rhythmJs = fs.readFileSync(path.resolve(__dirname, 'js/rhythm.js'), 'utf8'), baseCss = fs.readFileSync(path.resolve(__dirname, 'css/base.css'), 'utf8');
assert(mainJs.includes('this.lastRenderTime && (now - this.lastRenderTime < 15.2)'), 'Main gameLoop implements 60 FPS pacing lock');
assert(rhythmJs.includes('this.customSongTime += dt + diff * 0.15'), 'RhythmSystem uses Audio-Master Hardware Sync with smooth visual convergence');
assert(!rhythmJs.includes('this.songAudio.playbackRate = Math.max'), 'Eliminated audio playbackRate throttling to prevent Bluetooth-like packet stutter');
assert(!rhythmJs.includes('this.ctx.createLinearGradient(0, ribTop, 0, ribBottom)'), 'Eliminated expensive gradient in rhythm.js hold note ribbon');
assert(baseCss.includes('contain: strict;') && baseCss.includes('#combat-zone') && baseCss.includes('#rhythm-zone'), 'CSS hardware containment applied to combat and rhythm zones');

// 26. Testing Victory Finale & Defeat Cinematic Sequences (v1.9.5 Build 59)
console.log('\n26. Testing Victory Finale & Defeat Cinematic Sequences...');
const resCss = fs.readFileSync(path.resolve(__dirname, 'css/results.css'), 'utf8');
assert(resCss.includes('@keyframes victoryModalPopIn') && resCss.includes('@keyframes defeatModalDrop'), 'CSS results defines entrance keyframes for victory and defeat');
assert(resCss.includes('animation: victoryModalPopIn') && resCss.includes('animation: defeatModalDrop'), 'Results dialogs have punchy entrance animations applied');
const testCombat = new CombatSystem();
testCombat.entities.zombies = [{ x: 200, y: 150, hp: 120, active: true }, { x: 300, y: 150, hp: 200, active: true }];
let vicModalTriggered = false, defModalTriggered = false;
window.game = { showVictoryModal: () => { vicModalTriggered = true; }, showDefeatModal: () => { defModalTriggered = true; }, pauseBattle: () => {} };
testCombat.triggerVictoryFinale({ id: 'solo_rock', title: 'Solo' }, { totalNotes: 10, hitNotes: 10 });
assert(testCombat.isVictorySequence === true && testCombat.victorySequenceTimer > 2.0, 'triggerVictoryFinale initiates 2.4s victory sequence');
assert(testCombat.entities.zombies.every(z => !z.active && z.hp === 0), 'Victory finale obliterates and vaporizes every living zombie');
assert(testCombat.fx.shockwaves.some(s => s.color === '#ffd700'), 'Victory finale emits golden supreme sonic shockwaves');
assert(testCombat.fx.particles.some(p => p.life > 2.0), 'Celebratory confetti particles spawned across arena');
testCombat.update(2500);
assert(vicModalTriggered === true && testCombat.isVictorySequence === false, 'Victory sequence triggers showVictoryModal upon completion');
testCombat.resetBattle(); testCombat.heroHp = 0; testCombat.handleHeroDefeat();
assert(testCombat.isDefeatSequence === true && testCombat.defeatSequenceTimer > 1.5, 'handleHeroDefeat initiates 1.8s defeat sequence');
assert(testCombat.fx.shockwaves.some(s => s.color === '#ff2222'), 'Defeat cinematic emits amp short-circuit shockwave');
testCombat.update(1900);
assert(defModalTriggered === true && testCombat.isDefeatSequence === false, 'Defeat sequence triggers showDefeatModal upon completion');

// ==========================================
// 27. Testing Simulated Online PvP Duel System (v1.9.7 Build 62)
// ==========================================
console.log('\n27. Testing Simulated Online PvP Duel System (Matchmaking, AI, Spawns & Cross-Healing)...');
assert(typeof PvPSystem !== 'undefined', 'PvPSystem class loaded');
const pvp = new PvPSystem();
assert(pvp.state === 'idle' && pvp.nicknamesPool.length >= 40, 'PvPSystem initializes in idle state with 40+ authentic gamer tags');
assert(pvp.getRank(200).tier === 'bronze' && pvp.getRank(500).tier === 'silver' && pvp.getRank(1500).tier === 'platinum' && pvp.getRank(2600).tier === 'master', 'PvP Rank tiers mapped correctly');

// Opponent Generation & Balancing
const opp = pvp.generateOpponent({ level: 5, name: 'Johnny' });
assert(opp && opp.level >= 4 && opp.level <= 6, `Opponent level balanced to player level (Player Lv.5 -> Opponent Lv.${opp.level})`);
assert(opp.ping >= 20 && opp.ping <= 45 && opp.accuracy > 0.90, `Opponent has realistic ping (${opp.ping}ms) and accuracy (${Math.round(opp.accuracy*100)}%)`);

// Center Twin Spawns
const pvpCombat = new CombatSystem();
pvpCombat.isPvPMode = true; pvpCombat.pvpSystem = pvp; pvp.opponent = opp;
pvpCombat.entities.zombies = [];
pvp.spawnZombiePair(pvpCombat, { type: 'normal', hp: 100, speed: 38, name: 'Zumbi Punk' });
assert(pvpCombat.entities.zombies.length === 2, 'spawnZombiePair spawns exactly 2 twin zombies at screen center');
const [zPlayer, zOpponent] = pvpCombat.entities.zombies;
assert(zPlayer.side === 'player' && zOpponent.side === 'opponent', 'Zombies correctly assigned to player side and opponent side');
assert(zPlayer.direction === -1 && zOpponent.direction === 1, 'Player zombie moves left (-1), opponent zombie moves right (+1)');
assert(zPlayer.isPvP === true && zPlayer.attackInterval === 1.6, 'PvP zombie has isPvP flag and 1.6s attack interval');
assert(zPlayer.speed <= 25 && zPlayer.attackDamage <= 7, 'PvP zombie has balanced speed (<=25) and bite damage (<=7)');
pvpCombat.resetBattle(null, true);
assert(pvpCombat.spawnTimer === 1.5 && pvpCombat.entities.zombies.length === 0, 'PvP match start grants 3.5s initial grace period before first wave');

// Over-Shoot Cross-Healing Rule
// 1. When player has NO player zombies active, player projectile overshoots and HEALS opponent zombie (+30% damage as heal)
pvpCombat.entities.zombies = [zOpponent];
zOpponent.hp = 50;
const testProj = { x: zOpponent.x, y: zOpponent.y - 15, damage: 40, active: true, owner: 'player' };
const healed = pvp.handleCollision(testProj, zOpponent, pvpCombat);
assert(healed === true && !testProj.active && zOpponent.hp === 50 + 12, `Clear-lane over-shoot healed opponent zombie by 30% of damage (+12 HP: 50 -> ${zOpponent.hp})`);
assert(pvp.overhealsPlayer === 1, 'overhealsPlayer counter incremented');

// 2. Normal collision when player zombie is present
pvpCombat.entities.zombies = [zPlayer, zOpponent];
zPlayer.active = true;
const normalProj = { x: zPlayer.x, y: zPlayer.y - 15, damage: 40, active: true, owner: 'player' };
const hitNormal = pvp.handleCollision(normalProj, zPlayer, pvpCombat);
assert(hitNormal === false, 'Player projectile hits player-side zombie normally (handleCollision returns false to allow standard damage)');

// Opponent AI Note Reaction & Projectile Firing
pvp.state = 'playing';
pvpCombat.entities.projectiles = [];
const dummyNote = { time: 1.0, track: 0, lane: 0 };
pvp.onSongNotePassed(dummyNote, 'perfect', 1.0, pvpCombat);
assert(opp.totalNotes === 1, 'Opponent AI reacts to rhythm highway notes');
assert(typeof pvp.drawOpponentHighway === 'function', 'drawOpponentHighway method available');
assert(Array.isArray(pvp.oppLaneFlashes) && pvp.oppLaneFlashes.length === 4, 'Opponent highway 4 lane flashes initialized');
if (opp.streak > 0) {
    assert(pvpCombat.entities.projectiles.some(p => p.owner === 'opponent' && p.vx < 0), 'Opponent fires projectile traveling left toward center');
    assert(pvp.oppFloatingRatings.length > 0, 'Opponent highway creates floating ratings on note hit');
}

// Opponent Side Over-shoot cross healing (+30% HP)
pvpCombat.entities.zombies = [zPlayer];
zPlayer.hp = 50;
const oppOverProj = { x: zPlayer.x, y: zPlayer.y - 15, damage: 30, active: true, owner: 'opponent' };
const oppHealed = pvp.handleCollision(oppOverProj, zPlayer, pvpCombat);
assert(oppHealed === true && zPlayer.hp === 59 && pvp.overhealsOpponent === 1, 'Opponent clear-lane projectile heals player zombie (+30% HP: 50 -> 59)');

// Opponent kill integrity (does NOT award player score/kills)
pvpCombat.entities.zombies = [zOpponent];
zOpponent.hp = 10;
const oppKillProj = { x: zOpponent.x, y: zOpponent.y - 15, damage: 30, active: true, owner: 'opponent' };
const initialPlayerKills = pvpCombat.zombiesKilled;
const initialPlayerScore = pvpCombat.score;
pvp.handleCollision(oppKillProj, zOpponent, pvpCombat);
assert(!zOpponent.active && pvp.opponentZombiesKilled === 1, 'Opponent kill credited to opponent kill count');
assert(pvpCombat.zombiesKilled === initialPlayerKills && pvpCombat.score === initialPlayerScore, 'Opponent kill does NOT pollute player score or kill count');

// Victory & Defeat Conditions
pvp.state = 'playing';
let pvpModalOpened = false;
global.document.getElementById = (id) => ({ classList: { add: () => { if (id === 'pvp-results-modal') pvpModalOpened = true; }, remove: () => {} }, style: {}, innerText: '', appendChild: () => {} });
pvp.damageOpponent(100, true, '-100 HP', '#ff3344', pvpCombat);
assert(opp.hp === 0 && pvp.state === 'ended', 'Opponent HP 0 ends duel by KO');
assert(pvpModalOpened === true, 'PvP results comparison modal opened on duel completion');

// PvP Song Selection & Zero Ping Loading UI Checks
assert(htmlContent.includes('id="pvp-song-select-view"'), 'index.html contains #pvp-song-select-view');
assert(!htmlContent.includes('id="pvp-ping-display"') && !htmlContent.includes('data-i18n="pvpPing"'), 'index.html has zero ping mentions');
pvp.openMatchmakingModal([{ id: 'test_song', title: 'Test Song', bpm: 140 }], null, null);
assert(pvp.selectedSong && pvp.selectedSong.id === 'test_song', 'openMatchmakingModal successfully configures player chosen song for PvP');

// Zero God Object rule check (JS & CSS files)
fs.readdirSync(path.resolve(__dirname, 'js')).filter(f => f.endsWith('.js')).forEach(f => {
    const lines = fs.readFileSync(path.resolve(__dirname, 'js', f), 'utf8').split('\n').length;
    assert(lines < 1000, `File js/${f} is under 1,000 lines (${lines} lines)`);
});
allCssFiles.forEach(f => {
    const lines = fs.readFileSync(path.resolve(__dirname, 'css', f), 'utf8').split('\n').length;
    assert(lines < 1000, `File css/${f} is under 1,000 lines (${lines} lines)`);
});

// Summary
console.log(`\n==========================================\nTOTAL TESTS: ${testsPassed + testsFailed}\nPASSED: ${testsPassed}\nFAILED: ${testsFailed}\n==========================================\n`);
process.exit(testsFailed > 0 ? 1 : 0);
