package dungeonmania.mvp.Task2;

import dungeonmania.DungeonManiaController;
import dungeonmania.exceptions.InvalidActionException;
import dungeonmania.mvp.TestUtils;
import dungeonmania.response.models.BattleResponse;
import dungeonmania.response.models.DungeonResponse;
import dungeonmania.response.models.EntityResponse;
import dungeonmania.response.models.RoundResponse;
import dungeonmania.util.Direction;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

// ASSUMPTION - Whether midnight armour counts as a weapon when destroying
// zombie toast spawners is undefined.

public class MidnightArmourTest {
    @Test
    @Tag("18-0-1")
    @DisplayName("Can be crafted with (1 sword + 1 sun stone) if there are no zombies currently in the dungeon.")
    public void testCraft() {
        //  W   W   W   W
        //  P   W       W
        //      W   D   W
        //          K
        DungeonManiaController dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_MidnightArmour_NoSpawn", "c_MidnightArmour_noSpawn");
        assertEquals(0, getZombies(res).size());
        res = dmc.tick(Direction.DOWN);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        res = dmc.tick(Direction.DOWN);
        assertEquals(1, TestUtils.getInventory(res, "sword").size());
        res = assertDoesNotThrow(() -> dmc.build("midnight_armour"));
    }

    @Test
    @Tag("18-0-2")
    @DisplayName("Can be crafted with (1 sword + 1 sun stone) if there are no zombies currently in the dungeon.")
    public void testTreasureCannotReplaceSunStone() {
        //  W   W   W   W
        //  P   W       W
        //      W   D   W
        //          K
        DungeonManiaController dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_MidnightArmour_NoSpawnTwo", "c_MidnightArmour_noSpawn");
        assertEquals(0, getZombies(res).size());
        res = dmc.tick(Direction.DOWN);
        assertEquals(1, TestUtils.getInventory(res, "treasure").size());
        res = dmc.tick(Direction.DOWN);
        assertEquals(1, TestUtils.getInventory(res, "sword").size());
        assertThrows(InvalidActionException.class, () -> dmc.build("midnight_armour"));

    }

    @Test
    @Tag("18-1")
    @DisplayName("Test armour reduces enemy attack")
    public void testArmourReducesEnemyAttack() {
        DungeonManiaController dmc = new DungeonManiaController();
        String config = "c_MidnightArmour_defenceTest";
        DungeonResponse res = dmc.newGame("d_MidnightArmour_defenceTest", config);

        // Pick up Sword
        res = dmc.tick(Direction.RIGHT);

        // Pick up SunStone
        res = dmc.tick(Direction.RIGHT);
        res = dmc.tick(Direction.RIGHT);

        // Pick up Key
        res = dmc.tick(Direction.RIGHT);

        assertEquals(1, TestUtils.getInventory(res, "sword").size());
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        assertEquals(1, TestUtils.getInventory(res, "key").size());

        res = assertDoesNotThrow(() -> dmc.build("midnight_armour"));

        res = dmc.tick(Direction.RIGHT);

        BattleResponse battle = res.getBattles().get(0);

        RoundResponse firstRound = battle.getRounds().get(0);

        // Assumption: Shield effect calculation to reduce damage makes enemyAttack =
        // enemyAttack - shield effect
        int enemyAttack = Integer.parseInt(TestUtils.getValueFromConfigFile("spider_attack", config));
        int shieldEffect = Integer.parseInt(TestUtils.getValueFromConfigFile("shield_defence", config));
        int expectedDamage = (enemyAttack - shieldEffect) / 10;
        // Delta health is negative so take negative here
        assertEquals(expectedDamage, -firstRound.getDeltaCharacterHealth(), 0.001);
    }

    @Test
    @Tag("18-2")
    @DisplayName("Can be crafted with (1 sword + 1 sun stone) if there are no zombies currently in the dungeon.")
    public void testCannotCraftIfZombie() {
        //  W   W   W   W
        //  P   W   Z   W
        //      W   D   W
        //          K
        DungeonManiaController dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_MidnightArmour_ZombieTest", "c_MidnightArmour_zombieSpawn");
        assertEquals(1, getZombies(res).size());
        res = dmc.tick(Direction.DOWN);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        res = dmc.tick(Direction.DOWN);
        assertEquals(1, TestUtils.getInventory(res, "sword").size());
        assertThrows(InvalidActionException.class, () -> dmc.build("midnight_armour"));

    }

