import { setData, getData } from './dataStore';
import { checkForValidToken, findUserIdUsingToken } from './token';
import { checkAuthUserExist } from './auth';
import { dm, dmList, error, message, messageView, member, reactOutput } from './types';
import HTTPError from 'http-errors';
import { createNotification } from './notifications';
import { updateDmStats, updateDelDmStats, updateDmUsersStats, updateDelDmUsersStats, 
  updateSpecificDelMessageUsersStats, updateSpecificDelMessageStats, updateInvolvement } from './stats';

/**
 * Remove an existing DM, so all members are no longer in the DM.
 * This can only be done by the original creator of the DM.
 *
 * @param token: string - token of the original creator of the DM
 * @param dmId: number - Id of the DM
 *
 * @returns {} if no error
 * @returns { error } if dmId, token is invalid and if user is not the original
 * DM creator or is no longer in the DM
 */
function dmRemoveV1(token: string, dmId: number) {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  if (!checkAuthUserExist(authUserId)) {
    throw HTTPError(403, 'Could not find user');
  }
  const authUserProfile = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  const dmProfile = data.dms.find((dm: {dmId: number}) => dm.dmId === dmId);
  if (!isTokenValid || typeof authUserProfile === 'undefined') {
    throw HTTPError(403, 'Token is invalid');
  } else if (typeof dmProfile === 'undefined') {
    throw HTTPError(400, 'DmId does not refer to a valid DM');
  } else {
    if (dmProfile.allMembers.some((member: {uId: number}) => member.uId === authUserId) === false) {
      throw HTTPError(403, 'User is no longer in the DM');
    } else if (dmProfile.ownerMembers.some((owner: {uId: number}) => owner.uId === authUserId) === false) {
      throw HTTPError(403, 'User is not the original DM creator');
    }
    const index = data.dms.findIndex((dm: dm): dm is dm => dm === dmProfile);
    if (index > -1) {
      data.dms.splice(index, 1);
    }
    // Added in iteration 4
    const uIds = dmProfile.allMembers;
    if (!checkUniqueArray(uIds)) {
      throw HTTPError(400, 'Duplicate user found');
    }

    const dmMessages = dmProfile.messages;
    const numMessageInDm = dmMessages.length;
    // Get all messages that arent deleted.
    const filteredMessage = dmMessages.filter((message: message) => {
      return message.uId === authUserId && message.message !== '';
    });
    const numMessagesinDmForAuth= filteredMessage.length;


    setData(data);

    // Iteration 4 - update dms + update messages that were deleted in DM
    for (const index of uIds) {
      if (authUserId !== index.uId) {
        // const filterMessage = dmMessages.filter((message: message) => {
        //   return message.uId === index.uId && message.message !== '';
        // });
        // const numMessagesinDmForIndex= filterMessage.length;
        updateDelDmStats(index.uId);
        updateInvolvement(index.uId);
        // delete any messages sent by index.uId
        // updateSpecificDelMessageStats(index.uId, numMessagesinDmForIndex);
      }
    }
    updateDelDmStats(authUserId);
    updateDelDmUsersStats(authUserId);
    // Delete all the messages that were contained in dm
    updateSpecificDelMessageUsersStats(authUserId, numMessageInDm);
    // Delete all messages sent by authUserId
    updateSpecificDelMessageStats(authUserId, numMessagesinDmForAuth);
    updateInvolvement(authUserId);

    return {};
  }
}


/**
 * Given a DM ID, the user is removed as a member of this DM.
 * The creator is allowed to leave and the DM will still exist if this happens.
 * This does not update the name of the DM.
 *
 * @param token: string - token of the user
 * @param dmId: number - Id of the DM
 *
 * @returns {} if no error
 * @returns { error } if dmId or token is invalid and if user is not a member of the DM
 */
