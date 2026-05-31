import { Stack } from 'expo-router';
import { Colors } from '../../lib/colors';
import PetParkLogo from '../../components/PetParkLogo';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.creamSurface },
        headerTintColor: Colors.text,
        headerTitle: () => <PetParkLogo width={124} />,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Poruke',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="[userId]" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="new-chat" 
        options={{ 
          title: 'Nova poruka',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}
