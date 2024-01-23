package dungeonmania.entities.collectables.potions;

import dungeonmania.util.Position;

public class PotionFactory {
    public static Potion createPotion(PotionType type, Position position, int duration) {
        switch (type) {
            case INVISIBILITY:
                return new InvisibilityPotion(position, duration);
            case INVINCIBILITY:
                return new InvincibilityPotion(position, duration);
            // Add more cases if you have more potion types in the future
            default:
                throw new IllegalArgumentException("Invalid potion type: " + type);
        }
    }
}
