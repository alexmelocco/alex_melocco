import { getData, setData } from './dataStore';

/**
 * Function - test whether token is valid
 * @param {string} token - inputed token
 * @returns {boolean} - t/f valid of token
 */
// export const checkForValidToken = (token: string): boolean => {
//     const data = getData(); // Retrieve data object
//     // for (const index of data.tokens) {
//     //   if (index.token === token) {
//     //     console.log('hello')
//     //     return true;

//     //   }
//     // }
//     // console.log('hello2')
//     // return false;
//     return data.tokens.hasOwnProperty(token); // Check if token exists in data object

// };

export const checkForValidToken = (token: string): boolean => {
  if (getData().tokens[token] !== undefined) {
    return true;
  }
  return false;
};

/**
 * Returns user ID with a given token, or null if token invalid
 * @param {string} token - Inputed token
 * @returns {number|null} - The user ID associated with the token, or null if the token is invalid
 */
export const findUserIdUsingToken = (token: string): number | null => {
  const data = getData(); // Retrieve data object
  // for (const index of data.tokens) {
  //   if (index.token === token) {
  //     return index.uId;
  //   }
  // }
  // return null
  const userId = data.tokens[token] || null; // Get user ID associated with token, or return null if token is invalid
  return userId;
};

/**
 * Generates a random string of letters with a specified number of characters
 * @param {number} numChars - The number of characters in the generated string
 * @returns {string} - The random string of letters
 */
export const randomStringCreator = (numChars: number): string => {
  // Define alphabet
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // Generate random characters from alphabet
  const randomChars = new Array(numChars).fill(null).map(() => alphabet[Math.floor(alphabet.length * Math.random())]);
  const randomString = randomChars.join(''); // Join characters into a string
  return randomString;
};

/**
 * Create new token given for a uId
 * @param {number} uId - use input
 * @returns {string} - Generated token
 */
export const createToken = (uId: number): string => {
  const token = randomStringCreator(20);
  const data = getData();
  // const newToken = {
  //   token: token,
  //   uId: uId
  // }
  // data.tokens.push(newToken);
  data.tokens[token] = uId;
  setData(data);

  return token;
};

/**
 * Takes token and delete token to logout user
 * @param {string} token - token to delete
 */
export const deleteToken = (token: string) => {
  const data = getData();
  // Delete Token off database
  delete data.tokens[token];
  setData(data);
  // Dont return anything
  return {};
};
