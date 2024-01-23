package dungeonmania.entities.staticentities;

import dungeonmania.map.GameMap;
import dungeonmania.entities.Entity;
import dungeonmania.entities.Player;
import dungeonmania.entities.collectables.Key;
import dungeonmania.entities.collectables.Treasure.SunStone;
import dungeonmania.entities.enemies.Spider;
import dungeonmania.entities.inventory.Inventory;
import dungeonmania.util.Position;

public class Door extends StaticEntity {
    private boolean open = false;
    private int number;

    public Door(Position position, int number) {
        super(position.asLayer(Entity.DOOR_LAYER));
        this.number = number;
    }

    @Override
    public boolean canMoveOnto(GameMap map, Entity entity) {
        if (open || entity instanceof Spider) {
            return true;
        }
        return (entity instanceof Player && hasKey((Player) entity));
    }

    @Override
    public void onOverlap(GameMap map, Entity entity) {
        if (!(entity instanceof Player))
            return;

        Player player = (Player) entity;
        Inventory inventory = player.getInventory();
        Key key = inventory.getFirst(Key.class);
        SunStone sunStone = inventory.getFirst(SunStone.class);

        // sunstone takes priority over key
        if (hasKey(player)) {
            if (sunStone != null) {
                open();
            } else {
                inventory.remove(key);
                open();
            }
        }
    }

    private boolean hasKey(Player player) {
        Inventory inventory = player.getInventory();
        SunStone sunStone = inventory.getFirst(SunStone.class);
        Key key = inventory.getFirst(Key.class);

        return ((key != null && key.getnumber() == number) || sunStone != null);
    }

    public boolean isOpen() {
        return open;
    }

    public void open() {
        open = true;
    }

}
