import { getData, setData } from './dataStore';
import { checkForValidToken, findUserIdUsingToken } from './token';
import HTTPError from 'http-errors';
import { globalOwner, message, channel, dm, member } from './types';
import { checkForTag, createNotification } from './notifications';
import { updateMessageUsersStats, updateDelMessageUsersStats, updateMessageStats, 
  updateDelMessageStats, updateInvolvement } from './stats';

// Function to get random word
export const getRandomWord = (wordBase: string[]): string => {
  const index = Math.floor(Math.random() * wordBase.length);
  return wordBase[index];
}

// hangman structure
export const hangmanStructure = (token: string, channelId: number): string => {
  const data = getData();
  const numRemain = data.games.hangman.remainAttempts - 1;
  let wordString: string = ""

  const game = data.games.hangman;
  for (let i = 0; i < game.word.length; i++) {
    let letter = game.word.charAt(i);
    if (game.guessedLetters.includes(letter)) {
      wordString += letter + " ";
    } else {
      wordString += "_ ";
    }
  }

  const structure: string[] = [ 
    ' | \n o \n/|\\\n/ \\',
    ' | \n o \n/|\\\n/',
    ' | \n o \n/|\\',
    ' | \n o \n |',
    ' | \n o ',
    '',
  ]
  
  // const fuck = ' |  \n o  \n | \n/ /';
  // return '\n' + fuck;

  return '\n' + wordString + '\n' + structure[numRemain];
}

// Function to start/retarst hangman game
export const initializeHangmanGame = (token: string, channelId: number) => {
  let data = getData();
  const game = data.games.hangman;
  
  // Get random word base
  const words = ['algorithm', 'application', 'backup', 'binary', 'bug', 
  'byte', 'cache', 'cloud', 'compiler', 'cookie', 'database', 'debug', 
  'encryption', 'firewall', 'floppy', 'format', 'hacker', 'hash', 'icon', 
  'input', 'interface', 'keyboard', 'logic', 'malware', 'megabyte', 'network', 
  'output', 'packet', 'password', 'processor', 'queue', 'reboot', 'router', 
  'script', 'spam', 'spyware', 'storage', 'upload', 'virus', 'webcam'];


  game.guessedLetters = [];
  game.remainAttempts = 6;
  game.word = getRandomWord(words);
  game.state = 'ACTIVE'

  setData(data);
  return {};
} 

// Checks if game is won or not
// returns 0 if game lost
// returns 1 if game won
// returns 2 if game still ongoing
// returns -1 if game is not active
export const checkIfWinOrLose = (token: string, channelId: number) => {
  let data = getData();
  const game = data.games.hangman;

  // game lost
  if (game.remainAttempts === 0) {
    return 0;
  }
  // game is not active
  if (game.state !== 'ACTIVE') {
    return -1;
  }
  let isValid: boolean = true;
  
  for (let i = 0; i < game.word.length; i++) {
    let letter = game.word.charAt(i);
    if (!game.guessedLetters.includes(letter)) {
      isValid = false;
      break;
    }
  }

  // game is won
  if (isValid) {
    return 1;
  } 
  // game is ongoing
  else {
    return 2;
  }
}

// Function to add attempt
// Returns (1) if successful 
// Returns (2) if unsucceesful 
// Returns (0) game not started
export const hangmanAttempt = (token: string, channelId: number, message: string) => {
  let data = getData();
  const game = data.games.hangman;
  // Minus one of remain attempts count
  
  if (game.state !== 'ACTIVE') {
    return 0;
  }
  
  game.guessedLetters.push(message);
  setData(data);

  // Repeat letters can be added, there is no warning given
  if (game.word.includes(message)) {
    
    return 1;
  } else {
    return 2;
  }
  
}

// Check if string is only alphabetic
export const isAlphabetic = (message: string): boolean => {
  return /^[a-zA-Z]+$/.test(message);
}

