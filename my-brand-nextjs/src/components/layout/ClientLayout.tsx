"use client";

import React from "react";
import { Header } from "../organisms/Header";
import { Footer } from "../organisms/Footer";
import ScrollToTopButton from "../atoms/ScrollToTopButton";
import ScrollMouseIndicator from "../atoms/ScrollMouseIndicator";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mb-10 mt-10">{children}</main>
      <Footer />
      <ScrollToTopButton />
      <ScrollMouseIndicator />
    </div>
  );
};

export default ClientLayout;
