import { getData, setData } from './dataStore';
import { findUserIdUsingToken, checkForValidToken } from './token';
import validator from 'validator';
import { member, user } from './types';
import HTTPError from 'http-errors';
import request from 'sync-request';
import fs from 'fs';
import sharp from 'sharp';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
/**
 * This function returns the user profile of a valid user.
 *
 * @param {integer} authUserId - The user id of the searching user
 * @param {integer} uId - The user id of the profile being searched
 *
 * @returns {user} - An object that contains information about the user's profile is returned when a valid authUserId and uId is given.
 * @returns {error} - An error is returned if either the authUserId or uId are invalid.
 */
const userProfileV1 = (token: string, uId: number) => {
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  const data = getData();
  // Check if authUserId and uId are valid
  let userFlag = false;
  for (const index of data.users) {
    if (index.authUserId === uId) {
      userFlag = true;
    }
  }
  if (userFlag === false) {
    throw HTTPError(400, 'Target user not found');
  }
  // returns user object
  for (const index of data.users) {
    if (uId === index.authUserId) {
      const user: member = {
        uId: index.authUserId,
        email: index.email,
        nameFirst: index.nameFirst,
        nameLast: index.nameLast,
        handleStr: index.handleStr,
        profileImgUrl: index.profileImgUrl,
      };
      return { user };
    }
  }
};

/**
 * use valid token to return a list of all users
 * @param {string} token - inputted tokene of person wanting to see list
 * @returns {user: {
 *   uId: number,
 *   email: string,
 *   nameFirst: string,
 *   nameLast: string,
 *   handleStr: string
 * } }} - user profile
 */
const usersAllV1 = (token: string) => {
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  // Get all users inforamtion (should be an array)
  let userArray = getData().users;

  userArray = userArray.filter((user:user) => user.deleted === false);
  // Return map of existing arrays
  return {
    users: userArray.map((user: user) => {
      return {
        uId: user.authUserId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
        profileImgUrl: user.profileImgUrl,
      };
    })
  };
};

/**
 * Update user firstname and lastname if called
 * @param {number} authUserId - user calling input
 * @param {string} nameFirst - user's new firstname
 * @param {string} nameLast - user's new lastname
 * @returns { {} || {error: string} } - empty object or error
 */
const setNameV1 = (token: string, nameFirst: string, nameLast: string) => {
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  const authUserId = findUserIdUsingToken(token);
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'First name must be between 1 and 50 characters');
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'Last name must be between 1 and 50 characters');
  }

  const data = getData();

  for (const index of data.users) {
    if (index.authUserId === authUserId) {
      index.nameFirst = nameFirst;
      index.nameLast = nameLast;
    }
  }

  setData(data);
  // Return nothing
  return {};
};

/**
 * Update the handStr of the user
 * @param {number} authUserId - user authUserId making the call
 * @param {string} handleStr - user new handle input
 *
 * @returns { {} || { error: string }} - empty object or error
 */
const setHandleV1 = (token: string, handleStr: string) => {
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  const authUserId = findUserIdUsingToken(token);
  if (!/^[a-zA-Z0-9]+$/.test(handleStr)) {
    throw HTTPError(400, 'Handle can only include numbers and alphabetic values');
  }
  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'New handle must be between 3 and 20 characters');
  }
  const data = getData();

  const taken: boolean = data.users.some((user: {handleStr: string}) => user.handleStr === handleStr);
  if (taken === true) {
    throw HTTPError(400, 'Handle is already taken');
  }

  const userToChange = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);

  userToChange.handleStr = handleStr;
  setData(data);
  return {};
};

/**
 * Function to find user with corresponding email
 * Helper function for setEmailV1 to check if email is in use
 * @param {string} email - email to check
 * @returns
 */
const findUserUsingEmail = (email: string) => {
  const data = getData();

  // return a user email if found or else null
  return data.users.find((user: user): user is user => {
    return user.email.toLowerCase() === email.toLowerCase();
  }) || null;
};

/**
 * Change the email of user
 * @param {number} authUserId - user making input
 * @param {string} email - new email
 *
 * @returns {{} || { error: string }} - empty object or error
 */
const setEmailV1 = (token: string, email: string) => {
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  const authUserId = findUserIdUsingToken(token);

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'validator found input email as invalid format');
  }

  const data = getData();
  // Find user to change
  const userFind = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);

  // Check if email is in use
  if (email !== userFind.email && findUserUsingEmail(email) !== null) {
    throw HTTPError(400, 'Inputted email is taken');
  }

  userFind.email = email;
  setData(data);

  return {};
};

function obtainDefault() {
  console.log('photo default');
  const res = request(
    'GET',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Rufous_Hummingbird%2C_male_01.jpg/1280px-Rufous_Hummingbird%2C_male_01.jpg'
  );
  const body = res.getBody();
  fs.writeFileSync('default.jpg', body, { flag: 'w' });
}

function uploadPhotoV1(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  if (yStart > yEnd || xStart > xEnd) {
    throw HTTPError(400, 'invalid crop inputs');
  }
  const fileType = imgUrl.toString().slice(-4);
  if (fileType !== '.jpg') {
    throw HTTPError(400, 'not jpg file');
  }

  const data = getData();
  let body: any;
  try {
    const res = request(
      'GET', imgUrl
    );
    body = res.getBody();
  } catch (error) {
    throw HTTPError(400, 'unable to get image');
  }
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  const authUserId = findUserIdUsingToken(token);
  const handleStr = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId).handleStr;
  const oldFile = 'pictures/' + handleStr + 'uncropped.jpg';
  fs.writeFileSync(oldFile, body, { flag: 'w' });
  const newFile = 'pictures/' + handleStr + '.jpg';

  const sizeOf = require('image-size');
  const size = sizeOf(oldFile);
  if (size.width < xStart || size.width < xEnd || size.height < yStart || size.height < yEnd) {
    throw HTTPError(400, 'Invalid dimensions');
  }

  sharp(oldFile).extract({ width: xEnd - xStart, height: yEnd - yStart, left: xStart, top: yStart }).toFile(newFile);
  const user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  const newUrl = SERVER_URL + '/' + newFile;
  user.profileImgUrl = newUrl;

  for (const index of [...data.channels, ...data.dms]) {
    const userExist = index.allMembers.find((user: {uId: number}) => user.uId === authUserId);
    if (userExist === undefined) {
      continue;
    } else {
      userExist.profileImgUrl = newUrl;
    }
    const userOwner = index.ownerMembers.find((user: {uId: number}) => user.uId === authUserId);
    if (userOwner !== undefined) {
      userOwner.profileImgUrl = newUrl;
    }
  }

  setData(data);
  return {};
}

export { userProfileV1, usersAllV1, setNameV1, setEmailV1, setHandleV1, findUserUsingEmail, obtainDefault, uploadPhotoV1 };
