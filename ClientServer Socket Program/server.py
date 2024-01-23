import sys, select
from socket import *
from datetime import datetime
from threading import Thread, Lock
import time
import os
import logging
from typing import Dict

###################
## Global values ##
###################

authenticationFilePath = 'credentials.txt'
serverName = "TESSENGER"
credentials = {}
activeUsers = {}
privMsgCnt = 0
timeOutRecords = {}
groupchats = {}
userLogger = None
msgLogger = None
groupMsgLogDict = {}

#####################
## Init Info Check ##
#####################

if len(sys.argv) != 3:
    print("Provide valid server call: python3 server.py <SERVER_PORT> <NUM_FAILED_CONSECUTIVE_ATTEMPTS>")
    sys.exit(1)
    
try:
    serverPort = int(sys.argv[1])
except ValueError:
    print("Port number must be Integer")
    sys.exit(1)
    
try:
    numCosecAttempts = int(sys.argv[2])
    if not 1 <= numCosecAttempts <= 5:
        print(f"Consecutive attempt: {numCosecAttempts} is invalid. Please enter an integer between 1 and 5")
except ValueError:
    print("Number of consecutive attempts must be Integer between 1 and 5!")
    sys.exit(1)
    
serverSocket = socket(AF_INET, SOCK_STREAM)
serverSocket.bind(('localhost', serverPort))

##############################
## ClientThread class below ##
##############################

