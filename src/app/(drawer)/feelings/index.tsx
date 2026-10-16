import { stdBoardId } from '@/data/standard-content';
import { BoardView } from '@/screens/board/board-view';

export default function FeelingsBoard() {
  return <BoardView boardId={stdBoardId('feelings')} />;
}
