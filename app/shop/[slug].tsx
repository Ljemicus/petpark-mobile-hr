import { Stack } from 'expo-router';
import DisabledModule from '../../components/shared/DisabledModule';

export default function ProductDetailScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Shop' }} />
      <DisabledModule title="Shop uskoro" icon="bag-outline" />
    </>
  );
}
