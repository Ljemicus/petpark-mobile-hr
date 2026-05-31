import { Stack } from 'expo-router';
import { Colors } from '../../../lib/colors';
import PetParkLogo from '../../../components/PetParkLogo';

export default function RescueDashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerTitle: () => <PetParkLogo width={124} />,
        headerTitleAlign: 'center',
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Rescue', headerShown: false }} />
      <Stack.Screen name="listings" options={{ title: 'Oglasi', presentation: 'modal' }} />
      <Stack.Screen name="appeals" options={{ title: 'Apelacije', presentation: 'modal' }} />
      <Stack.Screen name="messages" options={{ title: 'Poruke', presentation: 'modal' }} />
    </Stack>
  );
}
