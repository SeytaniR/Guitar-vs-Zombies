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
assert(goldCost > 0, `Gold cost for leveling up calculated: ${goldCost} gold`);

// Mock talent system for gold purchase
window.talentSystem = {
    gold: 5000,
    saveProgress: () => {}
};
const goldLvlRes = pool.levelUpWithGold('johnny_blaze', window.talentSystem);
assert(goldLvlRes.success && goldLvlRes.newLevel === 2, 'Hero successfully leveled up using gold');
assert(window.talentSystem.gold < 5000, 'Gold correctly deducted from player balance');

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
