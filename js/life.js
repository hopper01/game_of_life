function $(selector, container) {
    return (container || document).querySelector(selector);
}
var LifeView
(function () {
    var _ = self.Life = function (seed) {
        this.seed = seed;
        this.height = seed.length;
        this.width = seed[0].length;

        this.prevBoard = [];
        this.board = cloneArray(seed);
    };
    _.prototype = {
        next: function () {
            this.prevBoard = cloneArray(this.board)

            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    var neighbours = this.aliveNeighbours(this.prevBoard, x, y);
                    var alive = !!this.board[y][x];

                    if (alive) {
                        if (neighbours < 2 || neighbours > 3) {
                            this.board[y][x] = 0;
                        }
                    }
                    else {
                        if (neighbours == 3) {
                            this.board[y][x] = 1;
                        }
                    }
                }
            }
        },
        aliveNeighbours: function (array, x, y) {
            var prevRow = array[y - 1] || [];
            var nextRow = array[y + 1] || [];
            return [
                prevRow[x - 1], prevRow[x], prevRow[x + 1],
                array[y][x - 1], array[y][x + 1],
                nextRow[x - 1], nextRow[x], nextRow[x + 1]
            ].reduce(function (prev, curr) {
                return prev + !!+curr;
            }, 0)
        },

        toString: function () {

            return this.board.map(function (row) { return row.join(' '); }).join('\n');
        }
    };
    //Helpers
    //Warning: Only Clones 2D arrays 
    function cloneArray(array) {
        return array.slice().map(function (row) { return row.slice(); });
    }

})();

//Create The UI
(function () {
    var _ = self.lifeView = function (table, size) {
        this.grid = table;
        this.size = size;
        this.started = false;
        this.autoplay = false;
        this.createGrid();
    }

    _.prototype = {
        createGrid: function () {
            var fragment = document.createDocumentFragment();
            this.grid.innerHTML = '';
            this.checkBoxes = [];
            var me = this;

            for (var y = 0; y < this.size; y++) {
                var row = document.createElement('tr');
                this.checkBoxes[y] = [];

                for (var x = 0; x < this.size; x++) {
                    var cell = document.createElement('td');
                    var checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    this.checkBoxes[y][x] = checkbox;
                    checkbox.coords = [y, x];//for keyboard accesebility


                    cell.appendChild(checkbox);
                    row.appendChild(cell);
                }
                fragment.appendChild(row);
            }
            // Event Listernes For GRID
            this.grid.addEventListener('change', function (e) {
                if (e.target.nodeName.toLowerCase() == 'input') {
                    me.started = false;
                }
            });
            this.grid.addEventListener('keyup', function (e) {
                var checkbox = e.target;

                if (checkbox.nodeName.toLowerCase() == 'input') {
                    var coords = checkbox.coords;
                    var y = coords[0];
                    var x = coords[1];

                    switch (e.keyCode) {
                        case 37:// left
                            if (x > 0) {
                                me.checkBoxes[y][x - 1].focus();
                            } break;
                        case 38:// up
                            if (y > 0) {
                                me.checkBoxes[y - 1][x].focus();
                            } break;
                        case 39:// right
                            if (x < me.size - 1) {
                                me.checkBoxes[y][x + 1].focus();
                            } break;
                        case 40://down
                            if (y < me.size - 1) {
                                me.checkBoxes[y + 1][x].focus();
                            } break;
                    }
                }
            });
            this.grid.appendChild(fragment);
        },
        get boardArray() {
            return this.checkBoxes.map(function (row) {
                return row.map(function (checkbox) {
                    return +checkbox.checked;
                });
            });
        },
        play: function () {
            this.game = new Life(this.boardArray);
            this.started = true;
        },
        next: function () {
            var me = this;
            if (!this.started || this.game) {
                this.play();
            }
            this.game.next();
            var board = this.game.board;
            for (var y = 0; y < this.size; y++) {
                for (var x = 0; x < this.size; x++) {
                    this.checkBoxes[y][x].checked = !!board[y][x];
                }
            }
        },
        autoPlay: function () {
            var me = this;
            if (me.autoplay) {
                slider = document.getElementById('myRange').value;
                this.timer = setTimeout(function () {
                    me.next();
                    me.autoPlay();
                }, slider);
            }
        }
    };
})();

//Calling of the Main Function
LifeView = new lifeView(document.getElementById('grid'), 30);
//Ends 



// Event Listerens For Buttons
(function () {

    var buttons = {
        next: $('button.play'),
        auto: $('#autoplay')
    };

    buttons.next.addEventListener('click', function () {
        LifeView.next();
    });
    $('#autoplay').addEventListener('change', function () {
        buttons.next.disabled = this.checked;
        document.getElementById('auto').textContent = this.checked ? 'Stop' : 'Autoplay';
        if (this.checked) {
            LifeView.autoplay = this.checked;
            LifeView.autoPlay();
        }
        else {
            clearTimeout(LifeView.timer);
        }
    });
    $('#reset').addEventListener('click', function () {
        if (buttons.next.disabled == true) {
            buttons.next.disabled = false;
        }
        LifeView = new lifeView(document.getElementById('grid'), 30);
    });
})();
