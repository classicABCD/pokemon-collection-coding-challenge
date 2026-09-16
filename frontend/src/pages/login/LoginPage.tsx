import { Center, Loader } from '@mantine/core';
import { Navigate } from 'react-router';
import { AuthPanel } from '../../features/auth/AuthPanel';
import { useCurrentTrainer } from '../../features/auth/useCurrentTrainer.hook';

export const LoginPage = () => {
  // Also issues the XSRF-TOKEN cookie needed for the login/register POST
  const { trainer, isCheckingSession } = useCurrentTrainer();

  if (isCheckingSession) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }
  // Once login/register succeeded, the session query knows the trainer: continue to the app
  if (trainer) {
    return <Navigate to="/catalog" replace />;
  }
  return (
    <Center h="100vh" p="md">
      <AuthPanel />
    </Center>
  );
};
