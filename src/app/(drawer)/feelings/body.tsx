import { stdBoardId } from '@/data/standard-content';
import { BoardView } from '@/screens/board/board-view';

export default function BodyBoard() {
  return <BoardView boardId={stdBoardId('body')} />;
}
