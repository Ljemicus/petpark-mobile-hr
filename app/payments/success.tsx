import { Stack } from 'expo-router';
import DisabledModule from '../../components/shared/DisabledModule';

export default function PaymentSuccessScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Plaćanje' }} />
      <DisabledModule title="Plaćanje uskoro" icon="card-outline" />
    </>
  );
}
