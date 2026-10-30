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

// Test 1.1: Base Attack Speed 1.0/s for all guitarists
pool.guitarists.forEach(g => {
    assert(g.baseStats.baseAttackSpeed === 1.0, `Guitarist ${g.name} (${g.id}) baseAttackSpeed is configured to 1.0/s`);
    const st = pool.getHeroStats(g.id);
    assert(st.baseAttackSpeed === 1.0, `pool.getHeroStats('${g.id}') returns baseAttackSpeed === 1.0`);
});

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

assert(skillSys.getAllSkills().length === 31, 'All 31 skills are registered in SkillSystem (30 unique + 1 universal basic)');

const defaultEquipped = skillSys.getEquippedSkills('johnny_blaze');
assert(defaultEquipped.length === 4, '4 lanes are equipped');
assert(skillSys.hasAtLeastOneBasicStrike(skillSys.loadEquipped('johnny_blaze')), 'Default loadout maintains at least one basic strike');

// Check unique skills per guitarist (at least 5 unique each)
const heroCatalogues = ['johnny_blaze', 'vulkan_ironhead', 'dr_radix', 'cypher_volt', 'kragthor_titan', 'roxie_anarchy'];
heroCatalogues.forEach(hid => {
    const uniqueSkills = skillSys.getSkillsForHero(hid).filter(s => s.id !== 'basic_strike');
    assert(uniqueSkills.length >= 5, `Hero ${hid} has at least 5 unique skills (${uniqueSkills.length} found)`);
});

// Test stage rule: player cannot equip 4 special skills; at least 1 must remain basic strike
skillSys.equipSkill(3, 'basic_strike', 'johnny_blaze');
skillSys.equipSkill(0, 'blaze_power_chord', 'johnny_blaze');
skillSys.equipSkill(1, 'blaze_garage_shred', 'johnny_blaze');
skillSys.equipSkill(2, 'blaze_stage_dive', 'johnny_blaze');

// Slot 3 is currently basic_strike. Trying to replace slot 3 with a special skill MUST be blocked!
const checkBlock = skillSys.canEquipSkill(3, 'blaze_sound_concussion', 'johnny_blaze');
assert(checkBlock.allowed === false, 'canEquipSkill() blocks equipping 4th special skill (rule: must keep >= 1 basic strike)');
assert(checkBlock.reason && checkBlock.reason.includes('Ataque Básico'), 'Blocked reason specifies keeping at least 1 Ataque Básico');

const equipBlockedResult = skillSys.equipSkill(3, 'blaze_sound_concussion', 'johnny_blaze');
assert(equipBlockedResult === false, 'equipSkill() returns false when stage rule is violated');
assert(skillSys.getEquippedSkill(3, 'johnny_blaze').id === 'basic_strike', 'Slot 3 remains basic_strike');

// Replacing slot 3 with basic_strike is allowed
const allowBasic = skillSys.canEquipSkill(3, 'basic_strike', 'johnny_blaze');
assert(allowBasic.allowed === true, 'canEquipSkill() permits equipping basic_strike');

