import { getData, setData } from './dataStore';
import { checkForValidToken, findUserIdUsingToken } from './token';
import HTTPError from 'http-errors';
import { updateChannelUsersStats, updateChannelStats, updateInvolvement } from './stats';

/**
 * Lists all channels that the authorised user is a part of
 *
 * @param {string} token - The user Id of the function caller
 *
 * @returns {channels} - Holds information about channels where the user is a part of (successful call)
 * @returns {error} - Returns an error when the authUserId is invalid
 */

export type channelType = {
  channelId: number,
  name: string
};
export type channelsType = channelType[];

function channelsListV2(token: string): {channels: channelsType} {
  const data = getData();
  const exists: boolean = checkForValidToken(token);
  if (exists === false) {
    throw HTTPError(403, 'Token is invalid');
  }
  const channels: channelsType = [];
  // Loop through channels and add to return output if the user is a member of the channel
  const authUserId = findUserIdUsingToken(token);
  for (const index of data.channels) {
    let userFlag = false;
    for (const index2 of index.allMembers) {
      if (index2.uId === authUserId) {
        userFlag = true;
      }
    }
    if (userFlag === true) {
      channels.push({
        channelId: index.channelId,
        name: index.channelName,
      });
    }
  }
  return {
    channels
  };
}

/**
 * Creates a new channel with the given name, that is either a public or private channel.
 * The user who created it automatically joins the channel.

 *
 * @param {string} token - The user token of the function caller
 * @param {string} channelName - The name of the channel to be created
 * @param {boolean} isPublic - Whether the channel to be created is a public or private channel
 *
 * @returns {channelId} - Holds information about the unique identifier of a channel (successful call)
 * @returns {error} - When the authUserId is invalid, or channel name is
 * less than 1 or more than 20 characters
 */
function channelsCreateV1(token: string, channelName: string, isPublic: boolean): { error: string } | { channelId: number} {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  const userProfile = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  if (!isTokenValid || typeof userProfile === 'undefined') {
    throw HTTPError(403, 'Token is invalid');
  } else {
    if (channelName.length > 20 || channelName.length < 1) {
      throw HTTPError(400, 'Channel name is outside character limits');
    } else {
      // Add new channel to existing data
      const newChannelId = data.channels.length + 1;
      const firstMember = {
        uId: userProfile.authUserId,
        nameFirst: userProfile.nameFirst,
        nameLast: userProfile.nameLast,
        email: userProfile.email,
        handleStr: userProfile.handleStr,
        profileImgUrl: userProfile.profileImgUrl,
      };
      data.channels.push({
        channelId: newChannelId,
        channelName: channelName,
        allMembers: [firstMember],
        ownerMembers: [firstMember],
        isPublic: isPublic,
        messages: [],
        start: 0,
        end: -1,
      });

      setData(data);

      // Iteration 4
      updateChannelStats(authUserId);
      updateChannelUsersStats(authUserId);
      updateInvolvement(authUserId);

      return {
        channelId: newChannelId,
      };
    }
  }
}

/**
 * Provides an array of all channels, including private channels
 * (and their associated details).
 *
 * @param {integer} authUserId - The user Id of the function caller
 *
 * @returns {channels} - Holds information about each channel (successful call)
 * @returns {error} - Returns an error when the authUserId is invalid
 */
function channelsListAllV1(token: string) {
  const data = getData();

  const authUserId = findUserIdUsingToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  const channels = [];
  // Loop through channels and add to return output
  for (const index of data.channels) {
    channels.push({
      channelId: index.channelId,
      name: index.channelName,
    });
  }

  return {
    channels
  };
}

export { channelsListV2, channelsCreateV1, channelsListAllV1 };
