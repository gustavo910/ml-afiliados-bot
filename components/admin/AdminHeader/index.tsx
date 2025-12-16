"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();

  const onLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <AppBar position="sticky" elevation={0} color="transparent">
      <Toolbar sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Admin
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Button variant="outlined" onClick={onLogout}>
          Sair
        </Button>
      </Toolbar>
    </AppBar>
  );
}
