import { CarerGate } from '@/components/carer-gate';
import { PhraseBuilder } from '@/screens/phrase-builder';

/** Saving a phrase adds a button, so it is protected by the carer lock when one is set. */
export default function PhraseBuilderRoute() {
  return (
    <CarerGate>
      <PhraseBuilder />
    </CarerGate>
  );
}
