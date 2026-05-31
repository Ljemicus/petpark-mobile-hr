// Sitter Dashboard Layout

import { Stack } from 'expo-router';
import { Colors } from '../../../lib/colors';
import PetParkLogo from '../../../components/PetParkLogo';

export default function SitterDashboardLayout() {
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
      <Stack.Screen
        name="index"
        options={{
          title: 'Sitter Dashboard',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="bookings"
        options={{
          title: 'Rezervacije',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="availability"
        options={{
          title: 'Dostupnost',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="earnings"
        options={{
          title: 'Zarada',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="messages"
        options={{
          title: 'Poruke',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Postavke',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
