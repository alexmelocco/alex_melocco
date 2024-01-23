package dungeonmania.mvp.Task2;

import dungeonmania.DungeonManiaController;
import dungeonmania.exceptions.InvalidActionException;
import dungeonmania.mvp.TestUtils;
import dungeonmania.response.models.DungeonResponse;
import dungeonmania.util.Direction;
import dungeonmania.util.Position;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class SunStoneTest {
    // DESCRIPTION - it is classed as treasure it counts towards the treasure goal
    @Test
    @Tag("16-1")
    @DisplayName("Test treasure goal can be met using SunStones")
    public void testSimpleTreasureGoal() {
        DungeonManiaController dmc;
        dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SunStoneTest_testSimpleGoal", "c_basicGoalsTest_treasure");

        // move player to right
        res = dmc.tick(Direction.RIGHT);

        // assert goal not met
        assertTrue(TestUtils.getGoals(res).contains(":treasure"));

        // collect sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        // assert goal not met
        assertTrue(TestUtils.getGoals(res).contains(":treasure"));

        // collect sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(2, TestUtils.getInventory(res, "sun_stone").size());

        // assert goal not met
        assertTrue(TestUtils.getGoals(res).contains(":treasure"));

        // collect sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(3, TestUtils.getInventory(res, "sun_stone").size());

        // assert goal met
        assertEquals("", TestUtils.getGoals(res));
    }

    @Test
    @Tag("16-2")
    @DisplayName("Test treasure goal can be met using both SunStones and treasure")
    public void testMixedTreasureGoal() {
        DungeonManiaController dmc;
        dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SunStoneTest_testMixedGoal", "c_basicGoalsTest_treasure");

        // move player to right
        res = dmc.tick(Direction.RIGHT);

        // assert goal not met
        assertTrue(TestUtils.getGoals(res).contains(":treasure"));

        // collect sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        // assert goal not met
        assertTrue(TestUtils.getGoals(res).contains(":treasure"));

        // collect treasure
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "treasure").size());

        // assert goal not met
        assertTrue(TestUtils.getGoals(res).contains(":treasure"));

        // collect sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(2, TestUtils.getInventory(res, "sun_stone").size());

        // assert goal met
        assertEquals("", TestUtils.getGoals(res));
    }

    // DESCRIPTION - When used for opening doors, or when replacing another material such as
    // a key or treasure in building entities, it is retained after use.
    @Test
    @Tag("16-3")
    @DisplayName("Test sunstone in place of key")
    public void testSunstoneAsKey() {
        DungeonManiaController dmc;
        dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SunStoneTest_useSunStoneWalkThroughOpenDoor",
                "c_SunStoneTest_useSunStoneToWalkThroughOpenDoor");

        // pick up sunstone
        res = dmc.tick(Direction.RIGHT);
        Position pos = TestUtils.getEntities(res, "player").get(0).getPosition();
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        // walk through door and check sunstone is retained
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        assertNotEquals(pos, TestUtils.getEntities(res, "player").get(0).getPosition());

    }

    // ASSUMPTION - When trying to open a door with both a key and a sunstone in the player's inventory,
    // it is undefined which entity will be used.
    @Test
    @Tag("16-4")
    @DisplayName("Test sunstone in place of key with both key and sunstone")
    public void testSunstoneAsKeyWithKey() {
        DungeonManiaController dmc;
        dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SunStoneTest_useSunStoneWalkThroughOpenDoorWithKey",
                "c_SunStoneTest_useSunStoneToWalkThroughOpenDoor");

        // pick up key
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "key").size());

        // pick up sunstone
        res = dmc.tick(Direction.RIGHT);
        Position pos = TestUtils.getEntities(res, "player").get(0).getPosition();
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        // walk through door and check key is gone
        // SUNSTONE TAKES PRECEDENCE OVER KEY
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "key").size());
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        assertNotEquals(pos, TestUtils.getEntities(res, "player").get(0).getPosition());
    }

    // DESCRIPTION - Can be used to open doors, and can be used interchangeably with treasure
    // or keys when building entities
    // DESCRIPTION - When used for opening doors, or when replacing another material such as a key or
    //      treasure in building entities, it is retained after use.
    //             - Need to test for retention after use
    @Test
    @Tag("16-5")
    @DisplayName("Test whether build can occur with Sunstone")
    public void testSimpleBuild() {
        // not needed - done in the sceptre and armour buidling tests
    }

    // ASSUMPTION - Whether a sunstone is preferred over keys or treasure when building a
    // buildable item if both are available is undefined.
    @Test
    @Tag("16-6")
    @DisplayName("Test whether build can occur with Sunstone in presense of other equivalents")
    public void testBuildWithKeyTreasurePresent() {
        // not needed - done in the sceptre and armour buidling tests
    }

    // DESCRIPTION - it cannot be used to bribe mercenaries or assassins.
    @Test
    @Tag("16-7")
    @DisplayName("Test the sunstone cannot be used to bribe")
    public void testSunStoneCannotBribe() {
        //                                                          Wall     Wall     Wall    Wall    Wall
        // P1       P2/Treasure      P3/Treasure    P4/Treasure      M4       M3       M2     M1      Wall
        //                                                          Wall     Wall     Wall    Wall    Wall
        DungeonManiaController dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SunStoneTest_testSunStoneBribe", "c_SunStoneTest_bribeAmount");

        String mercId = TestUtils.getEntitiesStream(res, "mercenary").findFirst().get().getId();

        // pick up first treasure
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "").size());
        assertEquals(new Position(7, 1), getMercPos(res));

        // attempt bribe
        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId));

        assertEquals(1, TestUtils.getInventory(res, "treasure").size());

        // pick up second treasure
        res = dmc.tick(Direction.RIGHT);
        assertEquals(2, TestUtils.getInventory(res, "treasure").size());
        assertEquals(new Position(6, 1), getMercPos(res));

        // attempt bribe
        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId));
        assertEquals(2, TestUtils.getInventory(res, "treasure").size());

        // pick up third treasure - BUT ITS A SUNSTONE NOT A TREASURE
        res = dmc.tick(Direction.RIGHT);
        assertEquals(2, TestUtils.getInventory(res, "treasure").size());
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        assertEquals(new Position(5, 1), getMercPos(res));

        // achieve bribe
        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId));
        assertEquals(2, TestUtils.getInventory(res, "treasure").size());

    }

    // When used as a listed ingredient in crafting, it is consumed.
    @Test
    @Tag("16-8")
    @DisplayName("Test it is consumed if it is listed as an ingredient in crafting")
    public void testSunStoneConsumption() {
        // This test is not needed - will be tested in other tests that use sunstone
    }

    private Position getMercPos(DungeonResponse res) {
        return TestUtils.getEntities(res, "mercenary").get(0).getPosition();
    }
}
