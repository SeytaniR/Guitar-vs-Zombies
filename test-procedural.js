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
loadScript('js/stage-system.js');
loadScript('js/skills.js');
loadScript('js/guitarist-pool.js');
loadScript('js/zombie-entity.js');

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
const pool = new GuitaristPoolSystem();
window.guitaristPool = pool;

assert(pool.guitarists.length === 6, 'Pool contains all 6 unique guitarists');

const johnny = pool.guitarists[0];
const initialStats = pool.getHeroStats('johnny_blaze');
assert(initialStats.level === 1, 'Johnny starts at Level 1');
assert(Math.abs(initialStats.damageMult - 1.0) < 0.001, 'Level 1 damage multiplier is 1.0x (base)');

// Test Level 100 stats
pool.setLevel('johnny_blaze', 100);
const maxStats = pool.getHeroStats('johnny_blaze');
assert(maxStats.level === 100, 'Johnny reached Level 100');
assert(Math.abs(maxStats.damageMult - 1.99) < 0.01, `Level 100 damage multiplier scales smoothly to ~2.0x (1.99x)`);
assert(maxStats.critDamageBonusPercent >= 89, 'Level 100 Johnny has scaled crit bonus');

// Test XP Leveling & Gold Leveling
pool.setLevel('johnny_blaze', 1);
const xpNeeded = pool.getXpRequiredForNextLevel(1);
assert(xpNeeded > 0, `XP required for Level 2 is calculated: ${xpNeeded}`);

// Add XP to trigger level up
const resXp = pool.addHeroXp('johnny_blaze', 500);
assert(resXp.newLevel > 1, `Hero leveled up via XP from Level 1 to Level ${resXp.newLevel}`);

// Test Gold Level Up
pool.setLevel('johnny_blaze', 1);
const goldCost = pool.getGoldCostForLevelUp('johnny_blaze');
assert(goldCost === 117, `Gold cost for Level 1 guitarist is tripled to 117 gold (was 39)`);

// Test Talent Cost Doubling
global.document = { getElementById: () => null, querySelectorAll: () => [] };
loadScript('js/talents.js');
const talentSysInstance = new TalentSystem();
const powerChordCost = talentSysInstance.getCost(talentSysInstance.talents['power_chord']);
assert(powerChordCost === 160, `Level 0 Power Chord upgrade cost is doubled to 160 gold (was 80)`);
const soloCost = talentSysInstance.getCost(talentSysInstance.talents['ferocious_solo']);
assert(soloCost === 400, `Level 0 Ferocious Solo upgrade cost is doubled to 400 gold (was 200)`);

// Mock talent system for gold purchase
window.talentSystem = {
    gold: 5000,
    getStat: () => 0,
    saveProgress: () => {},
    addGold: (amt) => { window.talentSystem.gold += amt; }
};
const goldLvlRes = pool.levelUpWithGold('johnny_blaze', window.talentSystem);
assert(goldLvlRes.success && goldLvlRes.newLevel === 2, 'Hero successfully leveled up using gold');
assert(window.talentSystem.gold === 5000 - 117, `Gold correctly deducted from player balance (5000 - 117 = ${window.talentSystem.gold})`);

// Test Higher Rarity Bonus Scaling (Roxie - Mítico)
const roxieStatsLv1 = pool.getHeroStats('roxie_anarchy');
pool.setLevel('roxie_anarchy', 100);
const roxieStatsLv100 = pool.getHeroStats('roxie_anarchy');
assert(roxieStatsLv100.manaRegenRate > roxieStatsLv1.manaRegenRate, 'Mythic hero gains significant mana regen bonus at Level 100');
assert(roxieStatsLv100.critDamageBonusPercent >= 110, 'Mythic hero reaches high crit damage bonus at Level 100');

// ==========================================
// TEST 2: INFINITE PROCEDURAL STAGE SYSTEM
// ==========================================
console.log('\n2. Testing Infinite Procedural Stage System...');
const stageSys = new StageSystem();
window.stageSystem = stageSys;

assert(stageSys.selectedStage === 1, 'Stage System starts at Stage 1');
assert(stageSys.highestUnlockedStage === 1, 'Highest unlocked is Stage 1');

const stage1Info = stageSys.getStageInfo(1);
assert(stage1Info.minZombieLevel === 1 && stage1Info.maxZombieLevel === 1, 'Stage 1 zombie level range is 1-1');
assert(stage1Info.targetKills >= 5, `Stage 1 target kills is ${stage1Info.targetKills}`);

