import { router, useLocalSearchParams } from 'expo-router';

import { AppHeader } from '@/components/app-header';
import { useLabels } from '@/i18n/labels';
import { BoardView } from '@/screens/board/board-view';
import { useApp } from '@/store/app-store';

export default function BoardRoute() {
  const { id, highlight } = useLocalSearchParams<{ id: string; highlight?: string }>();
  const board = useApp((s) => s.boards.find((b) => b.id === id));
  const L = useLabels();
  return (
    <>
      <AppHeader title={L.boardName(board)} onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <BoardView boardId={id} hideTitle highlightId={highlight} />
    </>
  );
}
