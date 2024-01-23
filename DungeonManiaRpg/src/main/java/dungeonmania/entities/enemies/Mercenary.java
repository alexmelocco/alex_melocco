package dungeonmania.entities.enemies;

import dungeonmania.Game;
import dungeonmania.battles.BattleStatistics;
import dungeonmania.entities.Entity;
import dungeonmania.entities.Interactable;
import dungeonmania.entities.Player;
import dungeonmania.entities.collectables.Treasure.Treasure;
import dungeonmania.entities.collectables.potions.InvincibilityPotion;
import dungeonmania.entities.collectables.potions.InvisibilityPotion;
import dungeonmania.entities.enemies.MoveStrat.FollowHostileMovementStrategy;
import dungeonmania.entities.enemies.MoveStrat.InvincibilityMovementStrategy;
import dungeonmania.entities.enemies.MoveStrat.InvisibilityMovementStrategy;
import dungeonmania.entities.enemies.MoveStrat.MovementStrategy;
import dungeonmania.map.GameMap;
import dungeonmania.util.Position;

public class Mercenary extends Enemy implements Interactable {
    public static final int DEFAULT_BRIBE_AMOUNT = 1;
    public static final int DEFAULT_BRIBE_RADIUS = 1;
    public static final double DEFAULT_ATTACK = 5.0;
    public static final double DEFAULT_HEALTH = 10.0;

    private int bribeAmount = Mercenary.DEFAULT_BRIBE_AMOUNT;
    private int bribeRadius = Mercenary.DEFAULT_BRIBE_RADIUS;
    private int mindControlDuration = 0;

    private double allyAttack;
    private double allyDefence;
    private boolean allied = false;
    private boolean bribeStatus = false;
    private boolean isAdjacentToPlayer = false;

    public Mercenary(Position position, double health, double attack, int bribeAmount, int bribeRadius,
            double allyAttack, double allyDefence) {
        super(position, health, attack);
        this.bribeAmount = bribeAmount;
        this.bribeRadius = bribeRadius;
        this.allyAttack = allyAttack;
        this.allyDefence = allyDefence;
    }

    public boolean isAllied() {
        return allied;
    }

    public int getMindControlDuration() {
        return mindControlDuration;
    }

    public void setMindControlDuration(int mindControlDuration) {
        this.mindControlDuration = mindControlDuration;
    }

    public boolean mindControlStatus() {
        return mindControlDuration > 0;
    }

    /*
     * If ticks to 0, then change allied status to false, if not bribed
     */
    public void tickMindControl() {
        if (!mindControlStatus())
            return;

        if (mindControlDuration > 0)
            mindControlDuration--;

        // if mindControlStatus == 0, bribeStatus = false, make allied false
        if (!mindControlStatus() && !bribeStatus)
            allied = false;
    }

    @Override
    public void onOverlap(GameMap map, Entity entity) {
        if (allied)
            return;
        super.onOverlap(map, entity);
    }

    /**
     * check whether the current merc can be bribed
     * @param player
     * @return
     */
    private boolean canBeBribed(Player player) {
        return bribeRadius >= 0 && player.countEntityOfType(Treasure.class) >= bribeAmount;
    }

    private void setAllied(boolean bool) {
        this.allied = bool;
    }

    /**
     * bribe the merc
     */
    private void bribe(Player player) {
        for (int i = 0; i < bribeAmount; i++) {
            player.use(Treasure.class);
        }
    }

    private void mindControl(Player player) {
        int controlDuration = player.use("sceptre");
        setMindControlDuration(controlDuration);
        setAllied(true);
    }

    // Bribe takes priority over mindControl, cannot mind control if have been bribed
    @Override
    public void interact(Player player, Game game) {
        if (canBeBribed(player) && !bribeStatus) {
            allied = true;
            bribeStatus = true;
            bribe(player);
        } else if (player.hasSceptre() && !mindControlStatus() && !bribeStatus) {
            //only activate if player has sceptre and not already mind controlled, and not bribed
            mindControl(player);
        }

        if (!isAdjacentToPlayer && Position.isAdjacent(player.getPosition(), getPosition()))
            isAdjacentToPlayer = true;
    }

    @Override
    public void move(Game game) {
        Position nextPos;
        GameMap map = game.getMap();
        Player player = game.getPlayer();
        if (allied) {
            nextPos = isAdjacentToPlayer ? player.getPreviousDistinctPosition()
                    : map.dijkstraPathFind(getPosition(), player.getPosition(), this);
            if (!isAdjacentToPlayer && Position.isAdjacent(player.getPosition(), nextPos))
                isAdjacentToPlayer = true;
            map.moveTo(this, nextPos);
        } else {
            MovementStrategy movementStrategy;
            if (map.getPlayer().getEffectivePotion() instanceof InvisibilityPotion) {
                movementStrategy = new InvisibilityMovementStrategy();
            } else if (map.getPlayer().getEffectivePotion() instanceof InvincibilityPotion) {
                movementStrategy = new InvincibilityMovementStrategy();
            } else {
                movementStrategy = new FollowHostileMovementStrategy();
            }
            movementStrategy.move(game, this);
        }

    }

    /*
     * is interactable if player.hasSceptre or canBeBribed (enough treasure)
     * Logic for  (player.hasSceptre() && !allied)
     * - cannot interact with player if sceptre, but already mindcontrolled (allied)
     */
    @Override
    public boolean isInteractable(Player player) {
        return !bribeStatus && (canBeBribed(player) || (player.hasSceptre() && !allied));
    }

    @Override
    public BattleStatistics getBattleStatistics() {
        if (!allied)
            return super.getBattleStatistics();
        return new BattleStatistics(0, allyAttack, allyDefence, 1, 1);
    }
}
