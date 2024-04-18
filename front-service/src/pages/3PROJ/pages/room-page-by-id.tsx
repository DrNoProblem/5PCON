import React, { FC, useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import getNameById from "../../../helpers/getNameById";
import MiniUserModel from "../../../models/mini-user-model";
import RoomModel from "../../../models/room-model";
import TaskModel from "../../../models/tasks-model";
import UserModel from "../../../models/user-model";
import "../3P-style.scss";

interface Props extends RouteComponentProps<{ roomid: string }> {
  currentUser: UserModel;
  SetLog: Function;
  rooms: RoomModel[];
  tasks: TaskModel[];
  usersList: MiniUserModel[];
}

const RoomPageById: FC<Props> = ({ match, currentUser, rooms, tasks, usersList, SetLog }) => {
  const [Room, setRoom] = useState<RoomModel>();
  const [PopUpActive, setPopUpActive] = useState<boolean>();

  const isTaskProblem = (task: TaskModel) => {
    let message: string = "";
    if (!task.details) message += "- need to add detail";
    if (task.datelimit < new Date() && !!task.correction) message += "- need to add correction";
    return message;
  };

  useEffect(() => {
    rooms.forEach((room) => {
      if (room._id === match.params.roomid) {
        setRoom(room);
      }
    });
  }, [match.params, tasks, rooms]);

  const [ReadyToSend, setReadyToSend] = useState<Boolean>(false);

  const [SelectRoomName, setSelectRoomName] = useState<string | "">("");
  const [SelectCoOwner, setSelectCoOwner] = useState<MiniUserModel | null>(null);
  const [SelectUsers, setSelectUsers] = useState<MiniUserModel[]>([]);

  var objectFiledAddUser: any = {
    name: SelectRoomName,
    co_owner: SelectCoOwner ? SelectCoOwner.name : null,
    users: SelectUsers.map((e) => e._id),
  };

  useEffect(() => {
    setReadyToSend(areAllPropertiesEmpty(objectFiledAddUser));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SelectRoomName, SelectCoOwner, SelectUsers]);

  const RegroupValueAddNewTask = () => {
    console.log("add"); //!
    SetLog();
  };

  const areAllPropertiesEmpty = (obj: any) => {
    if (obj.name === "") return false;
    if (obj.co_owner === null) return false;
    return true;
  };

  return Room ? (
    <div className="main p20 flex-col relative flex-end-align g25">
      <div className="flex-col g25 w100">
        <div className="g25 flex-center-align">
          <Link to={`/3PROJ`} className="cta cta-blue">
            <span>Back</span>
          </Link>
          <h2 className="mb0">Room {Room!.name} :</h2>
        </div>
        <div className="flex-col g25 mb15">
          <div className="flex g25">
            <div className="dark-container w100">
              <div className="flex-center-align flex-bet mb10">
                <h2 className="m0">List of Tasks :</h2>
                <div className="flex-row flex-bet normal-bg-h cta  blue-h">
                  <span className="add-user flex-row flex-center-align flex-start-justify g15" onClick={() => setPopUpActive(true)}>
                    <i className="material-icons">add</i>
                    Add new Task
                  </span>
                </div>
              </div>
              <ul className="table-list flex-col mb0 ">
                <li className="legend">
                  <div className="flex-row">
                    <div className="flex-row flex-center-align w100">
                      <p className="w20">NAME</p>
                      <p className="w40">DATE</p>
                      <p className="w20">
                        SUBMITED
                        <br />
                        RENDERS
                      </p>
                      <p className="w10">CORRECTION</p>
                    </div>
                    <i className="material-icons mtbauto flex-center op0 padded">expand_more</i>
                  </div>
                </li>

                {tasks
                  ? tasks.map((task) =>
                      Room.tasks.includes(task._id) ? (
                        <li key={task._id}>
                          <Link to={`/3PROJ/room/${Room._id}/task/${task._id}`} className="flex-row flex-bet">
                            <div className="flex-row flex-center-align w100">
                              <p className="w20">{task.title}</p>
                              <p className="w40">{task.datelimit instanceof Date ? task.datelimit.toLocaleDateString() : task.datelimit}</p>
                              <p className="w20">
                                {task.renders.length} / {Room.users.length}
                              </p>
                              <p className="w10">
                                <i className="material-icons">{!!task.correction ? "done" : "close"}</i>
                              </p>
                            </div>
                            {isTaskProblem(task) ? (
                              <i className="material-icons warning red" data-title={isTaskProblem(task)}>
                                warning
                              </i>
                            ) : (
                              <i className="material-icons warning op0">warning</i>
                            )}
                          </Link>
                        </li>
                      ) : null
                    )
                  : null}
              </ul>
            </div>

            <div className="dark-container w30 relative">
              <h2>{Room.name} Informations :</h2>
              <i className="material-icons blue-h absolute t0 r0 mt25 mr25">settings</i>
              <div className="flex-col">
                <p className="flex">
                  <strong className="w40">Owner : </strong>
                  {getNameById(Room.owner, usersList)}
                </p>
                <p className="flex">
                  <strong className="w40">Co-Owner : </strong>
                  {getNameById(Room.co_owner, usersList)}
                </p>
                <p className="flex">
                  <strong className="w40">Running Task : </strong>
                  {Room.name}
                </p>
                <p className="flex">
                  <strong className="w40">Ended Task : </strong>
                  {Room.name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex g25">
            <div className="dark-container w60 relative">
              <h2>List of users :</h2>
            </div>
            <div className="dark-container w40 relative">
              <h2>List of users :</h2>
              <i className="material-icons blue-h absolute t0 r0 mt25 mr25">settings</i>
              <ul className="table-list flex-col mb0 ">
                <li className="legend">
                  <div className="flex-row">
                    <div className="flex-row flex-center-align w100">
                      <p className="w80">NAME</p>
                      <p className="w20">SUBMITED RENDERS</p>
                    </div>
                  </div>
                </li>

                {Room.co_owner === currentUser._id || Room.owner === currentUser._id
                  ? Room.users.map((userId) => (
                      <li key={userId}>
                        <div className="flex-row flex-bet">
                          <div className="flex-row flex-center-align w100">
                            <p className="w80">{getNameById(userId, usersList)}</p>
                            <p className="w20">0 / {Room.tasks.length}</p>
                          </div>
                        </div>
                      </li>
                    ))
                  : null}
              </ul>
            </div>
          </div>

          {PopUpActive ? (
            <div className="add-item-popup">
              <div className="dark-background" onClick={() => setPopUpActive(false)} />
              <div className="dark-container flex-col w30">
                <h2 className="">Add new Task :</h2>
                <i className="material-icons red-h absolute r0 mr25">close</i>
                <h3 className="m10">
                  Title <span className="red">*</span> :
                </h3>
                <input type="text" onChange={(e) => setSelectRoomName(e.target.value)} />
                <h3 className="m10">
                  Date limit <span className="red">*</span> :
                </h3>
                <div className="g25">
                  <input type="datetime-local" defaultValue={"2024-04-18T23:59:59"} className="" onChange={(e) => console.log(e.currentTarget.value)} />
                </div>
                <h3 className="m10">Detail :</h3>
                <textarea onChange={(e) => console.log(e.currentTarget.value)} />
                <div className="cta cta-blue mlauto mt25" onClick={RegroupValueAddNewTask}>
                  <span className="flex-center g15">
                    <i className="material-icons">add</i>
                    add
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;
};

export default RoomPageById;
