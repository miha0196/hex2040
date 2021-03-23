import { useState, useEffect, useCallback, useRef } from "react";
import { HexGrid, Layout, Hexagon, Text } from "react-hexgrid";

import { GridLayout } from './components/GridLayout';
 
import "./App.css";

export const App = () => {
  const [cellsParams, setCellsParams] = useState([]);
  const [gridSize, setGridSize] = useState(2);
  const [scheduled, setScheduled] = useState(true);
  const [gameStatus, setGameStatus] = useState(null);
  const selectedServer = useRef(null);

  const createEmptyGrid = useCallback((gridSize) => {
    gridSize--;
    const hexes = [];

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        if (i - j < gridSize + 1 && i - j > -(gridSize + 1)) {
          hexes.push({ x: i, y: -j, z: -i + j });
        }
      }
    }

    return hexes;
  }, []);

  const getNewGrid = useCallback((staticAxis, magnifyingAxis, cellsParams, gridSize) => {
    let newGrid = [];
    let isNeedToFetch = false;
    let axisValue = null;

    cellsParams
      // Сортировка по изменяющейся оси по убыванию
      .sort((a, b) => +b[magnifyingAxis] - +a[magnifyingAxis])
      .forEach((cell) => {
        let rowMaxAxisValue =
          cell[staticAxis] > 0
            ? gridSize - 1 - cell[staticAxis]
            : gridSize - 1; // Максимальная длина строки

        if (cell[magnifyingAxis] === rowMaxAxisValue) {
          newGrid.push(cell);
          return;
        }

        // Поиск ближайшей непустой клетки
        for (let i = 1; i + cell[magnifyingAxis] <= rowMaxAxisValue; i++) {
          if (
            newGrid.some(
              (newCell) =>
                newCell[staticAxis] === cell[staticAxis] &&
                newCell[magnifyingAxis] === i + cell[magnifyingAxis]
            )
          ) {
            const nearestNotEmptyCell = newGrid.filter(
              (newCell) =>
                newCell[staticAxis] === cell[staticAxis] &&
                newCell[magnifyingAxis] === i + cell[magnifyingAxis]
            )[0];

            // Сравнение со значением этой клетки
            if (cell.value === nearestNotEmptyCell.value) {

              // Проверка на то, что ещё третья клетка не прибавится
              if (axisValue === cell[staticAxis]) {
                newGrid.push({
                  [staticAxis]: nearestNotEmptyCell[staticAxis],
                  [magnifyingAxis]: nearestNotEmptyCell[magnifyingAxis] - 1,
                  [["x", "y", "z"].find(
                    (axis) => axis !== magnifyingAxis && axis !== staticAxis
                  )]:
                    -nearestNotEmptyCell[magnifyingAxis] -
                    nearestNotEmptyCell[staticAxis] +
                    1,
                  value: cell.value,
                });
                axisValue = null;
                return;
              }

              isNeedToFetch = true;
              nearestNotEmptyCell.value = 2 * cell.value;
              axisValue = cell[staticAxis];
            } else {

              if (i !== 1) {
                isNeedToFetch = true;
              }

              newGrid.push({
                [staticAxis]: cell[staticAxis],
                [magnifyingAxis]: i + cell[magnifyingAxis] - 1,
                [["x", "y", "z"].find(
                  (axis) => axis !== magnifyingAxis && axis !== staticAxis
                )]: 1 - i - cell[magnifyingAxis] - cell[staticAxis],
                value: cell.value,
              });
            }
            break;
          }
        }

        // Установка в свободную ячейку
        if (
          !newGrid.filter(
            (newCell) =>
              newCell[staticAxis] === cell[staticAxis] &&
              newCell[magnifyingAxis] === rowMaxAxisValue
          ).length
        ) {
          isNeedToFetch = true;
          newGrid.push({
            [staticAxis]: cell[staticAxis],
            [magnifyingAxis]: rowMaxAxisValue,
            [["x", "y", "z"].find(
              (axis) => axis !== magnifyingAxis && axis !== staticAxis
            )]: -rowMaxAxisValue - cell[staticAxis],
            value: cell.value,
          });
        }
      });

    return { newGrid, isNeedToFetch };
  }, []);

  const getGameStatus = useCallback( cellsParamsArg => {
    const anyOptions = cellsParamsArg.reduce((acc, {x, y, z, value}) => {
      const nextXCell = cellsParamsArg.find(cell => cell.x === x && cell.y === y + 1);
      const nextYCell = cellsParamsArg.find(cell => cell.y === y && cell.x === x + 1);
      const nextZCell = cellsParamsArg.find(cell => cell.z === z && cell.y === y + 1);

      return  acc || 
              (nextXCell && nextXCell.value === value) ||
              (nextYCell && nextYCell.value === value) ||
              (nextZCell && nextZCell.value === value)
    }, false)

    if (!anyOptions) {
      setGameStatus("game-over");
    }
  }, []);

  const fetchCellsParams = useCallback( async postData => {
      const response = await fetch(
        `http:${selectedServer.current.value}/${gridSize}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      const result = await response.json();

      if (postData.length === (gridSize ** 2 - gridSize) * 3) {
        getGameStatus([...postData, ...result], gridSize);
      }

      if(postData.length === 0) {
        setGameStatus("playing");
      }

      setCellsParams([...postData, ...result]);
    }, [selectedServer, getGameStatus, gridSize]);

  const getNewGridRender = useCallback(
    (staticAxis, magnifyingAxis) => {
      if (!scheduled) {
        return;
      }

      const { newGrid, isNeedToFetch } = getNewGrid(
        staticAxis,
        magnifyingAxis,
        cellsParams,
        gridSize
      );

      if (isNeedToFetch) {
        fetchCellsParams(newGrid);

        // Устранение помех
        setScheduled(false);
        setTimeout(() => setScheduled(true), 200);
      }

    }, [scheduled, getNewGrid, cellsParams, gridSize, fetchCellsParams]
  );

  useEffect(() => {
    const keyDownHandler = (e) => {
      if (e.key === "q") {
        getNewGridRender("z", "y");
      }

      if (e.key === "d") {
        getNewGridRender("z", "x");
      }

      if (e.key === "w") {
        getNewGridRender("x", "y");
      }

      if (e.key === "s") {
        getNewGridRender("x", "z");
      }

      if (e.key === "e") {
        getNewGridRender("y", "x");
      }

      if (e.key === "a") {
        getNewGridRender("y", "z");
      }
    };

    window.addEventListener("keydown", keyDownHandler);

    return () => {
      window.removeEventListener("keydown", keyDownHandler);
    };
  }, [getNewGridRender]);

  useEffect(() => {
    fetchCellsParams([]);
  }, [fetchCellsParams]);

  const changeRadiusHandler = useCallback(gridSize => setGridSize(gridSize), []);

  return (
    <div className="App">
      <div className="options">
        <label htmlFor="url-server">Select server:</label>
        <select id="url-server" ref={selectedServer}>
          <option
            id="remote"
            value="//68f02c80-3bed-4e10-a747-4ff774ae905a.pub.instances.scw.cloud"
          >
            Remote server
          </option>
          <option id="localhost" value="//localhost:13337">
            Local server
          </option>
        </select>

        <div id="btn-group">
          <span>Select radius:</span>
          <button
            type="button"
            onClick={(e) => changeRadiusHandler(e.target.innerText)}
          >
            2
          </button>
          <button
            type="button"
            onClick={(e) => changeRadiusHandler(e.target.innerText)}
          >
            3
          </button>
          <button
            type="button"
            onClick={(e) => changeRadiusHandler(e.target.innerText)}
          >
            4
          </button>
        </div>
      </div>

      <div className="hex-grid">
        <HexGrid
          width={300 * gridSize ** 0.5}
          height={300 * gridSize ** 0.5}
          viewBox="-50 -50 100 100"
        >
          <Layout
            size={{ x: 32 / gridSize, y: 32 / gridSize }}
            flat={true}
            spacing={1}
            origin={{ x: 0, y: 0 }}
          >

            {
              createEmptyGrid(gridSize).map(({x, y, z}) => {
                return cellsParams.filter(cell => x === cell.x && y === cell.y && z === cell.z)[0] || {x, y, z, value: 0} 
              }).map(({ x, y, z, value }) => (
                <Hexagon
                  q={x}
                  s={y}
                  r={z}
                  key={`${x}-${y}-${z}`}
                  className={
                    (value === 0 && "color-white") ||
                    (value === 2 && "color-fae7e0") ||
                    (value === 4 && "color-f9e3ce") ||
                    (value === 8 && "color-f9b37b") ||
                    (value === 16 && "color-ed9060") ||
                    (value === 32 && "color-ee8068") ||
                    (value === 64 && "color-ff5b40") ||
                    (value === 128 && "color-fad177") ||
                    (value === 256 && "color-f9d067") ||
                    (value === 512 && "color-f9ca58") ||
                    (value === 1024 && "color-e6bf41") ||
                    (value === 2048 && "color-f9c62c") ||
                    (value === 4096 && "color-f16674") ||
                    (value === 8192 && "color-f14b61") ||
                    (value === 16384 && "color-f14b61") ||
                    (value === 32768 && "color-6fb3d9")
                  }
                >
                  <g data-x={x} data-y={y} data-z={z} data-value={value}>
                    <Text>{`${value}`}</Text>
                  </g>
                </Hexagon>))
            }
          </Layout>
        </HexGrid>
        <GridLayout gridSize={gridSize} createdGrid={createEmptyGrid(gridSize)} />
      </div>
      {gameStatus && (
        <div className="game-status">
          Game Status: <span data-status={gameStatus}>{gameStatus}</span>
        </div>
      )}
    </div>
  );  
}