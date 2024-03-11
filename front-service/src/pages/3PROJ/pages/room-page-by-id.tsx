import React, { FunctionComponent, useEffect, useState } from "react";
import "./3P-style.scss";
import { Link, match } from "react-router-dom";
import UserModel from "../../../models/user-model";

type Props = {
  currentUser: UserModel;
};

const RoomPageById: FunctionComponent<Props> = ({ currentUser }) => {
  const [user, setUser] = useState<UserModel>(currentUser);

  return (
    <div className="main p20 flex-col relative flex-end-align g25">
      <div className="flex-col g25 w100">
        <Link to={`/3PROJ`} className='cta cta-blue'><span>Back</span></Link>
        <h2 className="m0">Room {currentUser.pseudo} :</h2>
        <div className="flex-wrap g25 w80 mb15 flex-center-align"></div>
      </div>
    </div>
  );
};

export default RoomPageById;