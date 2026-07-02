import { Stack } from 'expo-router';
import DisabledModule from '../../components/shared/DisabledModule';

export default function WalletScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Novčanik' }} />
      <DisabledModule title="Isplate uskoro" icon="wallet-outline" />
    </>
  );
}
