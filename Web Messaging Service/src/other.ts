import { setData } from './dataStore';

/**
 * Resets the internal data of the application to its initial state
 *
 * @returns {}
 */
function clearV1(): Record<string, never> {
  const timeStamp = Math.floor(Date.now() / 1000);
  setData({
    users: [],
    channels: [],
    tokens: {},
    dms: [],
    messageGlobal: 0,
    standups: [],
    passResetString: {},
    usersStats: {
      channelsExist: [{numChannelsExist: 0, timeStamp: timeStamp}],
      dmsExist: [{numDmsExist: 0, timeStamp: timeStamp}],
      messagesExist: [{numMessagesExist: 0, timeStamp: timeStamp}],
      utilizationRate: 0,
    },
    games: {
      hangman: {
        guessedLetters: [],
        remainAttempts: 0,
        word: "",
        state: "",
      } 
    }
  });
  return {};
}

export { clearV1 };
