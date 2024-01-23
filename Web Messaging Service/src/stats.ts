import { getData, setData } from './dataStore';
import { checkAuthUserExist } from './auth'
import HTTPError from 'http-errors';

/**
 * Fetches statistics for the entire workspace
 * @param {number} authUserId - The user making call
 * @returns - the entire workspace
 */
 export const usersStatsV1 = (authUserId: number) => {
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }
  return {
    workspaceStats: getData().usersStats
  };
};

/**
* Fetches statistics for a single user
* @param {number} authUserId - The user making call
* @returns - the user's statistics
*/
export const userStatsV1 = (authUserId: number) => {
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }

  const stats = getData().users.find((user: {authUserId: number}) => user.authUserId === authUserId).userStats;
  
  return { userStats: stats };
};

/**
 * Function to update the utilisation rate of the workspace
 * @param {} tokens
 * @returns 
 */
 export const updateUtilisation = (authUserId: number) => {
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }
  const data = getData();

  // Flag to indicate whether use was in DM/channel
  let flag = 0;
  let numUserJoinedChannelOrDm = 0;
  for (const index of data.users) {
    flag = 0;
    for (const channel of data.channels) {
      for (const member of channel.allMembers) {
        if (member.uId === index.authUserId) {
          flag = 1;
        }
      }
    }
    for (const dm of data.dms) {
      for (const member of dm.allMembers) {
        if (member.uId === index.authUserId) {
          flag = 1;
        }
      }
    }
    if (flag === 1) {
      numUserJoinedChannelOrDm++;
    }
  }

  data.usersStats.utilizationRate = numUserJoinedChannelOrDm / data.users.length;

  setData(data);
  return {};
};


/**
 * function to initialise values at auth Register
 * @param {number} authUserId 
 * @returns {}
 */
export const initialiseStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }
  const timeStamp = Math.floor(Date.now() / 1000);

  const user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  // Access individual user stats
  const userStats = user.userStats;

  userStats.channelsJoined.push({numChannelsJoined: 0, timeStamp: timeStamp});
  userStats.dmsJoined.push({numDmsJoined: 0, timeStamp: timeStamp});
  userStats.messagesSent.push({numMessagesSent: 0, timeStamp: timeStamp});

  setData(data);
  return {};
};

/**
 * function to update Channel stats for User
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateChannelStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }

  const user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  // Access individual user stats
  const userStats = user.userStats;
  const timeStamp = Math.floor(Date.now() / 1000);

  const array = userStats.channelsJoined;
  const number = array[array.length - 1].numChannelsJoined;

  // initialise 
  const numChannelsJoined = number + 1;
  userStats.channelsJoined.push({numChannelsJoined: numChannelsJoined, timeStamp: timeStamp});

  setData(data);
  return {};
};

/**
 * function to update Channel stats for User but for delete
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateDelChannelStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }

  const user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  // Access individual user stats
  const userStats = user.userStats;
  const timeStamp = Math.floor(Date.now() / 1000);

  const array = userStats.channelsJoined;
  const number = array[array.length - 1].numChannelsJoined;

  // initialise 
  const numChannelsJoined = number - 1;
  userStats.channelsJoined.push({numChannelsJoined: numChannelsJoined, timeStamp: timeStamp});


  setData(data);
  return {};
};

/**
 * function to update Channel stats for Users/stats
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateChannelUsersStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }
  const timeStamp = Math.floor(Date.now() / 1000);
  // update usersStats
  const usersStats = data.usersStats
  const arrayBig = usersStats.channelsExist

  const numberBig = arrayBig[arrayBig.length - 1].numChannelsExist;
  const numChannelsExist = numberBig + 1;
  usersStats.channelsExist.push({numChannelsExist: numChannelsExist, timeStamp: timeStamp});

  setData(data);
  updateUtilisation(authUserId);
  return {};
};

/**
 * function to update Channel stats for Users/stats for delete
 * NOT USED RN, just in case needed
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateDelChannelUsersStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }
  const timeStamp = Math.floor(Date.now() / 1000);
  // update usersStats
  const usersStats = data.usersStats
  const arrayBig = usersStats.channelsExist

  const numberBig = arrayBig[arrayBig.length - 1].numChannelsExist;
  const numChannelsExist = numberBig - 1;
  usersStats.channelsExist.push({numChannelsExist: numChannelsExist, timeStamp: timeStamp});

  setData(data);
  updateUtilisation(authUserId);
  return {};
};


/**
 * function to update messages for users/stats
 * @param {number} authUserId 
 * @returns {}
 */
