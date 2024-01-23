package dungeonmania.mvp.Task2;

import dungeonmania.DungeonManiaController;
import dungeonmania.mvp.TestUtils;
import dungeonmania.response.models.DungeonResponse;
import dungeonmania.util.Direction;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class EnemyGoalTest {
    @Test
    @Tag("13-5")
    @DisplayName("Test achieving a basic enemy goal by killing one zombie")
    public void killZombie() {
        //   Wall   Wall    Wall
        //    P1    P2-Z2    Z1   Wall
        //   Wall   Wall    Wall

        DungeonManiaController dmc;
        dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_basicGoalsTest_enemy", "c_basicGoalsTest_enemy");

        // assert goal not met
        assertTrue(TestUtils.getGoals(res).contains(":enemies"));

        // kill zombie_toast
        res = dmc.tick(Direction.RIGHT);
        assertTrue(TestUtils.countEntityOfType(res.getEntities(), "zombie_toast") == 1);

        // assert goal met
        assertEquals("", TestUtils.getGoals(res));
    }

    @Test
    @Tag("13-6")
    @DisplayName("Test achieving a basic enemy goal by destroying tosat spawner")
    public void destroySpawner() {
        //        Wall   Wall    Wall    wall     wall
        // wall  zombie          player  sword   spawner  Wall
        //        Wall   Wall    Wall    wall     wall

        DungeonManiaController dmc;
        dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_basicGoalsTest_ZombieToastSpawner", "c_basicGoalsTest_ZombieToastSpawner");

        // assert goal not met
        assertTrue(TestUtils.getGoals(res).contains(":enemies"));

        // kill zombie
        res = dmc.tick(Direction.LEFT);
        assertEquals(0, TestUtils.getEntities(res, "zombie_toast").size());

        // move to right
        res = dmc.tick(Direction.RIGHT);
        assertTrue(TestUtils.getGoals(res).contains(":enemies"));

        // pickup sword
        res = dmc.tick(Direction.RIGHT);
        assertTrue(TestUtils.getGoals(res).contains(":enemies"));

        // destroy zombie toast spawner
        res = dmc.tick(Direction.RIGHT);
        assertTrue(TestUtils.countEntityOfType(res.getEntities(), "zombie_toast_spwaner") == 0);

        // assert goal met
        assertTrue(TestUtils.getGoals(res).contains(""));

    }

    @Test
    @Tag("13-7")
    @DisplayName("Test achieving a basic enemy goal by killing mercenary")
    public void killMercenary() {
        //   Wall   Wall    Wall
        //    P1    P2-M2    M1   Wall
        //   Wall   Wall    Wall

        DungeonManiaController dmc;
        dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_basicGoalsTest_mercenary", "c_basicGoalsTest_mercenary");

        // assert goal not met
        assertTrue(TestUtils.getGoals(res).contains(":enemies"));

        // kill mercenary
        res = dmc.tick(Direction.RIGHT);
        assertTrue(TestUtils.countEntityOfType(res.getEntities(), "mercenary") == 0);

        // assert goal met
        assertEquals("", TestUtils.getGoals(res));
    }

    @Test
    @Tag("13-8")
    @DisplayName("Test achieving a basic enemy goal by killing multiple zombies")
    public void killMultipleZombies() {
        //       Wall   Wall    Wall
        // wall  Z1      P1      Z2   Wall
        //       Wall   Wall    Wall

        DungeonManiaController dmc;
        dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_basicGoalsTest_killMultipleZombies",
                "c_basicGoalsTest_killMultipleZombies");

        // kill zombie_toast
        res = dmc.tick(Direction.LEFT);
        assertTrue(TestUtils.countEntityOfType(res.getEntities(), "zombie_toast") == 2);

        // assert goal not met
        assertTrue(TestUtils.getGoals(res).contains(":enemies"));

        // kill zombie_toast
        res = dmc.tick(Direction.RIGHT);
        assertTrue(TestUtils.countEntityOfType(res.getEntities(), "zombie_toast") == 1);

        // assert goal met
        assertEquals("", TestUtils.getGoals(res));
    }

    @Test
    @Tag("13-9")
    @DisplayName("Test achieving a basic enemy goal by killing zombies more than target")
    public void killMore() {
        //       Wall   Wall    Wall
        // wall  Z1      P1      Z2   Wall
        //       Wall   Wall    Wall

        DungeonManiaController dmc;
        dmc = new DungeonManiaController();
        DungeonResponse res = dmc.newGame("d_basicGoalsTest_killMore", "c_basicGoalsTest_killMore");

        // kill zombie_toast
        res = dmc.tick(Direction.LEFT);
        assertTrue(TestUtils.countEntityOfType(res.getEntities(), "zombie_toast") == 2);

        // kill zombie_toast
        res = dmc.tick(Direction.RIGHT);
        assertTrue(TestUtils.countEntityOfType(res.getEntities(), "zombie_toast") == 1);

        // assert goal met
        assertEquals("", TestUtils.getGoals(res));
    }

}