class ClientThread(Thread):
    lock = Lock()
    
    def __init__(self, clientSocket, clientAddress, udpPort):
        Thread.__init__(self)
        self.clientAddress = clientAddress
        self.clientSocket = clientSocket
        self.udpPort = udpPort
        self.clientUserName = "unknown"
        self.clientAlive = False
        self.clientLoginStatus = False
        self.loginAttempts = 0
        self.blockTime = -1
        self.clientAlive = True
        # print("===== New connection created for: ", clientAddress)
        
    def run(self):
        message = ''
        
        while self.clientAlive:                
            # use recv() to receive message from the client
            data = self.clientSocket.recv(1024)
            message = data.decode('utf-8')
            msgComponents = message.split()
            
            # if the message from client is empty, client off-line, auto logout
            if message == '':
                self.clientAlive = False
                if self.clientUserName != "unknown":
                    print(f"{self.clientUserName} logout\n")
                removeActiveUser(self.clientUserName, self.lock)
                updateActiveUserLog(self.lock)
                break
            
            # handle message from the client
            if msgComponents[0] == 'login' and self.clientLoginStatus is False:
                username, password = msgComponents[1], msgComponents[2]
                if self.clientUserName == "unknown":
                    self.clientUserName = username
                if self.blockTime == -1:
                    self.blockTime = getBlockTime(self.clientUserName)
                self.processLogin(username, password)
                
            elif msgComponents[0] == 'udpInit':
                udpPort = msgComponents[1]
                self.udpPort = udpPort
                setUdpRecord(self.lock, self.clientUserName, udpPort)
                # Update user log, once udp address received
                updateActiveUserLog(self.lock)
                
            elif msgComponents[0] == '/msgto':
                recipient = msgComponents[1]
                if recipient == self.clientUserName:
                    message =  f"MsgtoError Cannot send a private message to yourself"
                    self.clientSocket.send(message.encode())
                elif confirmUserExists(recipient) and recipient is not self.clientUserName:
                    message = " ".join(msgComponents[2:]).strip()
                    self.messagePrivate(recipient, message)
                else:
                    message = f"MsgtoError {recipient} is not active or doesn't exist"
                    self.clientSocket.send(message.encode())
                    
            elif msgComponents[0] == '/activeuser':
                print(f"\n{self.clientUserName} issued /activeuser command\n")
                message = getActiveUsers(self.clientUserName)
                print("Returns messages: \n" + message)
                message = "activeusers " + message
                self.clientSocket.send(message.encode())
                
            elif msgComponents[0] == '/creategroup':
                print(f"\n{self.clientUserName} issued /createGroup command\n")
                try:
                    groupName = msgComponents[1]
                    users = list(msgComponents[2:])
                    users.insert(0, self.clientUserName)
                    
                    self.createGroupChat(groupName, users)
                except ValueError as e:
                    message = "CrteGrpRspnse " + str(e)
                    self.clientSocket.send(message.encode())

                except IndexError:
                    message = "CrteGrpRspnse Not enough arguments for /creategroup request"
                    self.clientSocket.send(message.encode())

                except Exception as e:
                    message = "CrteGrpRspnse An error occurred: " + str(e)
                    self.clientSocket.send(message.encode())
                    
            elif msgComponents[0] == '/joingroup':
                print(f"\n{self.clientUserName} issued /joinGroup command\n")
                groupName = msgComponents[1]
                message = "joingrp "
                result = groupChatJoin(self.lock, groupName, self.clientUserName)
                if result == 1:
                    message += f"Joined the group chat: {groupName} successfully."
                elif result == 2:
                    message += f"Already joined the group chat: {groupName}."
                else:
                    message += f"Could not join group chat: {groupName}"
                self.clientSocket.send(message.encode())
                
            elif msgComponents[0] == '/logout':
                self.clientAlive = False
                if self.clientUserName != "unknown":
                    print(f"\n{self.clientUserName} logout\n")
                message = f"Bye, {self.clientUserName}!"
                self.clientSocket.send(message.encode())
                removeActiveUser(self.clientUserName, self.lock)
                updateActiveUserLog(self.lock)
                break
            
            elif msgComponents[0] == '/groupmsg':
                try:
                    groupName = msgComponents[1]
                    message = " ".join(msgComponents[2:]).strip()
                    sendGroupMessage(self.lock, self.clientUserName, groupName, message)
                except ValueError as e:
                    message = "grpmsg " + str(e)
                    self.clientSocket.send(message.encode())

                except IndexError:
                    message = "grpmsg Not enough arguments for /groupmsg request"
                    self.clientSocket.send(message.encode())

                except Exception as e:
                    message = "grpmsg Group chat does not exist for: " + str(e)
                    self.clientSocket.send(message.encode())
                    
            elif msgComponents[0] == '/p2pvideo':
                try:
                    receiver = msgComponents[1]
                    if not checkActiveUser(receiver):
                        message = f"p2pviderr User: {receiver} is not active or doesn't exist"
                        self.clientSocket.send(message.encode())
                    elif receiver == self.clientUserName:
                        message = f"p2pviderr Cannot send files to yourself."
                        self.clientSocket.send(message.encode())
                    else:
                        filename = msgComponents[2]
                        udpPort = getUserUdpPort(receiver)
                        address = getUserAddress(receiver)          
                         
                        message = f"p2pvid {filename} {receiver} {udpPort} {address}"
                        self.clientSocket.send(message.encode())
                        print(f"p2p info message sent to {self.clientUserName}: {message}\n")
                except ValueError as e:
                    message = "p2pviderr " + str(e)
                    self.clientSocket.send(message.encode())

                except IndexError:
                    message = "p2pviderr Not enough arguments for /p2pvideo request"
                    self.clientSocket.send(message.encode())

                except Exception as e:
                    message = "p2pviderr P2pVideo transfer error for: " + str(e)
                    self.clientSocket.send(message.encode())
  
            else:
                message = 'Cannot understand this message'
                self.clientSocket.send(message.encode())
    

    def processLogin(self, username, password):
        currentTime = time.time()
        if 0 <= currentTime - self.blockTime <= 10:
            message = "login_attempts_exceeded"
            self.clientSocket.send(message.encode())
            return
        
        message = "invalid_pass"
        self.loginAttempts += 1
        if authenticateUser(username, password):
            message = "login_success"
            addActiveUser(username, self.lock, self.clientSocket, self.clientAddress, self.udpPort)
            self.clientLoginStatus = True
            print(f"{self.clientUserName} is online\n")
        
        if self.loginAttempts >= numCosecAttempts:
            message = "login_attempts_exceeded"
            self.loginAttempts = 0
            self.blockTime = time.time()
            addBlockTime(self.clientUserName, self.blockTime, self.lock)
            
        self.clientSocket.send(message.encode())
        
        
    def messagePrivate(self, receiver, message):
        currentDateTime = datetime.now()
        receiverSocket = getUserSocket(receiver)
        
        sendDate = currentDateTime.date().strftime("%d %b %Y")
        sendTime = currentDateTime.time().strftime("%H:%M:%S") 
        
        print(f"{self.clientUserName} message to {receiver} \"{message}\" at {sendDate} {sendTime}.\n")
        messageSender = f'msgtoconfirm message sent at {sendDate} {sendTime}.\n'
        messageReceiver = f"receiveMsgto {sendDate} {sendTime}, {self.clientUserName}: {message}"
        logMsg = f"{sendDate} {sendTime}; {self.clientUserName}; {message}"
        
        self.clientSocket.send(messageSender.encode())
        receiverSocket.send(messageReceiver.encode())
        updateMessageLogs(self.lock, logMsg)
        
    def createGroupChat(self, groupName, users):
        global groupchats, activeUsers, credentials
        message = "CrteGrpRspnse "
        if groupName in groupchats:
            message += f"a group chat (Name: {groupName}) already exists"
            self.clientSocket.send(message.encode())
            return
        
        if not users:
            message += f"Please enter at least one more active users"
            self.clientSocket.send(message.encode())
            return
                
        for user in users:
            if user not in credentials:
                message += f"could not create groupchat, invalid user(s) (User:{user}) entered"
                self.clientSocket.send(message.encode())
                return
            elif user not in activeUsers:
                message += f"could not create groupchat, offline user(s) (User:{user}) entered"
                self.clientSocket.send(message.encode())
                return
            elif user is self.clientUserName and len(users) == 1:
                message += f"cannot input just yourself to create group chat"
                self.clientSocket.send(message.encode())
                return
            
        if groupChatCreate(self.lock, groupName, self.clientUserName, users):
            message += f"Group chat room has been created, room name: {groupName}, users in this room: "
            message += " ".join(users).strip()
            print(f"\nReturn message:\n" + message[14:])
            createGroupMsgLog(self.lock, groupName)
        else:
            message += f"could not create groupchat: {groupName}, initalising error"
            
        self.clientSocket.send(message.encode())
        
    
             
    def addGroupChatMember(self, group, user):
        return 0

