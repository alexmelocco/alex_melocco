import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { dmListV1, dmMessagesV1, createDM, dmRemoveV1, dmLeaveV1, dmDetailsV1 } from './dm';
import { channelInviteV1, channelMessagesV2, channelJoinV1, channelRemoveOwnerV1, channelAddOwnerV1, channelLeaveV1, channelDetailsV1 } from './channel';
import { authLoginV1, authRegisterV1 } from './auth';
import { findUserIdUsingToken, createToken, deleteToken } from './token';
import { clearV1 } from './other';
import { channelsCreateV1, channelsListAllV1, channelsListV2 } from './channels';
import { messageSendV1, messageEditV1, messageRemoveV1, messageSendDmV1, messageSendLaterV1, messageSendLaterDmV1, messageReactV1, messageUnReactV1, messagePinV1, messageUnpinV1, messageShareV1 } from './message';
import { usersAllV1, userProfileV1, setNameV1, setEmailV1, setHandleV1, obtainDefault, uploadPhotoV1 } from './users';
import { adminUserRemoveV1, adminUserPermissionChangeV1 } from './admin';
import errorHandler from 'middleware-http-errors';
import { echo } from './echo';
import HTTPError from 'http-errors';
import { notificationsGetV1 } from './notifications';
import { callPasswordResetRequest, callPassswordReset } from './authPassReset';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';
import { searchV1 } from './search';
import { usersStatsV1, userStatsV1 } from './stats';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';


// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());
// const path = require('path')
// app.use('/public', express.static('pictures'));

// const path = require('path')

// app.use(express.static(path.join(__dirname, '/pictures')))

app.use('/pictures', express.static('pictures'));

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

/// /////////////////
// auth.ts routes //
/// /////////////////

app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = authLoginV1(email, password);

  return res.json({
    token: createToken(result.authUserId),
    authUserId: result.authUserId
  });
});

// app.post('/auth/logout/v1', (req: Request, res: Response) => {
//   const { token } = req.body as string;
//   return res.json(authLogoutV1(token));
// });
app.post('/auth/logout/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = findUserIdUsingToken(token);

  if (uId === null) {
    throw HTTPError(403, 'Token not found');
  }

  const result = deleteToken(token);
  return res.json(result);
});

app.post('/auth/register/v3', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  return res.json(authRegisterV1(email, password, nameFirst, nameLast));
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const { email } = req.body;

  // assigned a booleon value
  const fakeUser = req.header('user-agent') === undefined;

  callPasswordResetRequest(email, fakeUser).finally(() => {
    res.json({});
  });
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response) => {
  const { resetCode, newPassword } = req.body;
  res.json(callPassswordReset(resetCode, newPassword));
});

/// ////////////////////
// channel.ts routes //
/// ////////////////////

app.post('/channel/join/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId } = req.body;
  res.json(channelJoinV1(token, channelId));
});

app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId } = req.body;
  res.json(channelLeaveV1(token, channelId));
});

app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelAddOwnerV1(token, channelId, uId));
});

app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelRemoveOwnerV1(token, channelId, uId));
});

app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = req.query.channelId as string;
  const start = req.query.start as string;
  return res.json(channelMessagesV2(token, parseInt(channelId), parseInt(start)));
});

// Provide details for channel
app.get('/channel/details/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = req.query.channelId as string;
  return res.json(channelDetailsV1(token, parseInt(channelId)));
});

app.post('/channel/invite/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  return res.json(channelInviteV1(token, parseInt(channelId), parseInt(uId)));
});

/// /////////////////////
// channels.ts routes //
/// /////////////////////

app.post('/channels/create/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, isPublic } = req.body;
  return res.json(channelsCreateV1(token, name, isPublic));
});

app.get('/channels/list/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  return res.json(channelsListV2(token));
});

app.get('/channels/listAll/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(channelsListAllV1(token));
});

