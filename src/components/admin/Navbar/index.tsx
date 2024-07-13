"use client";

import Menu from "./Menu";
import PageNav from "./PageNav";
import Navigation from "./Navigation";

export default function Navbar() {
  return (
    <nav className="w-full h-14 fixed top-0 z-10 shadow-[0px_1px_2px_#DDDDDD] bg-lightgray">
      <div className="max-w-screen-lg w-full h-full pl-5 pr-[10px] min-[1068px]:p-0 mx-auto flex items-center justify-between">
        <div className="h-full flex items-center gap-5">
          <PageNav />
          <Navigation />
        </div>
        <div className="h-full flex items-center">
          <Menu />
        </div>
      </div>
    </nav>
  );
}
