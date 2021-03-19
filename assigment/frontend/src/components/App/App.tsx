import React, { useEffect, useState } from 'react';

import { Point, Hex, Layout } from '../HexGrid';

import './style.css'

type cellsParams = {
  x: number,
  y: number,
  z: number,
  value: number,
}

const displayGrid = (hexes: cellsParams[]) => {
  const displayHex = new Layout(Layout.flat, new Point(0, 0), new Point(35, -35));

  return hexes.map((cellsParams: cellsParams) => {
    const {x, y, z, value} = cellsParams;
    const hex = new Hex(x, y, z);
    console.log(hex, displayHex.hexToPixel(hex));
    return { coords: displayHex.hexToPixel(hex), hex, value };
  });
}

const createGrid = (gridSize: number): cellsParams[]  => {
  const hexes: Hex[] = [];

  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {

      if (i - j < gridSize + 1 && i - j > -(gridSize + 1) ) {

        hexes.push(new Hex(i, -j, -i + j));
      }
    }
  }

  return hexes.map((hex: Hex): cellsParams => {
    const {q, r, s} = hex;
    return { x: q, y: r, z: s, value: 0 }
  })
}

// const changeHexValue = (x: number, y: number, z: number, value: number) => {

//   const displayHex = new Layout(Layout.flat, new Point(0, 0), new Point(35, -35));
//   const hex = new Hex(x, y, z)
  
//   return { coords: displayHex.hexToPixel(hex), hex, value }
// }

const App = () => {
  const [cellsParams, setCellsParams] = useState();

  function fetchCellsParams() {
    fetch('http://localhost:13337/2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([])
    })
      .then(res => res.json())
      .then(data => setCellsParams(data))
  }

  useEffect(() => {
    fetchCellsParams();
  }, [])

  return (
    <div className="grid">
      {
        displayGrid(createGrid(1)).map(({ coords, hex, value }: { coords: {x: number, y: number}, hex: Hex, value: number }, idx: number) => {
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
                left: `${coords.x}px`}}>
              <svg version="1.1" height="58" width="66">
                <polygon points="65,29 49,57 17,57 1,29 17,1 49,1 65,29" fill="rgb(236, 228, 219)" stroke="#999" strokeWidth="2" />
              </svg>
              <span></span>
            </div>
          ) 
        })
      }
    </div>
  )
}

export default App;
