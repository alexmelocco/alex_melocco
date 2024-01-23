package dungeonmania.entities.staticentities.LogicEntities;

import java.util.ArrayList;
import java.util.List;

import dungeonmania.LogicEnum;
import dungeonmania.entities.Entity;
import dungeonmania.map.GameMap;
import dungeonmania.util.Position;

public class LightBulb extends LogicEntity {
    private boolean status = false;
    private LogicEnum logic;
    private List<Boolean> history;

    public LightBulb(Position position, LogicEnum logic) {
        super(position.asLayer(Entity.ITEM_LAYER));
        this.logic = logic;
        this.history = new ArrayList<>();
    }

    public void status(boolean bool) {
        status = bool;
    }

    // Lightbulbs can be move to by entities, except boulders
    @Override
    public boolean canMoveOnto(GameMap map, Entity entity) {
        return true;
    }

    public boolean isOn() {
        return status;
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
        status(LogicProcessor.processBooleanList(logic, booleanList, history, status));
        history = booleanList;
    }

}
