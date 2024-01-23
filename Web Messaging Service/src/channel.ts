import { getData, setData } from './dataStore';
import { globalOwner, globalMember, messageOutput, messageView, reactOutput } from './types';
import { checkForValidToken, findUserIdUsingToken } from './token';
import HTTPError from 'http-errors';
import { createNotification } from './notifications';
import { updateChannelStats, updateDelChannelStats, updateInvolvement } from './stats';

/**
 * Given a channelId of a channel that the authorised user can join, adds them to that channel.
 *
 * @param {string} token - A user token of the function caller
 * @param {integer} channelId - The channel Id of the channel the user wants to join
 *
 * @returns {} - (Successful call)
 * @returns {error} - When the authUserId or channelId is invalid, the user is already
 * a member of the channel or the channel is private and user is not a global owner
 */

function channelJoinV1(token: string, channelId: number) {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  const userProfile = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  const channelProfile = data.channels.find((channel: {channelId: number}) => channel.channelId === channelId);
  if (!isTokenValid || typeof userProfile === 'undefined') {
    throw HTTPError(403, 'Token is invalid');
  } else if (typeof channelProfile === 'undefined') {
    throw HTTPError(400, 'ChannelId does not refer to a valid channel');
  } else {
    const memberProfile = {
      uId: userProfile.authUserId,
      email: userProfile.email,
      nameFirst: userProfile.nameFirst,
      nameLast: userProfile.nameLast,
      handleStr: userProfile.handleStr,
      profileImgUrl: userProfile.profileImgUrl,
    };
    if (channelProfile.allMembers.some((member: {uId: number}) => member.uId === authUserId) === true) {
      throw HTTPError(400, 'User is already a member of the channel');
    } else if (channelProfile.isPublic === false && userProfile.globalPermissions === globalMember) {
      throw HTTPError(403, 'Channel is private and the user is not a global owner');
    } else {
      for (const index of data.channels) {
        if (index.channelId === channelId) {
          index.allMembers.push(memberProfile);
        }
      }
      setData(data);

      // Iteration 4
      updateChannelStats(authUserId);
      updateInvolvement(authUserId);
      return {};
    }
  }
}

/**
 * Given a channel with ID channelId that the authorised user is a member of,
 * provides basic details about the channel.
 *
 * @param {integer} authUserId - integer id of user who is requesting details
 * @param {integer} channelId - integer id of channel being requested
 * @returns { NamedCurve, isPublic, ownerMembers, allMembers} - upon no error,
 * it will return information about the channel in an object
 * @returns { error } - if the channelId or authUserId is invalid,
 * or if the authUser is not a member of the channel
 */
function channelDetailsV1(token: string, channelId: number) {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  const userProfile = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  const channelProfile = data.channels.find((channel: {channelId: number}) => channel.channelId === channelId);
  if (!isTokenValid || typeof userProfile === 'undefined') {
    throw HTTPError(403, 'Token is invalid');
  } else if (typeof channelProfile === 'undefined') {
    throw HTTPError(400, 'ChannelId is invalid');
  } else if (typeof (channelProfile.allMembers.find((member: {uId: number}) => member.uId === authUserId)) === 'undefined') {
    throw HTTPError(403, 'User is not a member of this channel');
  }

  return {
    name: channelProfile.channelName,
    isPublic: channelProfile.isPublic,
    ownerMembers: channelProfile.ownerMembers,
    allMembers: channelProfile.allMembers,
  };
}

/**
 * Searches for the most recent 50 messages in a channel, occuring after the start index.
 * Also returns an end value to allow for searching of older messages.
 *
 * @param {string} token - The token session of the user searching for the messages
 * @param {integer} channelId - The channel to search in
 * @param {integer} start - The message to start the search at
 * @returns {object} {Messages[], start, end} - The object shows the most recent messages as
*                                               well as a new end for searching older messages
 * @returns {error} - when authUserId or channelId are invalid, as well as when the user is not a part of the channel.
 */
