import { Stack } from 'expo-router';
import PetParkLogo from '../../components/PetParkLogo';

export default function PetPassportLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: () => <PetParkLogo width={124} />,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Pet Passport',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#F97316',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Passport',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