// Hangman game main structure
export const hangmanGame = (token: string, channelId: number, message: string) => {
  const data = getData();
  // Extract the hangman game command
  const command = message.slice('/hangman '.length);
  const hangmanblock = '////////////////////////\n// HANGMAN //\n////////////////////////\n'

  // Initialize the hangman game state
  if (command === 'start') {
    const message = 'Starting hangman game!\nType </hangman help> to see controls\n';
    const tries = 'Please type your guess </hangman ?>';

    initializeHangmanGame(token, channelId);
    return messageSendV1(token, channelId, hangmanblock + message + tries);
  } 
  else if (command.startsWith('edit ')) {
    if (data.games.hangman.state !== 'ACTIVE') {
      const invalidGame = 'Game is not initialised, please start';
      return messageSendV1(token, channelId, hangmanblock + invalidGame)
    }

    const newString = command.slice('edit '.length);
    if (!isAlphabetic(newString)) {
      const invalidMessage = 'Not a valid hangman word please try again :)'
      return messageSendV1(token, channelId, hangmanblock + invalidMessage);
    }
    initializeHangmanGame(token, channelId);
    data.games.hangman.guessedLetters = [];
    data.games.hangman.remainAttempts = 6;
    data.games.hangman.word = newString;
    const Mssage = 'The word was changed :)';
    setData(data);
    return messageSendV1(token, channelId, hangmanblock + Mssage);
  }
  else if (command === 'help') {
    const helpMessage = 'start - start/restart hangman\nhelp - see instructions\n<letter> - letter to add';
    const extra = '\nedit <new word> - change hangman word';
    return messageSendV1(token, channelId, hangmanblock + helpMessage + extra);
  } 
  else if (command.length === 1) {
    const letter = command.toLowerCase(); // Convert to lowercase for consistency
    if (!isAlphabetic(letter)) {
      const invalidMessage = 'Not a valid input please try again :)'
      return messageSendV1(token, channelId, hangmanblock + invalidMessage);
    }

    if (data.games.hangman.state !== 'ACTIVE') {
      const invalidGame = 'Game is not initialised, please start';
      return messageSendV1(token, channelId, hangmanblock + invalidGame)
    }

    const attemptRes = hangmanAttempt(token, channelId, letter);
    if (attemptRes === 2) {
      data.games.hangman.remainAttempts = data.games.hangman.remainAttempts - 1;
      setData(data);
    } 

    const remainAttempts = "There are " + data.games.hangman.remainAttempts + " remaining!";
    const hangmanStruc = hangmanStructure(token, channelId);
    const winLoseStatus = checkIfWinOrLose(token, channelId); 
    if (attemptRes === 0) {
      const invalidMessage = 'Please start the game before guessing'
      return messageSendV1(token, channelId, hangmanblock + invalidMessage);
    } 
    else if (attemptRes === 1) {
      // successful add
      const Mes = "Input: " + letter + " was successful!! :)\n";

      // game lost
      if (winLoseStatus === 0) {
        const loseGame = 'You lost the game!!! :(\nThe word was ' + data.games.hangman.word;
        data.games.hangman.state = 'INACTIVE';
        setData(data);
        return messageSendV1(token, channelId, hangmanblock + loseGame)
      }
      // game won
      else if (winLoseStatus === 1) {
        const winGame = 'YOU WON THE GAME!!! :)\nThe word was ' + data.games.hangman.word;
        data.games.hangman.state = 'INACTIVE';
        setData(data);
        return messageSendV1(token, channelId, hangmanblock + winGame)
      }
      // game is invalid // NOT INITAILISED 
      else if (winLoseStatus === -1) {
        const invalidGame = 'Game is not initialised, please start';
        return messageSendV1(token, channelId, hangmanblock + invalidGame)
      } 
      // game is ongoing
      else {
        return messageSendV1(token, channelId, hangmanblock + Mes + remainAttempts + hangmanStruc);
      }

    } 
    else {
      // unsuccessful add
      const Mes = "Input: " + letter + " was not successful :(\n";
      // game lost
      if (winLoseStatus === 0) {
        const loseGame = 'You lost the game!!! :(\nThe word was ' + data.games.hangman.word;
        data.games.hangman.state = 'INACTIVE';
        setData(data);
        return messageSendV1(token, channelId, hangmanblock + loseGame)
      }
      // game won
      else if (winLoseStatus === 1) {
        const winGame = 'YOU WON THE GAME!!! :)\nThe word was ' + data.games.hangman.word;
        data.games.hangman.state = 'INACTIVE';
        setData(data);
        return messageSendV1(token, channelId, hangmanblock + winGame)
      }
      // game is invalid // NOT INITAILISED 
      else if (winLoseStatus === -1) {
        const invalidGame = 'Game is not initialised, please start';
        return messageSendV1(token, channelId, hangmanblock + invalidGame)
      } 
      // game is ongoing
      else {
        return messageSendV1(token, channelId, hangmanblock + Mes + remainAttempts + hangmanStruc);
      }
    }
  } 
  else {
    const invalidMessage = 'Invalid command, please type <help> to see list of commands';
    return messageSendV1(token, channelId, hangmanblock + invalidMessage)
  }
}

