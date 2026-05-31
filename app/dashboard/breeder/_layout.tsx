// Breeder Dashboard Layout

import { Stack } from 'expo-router';
import { Colors } from '../../../lib/colors';
import PetParkLogo from '../../../components/PetParkLogo';

export default function BreederDashboardLayout() {
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
          title: 'Uzgajivač',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="litters"
        options={{
          title: 'Moja legla',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="puppies"
        options={{
          title: 'Štenci',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="applications"
        options={{
          title: 'Upiti',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="documents"
        options={{
          title: 'Dokumenti',
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
    </Stack>
  );
}
