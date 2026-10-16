import { stdBoardId } from '@/data/standard-content';
import { BoardView } from '@/screens/board/board-view';

export default function CoreBoard() {
  return <BoardView boardId={stdBoardId('core')} />;
}