// Function to encode a cipher
const encodeCipher = (input: string, shift: number): string => {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    let charCode = input.charCodeAt(i);
    let shiftedCharCode;
    if (charCode >= 65 && charCode <= 90) {
      shiftedCharCode = ((charCode - 65 + shift) % 26) + 65;
    } else if (charCode >= 97 && charCode <= 122) {
      shiftedCharCode = ((charCode - 97 + shift) % 26) + 97;
    } else if (charCode >= 48 && charCode <= 57) {
      shiftedCharCode = ((charCode - 48 + shift) % 10) + 48;
    } else {
      shiftedCharCode = charCode;
    }
    output += String.fromCharCode(shiftedCharCode);
  }
  return output;
}

// Function to decode a cipher
const decodeCipher = (input: string, shift: number): string => { 
  let output = "";
  for (let i = 0; i < input.length; i++) {
    let charCode = input.charCodeAt(i);
    let shiftedCharCode;
    if (charCode >= 65 && charCode <= 90) {
      shiftedCharCode = ((charCode - 65 - shift + 26) % 26) + 65;
    } else if (charCode >= 97 && charCode <= 122) {
      shiftedCharCode = ((charCode - 97 - shift + 26) % 26) + 97;
    } else if (charCode >= 48 && charCode <= 57) {
      shiftedCharCode = ((charCode - 48 - shift + 10) % 10) + 48;
    } else {
      shiftedCharCode = charCode;
    }
    output += String.fromCharCode(shiftedCharCode);
  }
  return output;
}

// Function get a joke
const getJoke = (): string => {
  const words: string[] = ["What do you call a pig that does karate: A pork chop",
  "Why did the bike fall over?: It was two tired", 
  "Why did the golfer bring two pairs of pants? In case he got a hole in one",
  "What did the policeman say to his belly button?: You're under a vest",
  "Error: jokes are too bad please try again", 
  "Why did the man get hit by a bike every day?: He was stuck in a vicious cycle",
  "Why do seagulls fly over the sea?: If they flew over the bay, they would be bagels",
  "What kind of ghost has the best hearing?: the eeriest",
  "Why are there gates around cemeteries?: Because people are dying to get it"
  ];
  return getRandomWord(words)
}

