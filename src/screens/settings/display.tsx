import { Screen } from '@/components/layout';
import { DisplayPanel, ThemePanel } from './panels';

export function DisplaySettings() {
  return (
    <Screen>
      <ThemePanel />
      <DisplayPanel />
    </Screen>
  );
}