export const updateMessageUsersStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }

  const timeStamp = Math.floor(Date.now() / 1000);
  // update usersStats
  const usersStats = data.usersStats
  const arrayBig = usersStats.messagesExist

  const numberBig = arrayBig[arrayBig.length - 1].numMessagesExist;
  const numMessagesExist = numberBig + 1;
  usersStats.messagesExist.push({numMessagesExist: numMessagesExist, timeStamp: timeStamp});

  setData(data);
  updateUtilisation(authUserId);
  return {};
};

/**
 * function to update messages for users/stats for delete
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateDelMessageUsersStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }

  const timeStamp = Math.floor(Date.now() / 1000);
  // update usersStats
  const usersStats = data.usersStats
  const arrayBig = usersStats.messagesExist

  const numberBig = arrayBig[arrayBig.length - 1].numMessagesExist;
  const numMessagesExist = numberBig - 1;
  usersStats.messagesExist.push({numMessagesExist: numMessagesExist, timeStamp: timeStamp});

  setData(data);
  updateUtilisation(authUserId);
  return {};
};

/**
 * function to update messages for users/stats for delete
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateSpecificDelMessageUsersStats = (authUserId: number, amount: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }

  const timeStamp = Math.floor(Date.now() / 1000);
  // update usersStats
  const usersStats = data.usersStats
  const arrayBig = usersStats.messagesExist

  const numberBig = arrayBig[arrayBig.length - 1].numMessagesExist;
  const numMessagesExist = numberBig - amount;
  usersStats.messagesExist.push({numMessagesExist: numMessagesExist, timeStamp: timeStamp});

  setData(data);
  updateUtilisation(authUserId);
  return {};
};

/**
 * function to update messages
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateMessageStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }

  const user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  // Access individual user stats
  const userStats = user.userStats;
  const timeStamp = Math.floor(Date.now() / 1000);
  const array = userStats.messagesSent;
  const number = array[array.length - 1].numMessagesSent;

  // initialise 
  const numMessagesSent = number + 1;
  // Check if same as previous
  if (numMessagesSent === number) {
    setData(data);
    return {};
  }
  userStats.messagesSent.push({numMessagesSent: numMessagesSent, timeStamp: timeStamp});

  setData(data);
  return {};
};

/**
 * function to update messages but delete
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateDelMessageStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }

  const user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  // Access individual user stats
  const userStats = user.userStats;
  const timeStamp = Math.floor(Date.now() / 1000);
  const array = userStats.messagesSent;
  const number = array[array.length - 1].numMessagesSent;

  // initialise 
  const numMessagesSent = number - 1;
  // Check if same as previous
  if (numMessagesSent === number) {
    setData(data);
    return {};
  }
  userStats.messagesSent.push({numMessagesSent: numMessagesSent, timeStamp: timeStamp});

  setData(data);
  return {};
};

/**
 * function to update messages but delete (specifc amount delete)
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateSpecificDelMessageStats = (authUserId: number, amount: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }

  const user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  // Access individual user stats
  const userStats = user.userStats;
  const timeStamp = Math.floor(Date.now() / 1000);
  const array = userStats.messagesSent;
  const number = array[array.length - 1].numMessagesSent;

  // initialise 
  const numMessagesSent = number - amount;
  // Check if same as previous
  if (numMessagesSent === number) {
    setData(data);
    return {};
  }
  userStats.messagesSent.push({numMessagesSent: numMessagesSent, timeStamp: timeStamp});

  setData(data);
  return {};
};

/**
 * function to update dms is users/stat
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateDmUsersStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }
  const timeStamp = Math.floor(Date.now() / 1000);
  // update usersStats
  const usersStats = data.usersStats
  const arrayBig = usersStats.dmsExist

  const numberBig = arrayBig[arrayBig.length - 1].numDmsExist;
  const numDmsExist = numberBig + 1;
  usersStats.dmsExist.push({numDmsExist: numDmsExist, timeStamp: timeStamp});

  setData(data);
  updateUtilisation(authUserId);
  return {};
};

/**
 * function to update dms is users/stat to remove
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateDelDmUsersStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }
  const timeStamp = Math.floor(Date.now() / 1000);
  // update usersStats
  const usersStats = data.usersStats
  const arrayBig = usersStats.dmsExist

  const numberBig = arrayBig[arrayBig.length - 1].numDmsExist;
  const numDmsExist = numberBig - 1;
  usersStats.dmsExist.push({numDmsExist: numDmsExist, timeStamp: timeStamp});
  setData(data);
  updateUtilisation(authUserId);
  return {};
};

/**
 * function to update dms
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateDmStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }

  const user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  // Access individual user stats
  const userStats = user.userStats;

  const timeStamp = Math.floor(Date.now() / 1000);

  const array = userStats.dmsJoined;

  const number = array[array.length - 1].numDmsJoined;

  // initialise 
  const numDmsJoined = number;
  userStats.dmsJoined.push({numDmsJoined: numDmsJoined + 1, timeStamp: timeStamp});

  setData(data);
  return {};
};

/**
 * function to update dms but to delete
 * @param {number} authUserId 
 * @returns {}
 */
 export const updateDelDmStats = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }

  const user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  // Access individual user stats
  const userStats = user.userStats;
  const timeStamp = Math.floor(Date.now() / 1000);

  const array = userStats.dmsJoined;
  const number = array[array.length - 1].numDmsJoined;

  // initialise 
  const numDmsJoined = number - 1;
  userStats.dmsJoined.push({numDmsJoined: numDmsJoined, timeStamp: timeStamp});

  setData(data);
  return {};
};


