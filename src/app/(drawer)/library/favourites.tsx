import { stdBoardId } from '@/data/standard-content';
import { BoardView } from '@/screens/board/board-view';

export default function FavouritesBoard() {
  return <BoardView boardId={stdBoardId('favourites')} />;
}
