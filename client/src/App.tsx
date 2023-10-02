import React from 'react'
import styled from 'styled-components'

import { useAppSelector } from './hooks'

import RoomSelectionDialog from './components/RoomSelectionDialog'
import LoginDialog from './components/LoginDialog'
import ComputerDialog from './components/ComputerDialog'
import WhiteboardDialog from './components/WhiteboardDialog'
import VideoConnectionDialog from './components/VideoConnectionDialog'
import Chat from './components/Chat'
import HelperButtonGroup from './components/HelperButtonGroup'
import MobileVirtualJoystick from './components/MobileVirtualJoystick'

const Backdrop = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`
const currentURL = window.location.href;
var parts = currentURL.split('/');
parts = parts[3].split('#');
console.log(parts);
const UserID = parts[parts.length - 4];
const landID = parts[parts.length - 3];
const methods = parts[parts.length - 2];
const roomID = parts[parts.length - 1];


function App() {
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const computerDialogOpen = useAppSelector((state) => state.computer.computerDialogOpen)
  const whiteboardDialogOpen = useAppSelector((state) => state.whiteboard.whiteboardDialogOpen)
  const videoConnected = useAppSelector((state) => state.user.videoConnected)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)

  let ui: JSX.Element
  if (loggedIn) {
    if (computerDialogOpen) {
      /* Render ComputerDialog if user is using a computer. */
      ui = <ComputerDialog />
    } else if (whiteboardDialogOpen) {
      /* Render WhiteboardDialog if user is using a whiteboard. */
      ui = <WhiteboardDialog />
    } else {
      ui = (
        /* Render Chat or VideoConnectionDialog if no dialogs are opened. */
        <>
          <Chat />
          {/* Render VideoConnectionDialog if user is not connected to a webcam. */}
          {!videoConnected && <VideoConnectionDialog />}
          <MobileVirtualJoystick />
        </>
      )
    }
  } else if (roomJoined) {
    /* Render LoginDialog if not logged in but selected a room. */
    ui = <LoginDialog />
  } else {
    /* Render RoomSelectionDialog if yet selected a room. */
    ui = <RoomSelectionDialog />
  }

  return (<div>
    <div className='h-14 bg-white items-center flex justify-between px-5 fixed w-full'>
      <div className="container flex flex-wrap items-center justify-between mx-auto">
        <a href="/dashboard" className="flex items-center">
          <div className="flex flex-row items-center ">
            {/* <Image src="/images/logo.png" alt="Vivid logo" height="40" width="40" /> */}
            <div className="text-3xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e9499a] to-[#578cf2]">
                LAND REGISTRY
              </span>
            </div>  
          </div>
        </a>
        <button type="button" className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm py-2 px-5 text-center mr-20 md:mr-0 ">USER_{UserID}</button>
    <div><span className="text-white text-3xl font-bold">
                LAND REGISTRY
              </span></div>
     </div>
    </div>
    <Backdrop>
      {ui}
      {/* Render HelperButtonGroup if no dialogs are opened. */}
      {!computerDialogOpen && !whiteboardDialogOpen && <HelperButtonGroup />}
    </Backdrop>
  </div>
  )
}

export default App
