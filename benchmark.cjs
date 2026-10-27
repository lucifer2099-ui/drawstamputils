const { performance } = require('perf_hooks');

const allTextPaths = [];
for (let i = 0; i < 500; i++) {
  allTextPaths.push({
    bounds: {
      x: Math.random() * 500,
      y: Math.random() * 500,
      width: 20,
      height: 20
    }
  });
}

const mockCanvas = {
  style: { cursor: 'default' },
  getBoundingClientRect: () => ({ left: 10, top: 10 })
};

const drawStampUtils = { canvas: mockCanvas };

// Baseline
function handleMouseMoveBaseline(event) {
  if (!drawStampUtils?.canvas) return

  const rect = drawStampUtils.canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  let isOverText = false
  for (const textPath of allTextPaths) {
    if (x >= textPath.bounds.x &&
        x <= textPath.bounds.x + textPath.bounds.width &&
        y >= textPath.bounds.y &&
        y <= textPath.bounds.y + textPath.bounds.height) {
      isOverText = true
      drawStampUtils.canvas.style.cursor = 'pointer'
      return
    }
  }

  if (!isOverText) {
    drawStampUtils.canvas.style.cursor = 'default'
  }
}

let animationFrameId = null;
let rafCallbacks = [];
const requestAnimationFrameMock = (cb) => {
  rafCallbacks.push(cb);
  return 1;
};

// Optimized
function handleMouseMoveOptimized(event) {
  if (!drawStampUtils?.canvas) return

  if (animationFrameId !== null) {
    return
  }

  const clientX = event.clientX
  const clientY = event.clientY

  animationFrameId = requestAnimationFrameMock(() => {
    animationFrameId = null
    if (!drawStampUtils?.canvas) return

    const rect = drawStampUtils.canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    let isOverText = false
    for (const textPath of allTextPaths) {
      if (x >= textPath.bounds.x &&
          x <= textPath.bounds.x + textPath.bounds.width &&
          y >= textPath.bounds.y &&
          y <= textPath.bounds.y + textPath.bounds.height) {
        isOverText = true
        if (drawStampUtils.canvas.style.cursor !== 'pointer') {
          drawStampUtils.canvas.style.cursor = 'pointer'
        }
        return
      }
    }

    if (!isOverText) {
      if (drawStampUtils.canvas.style.cursor !== 'default') {
        drawStampUtils.canvas.style.cursor = 'default'
      }
    }
  });
}

// Emulate 100,000 mouse move events (100 events per frame for 1000 frames)
let start = performance.now();
for (let frame = 0; frame < 1000; frame++) {
  for (let event = 0; event < 100; event++) {
    handleMouseMoveBaseline({ clientX: Math.random() * 600, clientY: Math.random() * 600 });
  }
}
let end = performance.now();
console.log('Baseline time (100,000 events):', end - start, 'ms');

start = performance.now();
for (let frame = 0; frame < 1000; frame++) {
  for (let event = 0; event < 100; event++) {
    handleMouseMoveOptimized({ clientX: Math.random() * 600, clientY: Math.random() * 600 });
  }
  // Flush RAF
  const callbacks = rafCallbacks;
  rafCallbacks = [];
  callbacks.forEach(cb => cb());
}
end = performance.now();
console.log('Optimized time (100,000 events w/ throttling):', end - start, 'ms');
