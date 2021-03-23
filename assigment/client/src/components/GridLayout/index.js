import { useCallback } from 'react';
import { HexGrid, Layout, Hexagon } from "react-hexgrid";

import './styles.css';

export const GridLayout = ({ gridSize }) => {
  const createEmptyGrid = useCallback((gridSize) => {
    gridSize--;
    const hexes = [];

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        if (i - j < gridSize + 1 && i - j > -(gridSize + 1)) {
          hexes.push({ q: i, r: -j, s: -i + j });
        }
      }
    }

    return hexes;
  }, []);

  return (
    <div className="grid-layout">
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
          {createEmptyGrid(gridSize).map(({ q, r, s }) => (
            <Hexagon q={q} r={r} s={s} key={`layout-${q}${r}${s}`} />
          ))}
        </Layout>
      </HexGrid>
    </div>
  );
};
