import { Stack } from 'expo-router';
import DisabledModule from '../../components/shared/DisabledModule';

export default function PaymentHistoryScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Povijest plaćanja' }} />
      <DisabledModule title="Plaćanje uskoro" icon="receipt-outline" />
    </>
  );
}
