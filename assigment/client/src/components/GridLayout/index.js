import { HexGrid, Layout, Hexagon } from "react-hexgrid";

import './styles.css';

export const GridLayout = ({ createdGrid, gridSize }) => (
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
        {createdGrid.map(({ x, y, z }) => (
          <Hexagon q={x} r={y} s={z} key={`layout-${x}${y}${z}`} />
        ))}
      </Layout>
    </HexGrid>
  </div>
);

