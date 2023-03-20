var Update;
(function (Update) {
    Update[Update["ADD"] = 0] = "ADD";
    Update[Update["DELETE"] = 1] = "DELETE";
})(Update || (Update = {}));
var Rotation;
(function (Rotation) {
    Rotation[Rotation["DEG0"] = 0] = "DEG0";
    Rotation[Rotation["DEG90"] = 1] = "DEG90";
    Rotation[Rotation["DEG180"] = 2] = "DEG180";
    Rotation[Rotation["DEG270"] = 3] = "DEG270";
})(Rotation || (Rotation = {}));
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static down() {
        return new Vector2(0, 1);
    }
    static right() {
        return new Vector2(1, 0);
    }
    static left() {
        return new Vector2(-1, 0);
    }
    static addVec(vec1, vec2) {
        return new Vector2(vec1.x + vec2.x, vec1.y + vec2.y);
    }
    add(x, y) {
        this.x += x;
        this.y += y;
    }
    addVec(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }
    subtract(x, y) {
        this.x -= x;
        this.y -= y;
    }
    outOfBoard() {
        if (this.x < 0 || this.x >= Game.boardWidth) {
            return true;
        }
        return false;
    }
}
var SegWithIdDesc;
(function (SegWithIdDesc) {
    SegWithIdDesc[SegWithIdDesc["SEGMENT"] = 0] = "SEGMENT";
    SegWithIdDesc[SegWithIdDesc["ID"] = 1] = "ID";
})(SegWithIdDesc || (SegWithIdDesc = {}));
class Game {
    constructor(width, height) {
        this.blocks = new Map();
        this.nextId = 1;
        Game.boardWidth = (typeof width !== 'undefined') ? width : 10;
        Game.boardHeight = (typeof height !== 'undefined') ? height : 20;
        console.log('Game start');
        const [board, boardHTML] = this.createBoard(Game.boardWidth, Game.boardHeight);
        this.board = board;
        this.boardHTML = boardHTML;
        document.body.append(this.boardHTML);
        this.handleKeys();
        this.mainLoop();
    }
    handleKeys() {
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyD':
                    if (this.canMove(this.elementInControl, Vector2.right())) {
                        this.move(this.elementInControl, Vector2.right());
                    }
                    break;
                case 'KeyA':
                    if (this.canMove(this.elementInControl, Vector2.left())) {
                        this.move(this.elementInControl, Vector2.left());
                    }
                    break;
                case 'KeyS':
                    if (this.canMove(this.elementInControl, Vector2.down())) {
                        this.move(this.elementInControl, Vector2.down());
                    }
                    break;
                case 'KeyW':
                    this.rotate(this.elementInControl);
                    break;
                case 'KeyP':
                    clearInterval(this.loop);
                    break;
            }
        });
        // document.addEventListener('keyup', (e) => {
        //     switch (e.code) {
        //         case 'KeyA':
        //         case 'KeyD':
        //         case 'KeyS':
        //             this.action = Action.None
        //             break
        //     }
        // })
    }
    createRow(width, rowNr) {
        const row = new Array(width);
        const rowHTML = document.createElement('tr');
        for (let i = 0; i < width; i++) {
            row[i] = 0;
            const cell = document.createElement('td');
            cell.classList.add('cell');
            cell.id = `${i}_${rowNr}`;
            rowHTML.append(cell);
        }
        return [row, rowHTML];
    }
    createBoard(width, height) {
        const board = new Array(height);
        const boardHTML = document.createElement('table');
        for (let i = 0; i < height; i++) {
            const [row, rowHTML] = this.createRow(width, i);
            board[i] = (row);
            boardHTML.append(rowHTML);
        }
        return [board, boardHTML];
    }
    randomColor() {
        const choice = Math.round(Math.random() * 1000) % 3;
        switch (choice) {
            case 0:
                return 'blue';
            case 1:
                return 'red';
            case 2:
                return 'green';
            default:
                return 'violet'; // It signals something went wrong
        }
    }
    spawnNewBlock() {
        console.log('spawning new block');
        const segments = [
            { position: new Vector2(Game.boardWidth / 2, 0), color: this.randomColor() },
            { position: new Vector2(Game.boardWidth / 2 + 1, 0), color: this.randomColor() }
        ];
        for (const segment of segments) {
            if (this.isCellOccupied(segment.position, 0)) {
                window.alert('game over');
                clearInterval(this.loop);
                return;
            }
        }
        const block = { id: this.nextId, segments, angle: Rotation.DEG0 };
        this.elementInControl = block;
        this.blocks.set(this.nextId++, block);
        for (let i = 0; i < block.segments.length; i++) {
            this.updateBoard(Update.ADD, block.id, block.segments[i].position.x, block.segments[i].position.y, block.segments[i].color);
        }
    }
    isCellOccupied(nextPos, id) {
        const isOccupied = (this.board[nextPos.y][nextPos.x] !== 0 && this.board[nextPos.y][nextPos.x] !== id);
        return isOccupied;
    }
    canMove(e, vector) {
        for (const segment of e.segments) {
            const nextPos = Vector2.addVec(segment.position, vector);
            if (nextPos.y >= Game.boardHeight) {
                return false;
            }
            if (nextPos.x < 0 || nextPos.x >= Game.boardWidth) {
                return false;
            }
            if (this.isCellOccupied(nextPos, e.id)) {
                return false;
            }
        }
        return true;
    }
    move(e, vector) {
        for (let i = 0; i < e.segments.length; i++) {
            this.updateBoard(Update.DELETE, e.id, e.segments[i].position.x, e.segments[i].position.y, e.segments[i].color);
        }
        for (let i = 0; i < e.segments.length; i++) {
            e.segments[i].position.addVec(vector);
            this.updateBoard(Update.ADD, e.id, e.segments[i].position.x, e.segments[i].position.y, e.segments[i].color);
        }
    }
    rotate(e) {
        for (let i = 0; i < e.segments.length; i++) {
            this.updateBoard(Update.DELETE, e.id, e.segments[i].position.x, e.segments[i].position.y, e.segments[i].color);
        }
        switch (e.angle) {
            case Rotation.DEG0:
                e.angle += 1;
                e.segments[0].position.add(0, -1);
                e.segments[1].position.add(-1, 0);
                break;
            case Rotation.DEG90:
                e.angle += 1;
                e.segments[0].position.add(1, 1);
                if (e.segments[0].position.outOfBoard() || this.isCellOccupied(e.segments[0].position, e.id)) {
                    const vector = Vector2.left();
                    if (this.canMove(e, vector)) {
                        for (let i = 0; i < e.segments.length; i++) {
                            e.segments[i].position.addVec(vector);
                        }
                    }
                    else {
                        e.segments[0].position.subtract(1, 1);
                    }
                }
                break;
            case Rotation.DEG180:
                e.angle += 1;
                e.segments[0].position.add(-1, 0);
                e.segments[1].position.add(0, -1);
                break;
            case Rotation.DEG270:
                e.angle = Rotation.DEG0;
                e.segments[1].position.add(1, 1);
                if (e.segments[1].position.outOfBoard() || this.isCellOccupied(e.segments[1].position, e.id)) {
                    const vector = Vector2.left();
                    if (this.canMove(e, vector)) {
                        for (let i = 0; i < e.segments.length; i++) {
                            e.segments[i].position.addVec(vector);
                        }
                    }
                    else {
                        e.segments[1].position.subtract(1, 1);
                    }
                }
                break;
            default:
                console.error('Unknow rotation value');
        }
        for (let i = 0; i < e.segments.length; i++) {
            this.updateBoard(Update.ADD, e.id, e.segments[i].position.x, e.segments[i].position.y, e.segments[i].color);
        }
    }
    updateBoard(operation, id, x, y, color) {
        switch (operation) {
            case Update.ADD:
                this.board[y][x] = id;
                this.boardHTML.rows[y].cells[x].style.backgroundColor = color;
                break;
            case Update.DELETE:
                this.board[y][x] = 0;
                this.boardHTML.rows[y].cells[x].style.backgroundColor = '';
                break;
            default:
                console.error('Unknown update operation');
        }
    }
    eliminateToSmall(toDelete) {
        for (let i = 0; i < toDelete.length; i++) {
            if (toDelete[i].length < 4) {
                toDelete[i].length = 0;
            }
        }
    }
    resetForNextCheck(toDelete, index) {
        if (toDelete[index].length >= 4) {
            toDelete.push([]);
            index++;
        }
        else {
            console.log('lenght =', toDelete[index].length, index);
            toDelete.forEach((e) => {
                e.forEach((_e) => {
                    console.log(_e[0], _e[1]);
                });
            });
            toDelete[index].length = 0;
        }
        return index;
    }
    checkRow(y) {
        const toDelete = [];
        toDelete.push([]);
        let index = 0;
        for (let i = 0; i < Game.boardWidth; i++) {
            if (this.board[y][i] > 0) {
                const block = this.blocks.get(this.board[y][i]);
                if (typeof block === 'undefined')
                    break;
                const segIndex = (block.segments[0].position.x === i && block.segments[0].position.y === y) ? 0 : 1;
                // console.log(i, y, block, segIndex)
                if (toDelete[index].length > 0 && toDelete[index][0][SegWithIdDesc.SEGMENT].color !== block.segments[segIndex].color) {
                    index = this.resetForNextCheck(toDelete, index);
                }
                toDelete[index].push([block.segments[segIndex], block.id]);
            }
            else {
                index = this.resetForNextCheck(toDelete, index);
            }
        }
        console.log('checkRow');
        toDelete.forEach((e) => {
            e.forEach((_e) => {
                console.log(_e[0], _e[1]);
            });
        });
        this.eliminateToSmall(toDelete);
        // console.log(toDelete)
        return toDelete;
    }
    checkColumn(x) {
        const toDelete = [];
        toDelete.push([]);
        let index = 0;
        for (let i = 0; i < Game.boardHeight; i++) {
            if (this.board[i][x] > 0) {
                const block = this.blocks.get(this.board[i][x]);
                if (typeof block === 'undefined')
                    break;
                const segIndex = (block.segments[0].position.x === x && block.segments[0].position.y === i) ? 0 : 1;
                if (toDelete[index].length > 0 && toDelete[index][0][SegWithIdDesc.SEGMENT].color !== block.segments[segIndex].color) {
                    index = this.resetForNextCheck(toDelete, index);
                }
                toDelete[index].push([block.segments[segIndex], block.id]);
            }
            else {
                index = this.resetForNextCheck(toDelete, index);
            }
        }
        // console.log('checkColumn')
        // toDelete.forEach((e) => {
        //   e.forEach((_e) => {
        //     console.log(_e[0], _e[1])
        //   })
        // })
        this.eliminateToSmall(toDelete);
        return toDelete;
    }
    tryToDestroy() {
        const toDeleteMap = new Map();
        for (const segment of this.elementInControl.segments) {
            for (const row of this.checkRow(segment.position.y)) {
                for (const item of row) {
                    toDeleteMap.set(item[SegWithIdDesc.SEGMENT], item[SegWithIdDesc.ID]);
                }
            }
            for (const column of this.checkColumn(segment.position.x)) {
                for (const item of column) {
                    toDeleteMap.set(item[SegWithIdDesc.SEGMENT], item[SegWithIdDesc.ID]);
                }
            }
        }
        console.log(toDeleteMap);
        toDeleteMap.forEach((v, k) => {
            const block = this.blocks.get(v);
            if (typeof block !== 'undefined') {
                const segIndex = (block.segments[0].position.x === k.position.x && block.segments[0].position.y === k.position.y) ? 0 : 1;
                this.updateBoard(Update.DELETE, block.id, block.segments[segIndex].position.x, block.segments[segIndex].position.y, block.segments[segIndex].color);
                block.segments.splice(segIndex, 1);
            }
        });
    }
    mainLoop() {
        if (this.loop != null) {
            clearInterval(this.loop);
        }
        if (this.elementInControl == null) {
            this.spawnNewBlock();
        }
        this.loop = setInterval(() => {
            if (this.blocks.size > 100) {
                clearInterval(this.loop);
            }
            let blockAdded = false;
            const keys = this.blocks.keys();
            for (const key of keys) {
                const blockToMove = this.blocks.get(key);
                if (typeof blockToMove === 'undefined')
                    break;
                if (blockToMove.segments.length === 0) {
                    this.blocks.delete(key);
                    break;
                }
                if (this.canMove(blockToMove, Vector2.down())) {
                    this.move(blockToMove, Vector2.down());
                }
                else {
                    if (blockToMove.id === this.elementInControl.id && !blockAdded) {
                        this.tryToDestroy();
                        this.spawnNewBlock();
                        blockAdded = true;
                    }
                }
            }
        }, 500);
    }
}
const game = new Game();
game.mainLoop();
// Reasumując kwintesencje tematu, dochodzę do fundamentalnej konkluzji:
// Walić OOP, najgorsze ścierwo