/// ////////////////////
// message.ts routes //
/// ////////////////////
app.post('/message/send/v2', (req: Request, res: Response, next) => {
  const { channelId, message } = req.body;
  const token = req.header('token');
  return res.json(messageSendV1(token, channelId, message));
});
app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  const { messageId, message } = req.body;
  const token = req.header('token');
  return res.json(messageEditV1(token.toString(), parseInt(messageId), message.toString()));
});
app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = req.query.messageId as string;
  return res.json(messageRemoveV1(token, parseInt(messageId)));
});
app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  const { dmId, message } = req.body;
  const token = req.header('token');
  return res.json(messageSendDmV1(token, dmId, message));
});
app.post('/message/share/v1', (req: Request, res: Response, next) => {
  const { ogMessageId, message, channelId, dmId } = req.body;
  const token = req.header('token');
  return res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
});
app.post('/message/react/v1', (req: Request, res: Response, next) => {
  const { messageId, reactId } = req.body;
  const token = req.header('token');
  return res.json(messageReactV1(token, messageId, reactId));
});
app.post('/message/sendlater/v1', async (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { channelId, message, timeSent } = req.body;
    res.json(await messageSendLaterV1(token, channelId, message, timeSent));
  } catch (error) {
    next(error);
  }
});
app.post('/message/sendlaterdm/v1', async (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { dmId, message, timeSent } = req.body;
    res.json(await messageSendLaterDmV1(token, dmId, message, timeSent));
  } catch (error) {
    next(error);
  }
});
app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  const { messageId, reactId } = req.body;
  const token = req.header('token');
  return res.json(messageUnReactV1(token, messageId, reactId));
});
app.post('/message/pin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;
  res.json(messagePinV1(token, messageId));
});
app.post('/message/unpin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;
  res.json(messageUnpinV1(token, messageId));
});
/// ///////////////
// dm.ts routes //
/// ///////////////

// Create new DM
app.post('/dm/create/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uIds } = req.body;
  return res.json(createDM(token, uIds));
});

app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = req.query.dmId as string;

  res.json(dmRemoveV1(token, parseInt(dmId as string)));
});

app.post('/dm/leave/v2', (req: Request, res: Response) => {
  const { dmId } = req.body;
  const token = req.header('token');
  res.json(dmLeaveV1(token, dmId));
});

// Return all details for a inputted DM
app.get('/dm/details/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = req.query.dmId as string;

  res.json(dmDetailsV1(token, parseInt(dmId)));
});

app.get('/dm/list/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(dmListV1(token));
});
app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = req.query.dmId as string;
  const start = req.query.start as string;
  return res.json(dmMessagesV1(token, parseInt(dmId), parseInt(start)));
});
/// //////////////////
// other.ts routes //
/// //////////////////

// Reset state
app.delete('/clear/v1', (req: Request, res: Response) => {
  res.json(clearV1());
});

/// //////////////////
// user.ts routes //
/// //////////////////

app.get('/user/profile/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = req.query.uId as string;

  return res.json(userProfileV1(token, parseInt(uId)));
});

app.get('/users/all/v2', (req: Request, res: Response) => {
  const token = req.header('token');

  return res.json(usersAllV1(token));
});

app.put('/user/profile/setname/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { nameFirst, nameLast } = req.body;

  return res.json(setNameV1(token, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { email } = req.body as { email: string };

  return res.json(setEmailV1(token, email));
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { handleStr } = req.body as { handleStr: string };

  return res.json(setHandleV1(token, handleStr));
});

/// //////////////////////////
// notifications.ts routes //
/// //////////////////////////
app.get('/notifications/get/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  return res.json(notificationsGetV1(token));
});

/// //////////////////
// search.ts routes //
/// //////////////////
app.get('/search/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const queryStr = req.query.queryStr as string;
  return res.json(searchV1(token, queryStr));
});

/// //////////////////
// admin.ts routes //
/// //////////////////
app.delete('/admin/user/remove/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = req.query.uId as string;
  res.json(adminUserRemoveV1(token, parseInt(uId as string)));
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uId, permissionId } = req.body;
  res.json(adminUserPermissionChangeV1(token, uId, permissionId));
});

///////////////////////
// standup.ts routes //
///////////////////////
app.post('/standup/start/v1', async (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { channelId, length } = req.body;
    res.json(await standupStartV1(token, channelId, length));
  } catch (error) {
    next(error);
  }
});

app.get('/standup/active/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = req.query.channelId as string;
  res.json(standupActiveV1(token, parseInt(channelId)));
});

app.post('/standup/send/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  res.json(standupSendV1(token, channelId, message));
});

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  obtainDefault();
  res.json(uploadPhotoV1(token, imgUrl, xStart, yStart, xEnd, yEnd));
});

app.use(errorHandler());

/////////////////////////
// stat routes - iter4 //
/////////////////////////

// Get individaul user stats
app.get('/user/stats/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const authUserId = findUserIdUsingToken(token);

  return res.json(userStatsV1(authUserId));
});

// Get the users stats for entire server
app.get('/users/stats/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const authUserId = findUserIdUsingToken(token);

  res.json(usersStatsV1(authUserId));
});

