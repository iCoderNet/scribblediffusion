const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImg = document.querySelector(".save-img"),
    ctx = canvas.getContext("2d");


let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000";


const undoAction = document.querySelector("#undo-action");

let history = [];
let historyIndex = -1;

const addToHistory = () => {
    historyIndex++;
    if (historyIndex < history.length) {
        // If we are undoing and then start a new action, discard the redo history
        history.splice(historyIndex);
    }
    const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.push(currentSnapshot);
};
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
};

window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

const drawRect = (x, y) => {
    if (!fillColor.checked) {
        return ctx.strokeRect(x, y, prevMouseX - x, prevMouseY - y);
    }
    ctx.fillRect(x, y, prevMouseX - x, prevMouseY - y);
};

const drawCircle = (x, y) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - x), 2) + Math.pow((prevMouseY - y), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (x, y) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(x, y);
    ctx.lineTo(prevMouseX * 2 - x, y);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

const startDraw = (e) => {
    isDrawing = true;
    const { offsetX, offsetY } = getMousePos(e);
    prevMouseX = offsetX;
    prevMouseY = offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = getMousePos(e);
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawRect(offsetX, offsetY);
    } else if (selectedTool === "circle") {
        drawCircle(offsetX, offsetY);
    } else {
        drawTriangle(offsetX, offsetY);
    }
};

const getMousePos = (e) => {
    if (e.touches && e.touches.length > 0) {
        return { offsetX: e.touches[0].pageX - canvas.offsetLeft, offsetY: e.touches[0].pageY - canvas.offsetTop };
    } else {
        return { offsetX: e.offsetX, offsetY: e.offsetY };
    }
};

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
});

saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

canvas.addEventListener("mousedown", (e) => {
    startDraw(e);
    addToHistory();
});
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    addToHistory();
});

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDraw(e);
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    drawing(e);
});

canvas.addEventListener("touchend", () => {
    isDrawing = false;
    addToHistory();
});

const updateCanvas = () => {
    if (historyIndex >= 0) {
        const currentSnapshot = history[historyIndex];
        ctx.putImageData(currentSnapshot, 0, 0);
    }
};

const undo = () => {
    if (historyIndex > 0) {
        historyIndex--;
        updateCanvas();
    }
};

undoAction.addEventListener("click", () => {
    undo();
});

