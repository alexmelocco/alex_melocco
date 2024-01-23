import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

let userdata: any;
let userdata2: any;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { qs: {} });
  const user = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
  userdata = JSON.parse(user.getBody() as string);
  const user2 = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' } });
  userdata2 = JSON.parse(user2.getBody() as string);
  const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
    { headers: { token: userdata.token }, json: { name: 'ChannelOne', isPublic: true } });
  JSON.parse(channel1.getBody() as string);
});

describe('Testing userProfPic', () => {
  test('cannot retrieve image', () => {
    const data = request('POST', SERVER_URL + '/user/profile/uploadphoto/v1',
      { headers: { token: userdata.token }, json: { imgUrl: 'this will break.jpg', xStart: 0, yStart: 0, xEnd: 100, yEnd: 100 } });
    expect(data.statusCode).toStrictEqual(400);
  });
  test('end less than start', () => {
    const data = request('POST', SERVER_URL + '/user/profile/uploadphoto/v1',
      { headers: { token: userdata.token }, json: { imgUrl: 'https://webcms3.cse.unsw.edu.au/static/uploads/profilepic/z5030786/5014edd7a6117bc4f2131a365b088a75f4b9eaf1d35c9769c2f6bc512046982b/IMG_2709_2.jpg', xStart: 0, yStart: 200, xEnd: 100, yEnd: 100 } });
    expect(data.statusCode).toStrictEqual(400);
  });
  test('wrong dimensions', () => {
    const data = request('POST', SERVER_URL + '/user/profile/uploadphoto/v1',
      { headers: { token: userdata.token }, json: { imgUrl: 'https://webcms3.cse.unsw.edu.au/static/uploads/profilepic/z5030786/5014edd7a6117bc4f2131a365b088a75f4b9eaf1d35c9769c2f6bc512046982b/IMG_2709_2.jpg', xStart: 0, yStart: 200, xEnd: 1000, yEnd: 10000 } });
    expect(data.statusCode).toStrictEqual(400);
  });
  test('not jpg', () => {
    const data = request('POST', SERVER_URL + '/user/profile/uploadphoto/v1',
      { headers: { token: userdata.token }, json: { imgUrl: 'https://webcms3.cse.unsw.edu.au/static/uploads/profilepic/z5030786/5014edd7a6117bc4f2131a365b088a75f4b9eaf1d35c9769c2f6bc512046982b/IMG_2709_2.png', xStart: 0, yStart: 0, xEnd: 100, yEnd: 100 } });
    expect(data.statusCode).toStrictEqual(400);
  });
  test('not jpg', () => {
    const data = request('POST', SERVER_URL + '/user/profile/uploadphoto/v1',
      { headers: { token: userdata.token + 'a' }, json: { imgUrl: 'https://webcms3.cse.unsw.edu.au/static/uploads/profilepic/z5030786/5014edd7a6117bc4f2131a365b088a75f4b9eaf1d35c9769c2f6bc512046982b/IMG_2709_2.jpg', xStart: 0, yStart: 0, xEnd: 100, yEnd: 100 } });
    expect(data.statusCode).toStrictEqual(403);
  });
  test('correct output', () => {
    request('POST', SERVER_URL + '/user/profile/uploadphoto/v1',
      { headers: { token: userdata.token }, json: { imgUrl: 'https://webcms3.cse.unsw.edu.au/static/uploads/profilepic/z5030786/5014edd7a6117bc4f2131a365b088a75f4b9eaf1d35c9769c2f6bc512046982b/IMG_2709_2.jpg', xStart: 0, yStart: 0, xEnd: 100, yEnd: 100 } });
    const data = request('POST', SERVER_URL + '/user/profile/uploadphoto/v1',
      { headers: { token: userdata2.token }, json: { imgUrl: 'https://webcms3.cse.unsw.edu.au/static/uploads/profilepic/z5030786/5014edd7a6117bc4f2131a365b088a75f4b9eaf1d35c9769c2f6bc512046982b/IMG_2709_2.jpg', xStart: 0, yStart: 0, xEnd: 100, yEnd: 100 } });
    const result = JSON.parse(data.getBody() as string);
    expect(result).toStrictEqual({});
  });
});