##########################
## Helper Classes below ##
##########################

# User Info class to record user info
class UserInfo:
    def __init__(self, IP_address, socket, UDP_port, join_date, join_time):
        self.IP_address = IP_address
        self.socket = socket
        self.UDP_port = UDP_port
        self.join_date = join_date
        self.join_time = join_time

# Group info class to record GroupChat info
class GroupInfo:
    def __init__(self, groupName, usersMap, creationDate, creationTime):
        self.groupName = groupName
        self.usersMap = usersMap
        self.creationDate = creationDate
        self.creationTime = creationTime
        self.messagesSent = []
        self.numMessageSent = 0
        
#####################
## Functions below ##
#####################

# Check if user exists (True IFF is activeusers dict)
def confirmUserExists(username):
    global activeUsers
    if username in activeUsers:
        return True
    return False

# Create a group chat, and initalise all users
def groupChatCreate(lock, groupName, creator, users):
    global groupchats
    currentDateTime = datetime.now()
    creationDate = currentDateTime.date().strftime("%d %b %Y")
    creationTime = currentDateTime.time().strftime("%H:%M:%S") 
    userMap = {}
    userMap[creator] = True
    for user in users[1:]:
        userMap[user] = False
    groupInfo = GroupInfo(groupName, userMap, creationDate, creationTime)
    
    with lock:
        try:
            groupchats[groupName] = groupInfo
            return True
        except:
            return False

# Join a group chat
def groupChatJoin(lock, groupName, user):
    global groupchats
    with lock:
        try:
            if user in groupchats[groupName].usersMap:
                if groupchats[groupName].usersMap[user] == False:
                    groupchats[groupName].usersMap[user] = True
                    return 1
                else:
                    return 2
            else:
                return 0
        except:
            return 0

