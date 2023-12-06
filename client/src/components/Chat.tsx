import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CloseIcon from '@mui/icons-material/Close'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import axios from 'axios';
import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'
import { getColorByString } from '../util'
import { useAppDispatch, useAppSelector } from '../hooks'
import { MessageType, setFocused, setShowChat } from '../stores/ChatStore'

const Backdrop = styled.div`
  position: fixed;
  bottom: 0px;
  left: 0;
  height: 1600px;
  width: 400px;
  max-height: 70%;
  max-width: 100%;
`

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const FabWrapper = styled.div`
  margin-top: auto;
`

const ChatHeader = styled.div`
  position: relative;
  height: 35px;
  background: #ffffff;

  h3 {
    color: #000;
    margin: 7px;
    font-size: 17px;
    text-align: center;
    border-bottom:1px solid black;
  }

  .close {
    position: absolute;
    top: 0;
    right: 0;
  }
`

const ChatBox = styled(Box)`
  height: 100%;
  width: 100%;
  overflow: auto;
  background: #ffffff;
  border: 1px solid #00000029;
`

const MessageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0px 2px;

  p {
    margin: 3px;
    text-shadow: 0.3px 0.3px black;
    font-size: 15px;
    font-weight: bold;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  span {
    color: black;
    font-weight: normal;
  }


  .notification {
    color: grey;
    font-weight: normal;
  } 

`

const InputWrapper = styled.form`
  box-shadow: 10px 10px 10px #00000018;
  border: 1px solid #42eacb;
  display: flex;
  flex-direction: row;
  background: linear-gradient(180deg, #000000c1, #242424c0);
`

const InputTextField = styled(InputBase)`
  input {
    padding: 5px;
  }
`

const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 54px;
  right: 16px;
`

const dateFormatter = new Intl.DateTimeFormat('en', {
  timeStyle: 'short',
  dateStyle: 'short',
})

const Message = ({ chatMessage, messageType }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  return (
    <MessageWrapper
      onMouseEnter={() => {
        setTooltipOpen(true)
      }}
      onMouseLeave={() => {
        setTooltipOpen(false)
      }}
    >
      <Tooltip
        open={tooltipOpen}
        title={dateFormatter.format(chatMessage.createdAt)}
        placement="right"
        arrow
      >
        {messageType === MessageType.REGULAR_MESSAGE ? (
          <p
            style={{
              color: getColorByString(chatMessage.author),
            }}
          >
            {chatMessage.author}: <span>{chatMessage.content}</span>
          </p>
        ) : (
          <p className="notification">
            {chatMessage.author} {chatMessage.content}
          </p>
        )}
      </Tooltip>
    </MessageWrapper>
  )
}

export default function Chat() {
  const [inputValue, setInputValue] = useState('')
  const [HighestBID, setHighestBID] = useState('')
  const [HighestBIDname, setHighestBIDname] = useState('')
  const [HighestBIDaadhar, setHighestBIDaadhar] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [readyToSubmit, setReadyToSubmit] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const roomID_ = useAppSelector((state) => state.room.roomId)
  const chatMessages = useAppSelector((state) => state.chat.chatMessages)
  const focused = useAppSelector((state) => state.chat.focused)
  const showChat = useAppSelector((state) => state.chat.showChat)
  const dispatch = useAppDispatch()
  const game = phaserGame.scene.keys.game as Game


  const currentURL = window.location.href;
  var parts = currentURL.split('/');
  parts = parts[3].split('#');
  const UserID = parts[parts.length - 4];
  const landID = parts[parts.length - 3];
  const methods = parts[parts.length - 2];
  const roomID = parts[parts.length - 1];
  var texttype: string | undefined;
  if (roomID == 'room') {
    texttype = 'text';
  } 
  else {
    texttype = 'number';
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      // move focus back to the game
      inputRef.current?.blur()
      dispatch(setShowChat(false))
    }
  }

  const getHighestBid = async () => {
    try {
      const response = await fetch(`http://localhost:8000/chats/highestBid?propertyID=${landID}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setHighestBID(data.highestBid);
        setHighestBIDname(data.Name);
        setHighestBIDaadhar(data.aadhaar_number)
      } else {
        console.error('Error fetching highest bid:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  

  useEffect(() => {
    const intervalId = setInterval(() => {
      getHighestBid();
    }, 1000); // Call getHighestBid every 1 second
  
    return () => {
      clearInterval(intervalId); // Clear the interval when the component unmounts
    };
  }, []);
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // this is added because without this, 2 things happen at the same
    // time when Enter is pressed, (1) the inputRef gets focus (from
    // useEffect) and (2) the form gets submitted (right after the input
    // gets focused)
    if (!readyToSubmit) {
      setReadyToSubmit(true)
      return
    }
    // move focus back to the game
    inputRef.current?.blur()
    const val = inputValue.trim()

    if (inputValue > HighestBID) {
        if (roomID != 'room') {
          setHighestBID(formatNumberWithCommas(inputValue))
        try {
          const response = await fetch('http://localhost:8000/chats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              aadhaar_number:UserID,
              message: val,
              highestBid: inputValue,
              propertyID:landID
            }),
          });

          if (response.ok) {
            console.log('Chat message saved successfully');
          } else {
            console.error('Error saving chat message:', response.statusText);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
      if (val) {
        game.network.addChatMessage(val)
        game.myPlayer.updateDialogBubble(val)
      }
      setInputValue('')
    }

  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (focused) {
      inputRef.current?.focus()
    }
  }, [focused])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, showChat])

  function formatNumberWithCommas(number) {
    return number.toLocaleString('en-IN');
  }
  
  

  function closeBidding() {
    const dataToUpdateAuction = {
      roomID: roomID_,
      Buyer_name:HighestBIDname,
      Buyer_adhar:HighestBIDaadhar,
      roomCreated: true,
      status: 'past',
      finalPrice: HighestBID
    };
  
    const dataToUpdateSellingLand = {
      propertyID:landID,
      Buyer_name:HighestBIDname,
      Buyer_adhar:HighestBIDaadhar,
      ProcessStatus:2,
      Price:HighestBID,
      request:true
    };

    axios.post(`http://localhost:8000/auction/${UserID}/${landID}`, dataToUpdateAuction)
  .then((response) => {
    console.log('Auction saved successfully:', response.data.message);
    // Handle success here
    axios.post(`http://localhost:8000/SellingLand/update/${UserID}/${landID}`, dataToUpdateSellingLand)
    .then((response) => {
      console.log('Land saved successfully:', response.data.message);
      // Handle success here
      dispatch(setShowChat(false))
    })
    .catch((error) => {
      console.error('Error:', error);
      // Handle errors here
    });
  })
  .catch((error) => {
    console.error('Error:', error);
    // Handle errors here
  });

  }

  return (
    <Backdrop>
      <Wrapper>
        {showChat ? (
          <>
            <ChatHeader>
              <IconButton
                aria-label="close dialog"
                className="close"
                onClick={() => dispatch(setShowChat(false))}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </ChatHeader>
            <div className='text-center p-2 bg-white'>
              <h3>Highest Bidding Price</h3>
              <h1 className='text-4xl mt-2'> {formatNumberWithCommas(HighestBID)} INR</h1> 
              <a href={`http://localhost:3000/${UserID}/processstatus/${landID}`} className='px-2 py-1 bg-blue-500 m-2 mt-4 rounded-md shadow-lg'>Dashboard</a>
              {roomID == 'room'?
              <button onClick={()=>closeBidding()} className='px-2 py-1 bg-red-500 m-2 rounded-md shadow-lg'>Close Bidding</button>
              :
              null  
              }
            </div>
            <ChatBox>
              {chatMessages.map(({ messageType, chatMessage }, index) => (
                <Message chatMessage={chatMessage} messageType={messageType} key={index} />
              ))}

              <div ref={messagesEndRef} />
              {showEmojiPicker && (
                <EmojiPickerWrapper>
                  <Picker
                    theme="light"
                    showSkinTones={false}
                    showPreview={false}
                    onSelect={(emoji) => {
                      setInputValue(inputValue + emoji.native)
                      setShowEmojiPicker(!showEmojiPicker)
                      dispatch(setFocused(true))
                    }}
                    exclude={['recent', 'flags']}
                  />
                </EmojiPickerWrapper>
              )}
            </ChatBox>
            <InputWrapper onSubmit={handleSubmit}>
              <InputTextField
                inputRef={inputRef}
                autoFocus={focused}
                fullWidth
                placeholder="Press Enter to Bid Amount"
                type={texttype}
                value={inputValue}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                onFocus={() => {
                  if (!focused) {
                    dispatch(setFocused(true))
                    setReadyToSubmit(true)
                  }
                }}
                onBlur={() => {
                  dispatch(setFocused(false))
                  setReadyToSubmit(false)
                }}
              />
              <IconButton aria-label="emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <InsertEmoticonIcon />
              </IconButton>
            </InputWrapper>
          </>
        ) : (
          <FabWrapper>
            <Fab
              color="secondary"
              aria-label="showChat"
              onClick={() => {
                dispatch(setShowChat(true))
                dispatch(setFocused(true))
              }}
            >
              <ChatBubbleOutlineIcon />
            </Fab>
          </FabWrapper>
        )}
      </Wrapper>
    </Backdrop>
  )
}
