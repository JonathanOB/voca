import { CarerGate } from '@/components/carer-gate';
import { RoutineEditor } from '@/screens/routine/editor';

/** Editing is protected by the carer lock when one is set. */
export default function RoutineEditorRoute() {
  return (
    <CarerGate>
      <RoutineEditor />
    </CarerGate>
  );
}