function dmLeaveV1(token: string, dmId: number) {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  const dmProfile = data.dms.find((dm: {dmId: number}) => dm.dmId === dmId);
  if (!isTokenValid) {
    throw HTTPError(403, 'Invalid Token');
  } else if (dmProfile === undefined) {
    throw HTTPError(400, 'Invalid dmId');
  } else {
    if (dmProfile.allMembers.some((member: {uId: number}) => member.uId === authUserId) === false) {
      throw HTTPError(403, 'User is not a member of the DM');
    } else if (dmProfile.ownerMembers.some((owner: {uId: number}) => owner.uId === authUserId) === true) {
      const index = dmProfile.ownerMembers.findIndex((owner: {uId: number}) => owner.uId === authUserId);
      if (index > -1) {
        dmProfile.ownerMembers.splice(index, 1);
      }
    }
    const index = dmProfile.allMembers.findIndex((member: {uId: number}) => member.uId === authUserId);
    if (index > -1) {
      dmProfile.allMembers.splice(index, 1);
    }
    setData(data);

    // Iteration 4
    updateDelDmStats(authUserId);
    updateInvolvement(authUserId);
    return {};
  }
}

/**
 * Returns the list of DMs that the user is a member of.
 * @param token: string - token of the user requesting the list
 * @returns { dms[] }: (Array of objects with keys { dmId, name }) if no error
 * @returns { error } if token is invalid
 */
function dmListV1(token: string): { dms: dmList } | error {
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  const uId = findUserIdUsingToken(token);
  const dms: dmList = getData().dms.filter((dm: dm): dm is dm => dm.allMembers.find((member: {uId: number}) => member.uId === uId) !== undefined);
  if (dms.length === 0) {
    return { dms: dms };
  }
  const returnArr: dmList = [];

  for (const index of dms) {
    returnArr.push({
      dmId: index.dmId,
      name: index.name,
    });
  }
  return { dms: returnArr };
}

/**
 * If array is unique true, else false
 * @param arr - input
 */
const checkUniqueArray = (arr: number[]): boolean | { error : string } => {
  // Iterate over each element
  for (let i = 0; i < arr.length; i++) {
    // Check current element is duplicated
    if (arr.indexOf(arr[i]) !== arr.lastIndexOf(arr[i])) {
      // If so, return `false`
      return false;
    }
  }

  // If no duplicates, return true.
  return true;
};

/**
 * Create/store new DM and return the id of the DM
 * @param uId - input user creating DM
 * @param uIds - Users who are in the dm (other users)
 */
export const createDM = (token:string, uIds: number[]) => {
  const uId = findUserIdUsingToken(token);

  if (uId === null) {
    throw HTTPError(403, 'Invalid Token');
  }

  if (!checkUniqueArray(uIds)) {
    throw HTTPError(400, 'Duplicate user found');
  }

  if (uIds.some(uId => !checkAuthUserExist(uId))) {
    throw HTTPError(400, 'Invalid user in uIds');
  }

  // const allMembers = [...uIds, uId];
  const data = getData();
  let dmId;
  if (data.dms.length === 0) {
    dmId = 1;
  } else {
    dmId = data.dms[data.dms.length - 1].dmId + 1;
  }

  const allMembers: member[] = [];
  const memberHandles: string[] = [];
  for (const index of data.users) {
    if (index.authUserId === uId) {
      memberHandles.push(index.handleStr);
      allMembers.push({
        uId: index.authUserId,
        email: index.email,
        nameFirst: index.nameFirst,
        nameLast: index.nameLast,
        handleStr: index.handleStr,
        profileImgUrl: index.profileImgUrl,
      });
    }
  }
  for (const index of data.users) {
    for (const value of uIds) {
      if (index.authUserId === value) {
        memberHandles.push(index.handleStr);
        allMembers.push({
          uId: index.authUserId,
          email: index.email,
          nameFirst: index.nameFirst,
          nameLast: index.nameLast,
          handleStr: index.handleStr,
          profileImgUrl: index.profileImgUrl,
        });
      }
    }
  }
  let name: string;
  memberHandles.sort((a, b) => {
    return a.localeCompare(b);
  });
  name = memberHandles[0];
  for (const index of memberHandles) {
    if (name === index) {
      continue;
    }
    name = name + ', ' + index;
  }

  const authUserProfile = data.users.find((user: {authUserId: number}) => user.authUserId === uId);
  const ownerMember = {
    uId: uId,
    nameFirst: authUserProfile.nameFirst,
    nameLast: authUserProfile.nameLast,
    email: authUserProfile.email,
    handleStr: authUserProfile.handleStr,
    profileImgUrl: authUserProfile.profileImgUrl,
  };

  data.dms.push({
    dmId: dmId,
    ownerMembers: [ownerMember],
    allMembers: allMembers,
    name: name,
    messages: [],
  });

  setData(data);

  for (const index of uIds) {
    createNotification(uId, index, -1, dmId, 'added you to', false);
    // Iteration 4 - update other users
    updateDmStats(index);
    updateInvolvement(index);
  }
  // update main user
  updateDmStats(uId);
  updateInvolvement(uId);
  // Update server users/stat
  updateDmUsersStats(uId);


  return { dmId };
};

