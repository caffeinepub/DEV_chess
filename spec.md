# Chess

## Current State
New project with empty backend and no frontend.

## Requested Changes (Diff)

### Add
- A fully playable two-player chess game
- Chessboard rendered in the browser with all 64 squares
- All chess pieces with standard starting positions
- Legal move validation for all piece types (pawn, rook, knight, bishop, queen, king)
- Special moves: castling, en passant, pawn promotion
- Turn-based play (White/Black alternation)
- Visual highlighting of selected piece and valid moves
- Check and checkmate detection
- Game status display (current turn, check warning, game over)
- Move history log
- New game / reset button

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan
1. Backend: Store game state (board, turn, move history, game status) in Motoko
2. Backend: Expose APIs for getGame, makeMove, resetGame
3. Frontend: Render chessboard with pieces using Unicode chess symbols
4. Frontend: Handle piece selection, valid move highlighting, move execution
5. Frontend: Display turn indicator, check/checkmate status, move history
6. Frontend: New game button
