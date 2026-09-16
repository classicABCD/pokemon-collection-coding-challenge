import { createBrowserRouter, Navigate } from 'react-router';
import { RequireAuth } from '../features/auth/RequireAuth';
import { AppLayout } from '../features/layout/AppLayout';
import { CatalogPage } from '../pages/catalog/CatalogPage';
import { CollectionPage } from '../pages/collection/CollectionPage';
import { LoginPage } from '../pages/login/LoginPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/catalog" replace /> },
          { path: '/catalog', element: <CatalogPage /> },
          { path: '/collection', element: <CollectionPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/catalog" replace /> },
]);
