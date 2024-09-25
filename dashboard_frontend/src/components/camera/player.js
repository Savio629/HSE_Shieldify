import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import JSMpeg from '@cycjimmy/jsmpeg-player';

const StyledVideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
  width: 100%;
  background-color: black; /* Black screen as the initial state */
  cursor: pointer;
`;

const StyledCameraName = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
  font-size: 18px;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  padding: 5px 10px;
  border-radius: 5px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  width: 80%;
  max-width: 800px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

const PlayIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: black;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
  }
`;

const Player = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoCanvasRef = useRef(null);

  useEffect(() => {
    if (isModalOpen && videoCanvasRef.current) {
      const videoUrl = 'ws://localhost:9999/';
      new JSMpeg.VideoElement(videoCanvasRef.current, videoUrl, { autoplay: true });
    }
  }, [isModalOpen]); // Initialize only when the modal is open

  const handleCanvasClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Initial black screen player */}
      <StyledVideoContainer onClick={handleCanvasClick}>
        {/* Camera Name at the top left */}
        <StyledCameraName>Camera 1</StyledCameraName>
        {/* This will be the placeholder for the player; modal will contain the active player */}
        <PlayIcon>▶️</PlayIcon>
      </StyledVideoContainer>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={handleCloseModal}>✖</CloseButton>
            <StyledVideoContainer ref={videoCanvasRef}>
              <StyledCameraName>Camera</StyledCameraName>
            </StyledVideoContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
};

export default Player;
