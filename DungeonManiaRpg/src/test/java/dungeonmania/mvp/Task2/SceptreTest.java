package dungeonmania.mvp.Task2;

import dungeonmania.DungeonManiaController;
import dungeonmania.exceptions.InvalidActionException;
import dungeonmania.mvp.TestUtils;
import dungeonmania.response.models.DungeonResponse;
import dungeonmania.util.Direction;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class SceptreTest {

    // GOOD IDEA TO ADD MORE TESTS FOR DIFFERENT COMBINATIONS OF ITEMS INCLUDING DOUBLE SUNSTONES
    // - later on tho

    // ASSUMPTION - The behaviour of a sceptre after use is undefined
    @Test
    @Tag("17-1-1")
    @DisplayName("Can be crafted with (1 wood OR 2 arrows) + (1 key OR 1 treasure) + (1 sun stone)")
    public void testBasicCraft() {
        DungeonManiaController dmc;
        dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SceptreTest_buildSceptre", "c_SceptreTest_buildSceptre");

        assertEquals(0, TestUtils.getInventory(res, "wood").size());
        assertEquals(0, TestUtils.getInventory(res, "key").size());
        assertEquals(0, TestUtils.getInventory(res, "sun_stone").size());

        // Pick up Wood x1 and Sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "wood").size());
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        // Pick up Key
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "key").size());

        // Build Sceptre
        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());
        res = assertDoesNotThrow(() -> dmc.build("sceptre"));
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());

        // Materials used in construction disappear from inventory
        assertEquals(0, TestUtils.getInventory(res, "wood").size());
        assertEquals(0, TestUtils.getInventory(res, "key").size());
        // Sunstone consumed if listed for crafting
        assertEquals(0, TestUtils.getInventory(res, "sun_stone").size());

    }

    @Test
    @Tag("17-1-2")
    @DisplayName("Can be crafted with (1 wood OR 2 arrows) + (1 key OR 1 treasure) + (1 sun stone)")
    public void testSunStoneReplacesTreasure() {
        DungeonManiaController dmc;
        dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SceptreTest_buildSceptreMultiSunStone", "c_SceptreTest_buildSceptre");

        assertEquals(0, TestUtils.getInventory(res, "wood").size());
        assertEquals(0, TestUtils.getInventory(res, "sun_stone").size());

        // Pick up Wood x1 and Sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "wood").size());
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        // Pick up sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(2, TestUtils.getInventory(res, "sun_stone").size());

        // Build Sceptre
        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());
        res = assertDoesNotThrow(() -> dmc.build("sceptre"));
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());

        // Materials used in construction disappear from inventory
        assertEquals(0, TestUtils.getInventory(res, "wood").size());
        // Sunstone consumed if listed for crafting, but as replaces treasure not
        // listed for crafting (should not be consumed)
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

    }

    // DESCRIPTION - A character with a sceptre does not need to bribe mercenaries or assassins to
    // become allies, as they can use the sceptre to control their minds without any distance constraint
    // ASSUMPTION - When a mercenary or assassin can be bribed and mind controlled at the same time,
    // which action will be taken after the player interacts with them is undefined.
    @Test
    @Tag("17-2")
    @DisplayName("Test mind control + no distance constraint on mercenaries")
    public void testMindControlOnMercenaries() {
        //                                  Wall    Wall    Wall
        // P1       P2/Treasure      .      M2      M1      Wall
        //                                  Wall    Wall    Wall
        DungeonManiaController dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SceptreTest_allyBattle", "c_SceptreTest_allyBattle");
        String mercId = TestUtils.getEntitiesStream(res, "mercenary").findFirst().get().getId();

        // pick up wood
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "wood").size());

        // pick up key
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "key").size());

        // pick up sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());
        res = assertDoesNotThrow(() -> dmc.build("sceptre"));
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());

        // Interact - should make allied with sceptre - sceptre consumed
        res = assertDoesNotThrow(() -> dmc.interact(mercId));
        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());

        // walk into mercenary, a battle does not occur
        res = dmc.tick(Direction.RIGHT);
        assertEquals(0, res.getBattles().size());
    }

    @Test
    @Tag("17-3")
    @DisplayName("check that a previously bribed")
    public void testCannotMindControlBribedMercenary() {
        //                                              Wall     Wall     Wall    Wall    Wall       Wall   Wall
        // P1  P2/Treasure  P3/Wood  P4/Sunstone P5/Treasure     Empty    M5       M4       M3       M2     M1   Wall
        //                                               Wall     Wall     Wall    Wall    Wall      Wall   Wall
        DungeonManiaController dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SceptreTest_noMindControlBribe", "c_SceptreTest_noMindControlBribe");

        String mercId = TestUtils.getEntitiesStream(res, "mercenary").findFirst().get().getId();
        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId));

        // pick up first treasure
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "treasure").size());

        // bribe the cheap ass mf
        res = assertDoesNotThrow(() -> dmc.interact(mercId));
        assertEquals(0, TestUtils.getInventory(res, "treasure").size());

        // pick up wood
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "wood").size());

        // pick up SunStone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        // pick up key
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "treasure").size());

        // build sceptre
        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());
        res = assertDoesNotThrow(() -> dmc.build("sceptre"));
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());
        assertEquals(0, TestUtils.getInventory(res, "wood").size());
        assertEquals(0, TestUtils.getInventory(res, "sun_stone").size());
        assertEquals(0, TestUtils.getInventory(res, "treasure").size());

        // Assert cannot mind control
        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId));
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());
    }

    @Test
    @Tag("17-4")
    @DisplayName("Bribe during mind controlled retained")
    public void testBribePossibleDuringMindControl() {
        //                                              Wall     Wall     Wall    Wall    Wall       Wall   Wall
        // P1  P2/sunstone  P3/sunstone  P4/wood   P5/Treasure     Empty    M5       M4       M3       M2     M1   Wall
        //                                               Wall     Wall     Wall    Wall    Wall      Wall   Wall
        DungeonManiaController dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SceptreTest_MindControlBribe", "c_SceptreTest_noMindControlBribe");

        String mercId = TestUtils.getEntitiesStream(res, "mercenary").findFirst().get().getId();
        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId));

        // pick up first sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        // pick up sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(2, TestUtils.getInventory(res, "sun_stone").size());

        // pick up wood
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "wood").size());

        // build sceptre, one sun_stoneshould be retained
        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());
        res = assertDoesNotThrow(() -> dmc.build("sceptre"));
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());
        assertEquals(0, TestUtils.getInventory(res, "wood").size());
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        assertEquals(0, TestUtils.getInventory(res, "treasure").size());

        // mind control
        res = assertDoesNotThrow(() -> dmc.interact(mercId));
        assertEquals(0, TestUtils.getInventory(res, "wood").size());
        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());

        // pick up treasure
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "treasure").size());

        // bribe
        res = assertDoesNotThrow(() -> dmc.interact(mercId));
        assertEquals(0, TestUtils.getInventory(res, "treasure").size());

        // Assert cannot interact
        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId));

        // Two ticks left of mind control
        res = dmc.tick(Direction.LEFT);
        res = dmc.tick(Direction.RIGHT);
        assertEquals(0, res.getBattles().size());
        // mind control should be gone, but still should be allied

    }

    @Test
    @Tag("17-4-check")
    @DisplayName("Check 17-4 test attacks player if not bribed")
    public void test174TimeRunsOutIfNotBribed() {
        //                                              Wall     Wall     Wall    Wall    Wall       Wall   Wall
        // P1  P2/sunstone  P3/sunstone  P4/wood   P5/Treasure     Empty    M5       M4       M3       M2     M1   Wall
        //                                               Wall     Wall     Wall    Wall    Wall      Wall   Wall
        DungeonManiaController dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SceptreTest_MindControlBribe", "c_SceptreTest_noMindControlBribe");

        String mercId = TestUtils.getEntitiesStream(res, "mercenary").findFirst().get().getId();
        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId));

        // pick up first sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        // pick up sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(2, TestUtils.getInventory(res, "sun_stone").size());

        // pick up wood
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "wood").size());

        // build sceptre, one sun_stoneshould be retained
        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());
        res = assertDoesNotThrow(() -> dmc.build("sceptre"));
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());
        assertEquals(0, TestUtils.getInventory(res, "wood").size());
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        assertEquals(0, TestUtils.getInventory(res, "treasure").size());

        // mind control
        res = assertDoesNotThrow(() -> dmc.interact(mercId));
        assertEquals(0, TestUtils.getInventory(res, "wood").size());
        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());

        // pick up treasure but dont bribe
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "treasure").size());

        assertEquals(1, TestUtils.getInventory(res, "treasure").size());

        // Two ticks left of mind control
        res = dmc.tick(Direction.LEFT);
        assertEquals(0, res.getBattles().size());
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, res.getBattles().size());
        // mind control should be gone, but still should be allied

    }

    // ASSUMPTION - the behaviour when mind_control_duration is <= 0 is undefined.
    @Test
    @Tag("17-5")
    @DisplayName("Test mind control is temporary")
    public void testMindControlTemporary() {
        //                                  Wall    Wall    Wall
        // P1       P2/Treasure      .      M2      M1      Wall
        //                                  Wall    Wall    Wall
        DungeonManiaController dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SceptreTest_allyBattle", "c_SceptreTest_allyBattle");
        String mercId = TestUtils.getEntitiesStream(res, "mercenary").findFirst().get().getId();

        // pick up wood
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "wood").size());

        // pick up key
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "key").size());

        // pick up sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());
        res = assertDoesNotThrow(() -> dmc.build("sceptre"));
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());

        // Interact - should make allied with sceptre - sceptre consumed
        res = assertDoesNotThrow(() -> dmc.interact(mercId));
        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());

        // walk into mercenary, a battle does not occur
        res = dmc.tick(Direction.RIGHT);
        assertEquals(0, res.getBattles().size());

        res = dmc.tick(Direction.LEFT);
        assertEquals(0, res.getBattles().size());

        // Battle occurs after 3 ticks to 0
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, res.getBattles().size());

        // battle occurs
        res = dmc.tick(Direction.LEFT);
        assertEquals(1, res.getBattles().size());
    }

    @Test
    @Tag("17-6")
    @DisplayName("check multiple mercenaries mindControlled and have different times")
    public void testMultipleMindControl() {
        // THe diagram below has been changed in diagram to encapsulate Mercenaries in walls, but same idea
        // also not completely accurate but same jus longer
        //                                              Wall     Wall     Wall    Wall    Wall       Wall
        // P1  P2/sunstone  P3/sunstone  P4/wood   P5/Wood   P6/Sunstone  Empty     wall     M2  Wall (M1)  Wall
        //                                               Wall     Wall     Wall    Wall    Wall      Wall

        DungeonManiaController dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_SceptreTest_MultiMerc", "c_SceptreTest_multiMerc");

        String mercId1 = TestUtils.getFirstId(res, "mercenary");
        String mercId2 = TestUtils.getSecondId(res, "mercenary");
        assertEquals(2, TestUtils.getEntities(res, "mercenary").size());

        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId1));
        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId2));
        assert (!mercId1.equals(mercId2));

        // pick up first sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        // pick up sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(2, TestUtils.getInventory(res, "sun_stone").size());

        // pick up wood
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "wood").size());

        // build sceptre, one sun_stoneshould be retained
        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());
        res = assertDoesNotThrow(() -> dmc.build("sceptre"));
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());
        assertEquals(0, TestUtils.getInventory(res, "wood").size());
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());

        // pick up wood
        res = dmc.tick(Direction.RIGHT);
        assertEquals(1, TestUtils.getInventory(res, "wood").size());

        // pick up sunstone
        res = dmc.tick(Direction.RIGHT);
        assertEquals(2, TestUtils.getInventory(res, "sun_stone").size());
        assertEquals(2, TestUtils.getEntities(res, "mercenary").size());

        // build sceptre, one sun_stoneshould be retained
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());
        res = assertDoesNotThrow(() -> dmc.build("sceptre"));
        assertEquals(2, TestUtils.getInventory(res, "sceptre").size());
        assertEquals(0, TestUtils.getInventory(res, "wood").size());
        assertEquals(1, TestUtils.getInventory(res, "sun_stone").size());
        assertEquals(0, TestUtils.getInventory(res, "treasure").size());
        assertEquals(2, TestUtils.getEntities(res, "mercenary").size());

        // mindControl
        res = assertDoesNotThrow(() -> dmc.interact(mercId1));
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());
        assertEquals(2, TestUtils.getEntities(res, "mercenary").size());

        // Assert cannot interact again once mind controlled
        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId1));
        assertEquals(1, TestUtils.getInventory(res, "sceptre").size());

        res = dmc.tick(Direction.RIGHT);

        // // mindControl
        res = assertDoesNotThrow(() -> dmc.interact(mercId2));
        assertEquals(0, TestUtils.getInventory(res, "sceptre").size());

        // // Assert cannot interact
        assertThrows(InvalidActionException.class, () -> dmc.interact(mercId2));
        res = dmc.tick(Direction.RIGHT);

        // Two ticks left of mind control
        res = dmc.tick(Direction.LEFT);
        res = dmc.tick(Direction.RIGHT);
        assertEquals(0, res.getBattles().size());
        // mind control should be gone, but still should be allied
    }
}
