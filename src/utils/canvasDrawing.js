/**
 * Pure Canvas Drawing Functions
 */

// Helper: Calculate grid step size based on range
function calculateGridStep(range) {
    if (range < 0.25) return 0.05;
    if (range < 0.5) return 0.1;
    if (range < 1) return 0.25;
    if (range < 2) return 0.5;
    return 1;
}

export function drawGrid(ctx, width, height, bounds, toCanvasX, toCanvasY) {
    if (!ctx) return;

    ctx.strokeStyle = '#1e1e2e';
    ctx.lineWidth = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#666';

    const zeroX = toCanvasX(0, width);
    const zeroY = toCanvasY(0, height);

    const xRange = bounds.xMax - bounds.xMin;
    const yRange = bounds.yMax - bounds.yMin;

    const xStep = calculateGridStep(xRange);
    const yStep = calculateGridStep(yRange);

    // Draw vertical lines and labels
    const startX = Math.ceil(bounds.xMin / xStep) * xStep;
    const endX = Math.floor(bounds.xMax / xStep) * xStep;

    for (let x = startX; x <= endX; x += xStep) {
        const cx = toCanvasX(x, width);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();

        // X-axis labels
        if (Math.abs(x) > 0.001) {
            const label = xStep === 1 ? x.toString() : x.toFixed(2);
            // Clamp label Y position
            const labelY = Math.max(20, Math.min(height - 20, zeroY + 15));
            ctx.fillText(label, cx, labelY);
        }
    }

    // Draw horizontal lines and labels
    const startY = Math.ceil(bounds.yMin / yStep) * yStep;
    const endY = Math.floor(bounds.yMax / yStep) * yStep;

    for (let y = startY; y <= endY; y += yStep) {
        const cy = toCanvasY(y, height);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();

        // Y-axis labels
        if (Math.abs(y) > 0.001) {
            const label = yStep === 1 ? y.toString() : y.toFixed(2);
            // Clamp label X position
            const labelX = Math.max(25, Math.min(width - 25, zeroX - 15));
            ctx.textAlign = 'right';
            ctx.fillText(label, labelX, cy);
        }
    }

    // Axes lines
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(width, zeroY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(zeroX, 0);
    ctx.lineTo(zeroX, height);
    ctx.stroke();
}

export function drawConfidenceBand(ctx, testX, mean, variance, toCanvasX, toCanvasY, height, width) {
    if (!ctx) return;
    
    ctx.beginPath();
    for (let i = 0; i < testX.length; i++) {
        const x = toCanvasX(testX[i], width);
        const y = toCanvasY(mean[i] + 2 * Math.sqrt(variance[i]), height);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    for (let i = testX.length - 1; i >= 0; i--) {
        const x = toCanvasX(testX[i], width);
        const y = toCanvasY(mean[i] - 2 * Math.sqrt(variance[i]), height);
        ctx.lineTo(x, y);
    }
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(124, 58, 237, 0.3)');
    grad.addColorStop(0.5, 'rgba(124, 58, 237, 0.15)');
    grad.addColorStop(1, 'rgba(124, 58, 237, 0.3)');
    ctx.fillStyle = grad;
    ctx.fill();
}

export function drawMeanLine(ctx, testX, mean, toCanvasX, toCanvasY, width, height) {
    if (!ctx) return;

    // Glow effect
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < testX.length; i++) {
        const x = toCanvasX(testX[i], width);
        const y = toCanvasY(mean[i], height);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Main line
    ctx.beginPath();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    for (let i = 0; i < testX.length; i++) {
        const x = toCanvasX(testX[i], width);
        const y = toCanvasY(mean[i], height);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
}

export function drawSamples(ctx, samples, toCanvasX, toCanvasY, width, height) {
    if (!ctx) return;

    const colors = [
        'rgba(255, 150, 150, 0.5)',
        'rgba(150, 255, 150, 0.5)',
        'rgba(150, 150, 255, 0.5)',
        'rgba(255, 255, 150, 0.5)',
        'rgba(255, 150, 255, 0.5)',
    ];

    samples.forEach((sample, s) => {
        ctx.beginPath();
        ctx.strokeStyle = colors[s % colors.length];
        ctx.lineWidth = 2;
        sample.x.forEach((xi, i) => {
            const x = toCanvasX(xi, width);
            const y = toCanvasY(sample.y[i], height);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
    });
}

export function drawPoints(ctx, points, toCanvasX, toCanvasY, width, height) {
    if (!ctx) return;

    points.forEach(pt => {
        const x = toCanvasX(pt.x, width);
        const y = toCanvasY(pt.y, height);

        // Outer glow
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244, 114, 182, 0.3)';
        ctx.fill();

        // Main dot
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f472b6';
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.arc(x - 1.5, y - 1.5, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
    });
}
