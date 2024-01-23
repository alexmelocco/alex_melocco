import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

/// //////////////////////////////
// EXAMPLE OF HOW TO IMPLEMENT //
/// //////////////////////////////
// const delete = sendWrapRequest('DELETE', '/dm/remove/v1', {token, dmId});
//
// OR
//
// test('Successful test for  /auth/register/v2', () => {
//     const resResponse = sendWrapRequest('POST', '/auth/register/v2', { email: 'valid@example.com', password: '1234567', nameFirst: 'Brad', nameLast: 'Valid' });
//     expect(resResponse).toStrictEqual({
//       token: expect.any(String),
//       authUserId: expect.any(Number)
//     });
// });
/// ////////////////
// HOW TO IMPORT //
/// ////////////////
// import { sendWrapRequest, wrapClearRequest } from './testHelper';

/**
 * A function to clear up testing in test files by wrappng around sync-requests
 * @param method - GET/DELETE/POST/PUT
 * @param endpoint - endpoint (/blah/blah/v2)
 * @param data - any data input, can be {} (empty)
 * @returns {object} - JSON file returned
 */

type tokenHeader = {
  token?: string
};

export const sendWrapRequest = (method: HttpVerb, endpoint: string, token: tokenHeader, data: object) => {
  if (!endpoint.startsWith('/')) {
    return { error: 'Missing slash on endpoint' };
  }

  const res = request(
    method,
    SERVER_URL + endpoint,
    {
      headers: ['GET', 'DELETE', 'PUT', 'POST'].includes(method) ? token : {},
      qs: ['GET', 'DELETE'].includes(method) ? data : {},
      json: ['PUT', 'POST'].includes(method) ? data : {},
    }
  );

  // Gives errors if we don't recieve an object
  if (res.statusCode !== 200) {
    return res.statusCode;
  }

  return JSON.parse(res.getBody() as string);
};

// export const sendWrapRequest = (method: HttpVerb, endpoint: string, data: object) => {
//   if (!endpoint.startsWith('/')) {
//     throw new Error('missing leading slash!');
//   }

//   const response = request(
//     method, SERVER_URL + endpoint, {
//       qs: ['GET', 'DELETE'].includes(method) ? data : {},
//       json: ['PUT', 'POST'].includes(method) ? data : {}
//     }
//   );

//   // Throw errors for when the status code is not OK or we don't get an object,
//   // since that should never occur for a conforming implementation. We don't
//   // want to use expect(...) here since we don't know if we're being run inside
//   // of a jest test.
//   if (response.statusCode !== 200) {
//     throw new Error(
//       `Response for ${method} was ${response.statusCode}: ${response.body}`
//     );
//   }

//   const responseObject = JSON.parse(response.getBody('utf-8'));
//   if (typeof responseObject !== 'object') {
//     throw new Error(`Response for ${method} wasn't an object: ${responseObject}`);
//   }

//   return responseObject;
// };

/**
 * Function to help clear the endpoint
 * @returns {{}} - Should not return anything
 */
export const wrapClearRequest = () => sendWrapRequest('DELETE', '/clear/v1', {}, {});

/**
 * Function for auth/login/v3
 */
export const wrapAuthLoginRequest = (input: { email: string, password: string }) => {
  return sendWrapRequest('POST', '/auth/login/v3', {}, input);
};

/**
 * Function for`user/profile/v3
 */
export const wrapUserProfileRequest = (input: { token: string, uId: number }) => {
  return sendWrapRequest('GET', '/user/profile/v3', {}, input);
};

/**
 * Function for /search/v1
 */
export const wrapSearchRequest = (input: { token: string, queryStr: string }) => {
  return sendWrapRequest('GET', '/search/v1', {}, input);
};

/**
* Function for auth/passwordreset/request/v1
*/
export const wrapAuthPasswordResetRequest = (input: { email: string }) => {
  return sendWrapRequest('POST', '/auth/passwordreset/request/v1', {}, input);
};

/**
 * Function for auth/passwordreset/reset/v1`
 */
export const wrapPasswordResetRequest = (input: { resetCode: string, newPassword: string }) => {
  return sendWrapRequest('POST', '/auth/passwordreset/reset/v1', {}, input);
};

/**
 * Function for `user/profile/uploadphoto/v1`
 */
export const wrapUploadProfPhotoRequest = (input: { token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number }) => {
  return sendWrapRequest('POST', '/user/profile/uploadphoto/v1', {}, input);
};
