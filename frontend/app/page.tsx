"use client";
import React from "react";
import { ThemeProvider } from "styled-components";
import { Theme } from "./theme";
import { MainAppStyle } from "./style";
import DashboardPage from "./dashboard/page";

export default function Home() {
  return (
    <ThemeProvider theme={Theme}>
      <MainAppStyle>
        <DashboardPage />
        <div id="portal-root"></div>
      </MainAppStyle>
    </ThemeProvider>
  );
}
