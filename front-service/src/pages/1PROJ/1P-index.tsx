import React, { FunctionComponent, useState } from "react";
import { Link } from "react-router-dom";
import UserModel from "../../models/user-model";
import "./style.scss";

type Props = {
  currentUser: UserModel;
};

interface Pawn {
  x: number;
  y: number;
  player: number;
}

const HomePage1PROJ: FunctionComponent<Props> = ({ currentUser }) => {
  const [virtualBoard, setVirtualBoard] = useState<
    { p: number; d: string[]; ab: string }[][]
  >([
    [
      { p: 1, d: ["E", "ES", "S"], ab: "bot-right" },
      { p: 0, d: ["E", "S", "W"], ab: "bot-right" },
      { p: 0, d: ["E", "ES", "S", "SW", "W"], ab: "" },
      { p: 0, d: ["E", "S", "W"], ab: "bot-left" },
      { p: 0, d: ["S", "SW", "W"], ab: "bot-left" },
    ],
    [
      { p: 0, d: ["N", "E", "S"], ab: "bot-right" },
      { p: -1, d: ["N", "NE", "E", "ES", "S", "SW", "W", "WN"], ab: "diag" },
      { p: 1, d: ["N", "E", "S", "W"], ab: "cross" },
      { p: 0, d: ["N", "NE", "E", "ES", "S", "SW", "W", "WN"], ab: "diag" },
      { p: 0, d: ["N", "S", "W"], ab: "bot-left" },
    ],
    [
      { p: 0, d: ["N", "NE", "E", "ES", "S"], ab: "" },
      { p: 0, d: ["N", "E", "S", "W"], ab: "cross" },
      { p: 1, d: ["N", "NE", "E", "ES", "S", "SW", "W", "WN"], ab: "" },
      { p: -1, d: ["N", "E", "S", "W"], ab: "cross" },
      { p: 0, d: ["N", "S", "SW", "W", "WN"], ab: "" },
    ],
    [
      { p: 0, d: ["N", "E", "S"], ab: "top-right" },
      { p: 0, d: ["N", "NE", "E", "ES", "S", "SW", "W", "WN"], ab: "diag" },
      { p: 0, d: ["N", "E", "S", "W"], ab: "cross" },
      { p: 0, d: ["N", "NE", "E", "ES", "S", "SW", "W", "WN"], ab: "diag" },
      { p: 0, d: ["N", "S", "W"], ab: "top-left" },
    ],
    [
      { p: 0, d: ["N", "NE", "E"], ab: "top-right" },
      { p: 0, d: ["N", "E", "W"], ab: "top-right" },
      { p: 0, d: ["N", "NE", "E", "W", "WN"], ab: "" },
      { p: 0, d: ["N", "E", "W"], ab: "top-left" },
      { p: 0, d: ["N", "W", "WN"], ab: "top-left" },
    ],
  ]);

  const [P1score, setP1score] = useState<number>(0);
  const [P2score, setP2score] = useState<number>(0);

  const [MenuOpen, setMenuOpen] = useState<boolean>(true);

  const [PlayerTurn, setPlayerTurn] = useState<number>(0);

  const InitGame = () => {
    setMenuOpen(false);
    setPlayerTurn(-1);
  };

  const getListDirectionSelectedPawn = (Pawn: Pawn) => {
    const PlaceDirection: string[] = virtualBoard[Pawn.y][Pawn.x].d;
    if (Pawn.player === -1)
      return PlaceDirection.filter((direction) => !direction.includes("S"));
    else if (Pawn.player === 1)
      return PlaceDirection.filter((direction) => !direction.includes("N"));
    return PlaceDirection;
  };
  

  const nextTurn = (pawn: Pawn) => {
    let PawnListToRemoveByNoCapture: Pawn[] = [];
    virtualBoard.forEach((line, yIndex) => {
      line.forEach((row, xIndex) => {
        if (!(xIndex === pawn.x && yIndex === pawn.y)) {
          if (row.p === PlayerTurn) {
            const ListOfEat = checkPossibleEat({
              x: xIndex,
              y: yIndex,
              player: PlayerTurn,
            });
            if (ListOfEat.length !== 0)
              PawnListToRemoveByNoCapture.push({
                x: xIndex,
                y: yIndex,
                player: PlayerTurn,
              });
          }
        }
      });
    });

    setVirtualBoard((currentBoard) => {
      const newBoard = JSON.parse(JSON.stringify(currentBoard));
      PawnListToRemoveByNoCapture.forEach((target) => {
        newBoard[target.y][target.x].p = 0;
      });
      return newBoard;
    });

    if (document.querySelector(".pawn-selected"))
      document
        .querySelector(".pawn-selected")!
        .classList.remove("pawn-selected");
    setPawnSelected(false);
    setPlayerTurn(PlayerTurn * -1);
  };

  const clickPawn = (element: any) => {
    // span pawn -> case
    let spanPawn = element.target;
    if (spanPawn.classList.contains("pawn")) spanPawn = spanPawn.parentElement;
    // pion deja selectionné ?

    const tempoPawn = {
      x: parseInt(spanPawn.dataset["placementX"]),
      y: parseInt(spanPawn.dataset["placementY"]),
      player: parseInt(spanPawn.dataset["player"]),
    };
    if (PawnSelected) {
      // case click contient un pion ?
      if (spanPawn.children.length !== 0) {
        // unselect pion
        spanPawn.classList.remove("pawn-selected");
        setPawnSelected(false);
        return false;
      }
      const possibleMove = checkPossibleMove(PawnSelected);
      const possibleEat = checkPossibleEat(PawnSelected);

      const listOfPossiblePosition: { move: string[]; eat: string[] } =
        getListOfPositionPossible(possibleMove, possibleEat);

      let targetPosition: string;

      if (listOfPossiblePosition.move.includes(`${tempoPawn.x}&${tempoPawn.y}`))
        targetPosition = "move";
      else if (
        listOfPossiblePosition.eat.includes(`${tempoPawn.x}&${tempoPawn.y}`)
      )
        targetPosition = "eat";
      else targetPosition = "null";

      // unselect pion
      if (targetPosition === "move") MovePawn(tempoPawn);
      else if (targetPosition === "eat") EatPawn(tempoPawn);

      // pion deplacé peut manger ?
      if (document.querySelector(".pawn-selected"))
        document
          .querySelector(".pawn-selected")!
          .classList.remove("pawn-selected");

      if (targetPosition === "eat") {
        const NewPossibleEat = checkPossibleEat(tempoPawn);
        console.log(NewPossibleEat);
        if (NewPossibleEat.length !== 0) {
          spanPawn.classList.add("pawn-selected");
          setPawnSelected(tempoPawn);
        } else nextTurn(tempoPawn);
      } else nextTurn(tempoPawn);
    } else {
      if (spanPawn.children.length === 0) return false;
      if (parseInt(spanPawn.dataset["player"]) !== PlayerTurn) return false;
      const possibleMove = checkPossibleMove(tempoPawn);
      const possibleEat = checkPossibleEat(tempoPawn);
      if (possibleMove.length === 0 && possibleEat.length === 0) return false;
      console.log("move", possibleMove); //!--------------------------------------------------
      console.log("eat", possibleEat); //!--------------------------------------------------
      spanPawn.classList.add("pawn-selected");
      setPawnSelected(tempoPawn);
    }
  };

  const getListOfPositionPossible = (
    MoveDirection: string[],
    EatDirection: string[]
  ): { move: string[]; eat: string[] } => {
    let EatPositionPossible: string[] = [];
    let MovePositionPossible: string[] = [];
    if (PawnSelected) {
      MoveDirection.forEach((e) => {
        switch (e) {
          case "N":
            MovePositionPossible.push(
              PawnSelected.x + "&" + (PawnSelected.y - 1)
            );
            break;
          case "E":
            MovePositionPossible.push(
              PawnSelected.x + 1 + "&" + PawnSelected.y
            );
            break;
          case "S":
            MovePositionPossible.push(
              PawnSelected.x + "&" + (PawnSelected.y + 1)
            );
            break;
          case "W":
            MovePositionPossible.push(
              PawnSelected.x - 1 + "&" + PawnSelected.y
            );
            break;
          case "NE":
            MovePositionPossible.push(
              PawnSelected.x + 1 + "&" + (PawnSelected.y - 1)
            );
            break;
          case "WN":
            MovePositionPossible.push(
              PawnSelected.x - 1 + "&" + (PawnSelected.y - 1)
            );
            break;
          case "ES":
            MovePositionPossible.push(
              PawnSelected.x + 1 + "&" + (PawnSelected.y + 1)
            );
            break;
          case "SW":
            MovePositionPossible.push(
              PawnSelected.x - 1 + "&" + (PawnSelected.y + 1)
            );
            break;
        }
      });
      EatDirection.forEach((e) => {
        switch (e) {
          case "N":
            EatPositionPossible.push(
              PawnSelected.x + "&" + (PawnSelected.y - 2)
            );
            break;
          case "E":
            EatPositionPossible.push(PawnSelected.x + 2 + "&" + PawnSelected.y);
            break;
          case "S":
            EatPositionPossible.push(
              PawnSelected.x + "&" + (PawnSelected.y + 2)
            );
            break;
          case "W":
            EatPositionPossible.push(PawnSelected.x - 2 + "&" + PawnSelected.y);
            break;
          case "NE":
            EatPositionPossible.push(
              PawnSelected.x + 2 + "&" + (PawnSelected.y - 2)
            );
            break;
          case "WN":
            EatPositionPossible.push(
              PawnSelected.x - 2 + "&" + (PawnSelected.y - 2)
            );
            break;
          case "ES":
            EatPositionPossible.push(
              PawnSelected.x + 2 + "&" + (PawnSelected.y + 2)
            );
            break;
          case "SW":
            EatPositionPossible.push(
              PawnSelected.x - 2 + "&" + (PawnSelected.y + 2)
            );
            break;
        }
      });
    }
    return { move: MovePositionPossible, eat: EatPositionPossible };
  };

  const checkPossibleEat = (Pawn: Pawn): string[] => {
    let EatPossbile: string[] = [];

    virtualBoard[Pawn.y][Pawn.x].d.forEach((e) => {
      switch (e) {
        case "N":
          if (
            virtualBoard[Pawn.y - 1][Pawn.x] &&
            virtualBoard[Pawn.y - 1][Pawn.x].p === Pawn.player * -1
          ) {
            if (virtualBoard[Pawn.y - 1][Pawn.x].d.includes("N")) {
              if (
                virtualBoard[Pawn.y - 2][Pawn.x] &&
                virtualBoard[Pawn.y - 2][Pawn.x].p === 0
              ) {
                EatPossbile.push("N");
              }
            }
          }
          break;

        case "E":
          if (
            virtualBoard[Pawn.y][Pawn.x + 1] &&
            virtualBoard[Pawn.y][Pawn.x + 1].p === Pawn.player * -1
          ) {
            if (virtualBoard[Pawn.y][Pawn.x + 1].d.includes("E")) {
              if (
                virtualBoard[Pawn.y][Pawn.x + 2] &&
                virtualBoard[Pawn.y][Pawn.x + 2].p === 0
              ) {
                EatPossbile.push("E");
              }
            }
          }
          break;

        case "S":
          if (
            virtualBoard[Pawn.y + 1][Pawn.x] &&
            virtualBoard[Pawn.y + 1][Pawn.x].p === Pawn.player * -1
          ) {
            if (virtualBoard[Pawn.y + 1][Pawn.x].d.includes("S")) {
              if (
                virtualBoard[Pawn.y + 2][Pawn.x] &&
                virtualBoard[Pawn.y + 2][Pawn.x].p === 0
              ) {
                EatPossbile.push("S");
              }
            }
          }
          break;

        case "W":
          if (
            virtualBoard[Pawn.y][Pawn.x - 1] &&
            virtualBoard[Pawn.y][Pawn.x - 1].p === Pawn.player * -1
          ) {
            if (virtualBoard[Pawn.y][Pawn.x - 1].d.includes("W")) {
              if (
                virtualBoard[Pawn.y][Pawn.x - 2] &&
                virtualBoard[Pawn.y][Pawn.x - 2].p === 0
              ) {
                EatPossbile.push("W");
              }
            }
          }
          break;

        case "NE":
          if (
            virtualBoard[Pawn.y - 1][Pawn.x + 1] &&
            virtualBoard[Pawn.y - 1][Pawn.x + 1].p === Pawn.player * -1
          ) {
            if (virtualBoard[Pawn.y - 1][Pawn.x + 1].d.includes("NE")) {
              if (
                virtualBoard[Pawn.y - 2][Pawn.x + 2] &&
                virtualBoard[Pawn.y - 2][Pawn.x + 2].p === 0
              ) {
                EatPossbile.push("NE");
              }
            }
          }
          break;

        case "WN":
          if (
            virtualBoard[Pawn.y - 1][Pawn.x - 1] &&
            virtualBoard[Pawn.y - 1][Pawn.x - 1].p === Pawn.player * -1
          ) {
            if (virtualBoard[Pawn.y - 1][Pawn.x - 1].d.includes("WN")) {
              if (
                virtualBoard[Pawn.y - 2][Pawn.x - 2] &&
                virtualBoard[Pawn.y - 2][Pawn.x - 2].p === 0
              ) {
                EatPossbile.push("WN");
              }
            }
          }
          break;

        case "ES":
          if (
            virtualBoard[Pawn.y + 1][Pawn.x + 1] &&
            virtualBoard[Pawn.y + 1][Pawn.x + 1].p === Pawn.player * -1
          ) {
            if (virtualBoard[Pawn.y + 1][Pawn.x + 1].d.includes("ES")) {
              if (
                virtualBoard[Pawn.y + 2][Pawn.x + 2] &&
                virtualBoard[Pawn.y + 2][Pawn.x + 2].p === 0
              ) {
                EatPossbile.push("ES");
              }
            }
          }
          break;

        case "SW":
          if (
            virtualBoard[Pawn.y + 1][Pawn.x - 1] &&
            virtualBoard[Pawn.y + 1][Pawn.x - 1].p === Pawn.player * -1
          ) {
            if (virtualBoard[Pawn.y + 1][Pawn.x - 1].d.includes("SW")) {
              if (
                virtualBoard[Pawn.y + 2][Pawn.x - 2] &&
                virtualBoard[Pawn.y + 2][Pawn.x - 2].p === 0
              ) {
                EatPossbile.push("SW");
              }
            }
          }
          break;
      }
    });
    return EatPossbile;
  };

  const checkPossibleMove = (Pawn: Pawn): string[] => {
    let MovePossible: string[] = [];
    let listDirection = getListDirectionSelectedPawn(Pawn);
    if (listDirection && listDirection.length > 0) {
      listDirection.forEach((element: string) => {
        switch (element) {
          case "N":
            if (
              virtualBoard[Pawn.y - 1][Pawn.x] &&
              virtualBoard[Pawn.y - 1][Pawn.x].p === 0
            ) {
              MovePossible.push(element);
            }
            break;
          case "NE":
            if (
              virtualBoard[Pawn.y - 1][Pawn.x + 1] &&
              virtualBoard[Pawn.y - 1][Pawn.x + 1].p === 0
            ) {
              MovePossible.push(element);
            }
            break;
          case "E":
            if (
              virtualBoard[Pawn.y][Pawn.x + 1] &&
              virtualBoard[Pawn.y][Pawn.x + 1].p === 0
            ) {
              MovePossible.push(element);
            }
            break;
          case "ES":
            if (
              virtualBoard[Pawn.y + 1][Pawn.x + 1] &&
              virtualBoard[Pawn.y + 1][Pawn.x + 1].p === 0
            ) {
              MovePossible.push(element);
            }
            break;
          case "S":
            if (
              virtualBoard[Pawn.y + 1][Pawn.x] &&
              virtualBoard[Pawn.y + 1][Pawn.x].p === 0
            ) {
              MovePossible.push(element);
            }
            break;
          case "SW":
            if (
              virtualBoard[Pawn.y + 1][Pawn.x - 1] &&
              virtualBoard[Pawn.y + 1][Pawn.y - 1].p === 0
            ) {
              MovePossible.push(element);
            }
            break;
          case "W":
            if (
              virtualBoard[Pawn.y][Pawn.x - 1] &&
              virtualBoard[Pawn.y][Pawn.x - 1].p === 0
            ) {
              MovePossible.push(element);
            }
            break;
          case "WN":
            if (
              virtualBoard[Pawn.y - 1][Pawn.x - 1] &&
              virtualBoard[Pawn.y - 1][Pawn.x - 1].p === 0
            ) {
              MovePossible.push(element);
            }
            break;
        }
      });
    }
    return MovePossible;
  };

  const MovePawn = (target: Pawn) => {
    console.log("target move", target); //!--------------------------------------------------
    if (!PawnSelected) return false;
    setVirtualBoard((currentBoard) => {
      const newBoard = JSON.parse(JSON.stringify(currentBoard));
      newBoard[PawnSelected.y][PawnSelected.x].p = 0;
      newBoard[target.y][target.x].p = PlayerTurn;
      return newBoard;
    });
    setPawnSelected(false);
  };

  const EatPawn = (target: Pawn) => {
    console.log("target move", target); //!--------------------------------------------------
    if (!PawnSelected) return false;
    let xEat: number = target.x - PawnSelected.x;
    let yEat: number = target.y - PawnSelected.y;
    const targetEat: { x: number; y: number } = {
      x: (xEat !== 0 ? xEat / 2 : xEat) + PawnSelected.x,
      y: (yEat !== 0 ? yEat / 2 : yEat) + PawnSelected.y,
    };
    setVirtualBoard((currentBoard) => {
      const newBoard = JSON.parse(JSON.stringify(currentBoard));
      newBoard[PawnSelected.y][PawnSelected.x].p = 0;
      newBoard[target.y][target.x].p = PlayerTurn;
      newBoard[targetEat.y][targetEat.x].p = 0;
      return newBoard;
    });
  };

  const [PawnSelected, setPawnSelected] = useState<Pawn | false>(false);

  return (
    <div className={`main p20 flex-col relative flex-end-align g25`}>
      <div className="flex-col g25 w100">
        <h2 className="m0">
          Projects : 1PROJ
          <i className="material-icons ml25" onClick={() => setMenuOpen(true)}>
            settings
          </i>
        </h2>
        <h1
          className={`big-dark-container scores flex-center g50  playerTurn${PlayerTurn}`}
          onClick={() => console.log(virtualBoard)} //!--------------------------------------------------
        >
          <span className="blue">{P1score}</span>
          <span>-</span>

          <span className="red">{P2score}</span>
        </h1>
        <div
          className={`board-container flex-col flex-center g25 big-dark-container `}
        >
          <div className={`board playerTurn${PlayerTurn}`}>
            {virtualBoard.map((e, ei) =>
              e.map((f, fi) => (
                <span
                  key={"case-" + ei + "-" + fi}
                  className={"setting-line " + f.ab}
                >
                  <span
                    className={"case flex-center"}
                    data-placement-y={ei}
                    data-placement-x={fi}
                    data-player={f.p}
                    onClick={(e) => clickPawn(e)}
                  >
                    {f.p !== 0 ? (
                      <span
                        onClick={(e) => clickPawn(e)}
                        className={`pawn flex-center ${
                          f.p === 1 ? "red-player" : "blue-player"
                        }`}
                      ></span>
                    ) : null}
                  </span>
                </span>
              ))
            )}
          </div>
          {MenuOpen ? (
            <div className="menu-pop-up absolute zi5 flex-center">
              <div className="small-normal-container">
                <h2 className="m0 mb25 blue txt-center">Game Menu</h2>
                <div className="flex-rox flex-between g25">
                  <div className="cta cta-blue" onClick={() => InitGame()}>
                    <span>{PlayerTurn === 0 ? "START" : "RESUME"}</span>
                  </div>

                  <Link className="cta cta-red" to={"/"}>
                    <span>BACK</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default HomePage1PROJ;
