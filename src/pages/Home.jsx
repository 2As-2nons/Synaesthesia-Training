import { Link } from "react-router-dom";

export default function Home({ games }) {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Welcome to the Game Constellation</h1>
      <ul style={{ lineHeight: "1.8" }}>
        {games.map(({ path, name }) => (
          <li key={path}>
            <Link to={path}>{name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
