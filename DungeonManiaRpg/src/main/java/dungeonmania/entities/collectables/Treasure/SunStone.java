package dungeonmania.entities.collectables.Treasure;

import dungeonmania.entities.collectables.CollectableEntity;
import dungeonmania.util.Position;

/*
 * Sunstone - special form of treasure, hard and treasuable - Can be used to
 * open doors - Can be used interchangeably with treasure or keys when building
 * entities - CANNOT be used to bribe mercenaries or assassins - Counts towards
 * treasure goal - When used for opening doors, or when replacing another
 * material such as a key or treasure in building entities, it is retained after
 * use - when used a listed ingredient in crafting, it is consumed
 */

// Originally going to extend Treasure, but ran into some issues so do later if
// necessary

public class SunStone extends CollectableEntity {
    public SunStone(Position position) {
        super(position);
    }

}