// Function to send a message
function messageSendV1(token: string, channelId: number, message: string) {
  const data = getData();

  // hangman game
  if (message.startsWith('/hangman ')) { 
    return hangmanGame(token, channelId, message);
  } 
  // help gives list of channel commands
  if (message.startsWith('/help')) { 
    const chanBlock = '///////////////////////\n// CHANNEL //\n///////////////////////\n';
    const mess = 'Commands:\n</hangman help> - shows channel hangman game instructions';
    const ec = '\n</encode> - encodes the a message';
    const dc = '\n</decode> - decodes a given message (only works encoded messages)';
    const jk = '\n</printJoke> - prints a joke';
    const pt = '\n</printTime> - prints the time';
    const pd = '\n</printDate> - prints the date' + '\n</congrat> - congradulate';
    return messageSendV1(token, channelId, chanBlock + mess + ec + dc + jk + pt + pd);
  } 
  // Function to encode a message
  if (message.startsWith('/encode ')) { 
    const command = message.slice('/encode '.length);
    const encode = encodeCipher(command, 2);
    return messageSendV1(token, channelId, encode);
  } 
  // Function to decode a message
  if (message.startsWith('/decode ')) { 
    const command = message.slice('/encode '.length);
    const decode = decodeCipher(command, 2);
    return messageSendV1(token, channelId, decode);
  }
  // Function to print a joke
  if (message.startsWith('/printJoke')) {
    const joke = getJoke();
    return messageSendV1(token, channelId, joke);
  }
  // Function to print the time
  if (message.startsWith('/printTime')) {
    const now = new Date();
    return messageSendV1(token, channelId, now.toLocaleString());
  }
  // Function to print the date
  if (message.startsWith('/printDate')) {
    const now = new Date();
    return messageSendV1(token, channelId, now.toLocaleDateString());
  } 
  // Function to print a congradulation message
  if (message.startsWith('/congrat')) {
    return messageSendV1(token, channelId, '🎉🎉🎉🎉 CONGRATS 🎉🎉🎉🎉');
  }


  if (message.length < 1) {
    throw HTTPError(400, 'Message is too short');
  } else if (message.length > 1000) {
    throw HTTPError(400, 'Message is too long');
  }
  const exists: boolean = checkForValidToken(token);
  if (exists === false) {
    throw HTTPError(403, 'Token is invalid');
  }
  const authUserId: number = findUserIdUsingToken(token);
  let channel;
  let channelFlag = false;
  let memberFlag = false;
  for (const index of data.channels) {
    if (index.channelId === channelId) {
      channelFlag = true;
      channel = index;
      // member is not a part of the channel
      for (const value of index.allMembers) {
        if (value.uId === authUserId) {
          memberFlag = true;
        }
      }
    }
  }
  if (channelFlag === false) {
    throw HTTPError(400, 'Invalid channel');
  }
  if (memberFlag === false) {
    throw HTTPError(403, 'Channel is valid but user is not an authorised member of channel');
  }
  const newMessage: message = {
    messageId: data.messageGlobal,
    message: message,
    uId: authUserId,
    timeSent: Math.floor(Date.now() / 1000),
    isPinned: false,
    reacts: [{
      reactId: 1,
      uIds: [],
    }]
  };
  data.messageGlobal++;
  channel.messages.unshift(newMessage);
  const tagged = checkForTag(message);

  setData(data);
  
  // Iteration 4
  updateMessageStats(authUserId);
  updateInvolvement(authUserId);
  updateMessageUsersStats(authUserId);

  if (tagged.length > 0) {
    const channelMembers = data.channels.find((channel: {channelId: number}) => channel.channelId === channelId).allMembers;
    for (const index of tagged) {
      const member = channelMembers.find((member: {uId: number}) => member.uId === index);
      if (member !== undefined) {
        createNotification(authUserId, index, channelId, -1, 'tagged you in', true, message);
      }
    }
  }

  return { messageId: data.messageGlobal - 1 };
}

