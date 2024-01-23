import { getData, setData } from './dataStore';
import { checkForValidToken, findUserIdUsingToken } from './token';
import { globalOwner, globalMember, noElements } from './types';
import HTTPError from 'http-errors';

/**
 * Given a user by their uId, removes them from Memes.
 *
 * @param {string} token - A user token of the function caller
 * @param {integer} uId - The user Id of the user to be removed
 *
 * @returns {} - (Successful call)
 * @returns {error} - When the token or userId is invalid, or when the auth user is
 * not a global owner, or when the userId refers to a user who is the only global owner.
 */
export function adminUserRemoveV1(token: string, uId: number) {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  const authUserProfile = data.users.find((user: { authUserId: number }) => user.authUserId === authUserId);
  const userProfile = data.users.find((user: { authUserId: number }) => user.authUserId === uId);
  const globalOwners = data.users.filter((user: { globalPermissions: number }) => user.globalPermissions === globalOwner);
  if (!isTokenValid || typeof authUserProfile === 'undefined') {
    throw HTTPError(403, 'Token is invalid');
  } else if (typeof userProfile === 'undefined') {
    throw HTTPError(400, 'UserId is invalid');
  } else if (authUserProfile.globalPermissions !== globalOwner) {
    throw HTTPError(403, 'The authorised user is not a global owner');
  } else if (globalOwners.length === 1) {
    throw HTTPError(400, 'uId refers to a user who is the only global owner');
  } else {
    // Set message content for channels and remove from channel
    for (const channel of data.channels) {
      for (const message of channel.messages) {
        if (message.uId === uId) {
          message.message = 'Removed user';
        }
      }
      channel.allMembers.splice(channel.allMembers.findIndex((member: {uId: number}) => member.uId === uId));
      if (channel.ownerMembers.findIndex((owner: {uId: number}) => owner.uId === uId) !== noElements) {
        channel.ownerMembers.splice(channel.ownerMembers.findIndex((owner: {uId: number}) => owner.uId === uId));
      }
    }
    // Set message content for dms and remove from dm
    for (const dm of data.dms) {
      for (const message of dm.messages) {
        if (message.uId === uId) {
          message.message = 'Removed user';
        }
      }
      dm.allMembers.splice(dm.allMembers.findIndex((member: {uId: number}) => member.uId === uId));
      if (dm.ownerMembers.findIndex((owner: {uId: number}) => owner.uId === uId) !== noElements) {
        dm.ownerMembers.splice(dm.ownerMembers.findIndex((owner: {uId: number}) => owner.uId === uId));
      }
    }
    // Set name and status
    userProfile.nameFirst = 'Removed';
    userProfile.nameLast = 'user';
    userProfile.deleted = true;
    // Delete tokens
    for (const token of data.tokens) {
      if (data.tokens[token] === uId) {
        data.tokens[token].splice(token, 1);
      }
    }
    setData(data);

    return {};
  }
}

/**
 * Given a user by their uId, sets their permissions to new permissions described by permissionId.
 *
 * @param {string} token - A user token of the function caller
 * @param {integer} uId - The user Id of the user whose permissions are to be changed
 * @param {integer} permissionId - The new permission level to be assigned
 *
 * @returns {} - (Successful call)
 * @returns {error} - When the token or userId is invalid, or when the auth user is
 * not a global owner, or when the userId refers to a user who is the only global owner and is being
 * demoted or when permissionId is invalid or when the user already has the same permission level.
 */
export function adminUserPermissionChangeV1(token: string, uId: number, permissionId: number) {
  const data = getData();
  const isTokenValid = checkForValidToken(token);
  const authUserId = findUserIdUsingToken(token);
  const authUserProfile = data.users.find((user: { authUserId: number }) => user.authUserId === authUserId);
  const userProfile = data.users.find((user: { authUserId: number }) => user.authUserId === uId);
  const globalOwners = data.users.filter((user: { globalPermissions: number }) => user.globalPermissions === globalOwner);
  if (!isTokenValid || typeof authUserProfile === 'undefined') {
    throw HTTPError(403, 'Token is invalid');
  } else if (typeof userProfile === 'undefined') {
    throw HTTPError(400, 'UserId is invalid');
  } else if (authUserProfile.globalPermissions !== globalOwner) {
    throw HTTPError(403, 'The authorised user is not a global owner');
  } else if (globalOwners.length === 1 && permissionId === globalMember) {
    throw HTTPError(400, 'uId refers to a user who is the only global owner and they are being demoted to a user');
  } else if (permissionId !== globalOwner && permissionId !== globalMember) {
    throw HTTPError(400, 'PermissionId is invalid');
  } else if (userProfile.globalPermissions === permissionId) {
    throw HTTPError(400, 'User already has the permissions level of permissionId');
  } else {
    userProfile.globalPermissions = permissionId;
    setData(data);

    return {};
  }
}