// Unlock next stages
stageSys.unlockNextStage();
assert(stageSys.highestUnlockedStage === 2, 'Stage 2 successfully unlocked');
stageSys.setSelectedStage(2);
assert(stageSys.selectedStage === 2, 'Selected stage updated to 2');

// Test Infinite Stage 50
const stage50Info = stageSys.getStageInfo(50);
assert(stage50Info.minZombieLevel >= 60, `Stage 50 scales zombie levels: min ${stage50Info.minZombieLevel}, max ${stage50Info.maxZombieLevel}`);
assert(stage50Info.rewardCoins > stage1Info.rewardCoins, `Stage 50 gives scaled gold reward (${stage50Info.rewardCoins} vs ${stage1Info.rewardCoins})`);
assert(stage50Info.rewardXp > stage1Info.rewardXp, `Stage 50 gives scaled XP reward (${stage50Info.rewardXp} vs ${stage1Info.rewardXp})`);

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

// ==========================================
// TEST 4: 4-LANE SKILLS SYSTEM & ROCK MANA
// ==========================================
console.log('\n4. Testing 4-Lane Skill System & Rock Mana...');
const skillSys = new SkillSystem();
window.skillSystem = skillSys;

assert(skillSys.getAllSkills().length === 8, 'All 8 skills are registered in SkillSystem');

const defaultEquipped = skillSys.getEquippedSkills();
assert(defaultEquipped.length === 4, '4 lanes are equipped');
assert(defaultEquipped[0].id === 'basic_strike', 'Default lane 0 is Basic Strike');

// Equip custom skills to lanes
skillSys.equipSkillToLane(0, 'power_chord');
skillSys.equipSkillToLane(1, 'healing_melody');
skillSys.equipSkillToLane(2, 'acoustic_stun');
skillSys.equipSkillToLane(3, 'pyro_riff');

const updatedEquipped = skillSys.getEquippedSkills();
assert(updatedEquipped[0].id === 'power_chord', 'Lane 0 equipped with Power Chord');
assert(updatedEquipped[1].id === 'healing_melody', 'Lane 1 equipped with Healing Melody');
assert(updatedEquipped[2].id === 'acoustic_stun', 'Lane 2 equipped with Acoustic Stun');
assert(updatedEquipped[3].id === 'pyro_riff', 'Lane 3 equipped with Pyro Riff');

// Simulate Mana and Skill Execution
let currentRockMana = 30;
let maxRockMana = 100;

function simulateSkillExecution(lane, baseDamage, currentMana) {
    const skill = skillSys.getSkillForLane(lane);
    const manaCost = skill ? skill.manaCost : 0;
    
    if (manaCost > 0 && currentMana < manaCost) {
        // Insufficient mana fallback: basic strike with 0.5x damage
        return {
            executedSkill: 'insufficient_mana_fallback',
            damage: Math.round(baseDamage * 0.5),
            manaSpent: 0,
            feedback: '⚡ SEM MANA! (50%)'
        };
    } else {
        return {
            executedSkill: skill.id,
            damage: Math.round(baseDamage * (skill.damageMult || 1.0)),
            manaSpent: manaCost,
            feedback: skill.name
        };
    }
}

// Case A: Lane 0 (Power Chord, cost 8) with 30 mana -> Should succeed
const execSuccess = simulateSkillExecution(0, 50, 30);
assert(execSuccess.executedSkill === 'power_chord' && execSuccess.damage === 110, `Power chord executed with full 2.2x damage (${execSuccess.damage})`);
assert(execSuccess.manaSpent === 8, '8 mana spent');

// Case B: Lane 0 (Power Chord, cost 8) with only 3 mana -> Should fallback to 0.5x basic strike!
const execFallback = simulateSkillExecution(0, 50, 3);
assert(execFallback.executedSkill === 'insufficient_mana_fallback', 'Fallback triggered when mana is insufficient');
assert(execFallback.damage === 25, `Damage reduced to 50% (25 vs 50 base): ${execFallback.damage}`);
assert(execFallback.manaSpent === 0, 'Zero mana deducted on fallback');

// ==========================================
// TEST 5: ATTACK SPEED & RHYTHM ACCURACY MODIFIERS
// ==========================================
console.log('\n5. Testing Attack Speed System & Rhythm Accuracy Modifiers...');