function messageEditV1(token: string, messageId: number, message: string) {
  let data = getData();
  if (message.length > 1000) {
    throw HTTPError(400, 'Message is too long');
  }
  const exists: boolean = checkForValidToken(token);
  if (exists === false) {
    throw HTTPError(403, 'Invalid Token');
  }
  const authUserId: number = findUserIdUsingToken(token);

  const tagged = checkForTag(message);

  for (const index of data.channels) {
    if (index.allMembers.find((user: {uId: number}) => user.uId === authUserId) !== undefined) {
      for (const index2 in index.messages) {
      // If the messageId matches
        if (index.messages[index2].messageId === messageId) {
          let ownerPermissions = false;
          for (const index3 of index.ownerMembers) {
            if (index3.uId === authUserId) {
              ownerPermissions = true;
            }
          }

          if (index.messages[index2].uId !== authUserId && ownerPermissions === false) {
            throw HTTPError(403, 'User does not have owner perms and message was not sent by them');
          }
          // If tagged
          if (tagged.length > 0) {
            const channelMembers = data.channels.find((channel: {channelId: number}) => channel.channelId === index.channelId).allMembers;
            for (const index3 of tagged) {
              const member = channelMembers.find((member: {uId: number}) => member.uId === index3);
              if (member !== undefined) {
                data = createNotification(authUserId, index3, index.channelId, -1, 'tagged you in', true, message);
              }
            }
          }
          const indexVal = data.channels.find((channel: {channelId: number}) => channel.channelId === index.channelId);
          if (message === '') {
            indexVal.messages.splice(parseInt(index2), 1);
            setData(data);
            return {};
          }
          indexVal.messages[index2].message = message;
          setData(data);
          return {};
        }
      }
    }
  }
  for (const index of data.dms) {
    if (index.allMembers.find((user: {uId: number}) => user.uId === authUserId) !== undefined) {
      for (const index2 in index.messages) {
        if (index.messages[index2].messageId === messageId) {
          let ownerPermissions = false;
          for (const index3 of index.ownerMembers) {
            if (index3.uId === authUserId) {
              ownerPermissions = true;
            }
          }
          if (index.messages[index2].uId !== authUserId && ownerPermissions === false) {
            throw HTTPError(403, 'User does not have owner perms and message was not sent by them');
          }

          // If tagged
          if (tagged.length > 0) {
            const channelMembers = data.dms.find((dm: {dmId: number}) => dm.dmId === index.dmId).allMembers;
            for (const index3 of tagged) {
              const member = channelMembers.find((member: {uId: number}) => member.uId === index3);
              if (member !== undefined) {
                data = createNotification(authUserId, index3, -1, index.dmId, 'tagged you in', true, message);
              }
            }
          }
          const indexVal = data.dms.find((channel: {dmId: number}) => channel.dmId === index.dmId);
          if (message === '') {
            indexVal.messages.splice(parseInt(index2), 1);
            setData(data);
            return {};
          }
          index.messages[index2].message = message;
          setData(data);
          return {};
        }
      }
    }
  }
  throw HTTPError(400, 'Not a valid channel or dm the user has joined');
}

function messageRemoveV1(token: string, messageId: number) {
  const authUserId: number = findUserIdUsingToken(token);
  // iteration4 take a message away if edited to 0
  updateDelMessageStats(authUserId);
  updateInvolvement(authUserId);
  updateDelMessageUsersStats(authUserId);
  return messageEditV1(token, messageId, '');
}

function messageSendDmV1(token: string, dmId: number, message: string) {
  if (message.length < 1) {
    throw HTTPError(400, 'Message is too short');
  } else if (message.length > 1000) {
    throw HTTPError(400, 'Message is too long');
  }
  const data = getData();
  const exists: boolean = checkForValidToken(token);
  if (exists === false) {
    throw HTTPError(403, 'Token is invalid');
  }
  const authUserId: number = findUserIdUsingToken(token);
  let dm;
  let dmFlag = false;
  let memberFlag = false;
  for (const index of data.dms) {
    if (index.dmId === dmId) {
      dmFlag = true;
      dm = index;
      // member is not a part of the channel
      for (const value of index.allMembers) {
        if (value.uId === authUserId) {
          memberFlag = true;
        }
      }
    }
  }
  if (dmFlag === false) {
    throw HTTPError(400, 'Invalid dm');
  }
  if (memberFlag === false) {
    throw HTTPError(403, 'Channel is valid but user is not an authorised member of channel');
  }
  const newMessage: message = {
    messageId: data.messageGlobal,
    message: message,
    uId: authUserId,
    timeSent: Math.floor(Date.now() / 1000),
    isPinned: false,
    reacts: [{
      reactId: 1,
      uIds: [],
    }]
  };
  data.messageGlobal++;
  dm.messages.unshift(newMessage);
  setData(data);

  // Iteration 4 
  updateMessageStats(authUserId);
  updateInvolvement(authUserId);
  updateMessageUsersStats(authUserId);

  const tagged = checkForTag(message);
  if (tagged.length > 0) {
    const dmMembers = data.dms.find((dm: {dmId: number}) => dm.dmId === dmId).allMembers;
    for (const index of tagged) {
      const member = dmMembers.find((member: {uId: number}) => member.uId === index);
      if (member !== undefined) {
        createNotification(authUserId, index, -1, dmId, 'tagged you in', true, message);
      }
    }
  }

  return { messageId: data.messageGlobal - 1 };
}

