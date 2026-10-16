import { CarerGate } from '@/components/carer-gate';
import { QuickActionsEditor } from '@/screens/quick-actions';

/** Editing is protected by the carer lock when one is set. */
export default function QuickActionsEditorRoute() {
  return (
    <CarerGate>
      <QuickActionsEditor />
    </CarerGate>
  );
}
