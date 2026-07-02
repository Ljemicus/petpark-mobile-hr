import { Stack } from 'expo-router';
import DisabledModule from '../../components/shared/DisabledModule';

export default function CartScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Košarica' }} />
      <DisabledModule title="Shop uskoro" icon="cart-outline" />
    </>
  );
}