/**
 * Shares a message to the given channel/dm and appends an optional message
 *
 * @param token: token of user sharing the message
 * @param ogMessageId: id of the original message
 * @param message: optional message that is appended, given it is not empty or too long
 * @param channelId: channel message is being shared to (-1 if it is being shared to a dm)
 * @param dmId: dm message is being shared to (-1 if it is being shared to a channel)
 *
 * @returns sharedMessageId if no error
 * @returns HTTPError if channelId and dmId are invalid, neither channelId nor
 * dmId are -1, ogMessageId does not refer to a valid message, length of
 * optional message is more than 1000 characters, authorised user is not part of
 * channel/dm
 *
 */
function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const data = getData();
  const exists: boolean = checkForValidToken(token);
  if (exists === false) {
    throw HTTPError(403, 'Token is invalid.');
  }

  const authUserId: number = findUserIdUsingToken(token);
  const channel = data.channels.find((obj: channel) => obj.channelId === channelId);
  const dm = data.dms.find((obj: dm) => obj.dmId === dmId);
  if (typeof channel !== 'undefined') {
    if (dmId !== -1) {
      throw HTTPError(400, 'DmId is not -1.');
    }
    if (channel.allMembers.find((usr: member) => usr.uId === authUserId) === undefined) {
      throw HTTPError(403, 'User not found in channel.');
    }
    let ogMessage = data.channels.find((obj: channel) => obj.messages.find((obj: message) => obj.messageId === ogMessageId));
    if (typeof ogMessage === 'undefined') {
      ogMessage = data.dms.find((obj: dm) => obj.messages.find((obj: message) => obj.messageId === ogMessageId));
      if (typeof ogMessage === 'undefined') {
        throw HTTPError(400, 'Message not found');
      }
    }
    return {
      sharedMessageId: messageSendV1(token, channelId, ogMessage.message + message).messageId
    };
  } else if (typeof dm !== 'undefined') {
    if (channelId !== -1) {
      throw HTTPError(400, 'ChannelId is not -1.');
    }
    if (dm.allMembers.find((usr: member) => usr.uId === authUserId) === undefined) {
      throw HTTPError(403, 'User not found in dm.');
    }
    let ogMessage = data.dms.find((obj: dm) => obj.messages.find((obj: message) => obj.messageId === ogMessageId));
    if (typeof ogMessage === 'undefined') {
      ogMessage = data.channels.find((obj: channel) => obj.messages.find((obj: message) => obj.messageId === ogMessageId));
      if (typeof ogMessage === 'undefined') {
        throw HTTPError(400, 'Message not found');
      }
    }
    return {
      sharedMessageId: messageSendDmV1(token, dmId, ogMessage.message + message).messageId
    };
  } else {
    throw HTTPError(400, 'Channel and dm are invalid.');
  }
}

