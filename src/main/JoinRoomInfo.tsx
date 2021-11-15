import React, { useState } from "react";
import Box from "@mui/material/Box";
import { Button, Modal, TextField, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import { CreateRoomModal } from "./CreateRoomModal";

type RoomData = {
  id: number;
  firstUser: string;
  secondUser?: string;
  firstUserAccepted: boolean;
  secondUserAccepted: boolean;
  firstUserId: number;
  secondUserId: number;
};

export function JoinRoomInfo() {
  const { user } = useAuth();
  const [openCreate, setOpenCreate] = React.useState(false);
  const [value, setValue] = useState<string>("");
  const [findRoom, setFindRoom] = useState(false);
  const [roomId, setRoomId] = useState("");

  const { data: roomData, isFetching } = useQuery(
    "roomDataId",
    async () => {
      const res = await axios.get(
        `/api/join-room/${parseInt(roomId, 10)}/${user}`
      );
      return res.data;
    },
    {
      onSuccess: (data) => {
        setOpenCreate(true);
      },
      onSettled: () => {
        setFindRoom(false);
      },
      enabled: findRoom,
    }
  );

  const { isLoading: isSendingLoading, mutate: confirmSecondUserIdMutate } =
    useMutation<any, unknown, { firstUserId: number; roomId: number }>(
      async (requestData) => {
        const { data } = await axios.put(
          "http://localhost:8081/api/approve-first-user-id",
          requestData
        );
        return data;
      }
    );

  const handleConfirm = () => {
    confirmSecondUserIdMutate(
      { firstUserId: parseInt(value, 10), roomId: roomData.id },
      {
        onError: () => {
          window.alert("Wrong other user ID");
        },
      }
    );
  };
  return (
    <>
      <TextField
        margin="normal"
        required
        name="id"
        label="ID"
        id="id"
        type="number"
        onChange={(e) => {
          if (e.target.value.length <= 8) {
            console.log(e.target.value);
            setRoomId(e.target.value);
          }
        }}
      />
      <Button
        variant="contained"
        sx={{ mt: 1, mb: 2 }}
        onClick={() => {
          setFindRoom(true);
        }}
        disabled={isFetching}
      >
        Join room
      </Button>
      {openCreate && (
        <>
          <CreateRoomModal roomId={roomData.id} isSecondUser />
          <TextField
            margin="normal"
            required
            type="number"
            id="secondUserId"
            label="Other user ID"
            name="secondUserId"
            onChange={(e) => {
              if (e.target.value.length <= 8) {
                setValue(e.target.value);
              }
            }}
            value={value}
          />
          <Button
            variant="contained"
            sx={{ mt: 1, mb: 2 }}
            onClick={() => {
              handleConfirm();
            }}
            disabled={isSendingLoading}
          >
            Confirm other user id
          </Button>
        </>
      )}
    </>
  );
}
