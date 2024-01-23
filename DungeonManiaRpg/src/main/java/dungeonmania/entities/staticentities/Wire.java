package dungeonmania.entities.staticentities;

import java.util.List;

import dungeonmania.entities.Entity;
import dungeonmania.map.GameMap;
import dungeonmania.util.Position;

public class Wire extends StaticEntity {
    private boolean activated = false;

    public Wire(Position position) {
        super(position.asLayer(Entity.ITEM_LAYER));
    }

    public boolean isActivated() {
        return activated;
    }

    /*
     * Only update if activated = false, and newStatus = true
     */
    public void updateLogicStatus(boolean newStatus, GameMap map) {
        if (activated != newStatus && newStatus) {
            activated = newStatus;
            notifyAdjacent(map);
        }
    }

    @Override
    public boolean canMoveOnto(GameMap map, Entity entity) {
        return true;
    }

    private void notifyAdjacent(GameMap map) {
        List<Position> adjPosList = getPosition().getCardinallyAdjacentPositions();
        for (Position adjPos : adjPosList) {
            notifyAdjacent(map, map.getEntities(adjPos));

        }
    }

    private void notifyAdjacent(GameMap map, List<Entity> entities) {
        for (Entity entity : entities) {
            if (entity instanceof Wire) {
                Wire wire = (Wire) entity;
                if (!wire.isActivated()) {
                    wire.updateLogicStatus(activated, map);
                }
            }
        }
    }

    public void tickReset() {
        activated = false;
    }
}
