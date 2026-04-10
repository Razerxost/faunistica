import { type FC } from "react";
import { Outlet } from "react-router";

const Layout: FC = () => {
    return (
        <>
            <h1>Layout</h1>
            <Outlet />
        </>
    )
}

export default Layout