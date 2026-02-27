import AppRouter from "./app/router";
import Providers from "./app/providers";
import "./index.css";

export default function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}
