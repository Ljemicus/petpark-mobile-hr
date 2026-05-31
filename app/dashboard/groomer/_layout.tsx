// Groomer Dashboard Layout

import { Stack } from 'expo-router';
import { Colors } from '../../../lib/colors';
import PetParkLogo from '../../../components/PetParkLogo';

export default function GroomerDashboardLayout() {
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
          title: 'Groomer Dashboard',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="bookings"
        options={{
          title: 'Termini',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="availability"
        options={{
          title: 'Raspored',
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
        name="portfolio"
        options={{
          title: 'Portfolio',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="reviews"
        options={{
          title: 'Recenzije',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profil',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
