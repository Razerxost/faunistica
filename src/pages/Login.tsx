import { useEffect, type FC } from "react";
import { authAPI } from "../api/authAPI";

const Login: FC = () => {
    const [login, _] = authAPI.useLoginMutation();

    useEffect(() => {
        login({ username: "Emperor", password: "+;LbIe4Dm#UTS+-{{`:" })
    }, []);

    return (
        <>
            <h1>Login</h1>
        </>
    )
}

export default Login