    @Test
    @Tag("18-3")
    @DisplayName("Midnight armour provides extra attack damage as well as protection")
    public void testIncreasedAttackDamage() {
        DungeonManiaController dmc = new DungeonManiaController();
        String config = "c_MidnightArmour_sword";
        dmc.newGame("d_MidnightArmour_sword", config);
        // Pick up sword
        DungeonResponse res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sword").size());

        // Pick up the sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        res = assertDoesNotThrow(() -> dmc.build("midnight_armour"));
        res = dmc.tick(Direction.RIGHT);

        res = dmc.tick(Direction.RIGHT);
        List<BattleResponse> battles = res.getBattles();
        BattleResponse battle = battles.get(0);

        // This is the attack without the sword
        double playerBaseAttack = Double.parseDouble(TestUtils.getValueFromConfigFile("player_attack", config));
        double armourAttack = Double.parseDouble(TestUtils.getValueFromConfigFile("midnight_armour_attack", config));

        RoundResponse firstRound = battle.getRounds().get(0);

        assertEquals((playerBaseAttack + armourAttack) / 5, -firstRound.getDeltaEnemyHealth(), 0.001);
    }

    @Test
    @Tag("18-4")
    @DisplayName("Midnight armour should last forever")
    public void testArmourLastsForever() {
        //  W   W   W   W
        //  P   W       W
        //      W   D   W
        //          K
        DungeonManiaController dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_MidnightArmour_NoSpawn", "c_MidnightArmour_noSpawn");
        assertEquals(0, getZombies(res).size());
        res = dmc.tick(Direction.DOWN);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        res = dmc.tick(Direction.DOWN);
        assertEquals(1, TestUtils.getInventory(res, "sword").size());
        res = assertDoesNotThrow(() -> dmc.build("midnight_armour"));
        assertEquals(1, TestUtils.getInventory(res, "midnight_armour").size());
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        assertEquals(1, TestUtils.getInventory(res, "midnight_armour").size());
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        assertEquals(1, TestUtils.getInventory(res, "midnight_armour").size());
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        assertEquals(1, TestUtils.getInventory(res, "midnight_armour").size());
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        res = dmc.tick(Direction.DOWN);
        res = dmc.tick(Direction.UP);
        assertEquals(1, TestUtils.getInventory(res, "midnight_armour").size());

    }

    @Test
    @Tag("18-0-2")
    @DisplayName("Can be crafted with (1 sword + 1 sun stone) after killing only zombie.")
    public void testArmourCreatedAfterKillingZombie() {
        DungeonManiaController dmc = new DungeonManiaController();
        String config = "c_MidnightArmour_defenceTest";
        DungeonResponse res = dmc.newGame("d_MidnightArmour_defenceTest", config);

        // Pick up Sword
        res = dmc.tick(Direction.RIGHT);

        // Pick up SunStone
        res = dmc.tick(Direction.RIGHT);
        res = dmc.tick(Direction.RIGHT);

        // Pick up Key
        res = dmc.tick(Direction.RIGHT);

        assertEquals(1, TestUtils.getInventory(res, "sword").size());
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        assertEquals(1, TestUtils.getInventory(res, "key").size());

        res = assertDoesNotThrow(() -> dmc.build("midnight_armour"));

        res = dmc.tick(Direction.RIGHT);

        BattleResponse battle = res.getBattles().get(0);

        RoundResponse firstRound = battle.getRounds().get(0);

        // Assumption: Shield effect calculation to reduce damage makes enemyAttack =
        // enemyAttack - shield effect
        int enemyAttack = Integer.parseInt(TestUtils.getValueFromConfigFile("spider_attack", config));
        int shieldEffect = Integer.parseInt(TestUtils.getValueFromConfigFile("shield_defence", config));
        int expectedDamage = (enemyAttack - shieldEffect) / 10;
        // Delta health is negative so take negative here
        assertEquals(expectedDamage, -firstRound.getDeltaCharacterHealth(), 0.001);
    }

    private List<EntityResponse> getZombies(DungeonResponse res) {
        return TestUtils.getEntities(res, "zombie_toast");
    }
}
