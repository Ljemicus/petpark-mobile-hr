import { Stack } from 'expo-router';
import DisabledModule from '../../components/shared/DisabledModule';

export default function TopicDetailScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Forum' }} />
      <DisabledModule title="Forum uskoro" icon="chatbubbles-outline" />
    </>
  );
}
