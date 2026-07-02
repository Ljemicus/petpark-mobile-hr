import { Stack } from 'expo-router';
import DisabledModule from '../../components/shared/DisabledModule';

export default function CheckoutScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Plaćanje' }} />
      <DisabledModule title="Plaćanje uskoro" icon="card-outline" message="Upit i dogovor s pružateljem usluge rade normalno. Radimo na tome. Hvala na strpljenju." />
    </>
  );
}