function messageReactV1(token: string, messageId: number, reactId: number) {
  let data = getData();
  const exists: boolean = checkForValidToken(token);
  if (exists === false) {
    throw HTTPError(403, 'Token is invalid');
  }
  const authUserId: number = findUserIdUsingToken(token);
  if (reactId !== 1) {
    throw HTTPError(400, 'Only valid reactID is 1');
  }

  for (const index of [...data.channels, ...data.dms]) {
    const message = index.messages.find((message: {messageId: number}) => message.messageId === messageId);
    if (message === undefined) {
      continue;
    }
    const members = index.allMembers.find((member: {uId: number}) => member.uId === authUserId);
    if (members === undefined) {
      throw HTTPError(400, 'User is not part of the channel or dm');
    }
    // check if already reacted
    let memberArray = message.reacts[0].uIds;
    if (memberArray.some((uId: number) => uId === authUserId) === true) {
      throw HTTPError(400, 'User has already reacted');
    } else {
      let channel: number;
      let dm: number;
      if ([...data.channels, ...data.dms].findIndex(key => key === index) >= data.channels.length) {
        channel = -1;
        dm = index.dmId;
      } else {
        channel = index.channelId;
        dm = -1;
      }
      if (authUserId !== message.uId) {
        data = createNotification(authUserId, message.uId, channel, dm, 'reacted to your message in', false);
        let newMessage;
        if (channel !== -1) {
          newMessage = [...data.channels, ...data.dms][[...data.channels, ...data.dms].findIndex((key: {channelId: number}) => key.channelId === index.channelId)].messages.find((message: {messageId: number}) => message.messageId === messageId);
        } else {
          newMessage = [...data.channels, ...data.dms][[...data.channels, ...data.dms].findIndex((key: {dmId: number}) => key.dmId === index.dmId)].messages.find((message: {messageId: number}) => message.messageId === messageId);
        }
        memberArray = newMessage.reacts[0].uIds;
      }

      memberArray.push(authUserId);
    }
  }
  setData(data);
  return {};
}

function messageUnReactV1(token: string, messageId: number, reactId: number) {
  const data = getData();
  const exists: boolean = checkForValidToken(token);
  if (exists === false) {
    throw HTTPError(403, 'Token is invalid');
  }
  const authUserId: number = findUserIdUsingToken(token);
  if (reactId !== 1) {
    throw HTTPError(400, 'Only valid reactID is 1');
  }

  for (const index of [...data.channels, ...data.dms]) {
    const message = index.messages.find((message: {messageId: number}) => message.messageId === messageId);
    if (message === undefined) {
      continue;
    }
    const members = index.allMembers.find((member: {uId: number}) => member.uId === authUserId);
    if (members === undefined) {
      throw HTTPError(400, 'User is not part of the channel or dm');
    }
    // check if not reacted
    const memberArray = message.reacts[0].uIds;
    const indexValue = memberArray.findIndex((uId: number) => uId === authUserId);
    if (indexValue === -1) {
      throw HTTPError(400, 'User has not reacted');
    } else {
      memberArray.splice(indexValue, 1);
    }
  }
  setData(data);
  return {};
}

async function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number) {
  if ((timeSent * 1000 - Date.now()) < 0) {
    throw HTTPError(400, 'Timesent is a time in the past');
  }
  await sleep(timeSent * 1000 - Date.now());

  let messageId: any;
  try {
    messageId = messageSendV1(token, channelId, message);
  } catch (err) {
    throw HTTPError(err.statusCode, 'Recieved Error');
  }
  return { messageId: (await messageId).messageId };
}

async function messageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number) {
  if ((timeSent * 1000 - Date.now()) < 0) {
    throw HTTPError(400, 'Timesent is a time in the past');
  }
  await sleep(timeSent * 1000 - Date.now());

  let messageId: any;
  try {
    messageId = messageSendDmV1(token, dmId, message);
  } catch (err) {
    throw HTTPError(err.statusCode, 'Recieved Error');
  }
  return { messageId: (await messageId).messageId };
}

