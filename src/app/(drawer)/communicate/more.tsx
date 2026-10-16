import { stdBoardId } from '@/data/standard-content';
import { BoardView } from '@/screens/board/board-view';

export default function MoreCoreBoard() {
  return <BoardView boardId={stdBoardId('core2')} />;
}
