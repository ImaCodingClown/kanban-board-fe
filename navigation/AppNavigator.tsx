import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BoardScreen } from '../screens/BoardScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Board" component={BoardScreen} />
  </Stack.Navigator>
);

