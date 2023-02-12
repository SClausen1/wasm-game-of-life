import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg"
const CELL_SIZE = 7; // px
const GRID_COLOR = "#ffbe0b";
const DEAD_COLOR = "#fb5607";
const ALIVE_COLOR = "#8338ec";

const canvas = document.getElementById("game-of-life-canvas")
const universe = Universe.new()
universe.set_height(64)
universe.set_width(64)
universe.reset()
const width = universe.width()
const height = universe.height()
const ctx = canvas.getContext("2d")
let animationId = null

canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const playPauseButton = document.getElementById("play-pause");

const resetUniverButton = document.getElementById("reset-universe");

const tickSlider = document.getElementById("tick-slider")

const tickSlideMessage = document.getElementById("tick-slider-text")

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

resetUniverButton.addEventListener("click", event => {
    universe.reset()
})

tickSlider.addEventListener("input", event => {
    const ticksPerRender = event.currentTarget.value ? event.currentTarget.value : 1
    universe.set_generations_per_tick(ticksPerRender)
    tickSlideMessage.textContent = `Number of generations per tick: ${ticksPerRender}`
})

canvas.addEventListener("click", event => {
    const boundingRect = canvas.getBoundingClientRect()

    const scaleX = canvas.width / boundingRect.width
    const scaleY = canvas.height / boundingRect.height


    const clickX = (event.clientX - boundingRect.left) * scaleX
    const clickY = (event.clientY - boundingRect.top) * scaleY

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

    ctx.fillStyle = ALIVE_COLOR

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);
            if (cells[idx] !== Cell.Alive) {
                continue
            }
            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }


    ctx.fillStyle = DEAD_COLOR
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);
            if (cells[idx] !== Cell.Dead) {
                continue
            }
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

const fps = new class {
    constructor() {
        this.fps = document.getElementById("fps")
        this.frames = []
        this.lastFrameTimeStamp = performance.now()
    }

    render() {
        const now = performance.now()
        const delta = now - this.lastFrameTimeStamp
        this.lastFrameTimeStamp = now
        const fps = 1 / delta * 1000
        this.frames.push(fps)

        if (this.frames.length > 100) {
            this.frames.shift()
        }

        const frame_length = this.frames.length
        let min = Infinity
        let max = - Infinity
        let sum = 0
        for (let i = 0; i < frame_length; i++) {
            sum += this.frames[i]
            min = Math.min(min, this.frames[i])
            max = Math.max(max, this.frames[i])
        }

        let mean = sum / frame_length

        // Render the statistics.
        this.fps.textContent = `
        Frames per Second:
                latest = ${Math.round(fps)}
        avg of last 100 = ${Math.round(mean)}
        min of last 100 = ${Math.round(min)}
        max of last 100 = ${Math.round(max)}
        `.trim();
    }
}

const renderLoop = () => {
    fps.render()

    universe.tick()

    drawGrid()
    drawCells()

    animationId = requestAnimationFrame(renderLoop)
}

drawGrid();
drawCells();
play();