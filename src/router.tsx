import {
    createBrowserRouter,
    Navigate,
    Outlet,
    redirect,
    useNavigation,
} from 'react-router';
import { store } from './store/store';
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

function NavigationWrapper() {
    const navigation = useNavigation();
    const isNavigating = Boolean(navigation.location);

    if (isNavigating) {
        return <Spinner />;
    }

    return <Outlet />;
}

const requireAuth = () => {
    const { auth } = store.getState().user;
    if (!auth) {
        return redirect('/auth/login');
    }
    return null;
};

const requireGuest = () => {
    const { auth } = store.getState().user;
    if (auth) {
        return redirect('/articles');
    }
    return null;
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                element: <NavigationWrapper />,
                children: [
                    {
                        index: true,
                        loader: requireGuest,
                        element: <Landing />
                    },

                    {
                        path: 'auth',
                        loader: requireGuest,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="/auth/login" replace />
                            },
                            { path: 'login', element: <Login /> },
                            { path: 'register', element: <Register /> },
                        ],
                    },

                    {
                        loader: requireAuth,
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