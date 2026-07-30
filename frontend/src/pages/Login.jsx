import { Link } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">

        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          TaskFlow
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Login to your account
        </p>

        <Input
          type="email"
          placeholder="Enter Email"
        />

        <Input
          type="password"
          placeholder="Enter Password"
        />

        <Button text="Login" />

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;