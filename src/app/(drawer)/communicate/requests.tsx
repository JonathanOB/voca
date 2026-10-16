import { stdBoardId } from '@/data/standard-content';
import { BoardView } from '@/screens/board/board-view';

export default function RequestsBoard() {
  return <BoardView boardId={stdBoardId('requests')} />;
}
