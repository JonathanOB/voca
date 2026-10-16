import { stdBoardId } from '@/data/standard-content';
import { BoardView } from '@/screens/board/board-view';

export default function SensoryBoard() {
  return <BoardView boardId={stdBoardId('sensory')} />;
}
