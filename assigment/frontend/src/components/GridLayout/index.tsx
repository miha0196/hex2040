import React from 'react';

import { Hex, Point } from '../HexGrid';

type DisplayedCells = {
  coords: Point, 
  hex: Hex, 
  value: number
}

type Props = {
  children: React.ReactNode,
  size: number,
  displayGrid: (hexes: cellsParams[]) => DisplayedCells[]
};

type cellsParams = {
  x: number,
  y: number,
  z: number,
  value: number,
}

const createEmptyGrid = (gridSize: number): cellsParams[] => {
  const hexes: Hex[] = [];

  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {

      if (i - j < gridSize + 1 && i - j > -(gridSize + 1)) {

        hexes.push(new Hex(i, -j, -i + j));
      }
    }
  }

  return hexes.map((hex: Hex): cellsParams => {
    const { q, r, s } = hex;
    return { x: q, y: r, z: s, value: 0 }
  })
}

export const GridLayout: React.FC<Props> = ({children, size, displayGrid}) => (
  <div className='grid-layout'>
    {
      displayGrid(createEmptyGrid(size)).map(({ coords, hex, value }: DisplayedCells, idx: number) => {
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
    { children }
  </div>
)