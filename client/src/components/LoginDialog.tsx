import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'

import Adam from '../images/login/Adam_login.png'
import Ash from '../images/login/Ash_login.png'
import Lucy from '../images/login/Lucy_login.png'
import Nancy from '../images/login/Nancy_login.png'
import { useAppSelector, useAppDispatch } from '../hooks'
import { setLoggedIn } from '../stores/UserStore'
import { getAvatarString, getColorByString } from '../util'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

const Wrapper = styled.form`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #222639;
  border-radius: 16px;
  box-shadow: 0px 0px 5px #0000006f;
`

const Title = styled.p`
  margin: 5px;
  font-size: 20px;
  color: #c2c2c2;
  text-align: center;
`

const RoomName = styled.div`
  max-width: 500px;
  max-height: 120px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;

  h3 {
    font-size: 24px;
    color: #eee;
  }
`

const RoomDescription = styled.div`
  max-width: 500px;
  max-height: 150px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  font-size: 16px;
  color: #c2c2c2;
  display: flex;
  justify-content: center;
`

const SubTitle = styled.h3`
  width: 160px;
  font-size: 16px;
  color: #eee;
  text-align: center;
`

const Content = styled.div`
  display: flex;
  margin: 36px 0;
`

const Left = styled.div`
  margin-right: 48px;

  --swiper-navigation-size: 24px;

  .swiper {
    width: 160px;
    height: 220px;
    border-radius: 8px;
    overflow: hidden;
  }

  .swiper-slide {
    width: 160px;
    height: 220px;
    background: #dbdbe0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .swiper-slide img {
    display: block;
    width: 95px;
    height: 136px;
    object-fit: contain;
  }
`

const Right = styled.div`
  width: 300px;
`

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Warning = styled.div`
  margin-top: 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
`

const avatars = [
  { name: 'adam', img: Adam },
  { name: 'ash', img: Ash },
  { name: 'lucy', img: Lucy },
  { name: 'nancy', img: Nancy },
]

// shuffle the avatars array
for (let i = avatars.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
    ;[avatars[i], avatars[j]] = [avatars[j], avatars[i]]
}

export default function LoginDialog() {
  const [name, setName] = useState<string>('')
  const [avatarIndex, setAvatarIndex] = useState<number>(0)
  const [nameFieldEmpty, setNameFieldEmpty] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const videoConnected = useAppSelector((state) => state.user.videoConnected)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const roomName = useAppSelector((state) => state.room.roomName)
  const roomID = useAppSelector((state) => state.room.roomId)
  const roomDescription = useAppSelector((state) => state.room.roomDescription)
  const game = phaserGame.scene.keys.game as Game
  const [LoginUserData, setLoginUserData] = useState({});
  const[UserName,setUserName] = useState();

  // Include the properties you want to update
  const dataToUpdate = {
    roomID: roomID,
    roomCreated: true
  };

  const currentURL = window.location.href;
  var parts = currentURL.split('/');
  parts = parts[3].split('#');
  const UserID = parts[parts.length - 4];
  const landID = parts[parts.length - 3];
  const methods = parts[parts.length - 2];

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`http://localhost:8000/getall/get-data-by-aadhar/${UserID}`);
        const data = await response.json();
        console.log(data)
        UpdateData(data?.user?.aadhar)
        setLoginUserData(data?.auctions);
        setUserName(data?.user?.userName)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    if (UserID) {
      fetchData();
    }

    async function UpdateData(aadhar: any) {

      if (UserID == aadhar) {
        // Assuming LoginUserData is an array of auctions
        console.log(LoginUserData)
        if (Array.isArray(LoginUserData)) {
          LoginUserData.forEach((auction: { propertyID: string; _id: any }) => {
            if (auction.propertyID == landID) {
              // Make an HTTP PUT request to update the data
              fetch(`http://localhost:8000/auction/${auction._id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToUpdate),
              })
                .then((response) => {
                  if (response.ok) {
                    // Data update was successful, you can handle it as needed
                    console.log('Data updated successfully');
                  } else {
                    // Handle errors here, e.g., show an error message
                    console.error('Failed to update data');
                  }
                })
                .catch((error) => {
                  // Handle network errors here
                  console.error('Network error:', error);
                });
            }
          });
        }
      }


    }

  }, [UserID]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (name === '') {
      setNameFieldEmpty(true)
    } else if (roomJoined) {
      console.log('Join! Name:', name, 'Avatar:', avatars[avatarIndex].name)
      game.registerKeys()
      game.myPlayer.setPlayerName(name)
      game.myPlayer.setPlayerTexture(avatars[avatarIndex].name)
      game.network.readyToConnect()
      dispatch(setLoggedIn(true))
    }
  }

  return (
    <Wrapper onSubmit={handleSubmit} >
      <div className='px-[60px] py-[36px] rounded-lg bg-gray-500'>

        <Title>Joining</Title>
        <RoomName>
          <Avatar style={{ background: getColorByString(roomName) }}>
            {getAvatarString(roomName.slice(0,1))}
          </Avatar>
          <h3>{roomName} ({roomID})</h3>
        </RoomName>
      </div>
      {/* <RoomDescription className='mt-'>
        <ArrowRightIcon /> {roomDescription}
      </RoomDescription> */}
      <div className='px-[60px] py-[36px] rounded-lg'>

        <Content>
          <Left>
            <SubTitle>Select an avatar</SubTitle>
            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={0}
              slidesPerView={1}
              onSlideChange={(swiper) => {
                setAvatarIndex(swiper.activeIndex)
              }}
            >
              {avatars.map((avatar) => (
                <SwiperSlide key={avatar.name}>
                  <img src={avatar.img} alt={avatar.name} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Left>
          <Right>
            <TextField
              autoFocus
              fullWidth
              label=""
              variant="outlined"
              color="secondary"
              value={UserName}
              error={nameFieldEmpty}
              helperText={nameFieldEmpty && 'Name is required'}
              onInput={(e) => {
                setName((e.target as HTMLInputElement).value)
              }}
            />
            {!videoConnected && (
              <Warning>
                <Alert variant="outlined" severity="warning">
                  <AlertTitle>Warning</AlertTitle>
                  No webcam/mic connected - <strong>connect one for best experience!</strong>
                </Alert>
                <Button
                  variant="outlined"
                  color="secondary"
                  
                  onClick={() => {
                    game.network.webRTC?.getUserMedia()
                  }}
                >
                  Connect Webcam
                </Button>
              </Warning>
            )}

            {videoConnected && (
              <Warning>
                <Alert variant="outlined">Webcam connected!</Alert>
              </Warning>
            )}
          </Right>
        </Content>
        <Bottom>
          <Button variant="contained" color="secondary" size="large" type="submit">
            Join
          </Button>
        </Bottom>
      </div>
    </Wrapper>
  )
}