function channelMessagesV2(token: string, channelId: number, start: number): messageView {
  // Check for if authUserId is valid
  const data = getData();
  const exists: boolean = checkForValidToken(token);
  if (exists === false) {
    throw HTTPError(403, 'Invalid Token');
  }
  const authUserId: number | null = findUserIdUsingToken(token);
  // Check for if channelId is valid
  // Check for if the user is part of the channel
  let channelFlag = false;
  let memberFlag = false;
  for (const index of data.channels) {
    if (index.channelId === channelId) {
      channelFlag = true;
      for (const index2 of index.allMembers) {
        if (authUserId === index2.uId) {
          memberFlag = true;
        }
      }
    }
  }
  if (channelFlag === false) {
    throw HTTPError(400, 'Channel Not Found');
  }
  if (memberFlag === false) {
    throw HTTPError(403, 'User is not a member of the channel');
  }
  const messages: messageOutput[] = [];
  const output: messageView = {
    messages,
    start: start,
    end: -1,
  };
  let messageTotal;
  for (const index of data.channels) {
    if (index.channelId === channelId) {
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
        const message: messageOutput = {
          messageId: index.messages[index2].messageId,
          uId: index.messages[index2].uId,
          message: index.messages[index2].message.slice(),
          timeSent: index.messages[index2].timeSent,
          isPinned: index.messages[index2].isPinned,
          reacts: [reactArr],
        };
        output.messages.push(message);
      }
    }
  }
  return output;
}

/**
 * Invites a user with ID uId to join a channel with ID channelId.
 * Once invited, the user is added to the channel immediately.
 * In both public and private channels, all members are able to invite users.
 *
 * @param {number} token - the user who is inviting
 * @param {number} channelId - channel that user is being invited to
 * @param {number} uId - the user being invited
 *
 * @returns {} - when no error
 * @returns { error: string } - when the channelId, uId, authUserId is invalid,
 * uId is already in the channel, or authUserId is not a member of the channel.
 */
function channelInviteV1(token: string, channelId: number, uId: number) {
  const dataStore = getData();
  const chId = dataStore.channels.find((ch: {channelId: number}) => ch.channelId === channelId);
  if (typeof chId === 'undefined') {
    throw HTTPError(400, 'ChannelId is invalid');
  }

  const usrId = dataStore.users.find((usr: {authUserId: number}) => usr.authUserId === uId);
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  } else if (typeof usrId === 'undefined') {
    throw HTTPError(400, 'UserId is invalid');
  }
  const duplicate = chId.allMembers.find((member: {uId: number}) => member.uId === uId);
  if (typeof duplicate !== 'undefined') {
    throw HTTPError(400, 'User is already a member of the channel');
  }
  const authUserId: number | null = findUserIdUsingToken(token);
  const authChannel = chId.allMembers.find((member: {uId: number}) => member.uId === authUserId);
  if (typeof authChannel === 'undefined') {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  chId.allMembers.push({
    uId: uId,
    email: usrId.email,
    nameFirst: usrId.nameFirst,
    nameLast: usrId.nameLast,
    handleStr: usrId.handleStr,
    profileImgUrl: usrId.profileImgUrl,
  });
  setData(dataStore);
  createNotification(authUserId, uId, channelId, -1, 'added you to', false);

  // Iteration 4
  updateChannelStats(uId);
  updateInvolvement(uId);

  return {};
}

/**
 * Returns object with details of user using uID
 * @param {number} uID
 * @returns {{
 *   uId: string, email: string, nameFirst: string,
 *   nameLast: string, handleStr: string
 * }}
 */
const fetchDetailsFromUser = (uID: number) => {
  const user = getData().users.find((user: {authUserId: number}) => user.authUserId === uID);

  return {
    uId: uID,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
  };
};

/**
 * Given a channel with ID channelId that the authorised user is a member of, remove them as a member of the channel.
 *
 * @param {string} token - A user token of the function caller
 * @param {integer} channelId - The channel Id of the channel the user wants to leave
 *
 * @returns {} - (Successful call)
 * @returns {error} - When the token or channelId is invalid, or when the user is not a member of the channel
 */
function channelLeaveV1(token: string, channelId: number) {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  const userProfile = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  const channelProfile = data.channels.find((channel: {channelId: number}) => channel.channelId === channelId);
  // const standupProfile = data.standups.find((standup: {channelId: number}) => standup.channelId === channelId);
  if (!isTokenValid || typeof userProfile === 'undefined') {
    throw HTTPError(403, 'Token is invalid');
  } else if (typeof channelProfile === 'undefined') {
    throw HTTPError(400, 'ChannelId does not refer to a valid channel');
  // } else if (typeof standupProfile !== 'undefined' && standupProfile.uId === authUserId &&
  // Math.floor(Date.now() / 1000) < standupProfile.timeFinish) {
  //   throw HTTPError(400, 'User is the starter of an active standup in the channel');
  } else {
    if (channelProfile.allMembers.some((member: {uId: number}) => member.uId === authUserId) === false) {
      throw HTTPError(403, 'User is not a member of the channel');
    } else if (channelProfile.ownerMembers.some((owner: {uId: number}) => owner.uId === authUserId) === true) {
      const index = channelProfile.ownerMembers.findIndex((owner: {uId: number}) => owner.uId === authUserId);
      if (index > -1) {
        channelProfile.ownerMembers.splice(index, 1);
      }
    }
    const index = channelProfile.allMembers.findIndex((member: {uId: number}) => member.uId === authUserId);
    if (index > -1) {
      channelProfile.allMembers.splice(index, 1);
    }
    setData(data);

    // Iteration 4
    updateDelChannelStats(authUserId);
    updateInvolvement(authUserId);
    
    return {};
  }
}

