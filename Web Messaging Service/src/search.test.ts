import { sendWrapRequest, wrapClearRequest } from './testHelper';
import { authRegisterV1, channelsCreateV1 } from './testHelpers';

const error400 = 400;
const error403 = 403;

let user1: any;
let channeldata: any;
let messageData: any;
beforeEach(() => {
  wrapClearRequest();
  const user2 = authRegisterV1('persontwo@email.com', 'passwordone', 'Person', 'One');

  user1 = authRegisterV1('personone@email.com', 'passwordone', 'Person', 'One');
  channelsCreateV1(user2.token, 'ChannelOne', true);
  // Create ChannelOne channel.
  channeldata = channelsCreateV1(user1.token, 'ChannelOne', true);
  // Person One sends a message in ChannelOne channel.
  messageData = sendWrapRequest('POST', '/message/send/v2',
    { token: user1.token }, { channelId: channeldata.channelId, message: 'Hello' });
});

describe('Successful tests for search/v1', () => {
  test('The length of the query string is 1', () => {
    const validqueryString1 = 'H';
    const data1 = sendWrapRequest('GET', '/search/v1', { token: user1.token }, { queryStr: validqueryString1 });
    sendWrapRequest('GET', '/search/v1', { token: user1.token }, { queryStr: 'Does not contain' });
    const searchMessages = {
      messageId: messageData.messageId,
      uId: user1.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
    };

    const expected = [searchMessages];
    expect(data1).toStrictEqual({ messages: expected });
  });
});

describe('(400 Error) tests for search/v1', () => {
  test('The query string is empty', () => {
    const emptyqueryString = '';
    const data4 = sendWrapRequest('GET', '/search/v1', { token: user1.token }, { queryStr: emptyqueryString });
    expect(data4).toStrictEqual(error400);
  });
  test('Invalid token', () => {
    const emptyqueryString = 'H';
    const data4 = sendWrapRequest('GET', '/search/v1', { token: user1.token + 'a' }, { queryStr: emptyqueryString });
    expect(data4).toStrictEqual(error403);
  });
  test('The length of the query string is more than 1000', () => {
    let verylongqueryString = 'H';
    for (let i = 0; i < 1000; i++) {
      verylongqueryString += 'H';
    }

    const data5 = sendWrapRequest('GET', '/search/v1', { token: user1.token }, { queryStr: verylongqueryString });
    expect(data5).toStrictEqual(error400);
  });
});
