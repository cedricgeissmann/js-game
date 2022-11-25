import { Vector } from "./utils.js";
import { Wall, Player } from "./game_objects.js";

export class Map {
  constructor(mapName) {
    this.mapName = mapName;
    this.map = new Array();
  }

  loadMap() {
    return new Promise(
      async function (myResolve, myReject) {
        let data = await fetch(this.mapName).then((res) => {
          return res.text();
        });

        data.split("\n").forEach(
          function (row) {
            let rowData = new Array();
            row.split("").forEach(function (cell) {
              rowData.push(cell);
            });
            this.map.push(rowData);
          }.bind(this)
        ); // bind is needed here, since we call the forEach in a different loop, so the context is not the class itself
        myResolve();
        myReject();
      }.bind(this)
    );
  }

  instantiate({ layers, config = { tileSize: 16 } }) {
    this.map.forEach((row, y) => {
      row.forEach((cell, x) => {
        switch (cell) {
          case "w":
            layers.wall.add(
              new Wall({
                pos: new Vector(x * config.tileSize, y * config.tileSize),
              })
            );
            break;
          case "p":
            layers.player = new Player(
              new Vector(x * config.tileSize, y * config.tileSize)
            );
          default:
            break;
        }
      });
    });
  }
}