/**
 * Make user with user id uId an owner of the channel.
 *
 * @param {string} token - A user token of the function caller
 * @param {integer} channelId - The channel Id of the channel the user wants to become an owner of
 * @param {integer} uId - The user Id of the user to be added as an owner
 *
 * @returns {} - (Successful call)
 * @returns {error} - When the channelId, or token is invalid or when the uId refers to a user
 * who is not valid, not a member of the channel, is already an owner of the channel or does
 * not have owner permissions in the channel
 */
function channelAddOwnerV1(token: string, channelId: number, uId: number) {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  const authUserProfile = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  const userProfile = data.users.find((user: {authUserId: number}) => user.authUserId === uId);
  const channelProfile = data.channels.find((channel: {channelId: number}) => channel.channelId === channelId);
  if (!isTokenValid || typeof authUserProfile === 'undefined') {
    throw HTTPError(403, 'Token is invalid');
  } else if (typeof userProfile === 'undefined' || typeof channelProfile === 'undefined') {
    throw HTTPError(400, 'UserId or channelId is invalid');
  } else {
    const memberProfile = {
      uId: uId,
      email: userProfile.email,
      nameFirst: userProfile.nameFirst,
      nameLast: userProfile.nameLast,
      handleStr: userProfile.handleStr,
      profileImgUrl: userProfile.profileImgUrl,
    };
    if (channelProfile.allMembers.some((member: {uId: number}) => member.uId === uId) === false) {
      throw HTTPError(400, 'User is not a member of the channel');
    } else if (channelProfile.ownerMembers.some((owner: {uId: number}) => owner.uId === uId) === true) {
      throw HTTPError(400, 'User is already an owner of the channel');
    } else if (channelProfile.ownerMembers.some((owner: {uId: number}) => owner.uId === authUserId) === false &&
    authUserProfile.globalPermissions !== globalOwner) {
      throw HTTPError(403, 'Authorised user does not have owner permissions in the channel');
    }
    channelProfile.ownerMembers.push(memberProfile);
    setData(data);

    return {};
  }
}

/**
 * Remove user with user id uId as an owner of the channel.
 *
 * @param {string} token - A user token of the function caller
 * @param {integer} channelId - The channel Id of the channel the owner user wants to leave
 * @param {integer} uId - The user Id of the user to be removed as an owner
 *
 * @returns {} - (Successful call)
  * @returns {error} - When the channelId, or token is invalid or when the uId refers to a user
 * who is not valid, not an owner of the channel, is the only owner of the channel or does
 * not have owner permissions in the channel
 */
function channelRemoveOwnerV1(token: string, channelId: number, uId: number) {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  const authUserProfile = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  const userProfile = data.users.find((user: {authUserId: number}) => user.authUserId === uId);
  const channelProfile = data.channels.find((channel: {channelId: number}) => channel.channelId === channelId);
  if (!isTokenValid || typeof authUserProfile === 'undefined') {
    throw HTTPError(403, 'Token is invalid');
  } else if (typeof userProfile === 'undefined' || typeof channelProfile === 'undefined') {
    throw HTTPError(400, 'UserId or channelId is invalid');
  } else {
    if (channelProfile.ownerMembers.some((owner: {uId: number}) => owner.uId === uId) === false) {
      throw HTTPError(400, 'User is not an owner of the channel');
    } else if (channelProfile.ownerMembers.length === 1) {
      throw HTTPError(400, 'User is currently the only owner of the channel');
    } else if (channelProfile.ownerMembers.some((owner: {uId: number}) => owner.uId === authUserId) === false &&
    authUserProfile.globalPermissions === globalMember) {
      throw HTTPError(403, 'Authorised user does not have owner permissions in the channel');
    }
    const index = channelProfile.ownerMembers.findIndex((owner: {uId: number}) => owner.uId === uId);
    if (index > -1) {
      channelProfile.ownerMembers.splice(index, 1);
    }
    setData(data);

    return {};
  }
}

export { fetchDetailsFromUser, channelJoinV1, channelDetailsV1, channelMessagesV2, channelInviteV1, channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1 };
