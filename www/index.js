import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg"
const CELL_SIZE = 10; // px
const GRID_COLOR = "#ffbe0b";
const DEAD_COLOR = "#fb5607";
const ALIVE_COLOR = "#8338ec";

const canvas = document.getElementById("game-of-life-canvas")
const universe = Universe.new()
const width = universe.width()
const height = universe.height()
const ctx = canvas.getContext("2d")
let animationId = null
// let ticksPerRender = 1

canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const playPauseButton = document.getElementById("play-pause");

// const tickSlider = document.getElementById("tick-slider")

const play = () => {
    playPauseButton.textContent = "⏸";
    renderLoop()
}

const pause = () => {
    playPauseButton.textContent = "▶";
    cancelAnimationFrame(animationId);
    animationId = null;
}

const isPaused = () => {
    return animationId === null
}

playPauseButton.addEventListener("click", event => {
    if (isPaused()) {
        play()
    }
    else {
        pause()
    }
})
// tickSlider.addEventListener("input" , event => {
//     ticksPerRender = event.currentTarget.value ? 1 : 1
// })

canvas.addEventListener("click", event => {
    const boundingRect = canvas.getBoundingClientRect()

    const scaleX = canvas.width / boundingRect.width
    const scaleY = canvas.height / boundingRect.height


    const clickX =( event.clientX - boundingRect.left) * scaleX
    const clickY =( event.clientY - boundingRect.top) * scaleY

    const column = Math.min(Math.floor(clickX / (CELL_SIZE + 1)), width - 1)
    const row = Math.min(Math.floor(clickY / (CELL_SIZE + 1), height - 1));

    universe.toggle_cell(row, column)

    drawGrid()
    drawCells()
})

const drawGrid = () => {
    ctx.beginPath()
    ctx.strokeStyle = GRID_COLOR

    // Vertical lines.
    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }

    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
}

const getIndex = (row, column) => {
    return row * width + column;
}


const drawCells = () => {
    const cellsPtr = universe.cells()
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height)

    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);

            ctx.fillStyle = cells[idx] === Cell.Dead
                ? DEAD_COLOR
                : ALIVE_COLOR;

            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    ctx.stroke();
}


const renderLoop = () => {
    // for(let i = 0; i < ticksPerRender; i++){
        
    // }
    universe.tick()

    drawGrid()
    drawCells()

    animationId = requestAnimationFrame(renderLoop)
}

drawGrid();
drawCells();
play();