/**
 * Given a DM with ID dmId that the authorised user is a member of,
 * provide basic details about the DM.
 *
 * @param token: string - token of the user
 * @param dmId: number - Id of the DM
 *
 * @returns {} if no error
 * @returns { error } if dmId or token is invalid or if user is not a member of the DM
 */
function dmDetailsV1(token: string, dmId: number) {
  const data = getData();
  const authUserId = findUserIdUsingToken(token);
  const dmProfile = data.dms.find((dm: {dmId: number}) => dm.dmId === dmId);
  if (checkForValidToken(token) === false) {
    throw HTTPError(403, 'Invalid Token');
  } else if (dmProfile === undefined) {
    throw HTTPError(400, 'Invalid dmId');
  } else {
    if (dmProfile.allMembers.some((member: {uId: number}) => member.uId === authUserId) === false) {
      throw HTTPError(403, 'User is not a member of the dm');
    }

    const val = {
      name: dmProfile.name,
      members: dmProfile.allMembers,
    };

    return val;
  }
}

function dmMessagesV1(token: string, dmId: number, start: number): {error: string} | messageView {
  // Check for if authUserId is valid
  const data = getData();
  const exists: boolean = checkForValidToken(token);
  if (exists === false) {
    throw HTTPError(403, 'Invalid Token');
  }
  const authUserId = findUserIdUsingToken(token);
  // Check for if channelId is valid
  // Check for if the user is part of the channel
  let dmFlag = false;
  let memberFlag = false;
  for (const index of data.dms) {
    if (index.dmId === dmId) {
      dmFlag = true;
      for (const index2 of index.allMembers) {
        if (authUserId === index2.uId) {
          memberFlag = true;
        }
      }
    }
  }
  if (dmFlag === false) {
    throw HTTPError(400, 'dm not found');
  }
  if (memberFlag === false) {
    throw HTTPError(403, 'User is not a member of this dm');
  }
  const messages: message[] = [];
  const output: messageView = {
    messages: messages,
    start: start,
    end: -1,
  };
  let messageTotal;
  for (const index of data.dms) {
    if (index.dmId === dmId) {
      messageTotal = (index.messages).length;
      // Check for if start is greater than the total number of messages
      if (messageTotal < start) {
        throw HTTPError(400, 'There are no messages after the specified start');
      }

      let available;
      if (start + 50 < messageTotal) {
        output.end = start + 50;
        available = start + 50;
      } else {
        available = messageTotal;
      }
      for (let index2 = start; index2 < available; index2++) {
        let userReactFlag = false;
        if (index.messages[index2].reacts[0].uIds.find((uId :number) => uId === authUserId) !== undefined) {
          userReactFlag = true;
        }
        const reactArr: reactOutput = {
          reactId: index.messages[index2].reacts[0].reactId,
          uIds: index.messages[index2].reacts[0].uIds.slice(),
          isThisUserReacted: userReactFlag,
        };
        const message: message = {
          messageId: index.messages[index2].messageId,
          uId: index.messages[index2].uId,
          message: index.messages[index2].message.slice(),
          timeSent: index.messages[index2].timeSent,
          isPinned: index.messages[index2].isPinned,
          reacts: [reactArr]
        };
        output.messages.push(message);
      }
    }
  }
  return output;
}

export { dmMessagesV1, dmListV1, dmDetailsV1, dmRemoveV1, dmLeaveV1 };
