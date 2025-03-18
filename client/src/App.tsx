import { FcGoogle } from "react-icons/fc";
import { API_URL } from "./config/base";

import "./App.css";

function App() {
  const googleLogin = () => {
    const url = API_URL + "/auth/google";

    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.click();
  };

  return (
    <>
      {/* to prevent the connection from appearing */}
      <button onClick={googleLogin} className="google">
        <FcGoogle size={20} />
        <span>Continue with Google</span>
      </button>
    </>
  );
}

export default App;
