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
var Vector2 = /** @class */ (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2.down = function () {
        return new Vector2(0, 1);
    };
    Vector2.right = function () {
        return new Vector2(1, 0);
    };
    Vector2.left = function () {
        return new Vector2(-1, 0);
    };
    Vector2.addVec = function (vec1, vec2) {
        return new Vector2(vec1.x + vec2.x, vec1.y + vec2.y);
    };
    Vector2.prototype.add = function (x, y) {
        this.x += x;
        this.y += y;
    };
    Vector2.prototype.addVec = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
    };
    Vector2.prototype.subtract = function (x, y) {
        this.x -= x;
        this.y -= y;
    };
    Vector2.prototype.outOfBoard = function () {
        if (this.x < 0 || this.x >= Game.boardWidth) {
            return true;
        }
        return false;
    };
    return Vector2;
}());
var Game = /** @class */ (function () {
    function Game(width, height) {
        this.blocks = [];
        Game.boardWidth = (typeof width !== 'undefined') ? width : 10;
        Game.boardHeight = (typeof height !== 'undefined') ? height : 20;
        console.log('Game start');
        var _a = this.createBoard(Game.boardWidth, Game.boardHeight), board = _a[0], boardHTML = _a[1];
        this.board = board;
        this.boardHTML = boardHTML;
        document.body.append(this.boardHTML);
        this.handleKeys();
        this.mainLoop();
    }
    Game.prototype.handleKeys = function () {
        var _this = this;
        document.addEventListener('keydown', function (e) {
            switch (e.code) {
                case 'KeyD':
                    if (_this.canMove(_this.elementInControl, Vector2.right())) {
                        _this.move(_this.elementInControl, Vector2.right());
                    }
                    break;
                case 'KeyA':
                    if (_this.canMove(_this.elementInControl, Vector2.left())) {
                        _this.move(_this.elementInControl, Vector2.left());
                    }
                    break;
                case 'KeyS':
                    if (_this.canMove(_this.elementInControl, Vector2.down())) {
                        _this.move(_this.elementInControl, Vector2.down());
                    }
                    break;
                case 'KeyW':
                    _this.rotate(_this.elementInControl);
                    break;
                case 'KeyP':
                    clearInterval(_this.loop);
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
    };
    Game.prototype.createRow = function (width, rowNr) {
        var row = new Array(width);
        var rowHTML = document.createElement('tr');
        for (var i = 0; i < width; i++) {
            row[i] = 0;
            var cell = document.createElement('td');
            cell.classList.add('cell');
            cell.id = "".concat(i, "_").concat(rowNr);
            rowHTML.append(cell);
        }
        return [row, rowHTML];
    };
    Game.prototype.createBoard = function (width, height) {
        var board = new Array(height);
        var boardHTML = document.createElement('table');
        for (var i = 0; i < height; i++) {
            var _a = this.createRow(width, i), row = _a[0], rowHTML = _a[1];
            board[i] = (row);
            boardHTML.append(rowHTML);
        }
        return [board, boardHTML];
    };
    Game.prototype.randomColors = function () {
        return ['red', 'blue'];
    };
    Game.prototype.spawnNewBlock = function () {
        console.log('spawning new block');
        var segments = [
            new Vector2(Game.boardWidth / 2, 0),
            new Vector2(Game.boardWidth / 2 + 1, 0)
        ];
        for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
            var segment = segments_1[_i];
            if (this.isCellOccupied(segment, 0)) {
                window.alert('game over');
                clearInterval(this.loop);
                return;
            }
        }
        var colors = this.randomColors();
        var id = (this.blocks.length === 0) ? 1 : this.blocks[this.blocks.length - 1].id + 1;
        var block = { id: id, segments: segments, colors: colors, angle: Rotation.DEG0 };
        this.elementInControl = block;
        this.blocks.push(block);
        for (var i = 0; i < block.segments.length; i++) {
            this.updateBoard(Update.ADD, block.id, block.segments[i].x, block.segments[i].y, block.colors[i]);
        }
    };
    Game.prototype.isCellOccupied = function (nextPos, id) {
        var isOccupied = (this.board[nextPos.y][nextPos.x] !== 0 && this.board[nextPos.y][nextPos.x] !== id);
        return isOccupied;
    };
    Game.prototype.canMove = function (e, vector) {
        for (var _i = 0, _a = e.segments; _i < _a.length; _i++) {
            var segment = _a[_i];
            var nextPos = Vector2.addVec(segment, vector);
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
    };
    Game.prototype.move = function (e, vector) {
        for (var i = 0; i < e.segments.length; i++) {
            this.updateBoard(Update.DELETE, e.id, e.segments[i].x, e.segments[i].y, e.colors[i]);
        }
        for (var i = 0; i < e.segments.length; i++) {
            e.segments[i].addVec(vector);
            this.updateBoard(Update.ADD, e.id, e.segments[i].x, e.segments[i].y, e.colors[i]);
        }
    };
    Game.prototype.rotate = function (e) {
        for (var i = 0; i < e.segments.length; i++) {
            this.updateBoard(Update.DELETE, e.id, e.segments[i].x, e.segments[i].y, e.colors[i]);
        }
        switch (e.angle) {
            case Rotation.DEG0:
                e.angle += 1;
                e.segments[0].add(0, -1);
                e.segments[1].add(-1, 0);
                break;
            case Rotation.DEG90:
                e.angle += 1;
                e.segments[0].add(1, 1);
                if (e.segments[0].outOfBoard() || this.isCellOccupied(e.segments[0], e.id)) {
                    var vector = Vector2.left();
                    if (this.canMove(e, vector)) {
                        for (var i = 0; i < e.segments.length; i++) {
                            e.segments[i].addVec(vector);
                        }
                    }
                    else {
                        e.segments[0].subtract(1, 1);
                    }
                }
                break;
            case Rotation.DEG180:
                e.angle += 1;
                e.segments[0].add(-1, 0);
                e.segments[1].add(0, -1);
                break;
            case Rotation.DEG270:
                e.angle = Rotation.DEG0;
                e.segments[1].add(1, 1);
                if (e.segments[1].outOfBoard() || this.isCellOccupied(e.segments[1], e.id)) {
                    var vector = Vector2.left();
                    if (this.canMove(e, vector)) {
                        for (var i = 0; i < e.segments.length; i++) {
                            e.segments[i].addVec(vector);
                        }
                    }
                    else {
                        e.segments[1].subtract(1, 1);
                    }
                }
                break;
            default:
                console.error('Unknow rotation value');
        }
        for (var i = 0; i < e.segments.length; i++) {
            this.updateBoard(Update.ADD, e.id, e.segments[i].x, e.segments[i].y, e.colors[i]);
        }
    };
    Game.prototype.updateBoard = function (operation, id, x, y, color) {
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
    };
    Game.prototype.mainLoop = function () {
        var _this = this;
        if (this.loop != null) {
            clearInterval(this.loop);
        }
        if (this.elementInControl == null) {
            this.spawnNewBlock();
        }
        this.loop = setInterval(function () {
            if (_this.blocks.length > 100) {
                clearInterval(_this.loop);
            }
            var blockAdded = false;
            for (var i = 0; i < _this.blocks.length; i++) {
                var blockToMove = _this.blocks[i];
                if (_this.canMove(blockToMove, Vector2.down())) {
                    _this.move(blockToMove, Vector2.down());
                }
                else {
                    if (blockToMove.id === _this.elementInControl.id && !blockAdded) {
                        _this.spawnNewBlock();
                        blockAdded = true;
                    }
                }
            }
        }, 500);
    };
    return Game;
}());
var game = new Game();
game.mainLoop();