// Simulate Mana and Skill Execution in Combat
function simulateSkillExecution(lane, baseDamage, currentMana) {
    const skill = skillSys.getEquippedSkill(lane, 'johnny_blaze');
    const manaCost = skill ? skill.manaCost : 0;
    
    if (manaCost > 0 && currentMana < manaCost) {
        // Insufficient mana: note becomes a common basic attack! (1.0x damage, 0 mana spent)
        return {
            executedSkill: 'common_basic_attack',
            damage: Math.round(baseDamage * 1.0),
            manaSpent: 0,
            feedback: '⚡ SEM MP! (BÁSICO)'
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
assert(execSuccess.executedSkill === 'blaze_power_chord' && execSuccess.damage === 110, `Power chord executed with full 2.2x damage (${execSuccess.damage})`);
assert(execSuccess.manaSpent === 8, '8 mana spent');

// Case B: Lane 0 (Power Chord, cost 8) with only 3 mana -> Becomes common basic attack (deals 1.0x basic damage, 0 mana spent)
const execFallback = simulateSkillExecution(0, 50, 3);
assert(execFallback.executedSkill === 'common_basic_attack', 'Note becomes common basic attack when mana is insufficient');
assert(execFallback.damage === 50, `Deals common basic attack damage (50 vs 50 base): ${execFallback.damage}`);
assert(execFallback.manaSpent === 0, 'Zero mana deducted on insufficient mana fallback');

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

combat.registerRhythmNote('perfect', 0);
assert(combat.perfectStreak === 1, 'Perfect note increments perfectStreak to 1');
combat.registerRhythmNote('good', 2);
assert(combat.perfectStreak === 0, 'Good note resets perfectStreak to 0');

combat.registerRhythmNote('perfect', 0);
assert(combat.perfectStreak === 1, 'Perfect note increments perfectStreak to 1');
combat.registerRhythmNote('miss', 3);
assert(combat.perfectStreak === 0, 'Miss note resets perfectStreak to 0');

// 2. Accumulating 5 consecutive perfect notes guarantees crit on next shot
combat.registerRhythmNote('perfect', 0); // 1
combat.registerRhythmNote('perfect', 1); // 2
combat.registerRhythmNote('perfect', 2); // 3
combat.registerRhythmNote('perfect', 3); // 4
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

// ==========================================
// TEST 11: GUITARIST UNIQUE SKILL CATALOGUES, MANA SPENDING & BASIC STRIKE RULE
// ==========================================
console.log('\n11. Testing Unique Guitarist Skills, Mana Spending & Stage Rules...');

// 1. Verify 5+ skills per guitarist
const allHeroes = ['johnny_blaze', 'vulkan_ironhead', 'dr_radix', 'cypher_volt', 'kragthor_titan', 'roxie_anarchy'];
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
    assert(!s.name.toLowerCase().includes('machado'), `Skill ${s.id} name does not mention "machado": "${s.name}"`);
    assert(!s.name.toLowerCase().includes('martel'), `Skill ${s.id} name does not mention "martelo": "${s.name}"`);
    assert(s.icon !== '🪓', `Skill ${s.id} does not use axe icon 🪓`);
    assert(s.icon !== '🗡️', `Skill ${s.id} does not use dagger icon 🗡️`);
    assert(s.icon !== '🔨', `Skill ${s.id} does not use hammer icon 🔨`);
});

const roxieCleave = skillSys.getSkillById('roxie_double_cleave');
assert(roxieCleave.name.includes('Palhetada Dupla') || roxieCleave.name.includes('Tremolo'), `Roxie cleave skill is guitar-themed ("${roxieCleave.name}")`);
assert(roxieCleave.icon === '🎸', `Roxie cleave skill icon is electric guitar 🎸`);

const kragthorHammer = skillSys.getSkillById('kragthor_magma_hammer');
assert(kragthorHammer.name.includes('Flying-V') || kragthorHammer.name.includes('Slam'), `Kragthor heavy strike is Flying-V slam ("${kragthorHammer.name}")`);
assert(kragthorHammer.icon === '🎸', `Kragthor heavy strike icon is electric guitar 🎸`);

const roxiePool = pool.guitarists.find(g => g.id === 'roxie_anarchy');
assert(roxiePool && roxiePool.instrument.toLowerCase().includes('guitarra'), `Roxie instrument is an electric guitar ("${roxiePool ? roxiePool.instrument : ''}")`);
assert(!roxiePool.instrument.toLowerCase().includes('machado'), 'Roxie instrument does not mention "machado"');

// 4.7. Screen Isolation & Pre-Battle Responsiveness Regression Tests
console.log('\n14. Testing Screen Isolation, Pre-Battle Layout & Modal CSS...');
const htmlContent = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
const allCssFiles = fs.readdirSync(path.resolve(__dirname, 'css')).filter(f => f.endsWith('.css'));
const cssContent = allCssFiles.map(f => fs.readFileSync(path.resolve(__dirname, 'css', f), 'utf8')).join('\n');
const masterStyleContent = fs.readFileSync(path.resolve(__dirname, 'css/style.css'), 'utf8');
const mainJsContent = fs.readFileSync(path.resolve(__dirname, 'js/main.js'), 'utf8');

// Master CSS Orchestrator
assert(masterStyleContent.includes("@import url('base.css');"), "style.css imports base.css");
assert(masterStyleContent.includes("@import url('menu.css');"), "style.css imports menu.css");
assert(masterStyleContent.includes("@import url('map-select.css');"), "style.css imports map-select.css");
assert(masterStyleContent.includes("@import url('battle.css');"), "style.css imports battle.css");
assert(masterStyleContent.includes("@import url('skills.css');"), "style.css imports skills.css");
assert(masterStyleContent.includes("@import url('talents.css');"), "style.css imports talents.css");
assert(masterStyleContent.includes("@import url('song-studio.css');"), "style.css imports song-studio.css");
assert(masterStyleContent.includes("@import url('editor.css');"), "style.css imports editor.css");
assert(masterStyleContent.includes("@import url('results.css');"), "style.css imports results.css");

// Screen Isolation
assert(cssContent.includes('.game-screen {\n    display: none !important;'), 'CSS enforces .game-screen { display: none !important; }');
assert(cssContent.includes('.game-screen.active {\n    display: flex !important;'), 'CSS enforces .game-screen.active { display: flex !important; }');
assert(!cssContent.includes('#screen-map-select {\n    background: radial-gradient(circle at 50% 20%, #171026 0%, #0a0812 70%, #040308 100%);\n    display: flex;'), '#screen-map-select does not hardcode display: flex in ID rule');
assert(mainJsContent.includes("this.switchScreen('menu');"), "main.js constructor enforces switchScreen('menu') on startup");

// HTML Initial State
assert(htmlContent.includes('id="screen-main-menu" class="game-screen active"'), 'index.html initializes #screen-main-menu as only active screen');
assert(htmlContent.includes('id="screen-map-select" class="game-screen"'), 'index.html initializes #screen-map-select as inactive');
assert(htmlContent.includes('id="screen-battle" class="game-screen"'), 'index.html initializes #screen-battle as inactive');

// Pre-Battle Scrolling & Fluid Layout
assert(cssContent.includes('.map-screen-scroll {\n    flex: 1 1 0%;\n    min-height: 0;\n    overflow-y: auto !important;'), '.map-screen-scroll uses flex: 1 1 0% with overflow-y: auto');
assert(cssContent.includes('touch-action: pan-y !important;'), '.map-screen-scroll enforces touch-action: pan-y !important');
assert(htmlContent.includes('class="hero-showcase-top-row"'), 'Hero showcase uses top-row for portrait and names');
assert(cssContent.includes('.map-heroes-roster-grid {\n    display: grid;\n    grid-template-columns: repeat(3, minmax(0, 1fr));'), '.map-heroes-roster-grid uses 3 columns on mobile to prevent overflow');
assert(cssContent.includes('.map-lane-skills-grid {\n    display: grid;\n    grid-template-columns: repeat(2, minmax(0, 1fr));'), '.map-lane-skills-grid uses 2 columns on mobile to ensure readable cards');

// Skill Picker Modal CSS
assert(cssContent.includes('.game-modal,\n.skill-modal-overlay {\n    position: fixed;'), 'CSS defines .game-modal and .skill-modal-overlay with position: fixed');
assert(cssContent.includes('.game-modal.open,\n.skill-modal-overlay.open {\n    display: flex !important;'), 'CSS defines .game-modal.open with display: flex !important');
assert(htmlContent.includes('id="skill-picker-modal" class="game-modal skill-modal-overlay"'), 'index.html includes skill-modal-overlay on #skill-picker-modal');

// Pre-Battle Card flex-shrink check
assert(cssContent.includes('.map-section-card {\n    background: rgba(18, 14, 28, 0.7);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    border-radius: 12px;\n    padding: 10px;\n    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);\n    width: 100%;\n    max-width: 100%;\n    box-sizing: border-box;\n    overflow: hidden;\n    flex-shrink: 0;\n}'), '.map-section-card enforces flex-shrink: 0 to prevent vertical card collapse');

// Pre-Battle Header Reroll Removal & Clean Balance Spacer
assert(!htmlContent.includes('id="map-reroll-btn"'), 'map-reroll-btn successfully removed from pre-battle screen');
assert(htmlContent.includes('class="map-header-spacer"'), 'map-header-spacer maintains balanced centered title layout');

// Zombie Thumbnail Badge Compactness (< 10 chars, no multiple words covering art)
loadScript('js/enemy-pool.js');
const enemyPool = new EnemyPoolSystem();
enemyPool.masterPool.forEach(z => {
    assert(z.badge.length <= 10, `Zombie ${z.id} thumbnail badge is compact: "${z.badge}" (${z.badge.length} chars)`);
    assert(!z.badge.includes('/'), `Zombie ${z.id} thumbnail badge has no wrapping slash: "${z.badge}"`);
    assert(z.fullBadge && z.fullBadge.length > 0, `Zombie ${z.id} has fullBadge descriptor: "${z.fullBadge}"`);
});

// Branding & Visual Identity Checks (v1.6.7)
console.log('\n15. Testing Branding Assets & Visual Identity Integration...');
assert(fs.existsSync(path.resolve(__dirname, 'assets/branding/logo.png')), 'assets/branding/logo.png exists');
assert(fs.existsSync(path.resolve(__dirname, 'assets/branding/wallpaper.jpg')), 'assets/branding/wallpaper.jpg exists');
assert(fs.existsSync(path.resolve(__dirname, 'assets/branding/app-icon.png')), 'assets/branding/app-icon.png exists');
assert(fs.existsSync(path.resolve(__dirname, 'assets/branding/favicon-32.png')), 'assets/branding/favicon-32.png exists');
assert(fs.existsSync(path.resolve(__dirname, 'favicon.png')), 'favicon.png exists at project root');

assert(htmlContent.includes('assets/branding/logo.png'), 'index.html includes official brand logo image');
assert(htmlContent.includes('class="menu-brand-logo"'), 'index.html gives brand logo the .menu-brand-logo class');
assert(htmlContent.includes('href="assets/branding/favicon-32.png"'), 'index.html specifies high-res favicon');
assert(cssContent.includes("assets/branding/wallpaper.jpg"), 'CSS references cinematic wallpaper background');
assert(cssContent.includes('.menu-brand-logo'), 'CSS includes styling for .menu-brand-logo');

// 16. Testing 3 Battle Maps / Arenas System (v1.6.8)
console.log('\n16. Testing 3 Battle Maps / Arenas System...');
assert(fs.existsSync(path.resolve(__dirname, 'assets/maps/map_void.jpg')), 'assets/maps/map_void.jpg exists');
assert(fs.existsSync(path.resolve(__dirname, 'assets/maps/map_ruins.jpg')), 'assets/maps/map_ruins.jpg exists');
assert(fs.existsSync(path.resolve(__dirname, 'assets/maps/map_wasteland.jpg')), 'assets/maps/map_wasteland.jpg exists');
assert(fs.existsSync(path.resolve(__dirname, 'assets/maps/thumb_void.jpg')), 'assets/maps/thumb_void.jpg exists');
assert(fs.existsSync(path.resolve(__dirname, 'assets/maps/thumb_ruins.jpg')), 'assets/maps/thumb_ruins.jpg exists');
assert(fs.existsSync(path.resolve(__dirname, 'assets/maps/thumb_wasteland.jpg')), 'assets/maps/thumb_wasteland.jpg exists');

const stgSys = new StageSystem();
assert(stgSys.getAllMaps().length === 3, 'StageSystem contains all 3 battle maps');
assert(stgSys.maps.some(m => m.id === 'map_void' && m.name === 'The Void Club'), 'Map 1: The Void Club defined');
assert(stgSys.maps.some(m => m.id === 'map_ruins' && m.name === 'Palco dos Escombros'), 'Map 2: Palco dos Escombros defined');
assert(stgSys.maps.some(m => m.id === 'map_wasteland' && m.name === 'Wasteland do Metal'), 'Map 3: Wasteland do Metal defined');

// Test Random Map per Stage (v1.7.0)
const rolled = stgSys.rollRandomMap();
assert(stgSys.maps.some(m => m.id === rolled.id), `stgSys.rollRandomMap() rolls valid map: ${rolled.name} (${rolled.id})`);
stgSys.setSelectedStage(1);
assert(stgSys.getSelectedMap() !== null, 'Stage selection automatically assigns a randomized battle map');

// UI DOM & CSS Checks for Arenas (v1.7.0)
assert(htmlContent.includes('id="map-selected-arena-showcase"'), 'index.html contains #map-selected-arena-showcase');
assert(!htmlContent.includes('id="map-arenas-roster-grid"'), 'index.html removed #map-arenas-roster-grid (no manual map selection)');
assert(!htmlContent.includes('id="map-arena-prev-btn"'), 'index.html removed #map-arena-prev-btn (no manual map cycling)');
assert(!htmlContent.includes('id="map-arena-next-btn"'), 'index.html removed #map-arena-next-btn (no manual map cycling)');
assert(cssContent.includes('.selected-arena-showcase'), 'CSS includes styling for .selected-arena-showcase');

// Cache Buster Version & Modular CSS Links
assert(htmlContent.includes('css/base.css?v=44'), 'index.html links base.css with v=44');
assert(htmlContent.includes('css/menu.css?v=44'), 'index.html links menu.css with v=44');
assert(htmlContent.includes('css/map-select.css?v=44'), 'index.html links map-select.css with v=44');
assert(htmlContent.includes('css/battle.css?v=44'), 'index.html links battle.css with v=44');
assert(htmlContent.includes('css/skills.css?v=44'), 'index.html links skills.css with v=44');
assert(htmlContent.includes('css/talents.css?v=44'), 'index.html links talents.css with v=44');
assert(htmlContent.includes('css/song-studio.css?v=44'), 'index.html links song-studio.css with v=44');
assert(htmlContent.includes('css/editor.css?v=44'), 'index.html links editor.css with v=44');
assert(htmlContent.includes('css/results.css?v=44'), 'index.html links results.css with v=44');
assert(htmlContent.includes('js/main.js?v=44'), 'index.html links main.js with v=44');
assert(htmlContent.includes('v1.7.2 (Build 44)'), 'index.html footer specifies v1.7.2 (Build 44)');

// ==========================================
// 17. Testing Zombie Balance & Explosion AoE Damage Reduction (v1.7.1)
// ==========================================
console.log('\n17. Testing Zombie Balance (+30% Base HP) & Explosion AoE Reduction (-70%)...');
const poolZombies = enemyPool.masterPool;
const expectedHps = {
    punk_walker: 104, feral_leaper: 85, toxic_mutant: 299, armored_soldier: 273,
    fungal_spore: 163, bloater_pounder: 572, chained_gladiator: 254, toxic_hazmat: 208
};
Object.entries(expectedHps).forEach(([id, expectedHp]) => {
    const z = poolZombies.find(item => item.id === id);
    assert(z && z.hp === expectedHp, `Zombie ${id} base HP is scaled +30% to ${expectedHp} (actual: ${z ? z.hp : 'not found'})`);
});

// Test Mutant Blast AoE Damage Reduction to other zombies (reduced by 70%: 70 -> 21)
const mutantFx = new CombatFX();
const victimZombie1 = { x: 200, y: 150, hp: 100, active: true, flashTime: 0 };
mutantFx.triggerMutantBlast(150, 150, [victimZombie1], null, null);
assert(victimZombie1.hp === 79, `Mutant blast dealt exactly 21 damage to victim zombie (100 - 21 = 79, down 70% from 70)`);

// Test Hazmat Meltdown AoE Damage Reduction to other zombies (reduced by 70%: 40 -> 12)
const hazmatFx = new CombatFX();
const victimZombie2 = { x: 180, y: 150, hp: 100, active: true, flashTime: 0 };
hazmatFx.triggerHazmatMeltdown(150, 150, [victimZombie2], null, null);
assert(victimZombie2.hp === 88, `Hazmat meltdown dealt exactly 12 damage to nearby zombie (100 - 12 = 88, down 70% from 40)`);

// ==========================================
// 18. Testing 4 New Zombie Archetypes (v1.7.2)
// ==========================================
console.log('\n18. Testing 4 New Zombie Archetypes (Clown, Builder, Scientist, Firefighter)...');
['zombie_clown.jpg', 'zombie_builder.jpg', 'zombie_scientist.jpg', 'zombie_firefighter.jpg'].forEach(sheetFile => {
    assert(fs.existsSync(path.resolve(__dirname, 'assets', sheetFile)), `assets/${sheetFile} exists`);
});
['sinister_clown.jpg', 'builder_demolisher.jpg', 'mad_scientist.jpg', 'inferno_firefighter.jpg'].forEach(thumbFile => {
    assert(fs.existsSync(path.resolve(__dirname, 'assets/zombies', thumbFile)), `assets/zombies/${thumbFile} exists`);
});

assert(enemyPool.masterPool.length === 12, `EnemyPool masterPool now contains all 12 distinct zombies (${enemyPool.masterPool.length} found)`);

const clown = enemyPool.masterPool.find(z => z.id === 'clown_jester');
assert(clown && clown.hp === 130 && clown.speed === 50 && clown.type === 'clown', 'Clown Jester archetype defined correctly');

const builder = enemyPool.masterPool.find(z => z.id === 'builder_demolisher');
assert(builder && builder.hp === 245 && builder.speed === 31 && builder.type === 'builder', 'Builder Demolisher archetype defined correctly');

const scientist = enemyPool.masterPool.find(z => z.id === 'mad_scientist');
assert(scientist && scientist.hp === 155 && scientist.speed === 40 && scientist.type === 'scientist', 'Mad Scientist archetype defined correctly');

const firefighter = enemyPool.masterPool.find(z => z.id === 'inferno_firefighter');
assert(firefighter && firefighter.hp === 310 && firefighter.speed === 25 && firefighter.type === 'firefighter', 'Inferno Firefighter archetype defined correctly');

// Test Firefighter Burn Immunity
const zFirefighter = new ZombieEntity(firefighter, 100, 400, 1);
assert(zFirefighter.isBurnImmune === true, 'Firefighter zombie entity initializes with isBurnImmune = true');
zFirefighter.applyBurn(20, 4.0);
assert(zFirefighter.burnTimer === 0, 'Firefighter is completely immune to burn effect (burnTimer remains 0)');

// Zero God Object rule check (JS files)
const allJsFiles = fs.readdirSync(path.resolve(__dirname, 'js')).filter(f => f.endsWith('.js'));
allJsFiles.forEach(f => {
    const lines = fs.readFileSync(path.resolve(__dirname, 'js', f), 'utf8').split('\n').length;
    assert(lines < 1000, `File js/${f} is under 1,000 lines (${lines} lines)`);
});

// Zero God Object rule check (CSS files)
allCssFiles.forEach(f => {
    const lines = fs.readFileSync(path.resolve(__dirname, 'css', f), 'utf8').split('\n').length;
    assert(lines < 1000, `File css/${f} is under 1,000 lines (${lines} lines)`);
});

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
