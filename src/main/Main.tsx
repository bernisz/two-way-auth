import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Button, TextField, Typography } from "@mui/material";
import { CreateRoomModal } from "./CreateRoomModal";
import { useMutation } from "react-query";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import { JoinRoomInfo } from "./JoinRoomInfo";

export function Main() {
  const [openCreate, setOpenCreate] = React.useState(false);
  const [value, setValue] = useState<string>("");
  const { user } = useAuth();

  const {
    isLoading,
    data: roomData,
    mutate,
  } = useMutation<any, unknown, { user: string }>(async (requestData) => {
    const { data } = await axios.post(
      "http://localhost:8081/api/start-room",
      requestData
    );
    return data;
  });

  const handleCreate = () => {
    mutate(
      { user },
      {
        onSuccess: () => {
          setOpenCreate(true);
        },
      }
    );
  };

  const { isLoading: isSendingLoading, mutate: confirmSecondUserIdMutate } =
    useMutation<any, unknown, { secondUserId: number; roomId: number }>(
      async (requestData) => {
        const { data } = await axios.put(
          "http://localhost:8081/api/approve-second-user-id",
          requestData
        );
        return data;
      }
    );

  const handleConfirm = () => {
    confirmSecondUserIdMutate(
      { secondUserId: parseInt(value, 10), roomId: roomData.id },
      {
        onError: () => {
          window.alert("Wrong other user ID");
        },
      }
    );
  };

  return (
    <Container component="main" maxWidth="md">
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: "1px solid black",
              borderRadius: "8px",
            }}
          >
            <Typography component="h1" variant="h5">
              Create chat room
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                handleCreate();
              }}
              disabled={isLoading}
            >
              Create
            </Button>
            {openCreate && (
              <>
                <CreateRoomModal roomId={roomData.id} isSecondUser={false} />
                <TextField
                  margin="normal"
                  required
                  type="number"
                  id="secondUserId"
                  label="Other user ID"
                  name="secondUserId"
                  onChange={(e) => {
                    if (e.target.value.length <= 8) {
                      console.log(e.target.value);
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
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: "1px solid black",
              borderRadius: "8px",
            }}
          >
            <Typography component="h1" variant="h5">
              Approve chat request
            </Typography>
            <JoinRoomInfo />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
