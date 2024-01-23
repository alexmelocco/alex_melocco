package dungeonmania.entities.staticentities.LogicEntities;

import java.util.ArrayList;
import java.util.List;

import dungeonmania.LogicEnum;
import dungeonmania.entities.Entity;
import dungeonmania.entities.enemies.Spider;
import dungeonmania.map.GameMap;
import dungeonmania.util.Position;

public class SwitchDoor extends LogicEntity {
    private boolean open = false;
    private LogicEnum logic;
    private List<Boolean> history;

    public SwitchDoor(Position position, LogicEnum logic) {
        super(position.asLayer(Entity.DOOR_LAYER));
        this.logic = logic;
        this.history = new ArrayList<>();
    }

    // cahnage the bottom from hasKey, to is open
    @Override
    public boolean canMoveOnto(GameMap map, Entity entity) {
        if (open || entity instanceof Spider) {
            return true;
        }
        return false;
    }

    public boolean isOpen() {
        return open;
    }

    public void open() {
        open = true;
    }

    public void status(boolean bool) {
        open = bool;
    }

    @Override
    public void tickUpdate(GameMap map) {
        List<Position> adjPosList = getPosition().getCardinallyAdjacentPositions();
        List<Boolean> booleanList = new ArrayList<>();

        for (Position adjPos : adjPosList) {
            booleanList.addAll(super.tickUpdate(map, map.getEntities(adjPos)));
        }

        // if booleanList includes true then turn on
        // status(booleanList.contains(true));
        status(LogicProcessor.processBooleanList(logic, booleanList, history, open));
        history = booleanList;
    }

}
