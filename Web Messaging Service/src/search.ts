import { getData } from './dataStore';
import { checkForValidToken, findUserIdUsingToken } from './token';
import HTTPError from 'http-errors';

export function searchV1(token: string, queryStr: string) {
  const data = getData();
  console.log(token);
  if (queryStr.length < 1) {
    throw HTTPError(400, 'string is too short');
  } else if (queryStr.length > 1000) {
    throw HTTPError(400, 'string is too long');
  }
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const authUserId = findUserIdUsingToken(token);
  const messages = [];
  for (const index of [...data.channels, ...data.dms]) {
    const user = index.allMembers.find((member: {uId: number}) => member.uId === authUserId);
    if (user === undefined) {
      continue;
    } else {
      for (const index2 of index.messages) {
        if (messageContainsQuery(index2.message, queryStr)) {
          messages.push({
            messageId: index2.messageId,
            uId: index2.uId,
            message: index2.message,
            timeSent: index2.timeSent
          });
        }
      }
    }
  }
  return { messages: messages };
}

function messageContainsQuery(message: string, query: string) {
  const newMessage = message.toLowerCase();
  const newQuery = query.toLowerCase();
  return newMessage.includes(newQuery);
}
