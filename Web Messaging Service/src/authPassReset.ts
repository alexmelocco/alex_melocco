import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { randomStringCreator } from './token';
import nodemailer from 'nodemailer';
import { findUserUsingEmail } from './auth';

const emailPassString = 'gfrmpidcorcrhipl';
const sourceEmail = 'passreset696969@gmail.com';
const emailUsingName = `"hello" <${sourceEmail}>`;

/**
 * Function to make a Password Reset Request
 * @param {string} name - name
 * @returns {number} - returns a unique has for the user
 */
export const callPasswordResetRequest = async (email: string, fakeUser: boolean) => {
  const dataStore = getData();
  const user = findUserUsingEmail(email);
  if (user === null) {
    return {};
  }

  // Delete all current sessions by wiping tokens
  const tokenList = getData().tokens;
  for (const token in tokenList) {
    if (tokenList[token] === user.authUserId) {
      delete tokenList[token];
    }
  }

  // create a random 6 string resetString
  const resetString = randomStringCreator(6);
  dataStore.passResetString[resetString] = user.authUserId;
  setData(dataStore);

  const transporter = await (fakeUser
    ? callTestTransport
    : callActualTransport
  )();

  const textBody = `Heres your reset code: ${resetString}`;

  const data = await transporter.sendMail({
    from: emailUsingName,
    to: email,
    subject: 'Hello is resetting password',
    text: textBody,
  });

  console.log(data.messageId);

  if (fakeUser) {
    console.log('Fake email sent, link here:', nodemailer.getTestMessageUrl(data));
  }
};

const callTestTransport = async () => {
  console.log('Writing a test email...');

  const pseudoAcc = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: pseudoAcc.user,
      pass: pseudoAcc.pass,
    },
  });
};

// next function for coverage since it's been substituted for equivalent test function in test

const callActualTransport = async () => {
  console.log(' IMPORTANT: Check email for spam in case...');

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: sourceEmail,
      pass: emailPassString,
    },
  });
};

/**
 * Function to reset password
 * @param {string} name - name of the user
 * @returns {number} hash - unique id generated for the user
 */
export const callPassswordReset = (resetString: string, newPassword: string) => {
  if (newPassword.length < 6) {
    throw HTTPError(400, 'error: Password is too short');
  }
  const dataStore = getData();
  // retrieve authuserId
  const resetStrings = dataStore.passResetString;
  const authUserId = resetStrings[resetString];
  delete resetStrings[resetString];

  // Change password if authuserId found
  if (authUserId !== undefined) {
    dataStore.users.find((user: {authUserId: number}) => user.authUserId === authUserId).password = newPassword;
  }
  setData(dataStore);

  // Error if authUserId not found
  if (authUserId === undefined) {
    throw HTTPError(400, 'error: Invalid password reset');
  }

  return {};
};
