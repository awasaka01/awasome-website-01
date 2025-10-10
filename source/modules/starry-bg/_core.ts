declare const PIXI : typeof import("pixi.js");
const { Application, Graphics } = PIXI;

import * as awa from "__util__";
import chroma from "chroma-js";

// ============================================================================
// CONFIG
// ============================================================================
const TARGET_FPS = 20; // Lower FPS for background effects - saves CPU/GPU
const delayBetweenStarRespawn = [500, 1000] as const;
const rotationSpeedRange = [10000, 30000] as const;

// Star shape types
type StarShape = "pinched-diamond" | "circle";

const starTypes : [weight: number, {
    shape : StarShape,
    color : string | chroma.Scale,
    glow : [number, number],
    size : [number, number],
    duration : [number, number]
}][] = [
    [15, {
        shape: "pinched-diamond",
        color: "#ffffff",
        glow: [3, 6],
        size: [8, 15],
        duration: [2000, 4000],
    }],
    [1, {
        shape: "pinched-diamond",
        color: "#a8d8ff",
        glow: [5, 10],
        size: [8, 12],
        duration: [2500, 5000],
    }],
    [5, {
        shape: "pinched-diamond",
        color: "#fff9e6",
        glow: [4, 8],
        size: [10, 18],
        duration: [1800, 3500],
    }],
    [5, {
        shape: "pinched-diamond",
        color: "#cccccc",
        glow: [2, 4],
        size: [15, 25],
        duration: [3000, 6000],
    }],
    [3, {
        shape: "circle",
        color: chroma.scale(["#ff6b9d", "#c06c84", "#6c5b7b"]),
        glow: [4, 8],
        size: [6, 12],
        duration: [2000, 4000],
    }],
    [2, {
        shape: "pinched-diamond",
        color: chroma.scale(["#ffd93d", "#ffb347", "#ff8c42"]),
        glow: [5, 10],
        size: [10, 16],
        duration: [2200, 4500],
    }],
    [2, {
        shape: "circle",
        color: chroma.scale(["#6dd5ed", "#2193b0", "#1e3a8a"]),
        glow: [6, 12],
        size: [8, 14],
        duration: [2800, 5200],
    }],
    [1, {
        shape: "pinched-diamond",
        color: chroma.scale(["#b06ab3", "#4568dc", "#b06ab3"]),
        glow: [7, 14],
        size: [12, 20],
        duration: [3000, 6000],
    }],
];
const weightedStarTypes = awa.weightedArray(starTypes);

// ============================================================================
// STAR DATA STRUCTURE
// ============================================================================
// Each star maintains its own animation state to avoid recalculating
interface StarData {
    graphics : InstanceType<typeof Graphics>; // PixiJS Graphics object (draws the star shape)
    rotation : number; // Current rotation in radians
    rotationSpeed : number; // Radians per millisecond
    twinklePhase : number; // Current phase in twinkle animation (0 to 2π)
    twinkleSpeed : number; // Radians per millisecond for twinkle
    twinkleType : number; // Which twinkle pattern to use (1-3)
    delay : number; // Initial delay before star appears (ms)
    elapsed : number; // Total time elapsed since animation started (ms)
    duration : number; // How long this star animation lasts (ms)
    baseGlow : number; // Base glow radius for this star
}

// ============================================================================
// GLOBAL STATE
// ============================================================================
const stars : StarData[] = []; // Array of all active stars
let app : InstanceType<typeof Application>; // Main PixiJS application instance
let lastFrameTime = 0; // Track time for FPS limiting
const frameInterval = 1000 / TARGET_FPS; // Milliseconds between frames

// ============================================================================
// INITIALIZATION
// ============================================================================
async function init () {
    // Create PixiJS application - this manages the canvas and rendering
    app = new Application();

    // Initialize with async options (required in PixiJS v8)
    await app.init({
        resizeTo: window, // Auto-resize canvas to window
        backgroundAlpha: 0, // Transparent background
        antialias: true, // Smooth edges (minimal perf cost for stars)
    });

    // Style the canvas to match the original starfield positioning
    const canvas = app.canvas as HTMLCanvasElement;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "1000";
    canvas.style.pointerEvents = "none"; // Allow clicks to pass through

    // Add canvas to DOM
    document.body.appendChild(canvas);

    // Create initial stars based on screen size
    generateInitialStars();

    // Add update function to PixiJS ticker (runs every frame)
    // ticker provides delta time info for frame-independent animation
    app.ticker.add((ticker) => {
        // ticker.deltaMS = milliseconds since last frame
        // We use this for FPS limiting
        updateStars(ticker.deltaMS);
    });
}

