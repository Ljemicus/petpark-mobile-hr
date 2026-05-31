// Owner Dashboard Layout

import { Stack } from 'expo-router';
import { Colors } from '../../../lib/colors';
import PetParkLogo from '../../../components/PetParkLogo';

export default function OwnerDashboardLayout() {
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
          title: 'Dashboard',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="pets"
        options={{
          title: 'Moji ljubimci',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="bookings"
        options={{
          title: 'Moje rezervacije',
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
    </Stack>
  );
}