/**
 * function to update the users stats to the datastore
 * @param {number} authUserId 
 * @returns {}
 */
export const updateInvolvement = (authUserId: number) => {
  const data = getData();
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }
  const user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  // Access individual user stats
  const userStats = user.userStats;

  // get number of channels
  const chaArray = userStats.channelsJoined;
  const chaNum = chaArray[chaArray.length - 1].numChannelsJoined;

  //  get number of message
  const mesArray = userStats.messagesSent;
  const mesNum = mesArray[mesArray.length - 1].numMessagesSent;

  // get number of dms
  const dmArray = userStats.dmsJoined;
  const dmNum = dmArray[dmArray.length - 1].numDmsJoined;

  const usersStats = data.usersStats;

  // get number of total channels to exist
  const totChaArray = usersStats.channelsExist;
  const totChaNum = totChaArray[totChaArray.length - 1].numChannelsExist;

  // get number of total dm to exist
  const totDmArray = usersStats.dmsExist;
  const totDmNum = totDmArray[totDmArray.length - 1].numDmsExist;

  // get total number of messages to exist
  const totMsgArray = usersStats.messagesExist;
  const totMsgNum = totMsgArray[totMsgArray.length - 1].numMessagesExist

  userStats.involvementRate = getUsersInvolve(
    chaNum, dmNum, mesNum, totChaNum, totDmNum, totMsgNum
  );

  setData(data);
  return {};
}

/**
 * Function to get users involvement
 * @param {number} getNumChanJoin - number of channels joined
 * @param {number} getNumDmsJoin - num of dms joined
 * @param {number} getNumMessSent - num of messages 
 * @param {number} checkChanExist - number of channels existing
 * @param {number} checkDmsExist - number of dms existing
 * @param {number} checkMessageExist - number of message existing
 * @returns {number} - user involvement
 */
 const getUsersInvolve = (
  getNumChanJoin: number,
  getNumDmJoin: number,
  getNumMessSent: number,
  checkChanExist: number,
  checkDmsExist: number,
  checkMessageExist: number,
) => {

  const denom = checkChanExist + checkDmsExist + checkMessageExist;
  const numer = getNumChanJoin + getNumDmJoin + getNumMessSent;
  const involve = denom === 0 ? 0 : numer / denom;

  return Math.min(involve, 1);
};