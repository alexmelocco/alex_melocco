package dungeonmania.entities.staticentities.LogicEntities;

import java.util.List;

import dungeonmania.LogicEnum;

public class LogicProcessor {
    public static Boolean processBooleanList(LogicEnum logic, List<Boolean> booleanList, List<Boolean> history,
            Boolean curr) {
        if (logic == null) {
            return booleanList.contains(true);
        }

        switch (logic) {
        case OR:
            return processOr(booleanList);
        case AND:
            return processAnd(booleanList);
        case XOR:
            return processXor(booleanList);
        case CO_AND:
            return processCoAnd(booleanList, history, curr);
        case NULL:
            return booleanList.contains(true);
        default:
            throw new IllegalArgumentException("Unknown logic: " + logic);
        }
    }

    private static Boolean processOr(List<Boolean> booleanList) {
        return booleanList.contains(true);
    }

    private static Boolean processAnd(List<Boolean> booleanList) {
        // Implement the logic for AND
        int count = 0;
        for (Boolean value : booleanList) {
            if (value) {
                count++;
            }
        }
        return (count >= 2) && !booleanList.contains(false);

    }

    private static Boolean processXor(List<Boolean> booleanList) {
        int count = 0;
        for (Boolean bool : booleanList) {
            if (bool) {
                count++;
            }
        }
        return count == 1;
    }

    private static Boolean processCoAnd(List<Boolean> booleanList, List<Boolean> history, Boolean curr) {
        int historyCount = 0;
        int boolCount = 0;
        for (Boolean bool : history) {
            if (bool) {
                historyCount++;
            }
        }
        for (Boolean bool : booleanList) {
            if (bool) {
                boolCount++;
            }
        }
        // if no change, return current status
        if (boolCount != 0 && (boolCount == historyCount)) {
            return curr;
        }
        return (boolCount - historyCount) >= 2;
    }
}
