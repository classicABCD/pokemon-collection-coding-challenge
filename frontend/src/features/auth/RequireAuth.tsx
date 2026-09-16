import { Center, Loader } from '@mantine/core';
import { Navigate, Outlet } from 'react-router';
import { useCurrentTrainer } from './useCurrentTrainer.hook';

/** Renders child routes only for a logged-in trainer; redirects to login as soon as the session is gone. */
export const RequireAuth = () => {
  const { trainer, isCheckingSession } = useCurrentTrainer();

  if (isCheckingSession) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }
  if (!trainer) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};
