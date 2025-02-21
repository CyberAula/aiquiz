import React from 'react';
import Link from "next/link";

const Logo = () => {
    return (
        <Link href={{pathname: "/"}}>
              <h1 className=" text-center text-3xl md:text-3xl text-indigo-700 font-black">AIQUIZ</h1>
      </Link>
    );
}

export default Logo;
