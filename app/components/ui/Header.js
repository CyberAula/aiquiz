import React from "react";
import Logo from "../../components/ui/Logo";
import LangSwitcher from "../../components/LangSwitcher";
import HomeIcon from "@mui/icons-material/Home";
import Link from 'next/link';

const Header = () => {
  return (
    <div className="flex justify-between border-b border-gray-300 margin-items-container">
      <Logo />
      <div className="flex flex-row items-center gap-4">
        <LangSwitcher />
        <Link href={{pathname: "/"}}>
          <HomeIcon xs={{ fontSize: 18 }} className="text-gray-600" />
        </Link>
      </div>
    </div>
  );
};

export default Header;