// ============================================================================
// STAR SHAPE DRAWING
// ============================================================================
// Draws a pinched diamond (square with circular cuts in corners)
function drawPinchedDiamond (g : InstanceType<typeof Graphics>, size : number) {
    // This creates a perfectly symmetrical 4-pointed star shape
    // It's like a square rotated 45° with circles cut from each corner
    const outerRadius = size;
    const innerRadius = size * 0.2; // How "pinched" the corners are

    g.moveTo(0, -outerRadius);
    g.bezierCurveTo(
        innerRadius, -innerRadius,
        innerRadius, -innerRadius,
        outerRadius, 0,
    );
    g.bezierCurveTo(
        innerRadius, innerRadius,
        innerRadius, innerRadius,
        0, outerRadius,
    );
    g.bezierCurveTo(
        -innerRadius, innerRadius,
        -innerRadius, innerRadius,
        -outerRadius, 0,
    );
    g.bezierCurveTo(
        -innerRadius, -innerRadius,
        -innerRadius, -innerRadius,
        0, -outerRadius,
    );
}

// Draws a simple circle
function drawCircle (g : InstanceType<typeof Graphics>, size : number) {
    g.circle(0, 0, size);
}

// ============================================================================
// STAR POOL GENERATION
// ============================================================================
// Generates stars based on screen size (same logic as original)
// Uses object pooling - stars are reused rather than destroyed/recreated
function generateInitialStars () {
    // Clear existing stars from stage and destroy Graphics objects
    // This frees GPU memory - important for performance
    for (const star of stars) {
        app.stage.removeChild(star.graphics);
        star.graphics.destroy();
    }
    stars.length = 0;

    // Calculate number of stars based on screen area
    const pixelsPerStar = 5000;
    const pixels = app.screen.width * app.screen.height;
    const starCount = Math.min(200, Math.max(10, Math.round(pixels / pixelsPerStar)));

    // Create star pool
    for (let i = 0; i < starCount; i++) {
        const graphics = new Graphics();

        // app.stage is the root container - everything rendered must be added to it
        app.stage.addChild(graphics);

        // Create star data with initial state
        // Start each star at a random point in its animation for immediate visual interest
        const starData : StarData = {
            graphics,
            rotation: awa.rf(0, Math.PI * 2),
            rotationSpeed: 0,
            twinklePhase: awa.rf(0, Math.PI * 2), // Random starting phase
            twinkleSpeed: 0,
            twinkleType: awa.ri(1, 3),
            delay: 0, // No delay on initial load
            elapsed: awa.rf(0, 4000), // Start partway through animation
            duration: 4000,
            baseGlow: 0,
        };

        stars.push(starData);

        // Initialize animation parameters for this star
        animateStar(starData, 0); // 0 delay for instant appearance
    }
}

// ============================================================================
// STAR ANIMATION SETUP
// ============================================================================
// Sets up animation parameters for a star (called on creation and restart)
// This doesn't animate - it just sets the values that updateStars() will use
function animateStar (starData : StarData, delay ?: number) {
    // Get random star properties from weighted array
    const { shape, color, glow, size, duration } = randomStarType();
    const rotationSpeed = awa.rf(...rotationSpeedRange);

    // Set delay (or use default respawn delay)
    if (delay === undefined) {
        delay = awa.rf(...delayBetweenStarRespawn);
    }

    // Position star randomly on screen
    starData.graphics.x = awa.rf(0, app.screen.width);
    starData.graphics.y = awa.rf(0, app.screen.height);

    // Convert hex color to number format that PixiJS uses (0xRRGGBB)
    const colorNum = parseInt(color.replace("#", ""), 16);

    // Redraw star with new color and shape
    starData.graphics.clear();

    // Apply glow effect using shadow
    starData.baseGlow = glow;
    starData.graphics.filters = [];

    // Draw the appropriate shape
    if (shape === "circle") {
        drawCircle(starData.graphics, size);
    } else {
        drawPinchedDiamond(starData.graphics, size);
    }

    starData.graphics.fill({ color: colorNum });

    // Set rotation parameters
    // Convert rotation duration (ms) to speed (radians/ms)
    starData.rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 2) / rotationSpeed;
    starData.rotation = awa.rf(0, Math.PI * 2); // Random starting rotation

    // Set timing parameters
    starData.delay = delay;
    starData.elapsed = 0;
    starData.duration = duration;

    // Set twinkle parameters
    starData.twinklePhase = awa.rf(0, Math.PI * 2); // Random starting phase
    starData.twinkleSpeed = (Math.PI * 2) / duration; // Complete cycle over duration
    starData.twinkleType = awa.ri(1, 3); // 3 different twinkle patterns
}