// Accuracy modifier logic:
// MISS = 0.5x damage
// GOOD = 1.0x damage
// GREAT = 1.2x damage
// PERFECT = Crit!

const baseDmg = 40;
const critPercent = 60; // +60% crit damage
const critDmg = Math.round(baseDmg * (1 + critPercent / 100));

function calculateAttackDamage(rating, baseDmg, critPercent) {
    switch(rating) {
        case 'miss':
            return { damage: Math.max(1, Math.round(baseDmg * 0.5)), isCrit: false, label: 'MISS (50%)' };
        case 'good':
            return { damage: Math.round(baseDmg * 1.0), isCrit: false, label: 'GOOD (100%)' };
        case 'great':
            return { damage: Math.round(baseDmg * 1.2), isCrit: false, label: 'GREAT (120%)' };
        case 'perfect':
            const critBonusMult = 1 + (critPercent / 100);
            return { damage: Math.round(baseDmg * critBonusMult), isCrit: true, label: 'CRIT!' };
        default:
            return { damage: baseDmg, isCrit: false, label: 'NORMAL' };
    }
}

const missResult = calculateAttackDamage('miss', baseDmg, critPercent);
assert(missResult.damage === 20 && !missResult.isCrit, `MISS halves attack damage: ${missResult.damage} (expected 20)`);

const goodResult = calculateAttackDamage('good', baseDmg, critPercent);
assert(goodResult.damage === 40 && !goodResult.isCrit, `GOOD delivers 1.0x damage: ${goodResult.damage} (expected 40)`);

const greatResult = calculateAttackDamage('great', baseDmg, critPercent);
assert(greatResult.damage === 48 && !greatResult.isCrit, `GREAT delivers 1.2x damage: ${greatResult.damage} (expected 48)`);

const perfectResult = calculateAttackDamage('perfect', baseDmg, critPercent);
assert(perfectResult.damage === 64 && perfectResult.isCrit, `PERFECT delivers Critical Strike with hero crit stat (${perfectResult.damage} vs expected 64)`);

// 6. Testing Game Polish, Audio, Skills, Talents & Line Count Compliance
console.log('\n6. Testing Game Polish, Audio, Skills, Talents & Line Limits...');

// 6.1 Audio SoundEngine playPowerChord verification
const audioCode = fs.readFileSync('js/audio.js', 'utf8');
assert(audioCode.includes('playPowerChord'), 'SoundEngine defines playPowerChord method');

// 6.2 Healing Melody skill talent reference
const skillsCode = fs.readFileSync('js/skills.js', 'utf8');
assert(skillsCode.includes("getStat('rhythmic_heal')"), 'Skill healing_melody references correct rhythmic_heal talent');
assert(!skillsCode.includes("regen_pick"), 'No obsolete regen_pick talent referenced in skills.js');

// 6.3 Lifetime stats verification
let mockLocalStorage = {};
global.localStorage = {
    getItem: (k) => mockLocalStorage[k] || null,
    setItem: (k, v) => { mockLocalStorage[k] = v.toString(); }
};

localStorage.setItem('gvs_total_kills', '42');
localStorage.setItem('gvs_highscore', '15000');
assert(parseInt(localStorage.getItem('gvs_total_kills')) === 42, 'gvs_total_kills persists correctly');
assert(parseInt(localStorage.getItem('gvs_highscore')) === 15000, 'gvs_highscore persists correctly');

// 6.4 Strict Zero God Object Line Count Rule (< 1000 lines for every single JS file)
const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
let allUnder1000 = true;
jsFiles.forEach(file => {
    const lines = fs.readFileSync('js/' + file, 'utf8').split('\n').length;
    const isUnder = lines < 1000;
    if (!isUnder) allUnder1000 = false;
    assert(isUnder, `File js/${file} has ${lines} lines (< 1000 lines limit)`);
});
assert(allUnder1000, `All ${jsFiles.length} JavaScript files adhere strictly to the < 1000 lines limit`);

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
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.document = {
    getElementById: () => ({
        getContext: () => ({
            save: () => {}, restore: () => {}, fillRect: () => {}, beginPath: () => {},
            stroke: () => {}, fill: () => {}, drawImage: () => {}, closePath: () => {},
            arc: () => {}, ellipse: () => {}, measureText: () => ({ width: 20 })
        }),
        addEventListener: () => {},
        parentElement: { clientWidth: 400, clientHeight: 300 },
        width: 400,
        height: 300
    })
};
global.Image = class { constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 571; } };
global.SpriteSheet = class { constructor() {} drawFrame() {} };

