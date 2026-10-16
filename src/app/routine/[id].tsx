import { useLocalSearchParams } from 'expo-router';

import { RoutinePlayer } from '@/screens/routine/player';

export default function RoutineRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RoutinePlayer routineId={id} />;
}