async function sleep(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

// function messageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number) {
//   // also need to account for if dm is removed before timeSent
//   setTimeout(messageHelpDm, timeSent * 1000 - Date.now(), token, dmId, message);
//   return { messageId: 1 };
// }

/**
 * Given a message within a channel or DM, marks it as "pinned".
 *
 * @param {string} token - A user token of the function caller
 * @param {integer} messageId - The Id of the message to be pinned
 *
 * @returns {} - (Successful call)
 * @returns {error} - When the messageId is invalid, the message is already pinned,
 * or when the auth user does not have owner permissions.
 */
function messagePinV1(token: string, messageId: number) {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  const authUserProfile = data.users.find((user: { authUserId: number }) => user.authUserId === authUserId);
  if (!isTokenValid || typeof authUserProfile === 'undefined') {
    throw HTTPError(403, 'Token is invalid');
  } else {
    let isMessageIdValid = false;
    for (const index of [...data.channels, ...data.dms]) {
      const message = index.messages.find((message: {messageId: number}) => message.messageId === messageId);
      if (typeof message === 'undefined') {
        continue;
      }
      isMessageIdValid = true;
      const owner = index.ownerMembers.find((member: {uId: number}) => member.uId === authUserId);
      const member = index.allMembers.find((member: {uId: number}) => member.uId === authUserId);
      let isChannel = true;
      if ([...data.channels, ...data.dms].findIndex(key => key === index) >= data.channels.length) {
        isChannel = false;
      }
      if (typeof member === 'undefined') {
        throw HTTPError(400, 'User is not part of the channel or DM');
      } else if (typeof owner === 'undefined') {
        if (authUserProfile.globalPermissions !== globalOwner && isChannel === true) {
          throw HTTPError(403, 'User does not have owner permissions in the channel');
        } else if (isChannel === false) {
          throw HTTPError(403, 'User does not have owner permissions in the DM');
        }
      } else if (message.isPinned === true) {
        throw HTTPError(400, 'Message is already pinned');
      } else {
        message.isPinned = true;
      }
    }
    if (!isMessageIdValid) {
      throw HTTPError(400, 'MessageId is invalid');
    }
    setData(data);
    return {};
  }
}

/**
 * Given a message within a channel or DM, removes its mark as "pinned".
 *
 * @param {string} token - A user token of the function caller
 * @param {integer} messageId - The Id of the message to be unpinned
 *
 * @returns {} - (Successful call)
 * @returns {error} - When the messageId is invalid, the message is not already pinned,
 * or when the auth user does not have owner permissions.
 */
function messageUnpinV1(token: string, messageId: number) {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  const authUserProfile = data.users.find((user: { authUserId: number }) => user.authUserId === authUserId);
  if (!isTokenValid || typeof authUserProfile === 'undefined') {
    throw HTTPError(403, 'Token is invalid');
  } else {
    let isMessageIdValid = false;
    for (const index of [...data.channels, ...data.dms]) {
      const message = index.messages.find((message: {messageId: number}) => message.messageId === messageId);
      if (typeof message === 'undefined') {
        continue;
      }
      isMessageIdValid = true;
      const owner = index.ownerMembers.find((member: {uId: number}) => member.uId === authUserId);
      const member = index.allMembers.find((member: {uId: number}) => member.uId === authUserId);
      let isChannel = true;
      if ([...data.channels, ...data.dms].findIndex(key => key === index) >= data.channels.length) {
        isChannel = false;
      }
      if (typeof member === 'undefined') {
        throw HTTPError(400, 'User is not part of the channel or DM');
      } else if (typeof owner === 'undefined') {
        if (authUserProfile.globalPermissions !== globalOwner && isChannel === true) {
          throw HTTPError(403, 'User does not have owner permissions in the channel');
        } else if (isChannel === false) {
          throw HTTPError(403, 'User does not have owner permissions in the DM');
        }
      } else if (message.isPinned === false) {
        throw HTTPError(400, 'Message is not already pinned');
      } else {
        message.isPinned = false;
      }
    }
    if (!isMessageIdValid) {
      throw HTTPError(400, 'MessageId is invalid');
    }
    setData(data);
    return {};
  }
}

export { sleep, messageSendV1, messageEditV1, messageRemoveV1, messageSendDmV1, messageSendLaterV1, messageSendLaterDmV1, messageReactV1, messageUnReactV1, messagePinV1, messageUnpinV1, messageShareV1 };
