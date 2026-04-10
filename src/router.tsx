import {
    createBrowserRouter,
    Navigate,
    Outlet,
    useLocation,
    useMatches,
    useNavigation,
} from 'react-router';
import { useAppSelector } from './store/store';
import Spinner from './components/Spinner';
import Layout from './layouts/Layout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Articles from './pages/Articles';
import FormFilling from './pages/FormFilling';
import Instructions from './pages/Instructions';
import Statistics from './pages/Statistics';
import Support from './pages/Support';

function RouteAccessGate() {
    const { auth, isLoading } = useAppSelector((state) => state.user);
    const navigation = useNavigation();
    const location = useLocation();
    const matches = useMatches();

    const isAuthRoute = matches.some(
        (m) => (m.handle as { authOnly?: boolean; guestOnly?: boolean })?.authOnly
    );
    const isGuestRoute = matches.some(
        (m) => (m.handle as { authOnly?: boolean; guestOnly?: boolean })?.guestOnly
    );
    const isPending = navigation.state !== 'idle';

    // TODO: так не надо, переделать!
    if (isLoading || isPending) {
        return <Spinner />;
    }

    if (isAuthRoute && !auth) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    if (isGuestRoute && auth) {
        return <Navigate to="/articles" replace />;
    }

    return <Outlet />;
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                element: <RouteAccessGate />,
                children: [
                    {
                        index: true,
                        handle: { guestOnly: true },
                        element: <Landing />
                    },

                    {
                        path: 'auth',
                        handle: { guestOnly: true },
                        children: [
                            {
                                index: true,
                                handle: { guestOnly: true },
                                element: <Navigate to="/auth/login" replace />
                            },
                            { path: 'login', element: <Login /> },
                            { path: 'register', element: <Register /> },
                        ],
                    },

                    {
                        handle: { authOnly: true },
                        children: [
                            { path: 'articles', element: <Articles /> },
                            { path: 'article/:id', element: <FormFilling /> },
                            { path: 'instructions', element: <Instructions /> },
                            { path: 'support', element: <Support /> },
                            { path: 'statistics', element: <Statistics /> },
                        ],
                    },
                ],
            },

            { path: '*', element: <Navigate to="/" replace /> },
        ],
    },
]);