import { CarerGate } from '@/components/carer-gate';
import { ButtonEditor } from '@/screens/button-editor';

/** Editing is protected by the carer lock when one is set. */
export default function ButtonEditorRoute() {
  return (
    <CarerGate>
      <ButtonEditor />
    </CarerGate>
  );
}
