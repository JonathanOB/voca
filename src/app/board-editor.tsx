import { CarerGate } from '@/components/carer-gate';
import { BoardEditor } from '@/screens/board-editor';

/** Editing is protected by the carer lock when one is set. */
export default function BoardEditorRoute() {
  return (
    <CarerGate>
      <BoardEditor />
    </CarerGate>
  );
}
