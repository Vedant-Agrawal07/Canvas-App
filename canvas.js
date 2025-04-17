const canvas = document.querySelector(".main_canvas");
const ctx = canvas.getContext("2d");
let slider = document.querySelector(".slider");
let colourPicker = document.querySelector(".colour_picker");
let clear_page = document.querySelector(".clear_button");
let capture = document.querySelector(".capture_button");
let erase = document.querySelector(".eraser_button");
let draw = document.querySelector(".draw_button");
let triangle_draw = document.querySelector(".triangle_button");
let rectangle_draw = document.querySelector(".rectangle_button");
let circle_draw = document.querySelector(".circle_button");
let line_draw = document.querySelector(".line_button");
let fill = document.querySelector(".fill_input");

let isDrawing = false;
let startX = 0;
let startY = 0;
let mode = "draw";
let fill_shape = false;

fill.addEventListener("click", () => {
  fill_shape = fill.checked;
});

erase.addEventListener("click", () => {
  mode = "erase";
});

draw.addEventListener("click", () => {
  mode = "draw";
});

triangle_draw.addEventListener("click", () => {
  mode = "triangle";
});
rectangle_draw.addEventListener("click", () => {
  mode = "rectangle";
});
circle_draw.addEventListener("click", () => {
  mode = "circle";
});
line_draw.addEventListener("click", () => {
  mode = "line";
});

clear_page.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

capture.addEventListener("click", () => {
  const dataURL = canvas.toDataURL("image/png", 1.0);
  const link = document.createElement("a");
  link.download = "canvas_image.png";
  link.href = dataURL;
  link.click();
});

slider.oninput = function () {
  triangle.line_width = slider.value;
  rectangle.line_width = slider.value;
  circle.line_width = slider.value;
  line.line_width = slider.value;
  ball.radius = slider.value;
  eraser.radius = slider.value;
  ctx.lineWidth = slider.value;
};

colourPicker.oninput = function () {
  ball.color = colourPicker.value;
  rectangle.color = colourPicker.value;
  triangle.color = colourPicker.value;
  circle.color = colourPicker.value;
  line.color = colourPicker.value;
  ctx.strokeStyle = colourPicker.value;
  ctx.fillStyle = colourPicker.value;
};

const eraser = {
  radius: slider.value,
  draw() {
    ctx.beginPath();
    ctx.arc(startX, startY, this.radius, 0, Math.PI * 2, true);
    ctx.fillStyle = "white";
    ctx.fill();
  },
};

const ball = {
  radius: slider.value,
  color: "orange",
  draw() {
    ctx.beginPath();
    ctx.arc(startX, startY, this.radius, 0, Math.PI * 2, true);
    ctx.fillStyle = this.color;
    ctx.fill();
  },
};

const rectangle = {
  x: 0,
  y: 0,
  line_width: slider.value,
  color: "orange",
  draw(fill_shape) {
    ctx.lineWidth = this.line_width;
    if (fill_shape) {
      ctx.fillStyle = this.color;
      ctx.fillRect(startX, startY, this.x, this.y);
    } else {
      ctx.strokeStyle = this.color;
      ctx.strokeRect(startX, startY, this.x, this.y);
    }
  },
};

const triangle = {
  x: 0,
  y: 0,
  line_width: slider.value,
  color: "orange",
  draw(fill_shape) {
    ctx.beginPath();
    ctx.moveTo((this.x + startX) / 2, startY);
    ctx.lineTo(startX, this.y);
    ctx.lineTo(this.x, this.y);
    ctx.lineWidth = this.line_width;
    ctx.closePath();
    if (fill_shape) {
      ctx.fillStyle = this.color;
      ctx.fill();
    } else {
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }
  },
};

const circle = {
  radius: 44,
  line_width: slider.value,
  color: "orange",
  draw(fill_shape) {
    ctx.beginPath();
    ctx.arc(startX, startY, this.radius, 0, Math.PI * 2, true);
    ctx.lineWidth = this.line_width;
    if (fill_shape) {
      ctx.fillStyle = this.color;
      ctx.fill();
    } else {
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }
  },
};

const line = {
  x: 0,
  y: 0,
  line_width: slider.value,
  color: "orange",
  draw() {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(this.x, this.y);
    ctx.lineWidth = this.line_width;
    ctx.strokeStyle = this.color;
    ctx.stroke();
  },
};

canvas.addEventListener("mousedown", (e) => {
  startX = e.offsetX;
  startY = e.offsetY;
  isDrawing = true;
  savedCanvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvas.addEventListener("mousemove", onMouseMove);
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  canvas.removeEventListener("mousemove", onMouseMove);
});

function onMouseMove(e) {
  if (isDrawing) {
    switch (mode) {
      case "erase":
        startX = e.offsetX;
        startY = e.offsetY;
        eraser.draw();
        break;

      case "draw":
        startX = e.offsetX;
        startY = e.offsetY;
        ball.draw();
        break;

      case "rectangle":
        ctx.putImageData(savedCanvasState, 0, 0);
        rectangle.x = e.clientX - canvas.offsetLeft - startX;
        rectangle.y = e.clientY - canvas.offsetTop - startY;
        rectangle.draw(fill_shape);
        break;

      case "triangle":
        ctx.putImageData(savedCanvasState, 0, 0);
        triangle.x = e.offsetX;
        triangle.y = e.offsetY;
        triangle.draw(fill_shape);
        break;

      case "circle":
        ctx.putImageData(savedCanvasState, 0, 0);
        circle.radius = Math.abs(e.clientX - startX);
        circle.draw(fill_shape);
        break;

      case "line":
        ctx.putImageData(savedCanvasState, 0, 0);
        line.x = e.offsetX;
        line.y = e.offsetY;
        line.draw();
        break;
    }
  }
}
