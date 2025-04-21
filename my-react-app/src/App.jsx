import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  VStack,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  useDisclosure,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Checkbox,
  Text,
  Image,
  DrawerCloseButton,
  Input,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
// import rectangleIcon from './images/rectangle-icon.png'
import brushIcon from "./images/brush-icon.png";
import airBrushIcon from "./images/air-brush-icon.png";
import circleIcon from "./images/circle-icon.png";
import cleanIcon from "./images/clean-icon.png";
import crayonIcon from "./images/crayon-icon.png";
import eraserIcon from "./images/eraser-icon.png";
import lineIcon from "./images/line-icon.png";
// import paintBucketIcon from "./images/paint-bucket.png";
import rectangleIcon from "./images/rectangle-icon.png";
import screenshotIcon from "./images/screenshot-icon.png";
import triangleIcon from "./images/triangle-icon.png";

import "../src/styles/toolImage.css";

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("draw");
  const [fill_shape, setFillShape] = useState(false);
  const isDrawing = useRef(false);
  const [slider, setSlider] = useState(10);
  const [colorPick, setColorPick] = useState("#ff0000");
  const startX = useRef(0);
  const startY = useRef(0);
  const savedCanvasState = useRef(null);

  const canvasHistory = useRef(null);

  const modeSelect = (value) => {
    setMode(value);
  };

  const captureCanvas = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = "canvas_image.png";
    link.href = dataURL;
    link.click();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // ctx.fillStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvasHistory.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    onClose();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!canvasHistory.current) {
      canvasHistory.current = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else {
      ctx.putImageData(canvasHistory.current, 0, 0);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (canvasHistory.current) {
      ctx.putImageData(canvasHistory.current, 0, 0);
    }

    const cleanUp = () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", handleMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
    };

    const eraser = {
      radius: slider,
      draw() {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(
          startX.current,
          startY.current,
          this.radius,
          0,
          Math.PI * 2,
          true
        );

        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      },
    };

    const ball = {
      radius: slider,
      color: colorPick,
      draw() {
        ctx.beginPath();
        ctx.arc(
          startX.current,
          startY.current,
          this.radius,
          0,
          Math.PI * 2,
          true
        );
        ctx.fillStyle = this.color;
        ctx.fill();
      },
    };

    const sprayCan = {
      radii: slider,
      color: colorPick,
      draw() {
        for (let i = 0; i < 15; i++) {
          const radius = Math.random() * this.radii;
          const angle = Math.random() * 2 * Math.PI;
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;

          ctx.beginPath();
          ctx.arc(
            startX.current + offsetX,
            startY.current + offsetY,
            1 + Math.random(),
            0,
            Math.PI * 2
          );
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      },
    };

    const crayon = {
      radii: slider,
      color: colorPick,
      draw() {
        for (let i = 0; i < 55; i++) {
          const offsetX = Math.random() * this.radii - 10;
          const offsetY = Math.random() * this.radii - 10;
          ctx.beginPath();
          ctx.arc(
            startX.current + offsetX,
            startY.current + offsetY,
            1 + Math.random() * 2,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      },
    };

    const rectangle = {
      x: 0,
      y: 0,
      line_width: slider,
      color: colorPick,
      draw(fill_shape) {
        ctx.lineWidth = this.line_width;
        if (fill_shape) {
          ctx.fillStyle = this.color;
          ctx.fillRect(startX.current, startY.current, this.x, this.y);
        } else {
          ctx.strokeStyle = this.color;
          ctx.strokeRect(startX.current, startY.current, this.x, this.y);
        }
      },
    };

    const triangle = {
      x: 0,
      y: 0,
      line_width: slider,
      color: colorPick,
      draw(fill_shape) {
        ctx.beginPath();
        ctx.moveTo((this.x + startX.current) / 2, startY.current);
        ctx.lineTo(startX.current, this.y);
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
      line_width: slider,
      color: colorPick,
      draw(fill_shape) {
        ctx.beginPath();
        ctx.arc(
          startX.current,
          startY.current,
          this.radius,
          0,
          Math.PI * 2,
          true
        );
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
      line_width: slider,
      color: colorPick,
      draw() {
        ctx.beginPath();
        ctx.moveTo(startX.current, startY.current);
        ctx.lineTo(this.x, this.y);
        ctx.lineWidth = this.line_width;
        ctx.strokeStyle = this.color;
        ctx.stroke();
      },
    };

    function handleMouseDown(e) {
      startX.current = e.offsetX;
      startY.current = e.offsetY;
      isDrawing.current = true;

      savedCanvasState.current = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.addEventListener("mousemove", onMouseMove);
    }

    function handleMouseUp() {
      if (isDrawing.current) {
        isDrawing.current = false;
        canvasHistory.current = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        canvas.removeEventListener("mousemove", onMouseMove);
      }
    }

    function onMouseMove(e) {
      if (isDrawing.current) {
        switch (mode) {
          case "erase":
            startX.current = e.offsetX;
            startY.current = e.offsetY;
            eraser.draw();
            break;

          case "draw":
            startX.current = e.offsetX;
            startY.current = e.offsetY;
            ball.draw();
            break;

          case "spray":
            startX.current = e.offsetX;
            startY.current = e.offsetY;
            sprayCan.draw();
            break;

          case "crayon":
            startX.current = e.offsetX;
            startY.current = e.offsetY;
            crayon.draw();
            break;

          case "rectangle":
            if (savedCanvasState.current) {
              ctx.putImageData(savedCanvasState.current, 0, 0);
            }
            rectangle.x = e.offsetX - startX.current;
            rectangle.y = e.offsetY - startY.current;
            rectangle.draw(fill_shape);
            break;

          case "triangle":
            if (savedCanvasState.current) {
              ctx.putImageData(savedCanvasState.current, 0, 0);
            }
            triangle.x = e.offsetX;
            triangle.y = e.offsetY;
            triangle.draw(fill_shape);
            break;

          case "circle":
            if (savedCanvasState.current) {
              ctx.putImageData(savedCanvasState.current, 0, 0);
            }
            circle.radius = Math.abs(e.offsetX - startX.current);
            circle.draw(fill_shape);
            break;

          case "line":
            if (savedCanvasState.current) {
              ctx.putImageData(savedCanvasState.current, 0, 0);
            }
            line.x = e.offsetX;
            line.y = e.offsetY;
            line.draw();
            break;
        }
      }
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);

    canvas.addEventListener("mouseout", handleMouseUp);

    return cleanUp;
  }, [mode, slider, colorPick, fill_shape]);

  return (
    <>
      <Button
        onClick={onOpen}
        position="absolute"
        top="10px"
        left="10px"
        zIndex="1000"
        colorScheme="teal"
      >
        Tools
      </Button>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Toolbox</DrawerHeader>
          <DrawerBody>
            <Box
              className="left-panel"
              display="flex"
              flexDirection="column"
              p={4}
            >
              <Box className="shape-container" mb={4}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  Shapes
                </Text>
                <VStack spacing={3} align="start">
                  <Box
                    className="shape-item"
                    display="flex"
                    alignItems="center"
                  >
                    <Image
                      src={rectangleIcon}
                      className="icon"
                      boxSize="24px"
                      mr={2}
                    />
                    <Button
                      onClick={() => modeSelect("rectangle")}
                      className="rectangle_button"
                    >
                      Rectangle
                    </Button>
                  </Box>
                  <Box
                    className="shape-item"
                    display="flex"
                    alignItems="center"
                  >
                    <Image
                      src={triangleIcon}
                      className="icon"
                      boxSize="24px"
                      mr={2}
                    />
                    <Button
                      onClick={() => modeSelect("triangle")}
                      className="triangle_button"
                    >
                      Triangle
                    </Button>
                  </Box>
                  <Box
                    className="shape-item"
                    display="flex"
                    alignItems="center"
                  >
                    <Image
                      src={circleIcon}
                      className="icon"
                      boxSize="24px"
                      mr={2}
                    />
                    <Button
                      onClick={() => modeSelect("circle")}
                      className="circle_button"
                    >
                      Circle
                    </Button>
                  </Box>
                  <Box
                    className="shape-item"
                    display="flex"
                    alignItems="center"
                  >
                    <Image
                      src={lineIcon}
                      className="icon"
                      boxSize="24px"
                      mr={2}
                    />
                    <Button
                      onClick={() => modeSelect("line")}
                      className="line_button"
                    >
                      Line
                    </Button>
                  </Box>
                </VStack>
              </Box>

              <Box className="options-container" mb={4}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  Tools
                </Text>
                <VStack
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  spacing={3}
                  align="start"
                >
                  <Box className="tool-item" display="flex" alignItems="center">
                    <Image
                      src={brushIcon}
                      className="icon"
                      boxSize="24px"
                      mr={2}
                      width={"500px"}
                      height={"auto"}
                      onClick={() => modeSelect("draw")}
                    />
                  </Box>
                  <Box className="tool-item" display="flex" alignItems="center">
                    <Image
                      src={airBrushIcon}
                      className="icon"
                      boxSize="24px"
                      mr={2}
                      width={"500px"}
                      height={"auto"}
                      onClick={() => modeSelect("spray")}
                    />
                  </Box>
                  <Box className="tool-item" display="flex" alignItems="center">
                    <Image
                      src={crayonIcon}
                      className="icon"
                      boxSize="24px"
                      mr={2}
                      width={"500px"}
                      height={"auto"}
                      onClick={() => modeSelect("crayon")}
                    />
                  </Box>
                  <Box className="tool-item" display="flex" alignItems="center">
                    <Image
                      src={eraserIcon}
                      className="icon"
                      boxSize="24px"
                      mr={2}
                      width={"500px"}
                      height={"auto"}
                      onClick={() => modeSelect("erase")}
                    />
                  </Box>
                  <Box
                    className="fill-option"
                    display="flex"
                    alignItems="center"
                  >
                    <Checkbox
                      onChange={() => setFillShape(!fill_shape)}
                      isChecked={fill_shape}
                      className="fill_input"
                      mr={2}
                    />
                    <Text as="label" htmlFor="fill_input">
                      Fill Colour
                    </Text>
                  </Box>
                </VStack>
              </Box>

              <Box
                className="slidercontainer"
                mb={4}
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <Slider
                  min={1}
                  max={50}
                  value={slider}
                  onChange={(val) => setSlider(val)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text>{slider}</Text>
              </Box>

              <Box className="colourpickercontainer" mb={4}>
                <Input
                  type="color"
                  value={colorPick}
                  onChange={(e) => setColorPick(e.target.value)}
                  className="colour_picker"
                />
              </Box>

              <Box
                className="screenClear"
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={4}
              >
                <Image src={cleanIcon} className="icon" boxSize="24px" mr={2} />
                <Button onClick={clearCanvas} className="clear_button">
                  Clear
                </Button>
              </Box>

              <Box
                className="capture"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Image
                  src={screenshotIcon}
                  className="icon"
                  boxSize="24px"
                  mr={2}
                />
                <Button onClick={captureCanvas} className="capture_button">
                  Capture
                </Button>
              </Box>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box display="flex">
        <canvas
          style={{
            width: "1700px",
            height: "1700px",
            border: "1px solid black",
            backgroundColor: "white",
          }}
          width={1700}
          height={1700}
          ref={canvasRef}
        />
      </Box>
    </>
  );
}

export default App;
