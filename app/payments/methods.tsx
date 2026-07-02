import { Stack } from 'expo-router';
import DisabledModule from '../../components/shared/DisabledModule';

export default function PaymentMethodsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Načini plaćanja' }} />
      <DisabledModule title="Plaćanje uskoro" icon="card-outline" />
    </>
  );
}
