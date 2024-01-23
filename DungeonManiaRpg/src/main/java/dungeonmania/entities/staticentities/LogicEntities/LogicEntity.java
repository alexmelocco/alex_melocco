package dungeonmania.entities.staticentities.LogicEntities;

import java.util.ArrayList;
import java.util.List;

import dungeonmania.entities.Entity;
import dungeonmania.entities.staticentities.StaticEntity;
import dungeonmania.entities.staticentities.Switch;
import dungeonmania.entities.staticentities.Wire;
import dungeonmania.map.GameMap;
import dungeonmania.util.Position;

public abstract class LogicEntity extends StaticEntity {
    public LogicEntity(Position position) {
        super(position);
    }

    public abstract void tickUpdate(GameMap map);

    /*
     * Iterates through entities at a position, returning list of bools
     */
    public List<Boolean> tickUpdate(GameMap map, List<Entity> entities) {
        List<Boolean> booleanList = new ArrayList<>();
        for (Entity entity : entities) {
            if (entity instanceof Switch) {
                Switch switchEntity = (Switch) entity;
                booleanList.add(switchEntity.isActivated());
            } else if (entity instanceof Wire) {
                Wire wireEntity = (Wire) entity;
                booleanList.add(wireEntity.isActivated());
            }
        }
        return booleanList;
    }
}
