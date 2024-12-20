package dungeonmania.entities.staticentities;

import java.util.ArrayList;
import java.util.List;

import dungeonmania.entities.Entity;
import dungeonmania.entities.collectables.Bomb;
import dungeonmania.map.GameMap;
import dungeonmania.util.Position;

public class Switch extends StaticEntity {
    private boolean activated;
    private List<Bomb> bombs = new ArrayList<>();

    public Switch(Position position) {
        super(position.asLayer(Entity.ITEM_LAYER));
    }

    public void subscribe(Bomb b) {
        bombs.add(b);
    }

    public void subscribe(Bomb bomb, GameMap map) {
        bombs.add(bomb);
        if (activated) {
            bombs.stream().forEach(b -> b.notify(map));
        }
    }

    public void unsubscribe(Bomb b) {
        bombs.remove(b);
    }

    @Override
    public boolean canMoveOnto(GameMap map, Entity entity) {
        return true;
    }

    @Override
    public void onOverlap(GameMap map, Entity entity) {
        if (entity instanceof Boulder) {
            activated = true;
            bombs.stream().forEach(b -> b.notify(map));
        }
    }

    @Override
    public void onMovedAway(GameMap map, Entity entity) {
        if (entity instanceof Boulder) {
            activated = false;
        }
    }

    public boolean isActivated() {
        return activated;
    }

    @Override
    public void onDestroy(GameMap gameMap) {
        return;
    }

    public void tickUpdate(GameMap map) {
        List<Position> adjPosList = getPosition().getCardinallyAdjacentPositions();
        for (Position adjPos : adjPosList) {
            tickUpdate(map, map.getEntities(adjPos));
        }
    }

    private void tickUpdate(GameMap map, List<Entity> entities) {
        for (Entity entity : entities) {
            if (entity instanceof Wire) {
                Wire wire = (Wire) entity;
                if (!wire.isActivated()) {
                    wire.updateLogicStatus(activated, map);
                }
            }
        }
    }

}
