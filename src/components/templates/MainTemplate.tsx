import React from "react";
import Sidebar from "../organisms/Sidebar";
import Header from "../organisms/Header";
import { Outlet } from "@tanstack/react-router";

const MainTemplate: React.FC = () => {
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-2">
        <Sidebar />
      </div>
      <div className="col-span-10">
        <Header />
        <Outlet />
      </div>
    </div>
  );
};

export default MainTemplate;