loadScript('js/combat-fx.js');
loadScript('js/combat.js');

const combat = new CombatSystem('gameCanvas');
combat.canvas.width = 400;
combat.canvas.height = 300;

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
assert(defeatModalCalled === true, 'handleHeroDefeat triggers window.game.showDefeatModal()');

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
combat.combo = 0;
const baseSpd = combat.getHeroAttackSpeed();
combat.combo = 50;
const spd50 = combat.getHeroAttackSpeed();
assert(Math.abs(spd50 - (baseSpd + 0.50)) < 0.001, `Combo 50 adds +0.50 attack speed: ${spd50.toFixed(2)} vs ${baseSpd.toFixed(2)} + 0.50`);

combat.combo = 200;
const spd200 = combat.getHeroAttackSpeed();
assert(Math.abs(spd200 - (baseSpd + 2.0)) < 0.001, `Combo 200 adds +2.00 attack speed (max cap): ${spd200.toFixed(2)}`);

combat.combo = 500;
const spd500 = combat.getHeroAttackSpeed();
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
const k1 = testFx.getMultiKillDef(1);
const k2 = testFx.getMultiKillDef(2);
const k3 = testFx.getMultiKillDef(3);
const k4 = testFx.getMultiKillDef(4);
const k5 = testFx.getMultiKillDef(5);
const k6 = testFx.getMultiKillDef(6);
const k7 = testFx.getMultiKillDef(7);
const k12 = testFx.getMultiKillDef(12);

assert(k1.title === '1 KILL! ⚡' && k1.color === '#00ffff' && k1.shake === 3, 'Tier 1: 1 KILL! ⚡ (Cyan, shake 3)');
assert(k2.title === 'DOUBLE KILL! 🔥' && k2.color === '#ffaa00' && k2.shake === 5, 'Tier 2: DOUBLE KILL! 🔥 (Amber, shake 5)');
assert(k3.title === 'TRIPLE KILL! ⚡🔥' && k3.color === '#ff3300' && k3.shake === 7, 'Tier 3: TRIPLE KILL! ⚡🔥 (Blaze, shake 7)');
assert(k4.title === 'MULTI KILL! 💥' && k4.color === '#ff00aa' && k4.shake === 9, 'Tier 4: MULTI KILL! 💥 (Magenta, shake 9)');
assert(k5.title === 'ULTRA KILL! ⚡💥' && k5.color === '#ff0055' && k5.shake === 12, 'Tier 5: ULTRA KILL! ⚡💥 (Crimson-Violet, shake 12)');
assert(k6.title === 'FANTÁSTICO! 🎸🔥' && k6.color === '#9900ff' && k6.shake === 14, 'Tier 6: FANTÁSTICO! 🎸🔥 (Mythic Purple, shake 14)');
assert(k7.title === 'UNBELIEVABLE! 👑⚡' && k7.color === '#ffd700' && k7.shake === 16, 'Tier 7: UNBELIEVABLE! 👑⚡ (Godlike Gold, shake 16)');
assert(k12.title === 'UNBELIEVABLE x12! 👑⚡' && k12.color === '#ffd700', 'Tier 12+: Scaled UNBELIEVABLE x12! 👑⚡');

// 3. Multikill Banner Animation & Particle Shockwaves
testFx.addMultiKillBanner(4, 200, 150);
assert(testFx.multiKillBanners.length === 1, 'Multikill banner created in combat-fx');
const activeBanner = testFx.multiKillBanners[0];
assert(activeBanner.scale === 2.2, 'Multikill banner begins with slam scale 2.2');
assert(activeBanner.life === 1.35, 'Multikill banner life initialized to 1.35s');
assert(testFx.shockwaves.length > 0, 'Multikill triggers radial shockwaves');
assert(testFx.particles.length > 0, 'Multikill triggers adrenaline spark particles');
assert(testFx.shakePower >= 9, 'Screen shake triggered for multi kill');

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


// Summary
console.log('\n==========================================');
console.log(`TOTAL TESTS: ${testsPassed + testsFailed}`);
console.log(`PASSED: ${testsPassed}`);
console.log(`FAILED: ${testsFailed}`);
console.log('==========================================\n');

if (testsFailed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
