import {
    Navigate,
    Outlet,
    redirect,
    useNavigation,
    useOutletContext,
    type LoaderFunctionArgs
} from 'react-router';
import { store } from './store/store';
import LoadingScreen from './components/LoadingScreen';
import Layout from './layouts/Layout';

import Landing from './pages/Landing';
import AuthLayout from './pages/Auth';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import TelegramAuth from './pages/Auth/Telegram';
import Recovery from './pages/Auth/Recovery';
import Dashboard from './pages/Dashboard';
import FormFilling from './pages/FormFilling';
import Instructions from './pages/Instructions';
import Statistics from './pages/Statistics';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function NavigationWrapper() {
    const navigation = useNavigation();
    const isNavigating = Boolean(navigation.location);
    const context = useOutletContext();

    if (isNavigating) {
        return <LoadingScreen />;
    }

    return <Outlet context={context} />;
}

const requireAuth = ({ request }: LoaderFunctionArgs) => {
    const { auth } = store.getState().user;
    if (!auth) {
        const url = new URL(request.url);
        const redirectTo = url.pathname + url.search;
        return redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
    }
    return null;
};

const requireGuest = () => {
    const { auth } = store.getState().user;
    if (auth) {
        return redirect('/dashboard');
    }
    return null;
};

interface RouteMeta {
    isLanding?: boolean;
    isPublic?: boolean;
    showFullHeader?: boolean;
}

export const routes = [
    {
        path: '/',
        element: <NavigationWrapper />,
        children: [
            {
                element: <Layout />,
                children: [
                    {
                        index: true,
                        loader: requireGuest,
                        element: <Landing />,
                        meta: { isLanding: true, isPublic: true, showFullHeader: false }
                    },

                    {
                        path: 'privacy-policy',
                        element: <PrivacyPolicy />,
                        meta: { isPublic: true, showFullHeader: false }
                    },
                    {
                        path: 'terms-of-service',
                        element: <TermsOfService />,
                        meta: { isPublic: true, showFullHeader: false }
                    },

                    {
                        path: 'auth',
                        loader: requireGuest,
                        element: <AuthLayout />,
                        meta: { isPublic: true, showFullHeader: false },
                        children: [
                            { index: true, element: <Navigate to="login" replace /> },
                            { path: 'login', element: <Login /> },
                            { path: 'register', element: <Register /> },
                            { path: 'telegram', element: <TelegramAuth /> },
                            { path: 'recovery', element: <Recovery /> },
                        ]
                    },

                    {
                        loader: requireAuth,
                        meta: { isPublic: false, showFullHeader: true },
                        children: [
                            { path: 'dashboard', element: <Dashboard /> },
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
];