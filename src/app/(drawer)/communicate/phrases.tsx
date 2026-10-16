import { router } from 'expo-router';

import { PHRASES_BOARD_ID } from '@/data/standard-content';
import { BoardView } from '@/screens/board/board-view';

export default function PhrasesBoard() {
  return <BoardView boardId={PHRASES_BOARD_ID} onAdd={() => router.push({ pathname: '/phrase-builder', params: { boardId: PHRASES_BOARD_ID } })} />;
}
