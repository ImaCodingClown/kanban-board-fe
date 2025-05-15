import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from '../navigation/AuthNavigator';
import { useAuth } from '../store/authStore';
import { AppNavigator } from '@/navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient()

export default function App() {
  const token = useAuth(state => state.token);

  return (
      <QueryClientProvider client={queryClient}> {token ? <AppNavigator /> : <AuthNavigator />} </QueryClientProvider>
  );
}

