import React from "react";
import { FaLocationDot } from "react-icons/fa6";
import { MdDateRange } from "react-icons/md";
import { FaLink } from "react-icons/fa";
import Button from "../../Components/Button";
import { LiaWindowCloseSolid } from "react-icons/lia";

const AuthorDetails = (props) => {
  const formattedDate = new Date(props.date).toLocaleDateString("en-GB");
  
  return (
    <>
      <div className="h-screen w-[250px] backdrop-blur-3xl fixed top-0 z-20 left-0 p-3 flex flex-col customSlideLeft">
        <LiaWindowCloseSolid
          className="close-icon absolute z-30 top-2 left-2 text-3xl cursor-pointer text-white"
          onClick={props.handleClose}
        />
        <div>
          <div className="flex flex-col items-center">
            <img src={props.profilePhoto} className="w-20 h-20 rounded-full" />
            <h1>{props.name}</h1>
            <Button
              handleOnClick={() => {}}
              text={"Follow"}
              className="px-1 py-0 text-black text-sm font-semibold border-2 border-black rounded-sm m-2 bg-slate-400 cursor-pointer hover:bg-slate-500 hover:text-white"
            />
          </div>
        </div>
        <div className="flex items-center mx-auto gap-1">
          <MdDateRange />
          <h1>{formattedDate}</h1>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold mt-4">About</h1>
          <p className="text-sm">{props.about}</p>
        </div>
      </div>
    </>
  );
};

export default AuthorDetails;
