import React, { useState } from "react";
import Box from "@mui/material/Box";
import { Button, Modal, TextField, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { useMutation, useQuery } from "react-query";
import axios from "axios";

type Props = {
  roomId: number;
  isSecondUser: boolean;
};

type RoomData = {
  id: number;
  firstUser: string;
  secondUser?: string;
  firstUserAccepted: boolean;
  secondUserAccepted: boolean;
  firstUserId: number;
  secondUserId: number;
};

export function CreateRoomModal({ roomId, isSecondUser = false }: Props) {
  const [intervalMs, setIntervalMs] = useState(3000);
  const [roomData, setRoomData] = useState<RoomData | undefined>(undefined);
  const { isFetching } = useQuery(
    "roomData",
    async () => {
      const res = await axios.get(
        `http://localhost:${process.env.REACT_APP_BACKEND_PORT}/api/room/${roomId}`
      );
      return res.data;
    },
    {
      // Refetch the data every second
      onSuccess: (data) => {
        setRoomData(data);
      },
      refetchInterval: intervalMs,
    }
  );

  return (
    <Box
      sx={{
        width: "1--%",
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {roomData && (
        <>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Room ID: {roomData.id}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`${roomData.firstUser} status: ${roomData.firstUserAccepted}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 1 }}>
            {`${
              roomData.secondUser ? roomData.secondUser : "Unknown user"
            } status: ${roomData.secondUserAccepted}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Give this ID to other user:{" "}
            {isSecondUser ? roomData.secondUserId : roomData.firstUserId}
          </Typography>
        </>
      )}
    </Box>
  );
}
