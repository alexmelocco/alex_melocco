package dungeonmania.entities.collectables;

import dungeonmania.util.Position;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import dungeonmania.LogicEnum;
import dungeonmania.entities.Entity;
import dungeonmania.entities.Player;
import dungeonmania.entities.staticentities.Switch;
import dungeonmania.entities.staticentities.Wire;
import dungeonmania.entities.staticentities.LogicEntities.LogicProcessor;
import dungeonmania.map.GameMap;

public class Bomb extends CollectableEntity {
    public enum State {
        SPAWNED, INVENTORY, PLACED
    }

    public static final int DEFAULT_RADIUS = 1;
    private State state;
    private int radius;
    private LogicEnum logic;
    private List<Boolean> history;

    private List<Switch> subs = new ArrayList<>();

    public Bomb(Position position, int radius, LogicEnum logic) {
        super(position);
        state = State.SPAWNED;
        this.radius = radius;
        this.logic = logic;
        this.history = new ArrayList<>();
    }

    public void subscribe(Switch s) {
        this.subs.add(s);
    }

    public void notify(GameMap map) {
        explode(map);
    }

    @Override
    public void onOverlap(GameMap map, Entity entity) {
        if (state != State.SPAWNED)
            return;
        if (entity instanceof Player) {
            if (!((Player) entity).pickUp(this))
                return;
            subs.stream().forEach(s -> s.unsubscribe(this));
            map.destroyEntity(this);
        }
        this.state = State.INVENTORY;
    }

    public void onPutDown(GameMap map, Position p) {
        // get position change, then setPosition by transaltion
        Position delta = Position.calculatePositionBetween(getPosition(), p);
        setPosition(Position.translateBy(getPosition(), delta));
        map.addEntity(this);
        this.state = State.PLACED;
        List<Position> adjPosList = getPosition().getCardinallyAdjacentPositions();
        adjPosList.stream().forEach(node -> {
            List<Entity> entities = map.getEntities(node).stream().filter(e -> (e instanceof Switch))
                    .collect(Collectors.toList());
            entities.stream().map(Switch.class::cast).forEach(s -> s.subscribe(this, map));
            entities.stream().map(Switch.class::cast).forEach(s -> this.subscribe(s));
        });
    }

    public void explode(GameMap map) {
        int x = getPosition().getX();
        int y = getPosition().getY();
        for (int i = x - radius; i <= x + radius; i++) {
            for (int j = y - radius; j <= y + radius; j++) {
                List<Entity> entities = map.getEntities(new Position(i, j));
                entities = entities.stream().filter(e -> !(e instanceof Player)).collect(Collectors.toList());
                for (Entity e : entities)
                    map.destroyEntity(e);
            }
        }
    }

    public State getState() {
        return state;
    }

    public void tickUpdate(GameMap map) {
        if (state != State.PLACED) {
            return;
        }
        List<Position> adjPosList = getPosition().getCardinallyAdjacentPositions();
        List<Boolean> booleanList = new ArrayList<>();

        for (Position adjPos : adjPosList) {
            booleanList.addAll(tickUpdate(map, map.getEntities(adjPos)));
        }

        // if booleanList includes true then turn on
        if (LogicProcessor.processBooleanList(logic, booleanList, history, false)) {
            explode(map);
        }
        history = booleanList;
    }

    private List<Boolean> tickUpdate(GameMap map, List<Entity> entities) {
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
