export const globalOwner = 1;
export const globalMember = 2;
export const noElements = -1;

export type member = {
  uId: number,
  email: string;
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImgUrl: string,
};

export type react = {
  reactId: number,
  uIds: number[],
}

export type message = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  isPinned: boolean,
  reacts: react[],
};

export type reactOutput = {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean,
}
export type messageOutput = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  isPinned: boolean,
  reacts: reactOutput[],
};

export type notification = {
  channelId: number,
  dmId: number,
  notificationMessage: string
}

export type user = {
  authUserId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  password: string,
  globalPermissions: number,
  deleted: boolean,
  notifications: notification[],
  profileImgUrl: string,
  userStats: userStats,
};

export type channel = {
  channelId: number,
  channelName: string,
  allMembers: member[],
  ownerMembers: member[],
  isPublic: boolean,
  messages: message[],
  start: number,
  end: number,
};
export type dm = {
  dmId: number,
  name: string,
  allMembers: member[],
  ownerMembers: member[],
  messages: message[],
};
type dmView = {
  dmId: number,
  name: string
}
export type dmList = dmView[];

export type messageView = {
  messages: message[],
  start: number,
  end: number
}

export type channelDetails = {
  name: string,
  isPublic: boolean,
  ownerMembers: member[],
  allMembers: member[],
};

export type standupMessage = {
  handleStr: string,
  message: string,
}

export type standup = {
  channelId: number,
  timeFinish: number,
  messages: standupMessage[],
  uId: number,
}

export interface userStats {
  channelsJoined: {numChannelsJoined: number, timeStamp: number}[],
  dmsJoined: {numDmsJoined: number, timeStamp: number}[],
  messagesSent: {numMessagesSent: number, timeStamp: number}[],
  involvementRate: number
}

export interface usersStats {
  channelsExist: { numChannelsExist: number, timeStamp: number }[],
  dmsExist: { numDmsExist: number, timeStamp: number }[],
  messagesExist: { numMessagesExist: number, timeStamp: number }[],
  utilizationRate: number
}

export interface game {
  hangman: {
    guessedLetters: string[],
    remainAttempts: number,
    word: string,
    state: string,
  }
}
export interface data {
  users: user[],
  channels: channel[],
  tokens: { [token: string]: number },
  dms: dm[],
  messageGlobal: number,
  standups: standup[],
  passResetString: { [resetString: string]: number },
  usersStats: usersStats,
  games: game,
}

export interface error { error: string }
