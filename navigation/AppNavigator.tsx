import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Board } from '../components/Board';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Board" component={Board} />
  </Stack.Navigator>
);