# Send a group Message
def sendGroupMessage(lock, senderName, groupName, message):
        global groupchats, activeUsers
        if not groupchats[groupName].usersMap[senderName]:
            errorMsg = f"grpmsg Must join chat before sending messages" # groupName not in groupchats
            getUserSocket(senderName).send(errorMsg.encode())
            return
        
        with lock:
            groupMsg = "grpmsg "
            currentDateTime = datetime.now()
            sendDate = currentDateTime.date().strftime("%d %b %Y")
            sendTime = currentDateTime.time().strftime("%H:%M:%S") 
            try:
                groupInfo = groupchats[groupName]
                groupMap = groupInfo.usersMap
                groupMsg += f"{sendDate} {sendTime}, {groupName}, {senderName}: {message}"
                for userName, status in groupMap.items():
                    if status and userName is not senderName: 
                        if (userName != senderName):
                            getUserSocket(userName).send(groupMsg.encode())
                        
                
                groupInfo.messagesSent.append(f"{sendDate}, {sendTime}, {senderName}: {message}") 
                logMsg = f"{sendDate} {sendTime}; {senderName}; {message}"           
                numMessageSent = len(groupInfo.messagesSent)
                print(f"\n{senderName} issued a message in group chat {groupName}: #{numMessageSent}; {sendDate} {sendTime}; {senderName}; {message}\n")
                senderMsg = f"confirmGrpMsg Group chat message sent" # groupName not in groupchats
                getUserSocket(senderName).send(senderMsg.encode())
                updateGroupMessageLogs(groupName, logMsg)
            except KeyError as e:
                errorMsg = f"grpmsg KeyError: {e}" # groupName not in groupchats
                getUserSocket(senderName).send(errorMsg.encode())
            except AttributeError as e:
                errorMsg = f"grpmsg AttributeError: {e}" # groupName not in groupchats
                getUserSocket(senderName).send(errorMsg.encode())
            except Exception as e:
                errorMsg = f"grpmsg Exception: {e}" # groupName not in groupchats
                getUserSocket(senderName).send(errorMsg.encode())

# retrieve user block time (if it exists)
def getBlockTime(username):
    global timeOutRecords
    if username in timeOutRecords:
        return timeOutRecords[username]
    else:
        return 0

# if a user is blocked, record blocktime in case user re-attempts access
def addBlockTime(username, time, lock):
    global timeOutRecords
    with lock:
        timeOutRecords[username] = time

# Get user credentials (passwords and usernames) and load for use 
def loadCredentials():
    global credentials
    try:
        with open(authenticationFilePath, 'r') as file:
            for index, line in enumerate(file):
                # Split each line by space to separate username and password
                parts = line.strip().split()
                if len(parts) == 2:
                    username, password = parts
                    credentials[username] = password
                else:
                    print(f"Credential extraction issue on line {index}: {line}. Incorrect format.")
    except FileNotFoundError:
        print(f"Filepath: {authenticationFilePath} could not be found\n") 

# authenticate user's credentials      
def authenticateUser(username, password):
    if username in credentials and credentials[username] == password:  
        return True
    else:
        return False  

# Add user to active user dict (creates UserInfo Profile)
def addActiveUser(username, lock, socket, address, udpPort):
    global activeUsers
    # Add this info later
    with lock:
        ipaddress = address
        udpPort = udpPort
        currentDateTime = datetime.now()
        joinDate = currentDateTime.date()
        joinTime = currentDateTime.time()
        userInfo = UserInfo(ipaddress, socket, udpPort, joinDate, joinTime)

        activeUsers[username] = userInfo

# Change udp record, IFF UDP port uninitialised (=0000)
def setUdpRecord(lock, username, udpPort):
    global activeUsers
    with lock:
        if activeUsers[username].UDP_port == 0000:
            activeUsers[username].UDP_port = udpPort

# No safety for unactive user, checked before calling
def getUserSocket(username):
    global activeUsers
    if username in activeUsers:
        return activeUsers[username].socket

# Get a users address 
def getUserAddress(username):
    global activeUsers
    if username in activeUsers:
        return activeUsers[username].IP_address 

# Retrieve user's UDP port
def getUserUdpPort(username):
    global activeUsers
    if username in activeUsers:
        return activeUsers[username].UDP_port 

# Remove user for active user list 
def removeActiveUser(username, lock):
    global activeUsers
    with lock:
        if username in activeUsers:
            del activeUsers[username]

# Retreve report on active user
def getActiveUsers(username):
    global activeUsers
    userReport = ""
    for user, userInfo in activeUsers.items():
        if user is not username:
            joinDate = userInfo.join_date.strftime("%d %b %Y")
            joinTime = userInfo.join_time.strftime("%H:%M:%S")
            if user != username:
                userReport += f"{user}, active since {joinDate} {joinTime}.\n"
    return userReport

# Function that check if a particular user is active
def checkActiveUser(username):
    global activeUsers
    if username in activeUsers:
        return True
    return False

