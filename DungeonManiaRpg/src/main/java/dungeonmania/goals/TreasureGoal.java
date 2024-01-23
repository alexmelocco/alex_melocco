package dungeonmania.goals;

import dungeonmania.Game;

public class TreasureGoal extends Goal {
    public TreasureGoal(String type, int target) {
        super(type, target);
    }

    @Override
    public boolean achieved(Game game) {
        if (game.getPlayer() == null)
            return false;
        return game.getCollectedTreasureCount() >= getTarget();
    }

    @Override
    public String toString(Game game) {
        if (this.achieved(game))
            return "";
        return ":treasure";
    }

}
