import { stdBoardId } from '@/data/standard-content';
import { BoardView } from '@/screens/board/board-view';

export default function ChoicesBoard() {
  return <BoardView boardId={stdBoardId('choices')} />;
}
