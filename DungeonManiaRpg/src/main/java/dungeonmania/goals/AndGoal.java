package dungeonmania.goals;

import dungeonmania.Game;

public class AndGoal extends Goal {
    public AndGoal(String type, Goal goal1, Goal goal2) {
        super(type, goal1, goal2);
    }

    @Override
    public boolean achieved(Game game) {
        if (game.getPlayer() == null)
            return false;
        return getGoal1().achieved(game) && getGoal2().achieved(game);
    }

    @Override
    public String toString(Game game) {
        if (this.achieved(game))
            return "";
        return "(" + getGoal1().toString(game) + " AND " + getGoal2().toString(game) + ")";
    }

}
