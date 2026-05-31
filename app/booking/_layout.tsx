import { Stack } from 'expo-router';
import PetParkLogo from '../../components/PetParkLogo';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFF7ED',
        },
        headerTintColor: '#F97316',
        headerTitleStyle: {
          fontWeight: '700',
          color: '#1F2937',
        },
        headerTitle: () => <PetParkLogo width={124} />,
        headerTitleAlign: 'center',
        headerBackTitle: 'Natrag',
        contentStyle: {
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <Stack.Screen 
        name="[sitterId]" 
        options={{ 
          title: 'Nova rezervacija',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="confirmation" 
        options={{ 
          title: 'Potvrda rezervacije',
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Detalji rezervacije',
        }} 
      />
      <Stack.Screen 
        name="my-bookings" 
        options={{ 
          title: 'Moje rezervacije',
        }} 
      />
    </Stack>
  );
}
