import { getData, setData } from './dataStore';
import validator from 'validator';
import { user } from './types';
import HTTPError from 'http-errors';
import { createToken } from './token';
import { port, url } from './config.json';
import { updateInvolvement, initialiseStats } from './stats';
const SERVER_URL = `${url}:${port}`;
/**
 * Given a registered user's email and password, returns their authUserId value.
 *
 * @param {string} email  - string that is unique to each user, used for login
 * @param {string} password - string that is used to verify each user
 * @returns { authUserId } - upon no error, will return the authUserId that
 * correponds to the email and password
 * @returns { error } - if email is not found in database
 * or if the given password does not match the password for the user
 */
const authLoginV1 = (email: string, password: string): { error?: string, authUserId?: number } => {
  const user = getData().users.find((usr: {email: string}) => usr.email === email);
  if (typeof user === 'undefined') {
    throw HTTPError(400, 'Email entered does not belong to a user ');
  }

  if (user.password !== password) {
    throw HTTPError(400, 'Password is not correct');
  }

  return { authUserId: user.authUserId };
};

/**
 * Function used in authRegisterV1 to generate a unique Id when given a username
 * @param {string} name - name of the user
 * @returns {number} hash - unique id generated for the user
 */
const createUniqueId = (name: string): number => {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    let char = name.charCodeAt(i);
    // random algorthim to make diff in id bigger
    if (char % 2) {
      char = char * 67 + 29;
    } else {
      char = char * 13 + 50;
    }

    hash = hash + char;
    // Coverts to a 32 bit integer (in case not already a 32-bit integer)
    hash |= 0;
  }

  return hash;
};

/**
 * Given a user's first and last name, email address, and password,
 * creates a new account for them and returns a new authUserId.
 * A unique handle will be generated for each registered user.
 *
 * @param {string} email  - string that is unique to each user, used for login
 * @param {string} password - string that is used to verify each user
 * @param {stirng} nameFirst - string that represents user's frist name
 * @param {string} nameLast - string that represents user's frist name
 * @returns { authUserId } - upon no error, will return the authUserId
 * generated from the given information
 * @returns { error } - if the email entered is invalid or in-use,
 * the length of the password is less than 6 characters,
 * or the length of nameFirst/nameLast is not between 1 and 50 chars (incl.).
 */
const authRegisterV1 = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const data = getData();

  // Email address is already being used
  if (!(validator.isEmail(email))) {
    throw HTTPError(400, 'Email Invalid');
  }

  // length of password is less than 6 characters or nameFirst/Last is not between 0 or 50 characters
  if (password.length < 6 || (nameFirst.length > 50) || (nameLast.length > 50) ||
  nameFirst.length === 0 || nameLast.length === 0) {
    throw HTTPError(400, 'Invalid password/nameFirst/nameLast length');
  }

  // create my user ID basic (max 20 characters)
  let string = nameFirst.toLowerCase() + nameLast.toLowerCase();
  string = string.replace(/[^0-9a-z]/gi, '');
  let limString = string.substring(0, 20);

  // test if userID has been used before and see if there are any overlapping userId's
  let repeat = 0;
  // count how many repeats there area
  let gPerms = 0;
  // flag for reuse of old handle
  let deleteFlag = false;
  for (const key in data.users) {
    if (data.users[key].handleStr.substring(0, limString.length) === limString) {
      // check for whether the user with the handle has been deleted so that it can be reused
      if (data.users[key].deleted === true) {
        const reusableHandle: user[] = data.users.filter((user: {handleStr: string}) => user.handleStr === data.users[key].handleStr);
        if (reusableHandle[reusableHandle.length - 1].deleted === true) {
          deleteFlag = true;
          limString = data.users[key].handleStr;
        }
      } else {
        repeat++;
      }
    }
    gPerms++;
    if (data.users[key].email === email && data.users[key].deleted === false) { // check for overlapping emails
      throw HTTPError(400, 'email already in use');
    }
  }

  // Allocate global permissions number where first user has gPerms 1 and other members auto assigned 2
  if (gPerms > 0) {
    gPerms = 2;
  } else {
    gPerms = 1;
  }
  if (deleteFlag === false) {
    if (repeat !== 0) {
      // adjust for first number connected to string
      repeat--;
      limString = limString + repeat.toString();
    }
  }
  // Create unique Id
  const uniqueNoId = createUniqueId(limString);
  const user: user = {
    authUserId: uniqueNoId,
    handleStr: limString,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    globalPermissions: gPerms,
    deleted: false,
    notifications: [],
    profileImgUrl: SERVER_URL + '/pictures/default.jpg',
    userStats: { 
      channelsJoined: [],
      dmsJoined: [],
      messagesSent: [],
      involvementRate: 0
    },
  };
  // Store data into dataStore
  data.users.push(user);
  // const numMembers = data.users.length;

  setData(data);

  // ITERATION 4
  initialiseStats(uniqueNoId);
  updateInvolvement(uniqueNoId);

  return {
    token: createToken(uniqueNoId),
    authUserId: uniqueNoId,
  };
};

/**
 * Checks for valid authUserId, when given
 * @param {number} authUserId - input
 * @returns {boolean}
 */
const checkAuthUserExist = (authUserId: number): boolean => {
  const data = getData();
  // Run through and check for existing authUserId
  if (data.users.find((user: {authUserId: number}) => user.authUserId === authUserId) !== undefined) {
    return true;
  }
  return false;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {UserDetails || NULL}
 */
export const findUserUsingEmail = (email: string) => {
  const data = getData();
  // Run through and check for existing user with matching email
  const matchingUser = data.users.find((user: {email: string}) => user.email === email);
  if (matchingUser !== undefined) {
    return matchingUser;
  }
  return null;
};

export { checkAuthUserExist, authLoginV1, authRegisterV1 };
