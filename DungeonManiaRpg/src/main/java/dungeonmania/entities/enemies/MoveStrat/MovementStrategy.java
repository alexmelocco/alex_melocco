package dungeonmania.entities.enemies.MoveStrat;

import dungeonmania.Game;
import dungeonmania.entities.enemies.Enemy;

public interface MovementStrategy {
    void move(Game game, Enemy enemy);
}
