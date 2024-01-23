package dungeonmania.goals;

import dungeonmania.Game;
import dungeonmania.entities.enemies.ZombieToastSpawner;

public class EnemyGoal extends Goal {
    public EnemyGoal(String type, int target) {
        super(type, target);
    }

    @Override
    public boolean achieved(Game game) {
        if (game.getPlayer() == null) {
            return false;
        } else {
            return game.getMap().getEntities(ZombieToastSpawner.class).size() == 0
                    && game.getMap().getEnemiesKilled() >= getTarget();
        }
    }

    @Override
    public String toString(Game game) {
        if (this.achieved(game))
            return "";
        return ":enemies";
    }
}