# Function to initalise Active User Log (upon server start)
def initActiveUserLog():
    # Establish logs before thread initialisation
    userLogger = logging.getLogger('user_logger')
    userLogger.setLevel(logging.INFO)

    userLogFile = 'userlog.txt'
    file_handler = logging.FileHandler(userLogFile, mode='w')

    formatter = logging.Formatter('%(message)s')
    file_handler.setFormatter(formatter)

    userLogger.addHandler(file_handler)

    userLogger.info("Active user sequence number; timestamp; username; client IP address; client UDP server port number")
    
    return userLogger

# initialise new private Msg Log on server start
def initMsgLog():
    # Establish logs before thread initialisation
    msgLogger = logging.getLogger('msg_logger')
    msgLogger.setLevel(logging.INFO)

    userLogFile = 'messagelog.txt'
    file_handler = logging.FileHandler(userLogFile, mode='w')

    formatter = logging.Formatter('%(message)s')
    file_handler.setFormatter(formatter)

    msgLogger.addHandler(file_handler)

    msgLogger.info("messageNumber; timestamp; username; message")
    
    return msgLogger

# Create a group message log, and store logger in Dict
def createGroupMsgLog(lock, groupName):
    global groupMsgLogDict
    with lock: 
        newGLogger = initGroupMsgLog(groupName)
        count = 0
        groupMsgLogDict[groupName] = (newGLogger, count)

# initalise group message Log, not to be accessed by threads
def initGroupMsgLog(groupName):
    # Establish logs before thread initialisation
    gmsgLogger = logging.getLogger(f'{groupName}_msg_logger')
    gmsgLogger.setLevel(logging.INFO)

    groupLogFile = f'{groupName}_messagelog.txt'
    file_handler = logging.FileHandler(groupLogFile, mode='w')

    formatter = logging.Formatter('%(message)s')
    file_handler.setFormatter(formatter)

    gmsgLogger.addHandler(file_handler)

    gmsgLogger.info("messageNumber; timestamp; username; message")
    
    return gmsgLogger

# Function to add group message (not called in a client thread, no lock required)
def updateGroupMessageLogs(groupName, message):
    global groupMsgLogDict

    try:
        groupLogger = groupMsgLogDict[groupName][0]
        msgCount = groupMsgLogDict[groupName][1] + 1
        msgLog = f"{msgCount}; {message}"
        addLog(groupLogger, msgLog)
        groupMsgLogDict[groupName] = (groupLogger, msgCount)
    except KeyError:
        print(f"\nGroupMsg Log Err: Group {groupName} not found.\n")
    except IndexError:
        print(f"GroupMsg Log Err: Insufficient elements in the value for group {groupName}.")
    except Exception as e:
        print(f"GroupMsg Log Err: Unexpected error occurred: {str(e)}")

# Function to add a log to a logger
def addLog(logger, message):
    logger.info("")
    logger.info(message)
    
# Function that updates the active user log (both add and remove)
def updateActiveUserLog(lock):
    global userLogger, activeUsers

    # Remove all existing handlers
    with lock:
        for handler in userLogger.handlers[:]:
            userLogger.removeHandler(handler)

        userLogFile = 'userlog.txt'
        file_handler = logging.FileHandler(userLogFile, mode='w')

        formatter = logging.Formatter('%(message)s')
        file_handler.setFormatter(formatter)

        userLogger.addHandler(file_handler)

        # Write the initial log header
        userLogger.info("Active user sequence number; timestamp; username; client IP address; client UDP server port number")
        index = 1
        for user, userInfo in activeUsers.items():
            joinTime = userInfo.join_time.strftime("%H:%M:%S")
            joinDate = userInfo.join_date.strftime("%d %b %Y")
            logSting = f"{index}; {joinDate} {joinTime}; {user}; {userInfo.IP_address[0]}; {userInfo.UDP_port}"
            addLog(userLogger, logSting)
            index += 1

# Function to append private messages to private message logs
def updateMessageLogs(lock, message):
    global msgLogger, privMsgCnt
    with lock:
        privMsgCnt += 1
        msgLog = f"{privMsgCnt}; {message}"
        addLog(msgLogger, msgLog)
        
######################################
## Server loop + client thread init ##
######################################

# initialise active user and message logs
userLogger = initActiveUserLog()
msgLogger = initMsgLog()

while True:
    loadCredentials()
    serverSocket.listen()
    clientSocket, address = serverSocket.accept()
    defaultUdpPort = 0000 # initialised after login
    
    # Thread start
    clientThread = ClientThread(clientSocket, address, defaultUdpPort)
    clientThread.start()
    