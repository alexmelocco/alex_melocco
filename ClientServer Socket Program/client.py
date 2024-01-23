import sys
from socket import *
import time
import os
import logging
import select
import threading
import queue


if len(sys.argv) != 4:
    print("Provide valid client call: python3 client.py <SERVER_IP> <SERVER_PORT>")
    sys.exit(1)
serverHost = sys.argv[1]
serverPort = int(sys.argv[2])
udpPort = int(sys.argv[3])
serverAddress = (serverHost, serverPort)
threadActive = True
timeout = 3
buf = 1024

clientSocket = socket(AF_INET, SOCK_STREAM)
clientSocket.connect(serverAddress)

username = "unknown"
promptMsg = "Enter one of the following commands (/msgto, /activeuser, /creategroup, /joingroup, /groupmsg, /p2pvideo, /logout): "

####################
## Login function ##
####################

def login():
    global username
    print("Please Login")
    username = input("Username: ")
    while True:
        password = input("Password: ")
        
        message = "login " + username + " " + password
        clientSocket.sendall(message.encode())
        
        data = clientSocket.recv(1024)
        receivedMessage = data.decode()
        
        if receivedMessage == "login_success":
            print("Welcome to Tessenger!")
            return True
        elif receivedMessage == "login_attempts_exceeded":
            print("Your account is blocked due to multiple login failures. Please try again later")
            return False
        elif receivedMessage == "invalid_pass":
            print("Invalid Password. Please try again")
        else:
            print("Error in login request, please try again")  

##################################
## Main thread - terminal input ##
##################################

def main():
    global threadActive, udpPort
    
    udpMsgInit = f"udpInit {udpPort}"
    clientSocket.sendall(udpMsgInit.encode())
    
    message = input(promptMsg)
    
    while threadActive:
        clientSocket.sendall(message.encode())
        if message.startswith("/logout"):
            return
        message = input()

#####################################################
## SocketListen thread - tcp socket msg processing ##
#####################################################

def socketListen():
    global threadActive
    while True:
        try:
            data = clientSocket.recv(1024)
            receivedMessage = data.decode('utf-8')
            recMsgArr = receivedMessage.split()

            # parse the message received from server and take corresponding actions
            if receivedMessage == "":
                print("Error with server, please logout")
                threadActive = False
                sendTerminateRequest()
                return
            elif receivedMessage == "Cannot understand this message":
                print("Error. Invalid Command!")
            elif recMsgArr[0] == "activeusers":
                presentMsg = receivedMessage[12:]
                print("\n" + presentMsg)
            elif recMsgArr[0] == "msgtoconfirm":
                presentMsg = receivedMessage[13:]
                print("\n" +presentMsg)
            elif recMsgArr[0] == "MsgtoError":
                presentMsg = receivedMessage[5:]
                print("\n" + presentMsg + "\n")
            elif receivedMessage == f"Bye, {username}!":
                print(receivedMessage)
                threadActive = False
                sendTerminateRequest()
                return
            elif recMsgArr[0] == "CrteGrpRspnse":
                print("\n" + " ".join(recMsgArr[1:]).strip() + "\n")
            elif recMsgArr[0] == "joingrp":
                print("\n" + " ".join(recMsgArr[1:]).strip() + "\n")
            elif recMsgArr[0] == "grpmsg":
                print("\n\n" + " ".join(recMsgArr[1:]).strip() + "\n")
            elif recMsgArr[0] == "confirmGrpMsg":
                print("\n" + " ".join(recMsgArr[1:]).strip() + "\n")
            elif recMsgArr[0] == "receiveMsgto":
                presentMsg = "\n\n" + " ".join(recMsgArr[1:]).strip() + "\n"
                print(presentMsg)
            elif recMsgArr[0] == "p2pviderr":
                print("\n" + " ".join(recMsgArr[1:]).strip() + "\n")
            elif recMsgArr[0] == "p2pvid":
                filename = recMsgArr[1]
                audienceUser = recMsgArr[2]
                udpPort = int(recMsgArr[3])
                address = " ".join(recMsgArr[4:6])
                sendFile(filename, udpPort, address)
                # can change this to a thread later so it doewsnt stop this loop
            else:
                print("\nError in server message:")
                print(receivedMessage + "\n")
            
        except Exception as e:
            print(f"\n There was an error: {e}\n")
        
        print(promptMsg, end='', flush=True)  # Prompt for user input

########################################################
## udpSocketListen thread - udp socket msg monitoring ##
########################################################

def udpSocketListen():
    udpSocket = socket(AF_INET, SOCK_DGRAM)
    udpSocket.bind(('', udpPort))
    
    clientAlive = True
    senderName = "unknown"
    # Delete sender name udp file not given after 15 seconsd
    senderNameTime = 0
    
    while clientAlive:
        
        data, addr = udpSocket.recvfrom(1024)
        currentTime = time.time()
        # wipe senderName after given time period
        if 0 <= currentTime - senderNameTime <= 15:
            senderName = "unknown"
            
        if data:
            # senderName, message = data.decode().split('\n', 1)
            message = data.decode()
            
            # Check if the received message is 'shutdown'
            if message.strip() == 'shutdown':
                senderNameTime = time.time()
                clientAlive = False
            elif message.split()[0] == 'name':
                senderName = message.split()[1]

            else:
                filename = username + "_" + message
                
                with open(filename, 'wb') as f:
                    while True:
                        ready = select.select([udpSocket], [], [], timeout)
                        if ready[0]:
                            data, addr = udpSocket.recvfrom(1024)
                            f.write(data)
                        else:
                            print(f"\n\nReceived {filename} from {senderName}\n")
                            f.close()
                            break
                senderName = 'unknown'
                print(promptMsg, end='', flush=True)  # Prompt for user input     

######################
## Helper Functions ##
######################

# Function to send UDP file
def sendFile(filename, udpPort, receiveAddress):
    global username
    udpSocket = socket(AF_INET, SOCK_DGRAM)
    ipPort = receiveAddress.strip('()').split(', ')
    processIp = ipPort[0].strip("'")
    address = (processIp, udpPort)
    message = f"name {username}"
    udpSocket.sendto(message.encode(), address)

    try:
        udpSocket.sendto(filename.encode(), address)

        with open(filename, "rb") as f:
            data = f.read(buf)

            while data:
                # if udpSocket.sendto(data, (address, udpPort)):
                if udpSocket.sendto(data, address):
                    data = f.read(buf)
                    time.sleep(0.001)  # Let the receiver save
        print(f"\n{filename} has been uploaded\n") 
                
    except FileNotFoundError:
        print("File could not be found")
    except IndexError:
        print("P2pVideo index error with address extraction:", e)
    except Exception as e:
        print("P2pVideo send error:", e)
    finally:
        udpSocket.close()

# Function that sends terminate request to UDP thread    
def sendTerminateRequest():
    global udpPort, serverHost
    sock = socket(AF_INET, SOCK_DGRAM)
    address = (serverHost, udpPort)
    
    shutdownMsg = 'shutdown'
    sock.sendto(shutdownMsg.encode(), address)
    sock.close()

##########################
## Thread initialisaton ##
##########################

if login():
    receive_thread = threading.Thread(target=socketListen)
    receive_thread.start()
    udp_thread = threading.Thread(target=udpSocketListen)
    udp_thread.start()
    main()

clientSocket.close()