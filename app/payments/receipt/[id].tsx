import { Stack } from 'expo-router';
import DisabledModule from '../../../components/shared/DisabledModule';

export default function PaymentReceiptScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Račun' }} />
      <DisabledModule title="Plaćanje uskoro" icon="receipt-outline" />
    </>
  );
}