// ============================================================================
// MAIN UPDATE LOOP (FPS LIMITED)
// ============================================================================
// Called every frame by PixiJS ticker - this is where all animation happens
// deltaMS = milliseconds since last frame (typically ~16ms at 60fps)
function updateStars (deltaMS : number) {
    // FPS limiting: only update at TARGET_FPS to save CPU/GPU
    // This is critical for performance - we don't need 60fps for background
    const now = performance.now();
    if (now - lastFrameTime < frameInterval) {
        return; // Skip this frame
    }
    const actualDelta = now - lastFrameTime;
    lastFrameTime = now;

    // Update each star's animation state
    for (const star of stars) {
        // Track elapsed time using actual delta to prevent jumpy animation
        star.elapsed += actualDelta;

        // Handle delay period (star invisible until delay expires)
        if (star.elapsed < star.delay) {
            star.graphics.alpha = 0; // Invisible
            continue; // Skip to next star
        }

        // Calculate time since star became active
        const activeTime = star.elapsed - star.delay;

        // Check if animation cycle complete - restart with new parameters
        if (activeTime >= star.duration) {
            animateStar(star); // Recycle star with new properties
            continue;
        }

        // ====================================================================
        // ROTATION ANIMATION
        // ====================================================================
        // Update rotation based on speed and time delta
        // This makes rotation frame-rate independent
        star.rotation += star.rotationSpeed * actualDelta;
        star.graphics.rotation = star.rotation; // Apply to PixiJS object

        // ====================================================================
        // TWINKLE ANIMATION
        // ====================================================================
        // Update twinkle phase (cycles from 0 to 2π)
        star.twinklePhase += star.twinkleSpeed * actualDelta;

        // Calculate alpha based on twinkle type (mimics original CSS animations)
        let alpha = 1;

        if (star.twinkleType === 1) {
            // Smooth sine wave: 30% to 100% opacity
            alpha = 0.3 + 0.7 * (Math.sin(star.twinklePhase) * 0.5 + 0.5);
        } else if (star.twinkleType === 2) {
            // Double-speed sine wave: 20% to 100% opacity
            alpha = 0.2 + 0.8 * (Math.sin(star.twinklePhase * 2) * 0.5 + 0.5);
        } else {
            // Absolute sine (sharp peaks): 40% to 100% opacity
            alpha = 0.4 + 0.6 * Math.abs(Math.sin(star.twinklePhase));
        }

        // Apply alpha to Graphics object
        star.graphics.alpha = alpha;

        // ====================================================================
        // GLOW EFFECT (via drop shadow)
        // ====================================================================
        // Modulate glow intensity with twinkle for extra sparkle
        const glowIntensity = star.baseGlow * (0.5 + 0.5 * alpha);
        star.graphics.filters = [{
            blur: glowIntensity,
            quality: 2,
        } as any];
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
// Gets random star type from weighted array and generates random values
function randomStarType () {
    const { shape, color, glow, size, duration } = awa.arrayRandom(weightedStarTypes);
    return {
        shape,
        color: typeof color === "string" ? color : color(Math.random()).hex(),
        size: awa.rf(...size),
        glow: awa.rf(...glow),
        duration: awa.rf(...duration),
    };
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================
// Regenerate stars when window resizes (adjusts star count for new screen size)
window.addEventListener("resize", () => {
    generateInitialStars();
});

// Start the application
init();
