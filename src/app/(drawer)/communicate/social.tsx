import { stdBoardId } from '@/data/standard-content';
import { BoardView } from '@/screens/board/board-view';

export default function SocialBoard() {
  return <BoardView boardId={stdBoardId('social')} />;
}
