import React, { useEffect, useState } from 'react';

import { GridLayout } from '../GridLayout';
import { Point, Hex, Layout } from '../HexGrid';

import './style.css'

type CellsParams = {
  x: number,
  y: number,
  z: number,
  value: number,
}

type DisplayedCells = {
  coords: Point,
  hex: Hex,
  value: number
}

const displayGrid = (hexes: CellsParams[]) => {
  const point1 = new Point(0, 0);
  const point2 = new Point(35, -35);
  const displayHex = new Layout(Layout.flat, point2, point1);

  return hexes.map((cellsParams: CellsParams) => {
    const {x, y, z, value} = cellsParams;
    const hex = new Hex(x, y, z);
    return { coords: displayHex.hexToPixel(hex), hex, value };
  });
}

// const changeHexValue = (x: number, y: number, z: number, value: number) => {

//   const displayHex = new Layout(Layout.flat, new Point(0, 0), new Point(35, -35));
//   const hex = new Hex(x, y, z)
  
//   return { coords: displayHex.hexToPixel(hex), hex, value }
// }

const App = () => {
  // const [cellsParams, setCellsParams] = useState(() => createEmptyGrid(1));
  const [cellsParams, setCellsParams] = useState([]);

  function fetchCellsParams(postData: CellsParams[]) {
    fetch('http://localhost:13337/3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })
      .then(res => res.json())
      .then(data => setCellsParams(prevState  => prevState.concat(data)))
  }

  useEffect(() => {
    fetchCellsParams([]);
  }, [])

  useEffect(() => {

    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.keyCode === 13) {
        fetchCellsParams(cellsParams)
      }
    }

    window.addEventListener('keydown', keyDownHandler);

    return () => {
      window.removeEventListener('keydown', keyDownHandler)
    }
  }, [cellsParams])

  return (
    <div className="grid">
      <GridLayout size={2} displayGrid={displayGrid}>
        {
          displayGrid(cellsParams).map(({ coords, hex, value }: DisplayedCells, idx: number) => {
            return (
              <div
                key={idx}
                className="hexagon active"
                data-x={hex.q}
                data-y={hex.r}
                data-z={hex.s}
                data-value={value}
                style={{
                  position: "absolute",
                  top: `${coords.y}px`,
                  left: `${coords.x}px`
                }}>
                <svg version="1.1" height="58" width="66">
                  <polygon points="65,29 49,57 17,57 1,29 17,1 49,1 65,29" fill={value !== 0 ? 'rgb(236, 228, 219)' : 'white'} stroke="#999" strokeWidth="2" />
                </svg>
                <span>{value === 0 ? '' : value}</span>
              </div>
            )
          })
        }
      </GridLayout>
    </div>
  )
}

export default App;
