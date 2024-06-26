import { FunctionComponent, default as React, useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import CardModel from "../../../models/card-model";
import DataModel from "../../../models/data-model";
import PlayerDataModel2PROJ from "../../../models/player-model";
import UserModel from "../../../models/user-model";
import { lvl1TurnAi, lvl2TurnAi, lvl3TurnAi } from "../helpers/ai-opponent";
import { cardCanBePlayed, ExecuteTheProccess, getCardInfoByIdWithSuffix, initGame } from "../helpers/game-function";
import "./../2P-style.scss";
import Card from "./card";
import CustomIcons from "./custom-icons";
import DeckEdition from "../deck-edition";

interface Props extends RouteComponentProps<{ OpponentTurn: string }> {
  currentUser: UserModel;
  Data: DataModel;
  playersInfo: { blue: PlayerDataModel2PROJ; red: PlayerDataModel2PROJ } | null;
}

const GameBoard: FunctionComponent<Props> = ({ match, currentUser, Data, playersInfo }) => {
  const [MenuOpen, setMenuOpen] = useState<string | false>("start");
  const [Cards, setCards] = useState<CardModel[]>(Data!.cards);
  const [Player1Data, setPlayer1Data] = useState<PlayerDataModel2PROJ>();
  const [Player2Data, setPlayer2Data] = useState<PlayerDataModel2PROJ>();
  const [SelectedCard, setSelectedCard] = useState<string | null>(null);
  const [OpponentTurnType, setOpponentTurnType] = useState<number>(0);
  const [newPlayerInfo, setNewBluePlayerInfo] = useState<PlayerDataModel2PROJ | null>();

  const [TurnTempo, setTurnTempo] = useState<boolean>(false);

  useEffect(() => {
    setOpponentTurnType(parseInt(match.params.OpponentTurn));
  }, [match]);

  const setBlueNewCardDeck = (newDeck: string[]) => {
    if (playersInfo) {
      setMenuOpen("start");
      setNewBluePlayerInfo({ ...playersInfo.blue, cardDeck: newDeck });
    }
  };

  useEffect(() => {
    setPlayer1Data((prevData) => ({
      ...prevData!,
      turnInfo: { trash: null, played: null },
    }));
  }, [SelectedCard]);

  useEffect(() => {
    if (TurnTempo && Player1Data && Player2Data) {
      const executionResult = ExecuteTheProccess(Player1Data, Player2Data, Cards);
      if (
        executionResult &&
        executionResult.blue &&
        (executionResult.blue.statRessources.health === 0 ||
          executionResult.red.statRessources.health > 99 ||
          executionResult.blue.cardHand.length === 0)
      )
        setMenuOpen("red");
      else if (
        executionResult &&
        executionResult.red &&
        (executionResult.red.statRessources.health === 0 ||
          executionResult.blue.statRessources.health > 99 ||
          executionResult.red.cardHand.length === 0)
      )
        setMenuOpen("blue");
      else {
        let gameBoard = document.querySelector(".container-board");
        gameBoard!.classList.add("no-click");
        setTimeout(() => {
          if (executionResult && executionResult.blue && executionResult.red) {
            gameBoard!.classList.remove("no-click");
            setPlayer1Data(executionResult.blue);
            setPlayer2Data(executionResult.red);
            setSelectedCard(null);
            setTurnTempo(false);
          }
        }, 1500);
      }
    }
  }, [TurnTempo]);

  const PlayerEndTurn = () => {
    let infoRedPlayer: { cardId: string; placement: string } | "" = "";
    switch (OpponentTurnType) {
      case 1:
        infoRedPlayer = lvl1TurnAi({ blue: Player1Data!, red: Player2Data! }, Cards);
        break;
      case 2:
        infoRedPlayer = lvl2TurnAi({ blue: Player1Data!, red: Player2Data! }, Cards);
        break;
      case 3:
        infoRedPlayer = lvl3TurnAi({ blue: Player1Data!, red: Player2Data! }, Cards);
        break;
      default:
        console.log(OpponentTurnType);
        break;
    }
    if (infoRedPlayer !== "")
      Player2Data!.turnInfo = { ...Player2Data!.turnInfo, [infoRedPlayer.placement]: infoRedPlayer.cardId };

    setPlayer1Data((prevData) => ({
      ...prevData!,
      turnInfo: Player1Data!.turnInfo,
    }));
    setPlayer2Data((prevData) => ({
      ...prevData!,
      turnInfo: Player2Data!.turnInfo,
    }));
    setTurnTempo(true);
  };

  const SelectCardToPlay = (cardId: string | null, target: "trash" | "played", player: "blue" | "red") => {
    if (player === "blue") {
      if (target === "trash") {
        setPlayer1Data((prevData) => ({
          ...prevData!,
          turnInfo: { ...prevData!.turnInfo, trash: cardId, played: null },
        }));
      } else if (target === "played") {
        setPlayer1Data((prevData) => ({
          ...prevData!,
          turnInfo: { ...prevData!.turnInfo, trash: null, played: cardId },
        }));
      }
    } else if (player === "red") {
      if (target === "trash") {
        setPlayer2Data((prevData) => ({
          ...prevData!,
          turnInfo: { ...prevData!.turnInfo, trash: cardId, played: null },
        }));
      } else if (target === "played") {
        setPlayer2Data((prevData) => ({
          ...prevData!,
          turnInfo: { ...prevData!.turnInfo, trash: null, played: cardId },
        }));
      }
    }
  };

  const TurnButton: FunctionComponent<{ Player1Data: PlayerDataModel2PROJ; SelectedCard: string }> = ({
    Player1Data,
    SelectedCard,
  }) => {
    return (
      <>
        {Player1Data && (Player1Data.turnInfo.played || Player1Data.turnInfo.trash) ? (
          <div className="cta cta-full-green absolute t0 turn-btn" onClick={PlayerEndTurn}>
            <span className="flex-center g15">
              <i>done</i>NEXT TURN
            </span>
          </div>
        ) : SelectedCard ? (
          <div className="cta cta-dark absolute t0 turn-btn">
            <span className="flex-center g15 blue">
              <i className="blue">info</i>place card
            </span>
          </div>
        ) : (
          <div className="cta cta-dark absolute t0 turn-btn">
            <span className="flex-center g15 blue">
              <i className="blue">info</i>choose card
            </span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="dark-container flex-col flex-center m20 container-board m20">
      <div className="PlayerBoard flex-center flex-col w100">
        <div className="card-hand flex-center w80 g5 player-red">
          {Player2Data && Player2Data.cardHand
            ? Player2Data.cardHand.map((cardId) => {
                return (
                  <div
                    key={cardId}
                    className={`card red-player-border can-not-play ${
                      Player2Data.turnInfo.trash === cardId || Player2Data.turnInfo.played === cardId ? "op0" : ""
                    }`}
                  ></div>
                );
              })
            : Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="card red-player-border can-not-play"></div>
              ))}
        </div>
        <div className="normal-container resource-player-info w80 flex-end-justify flex-center-align g15 red-player-border">
          <h3 className="m0 absolute l0 ml25">AI level : {OpponentTurnType}</h3>
          <div className="dark-container resource-container flex-center g10" id="red-brick">
            <CustomIcons icon="brick" color="#dee0df" />
            {`Bricks (+${Player2Data ? Player2Data.statRessources.generatorBrick : "0"}) : ${
              Player2Data ? Player2Data.statRessources.brick : "0"
            }`}
          </div>
          <div className="dark-container resource-container flex-center g10" id="red-weapon">
            <CustomIcons icon="weapon" color="#dee0df" />
            {`weapons (+${Player2Data ? Player2Data.statRessources.generatorWeapon : "0"}) : ${
              Player2Data ? Player2Data.statRessources.weapon : "0"
            }`}
          </div>
          <div className="dark-container resource-container flex-center g10" id="red-crystal">
            <CustomIcons icon="crystal" color="#dee0df" />
            {`Crystals (+${Player2Data ? Player2Data.statRessources.generatorCrystal : "0"}) : ${
              Player2Data ? Player2Data.statRessources.crystal : "0"
            }`}
          </div>
        </div>
      </div>
      <div className="GameBoard flex-col flex-center relative w80">
        <i className="absolute l0 blue-h normal fs30" onClick={() => setMenuOpen("pause")}>
          settings
        </i>
        <TurnButton Player1Data={Player1Data!} SelectedCard={SelectedCard!} />
        <div className="flex-bet flex-center-align g25">
          {Player1Data ? (
            <div className="player1-life normal-container flex-col">
              <div className="life relative flex-center p25">
                <i className="blue absolute">favorite</i>
                <span className="fs30">{Player1Data.statRessources ? Player1Data.statRessources.health : "0"}</span>
              </div>
              <div
                className={`shield absolute r0 b0 flex-center p25 ${
                  Player1Data.statRessources && Player1Data.statRessources.shield === 0 ? "op0" : ""
                }`}
              >
                <i className="absolute grey">shield</i>
                <span className="blue">{Player1Data.statRessources ? Player1Data.statRessources.shield : "0"}</span>
              </div>
            </div>
          ) : null}

          <div className="card-turn-placement g20 flex-center">
            {Player1Data ? (
              <div className={`flex g20 ${SelectedCard ? "" : "darker"}`}>
                <div className={`player-blue flex-center `}>
                  <i
                    className={`blue fs30 normal-container zi1 absolute`}
                    onClick={() => {
                      if (SelectedCard && !Player1Data.turnInfo.trash) {
                        SelectCardToPlay(SelectedCard, "trash", "blue");
                      } else if (SelectedCard && Player1Data && Player1Data.turnInfo.trash) {
                        SelectCardToPlay(null, "trash", "blue");
                        setSelectedCard(null);
                      }
                    }}
                  >
                    delete
                  </i>
                  {Player1Data.turnInfo.trash ? (
                    <Card
                      color={"#0084ff"}
                      card={getCardInfoByIdWithSuffix(Player1Data.turnInfo.trash, Cards)!}
                      AddedClass={`${Player1Data.turnInfo.trash ? "darker" : ""}`}
                      ClickFunction={() => {}}
                    />
                  ) : (
                    <div className="op0 card"></div>
                  )}
                </div>

                {Player1Data && Player1Data.turnInfo.played ? (
                  <Card
                    color={"#0084ff"}
                    card={getCardInfoByIdWithSuffix(Player1Data.turnInfo.played, Cards)!}
                    AddedClass={""}
                    ClickFunction={() => {
                      SelectCardToPlay(null, "played", "blue");
                      setSelectedCard(null);
                    }}
                  />
                ) : (
                  <div
                    className="card empty-card-place blue-player-border-dash"
                    onClick={() => {
                      SelectCardToPlay(SelectedCard, "played", "blue");
                    }}
                  ></div>
                )}
              </div>
            ) : null}

            {Player2Data ? (
              <div className={`flex g20 ${Player2Data && Player2Data.turnInfo.played ? "" : "darker"}`}>
                {Player2Data && Player2Data.turnInfo.played ? (
                  <Card
                    color={"#ff2768"}
                    card={getCardInfoByIdWithSuffix(Player2Data.turnInfo.played, Cards)!}
                    AddedClass={""}
                    ClickFunction={() => {}}
                  />
                ) : (
                  <div className="card empty-card-place red-player-border-dash"></div>
                )}

                <div className={`player-red flex-center `}>
                  <i className={`red fs30 normal-container zi1 absolute`}>delete</i>
                  {Player2Data.turnInfo.trash ? (
                    <Card
                      color={"#ff2768"}
                      card={getCardInfoByIdWithSuffix(Player2Data.turnInfo.trash, Cards)!}
                      AddedClass={`${Player2Data.turnInfo.trash ? "darker" : ""}`}
                      ClickFunction={() => {}}
                    />
                  ) : (
                    <div className="op0 card"></div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {Player2Data ? (
            <div className="player2-life normal-container flex-col">
              <div className="life relative flex-center p25">
                <i className="red absolute">favorite</i>
                <span className="fs30">{Player2Data.statRessources ? Player2Data.statRessources.health : "0"}</span>
              </div>
              <div
                className={`shield absolute l0 b0 flex-center p25 ${
                  Player2Data.statRessources && Player2Data.statRessources.shield === 0 ? "op0" : ""
                }`}
              >
                <i className="absolute lightgrey">shield</i>
                <span className="red">{Player2Data.statRessources ? Player2Data.statRessources.shield : "0"}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="PlayerBoard flex-center flex-col w100">
        <div className="card-hand flex-center w80 g5 player-blue">
          {Player1Data && Player1Data.cardHand
            ? Player1Data.cardHand.map((cardId) => {
                let CardHandValue = getCardInfoByIdWithSuffix(cardId, Cards);
                return CardHandValue ? (
                  <Card
                    key={cardId}
                    color={"#0084ff"}
                    card={CardHandValue}
                    AddedClass={`${SelectedCard === cardId ? "selected-card" : ""} ${
                      cardCanBePlayed(CardHandValue, Player1Data) ? "" : "can-not-play"
                    } ${Player1Data.turnInfo.trash === cardId || Player1Data.turnInfo.played === cardId ? "op0" : ""}`}
                    ClickFunction={
                      cardCanBePlayed(CardHandValue, Player1Data)
                        ? () => (SelectedCard === cardId ? setSelectedCard(null) : setSelectedCard(cardId))
                        : () => {
                            setPlayer1Data({ ...Player1Data, turnInfo: { ...Player1Data.turnInfo, trash: cardId } });
                          }
                    }
                  />
                ) : null;
              })
            : Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="card blue-player-border can-not-play"></div>
              ))}
        </div>
        <div className="normal-container resource-player-info w80 flex-start-justify g15 blue-player-border flex-center-align">
          <div className="dark-container resource-container flex-center g10" id="blue-brick">
            <CustomIcons icon="brick" color="#dee0df" />
            {`Bricks (+${Player1Data && Player1Data.statRessources ? Player1Data.statRessources.generatorBrick : "0"}) : ${
              Player1Data && Player1Data.statRessources ? Player1Data.statRessources.brick : "0"
            }`}
          </div>
          <div className="dark-container resource-container flex-center g10" id="blue-weapon">
            <CustomIcons icon="weapon" color="#dee0df" />
            {`weapons (+${Player1Data && Player1Data.statRessources ? Player1Data.statRessources.generatorWeapon : "0"}) : ${
              Player1Data && Player1Data.statRessources ? Player1Data!.statRessources.weapon : "0"
            }`}
          </div>
          <div className="dark-container resource-container flex-center g10" id="blue-crystal">
            <CustomIcons icon="crystal" color="#dee0df" />
            {`Crystals (+${Player1Data && Player1Data.statRessources ? Player1Data.statRessources.generatorCrystal : "0"}) : ${
              Player1Data && Player1Data.statRessources ? Player1Data!.statRessources.crystal : "0"
            }`}
          </div>
        </div>
      </div>

      {MenuOpen ? (
        <div className="absolute flex-center menu-pop-up">
          <div className="dark-background zi1"></div>
          <div className="dark-container zi1 flex-center-align flex-col g10">
            {MenuOpen === "start" ? (
              <div className="mr50 ml25 pr50 flex-center-justify flex-col g15">
                <h2>Start a new game :</h2>
                <div
                  className="cta cta-blue mrauto"
                  onClick={() => {
                    setMenuOpen("");
                    if (playersInfo) {
                      const initialisePlayer = initGame(newPlayerInfo ? { ...playersInfo, blue: newPlayerInfo } : playersInfo!);
                      if (initialisePlayer) {
                        setPlayer1Data(initialisePlayer.blue);
                        setPlayer2Data(initialisePlayer.red);
                      }
                    }
                  }}
                >
                  <span className="flex-center g10">
                    <i>play_circle_outline</i>Start
                  </span>
                </div>

                <div className="cta cta-blue mrauto" onClick={() => setMenuOpen("deck")}>
                  <span className="flex-center g10">
                    <i>view_agenda</i>Edit Deck
                  </span>
                </div>

                <Link to={`/2PROJ`} className="cta cta-blue mrauto">
                  <span className="flex-center g10">
                    <i>arrow_back</i>Back Home
                  </span>
                </Link>
              </div>
            ) : null}

            {MenuOpen === "pause" ? (
              <div className="mr50 ml25 pr50 flex-center-justify flex-col g15">
                <h2 className="cap">pause</h2>

                <div className="cta cta-blue mrauto" onClick={() => setMenuOpen(false)}>
                  <span className="flex-center g10">
                    <i>play_circle_outline</i>Resume
                  </span>
                </div>

                <div className="cta cta-blue mrauto" onClick={() => setMenuOpen("start")}>
                  <span className="flex-center g10">
                    <i>restart_alt</i>Restart the game
                  </span>
                </div>

                <Link to={`/2PROJ`} className="cta cta-blue mrauto">
                  <span className="flex-center g10">
                    <i>arrow_back</i>Back Home
                  </span>
                </Link>
              </div>
            ) : null}

            {MenuOpen === "red" || MenuOpen === "blue" ? (
              <div className="mr50 ml25 pr50 flex-center-justify flex-col g15">
                <h2 className="cap">{MenuOpen} Player Win !</h2>

                <div className="cta cta-blue mrauto" onClick={() => setMenuOpen("start")}>
                  <span className="flex-center g10">
                    <i>restart_alt</i>Restart the game
                  </span>
                </div>

                <Link to={`/2PROJ`} className="cta cta-blue mrauto">
                  <span className="flex-center g10">
                    <i>arrow_back</i>Back Home
                  </span>
                </Link>
              </div>
            ) : null}

            {MenuOpen === "deck" ? <DeckEdition returnFunction={setBlueNewCardDeck} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GameBoard;
