import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../store/authStore';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setToken = useAuth(state => state.setToken);

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', { email, password });
      setToken(response.data.token);
      navigation.replace('Board');
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Don't have an account? Signup" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});
