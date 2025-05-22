export default function customGame() {
    const app = document.getElementById('app');
    if (app) {
        // 1. Inject the HTML structure
        app.innerHTML = `
            <div class="text-black font-jaro text-9xl mt-16 mb-36 select-none">Game Customization</div>
            <div class="flex flex-col justify-center items-center gap-6">

                <h2 class="text-3xl font-bold text-black mb-4">Select a theme:</h2>

                <div class="flex gap-4 mb-8">
                    <button
                        id="defaultTheme"
                        class="px-6 py-3 rounded-md bg-grey-500 text-white font-semibold shadow-md hover:bg-grey-600 focus:outline-none focus:ring-2 focus:ring-grey-500 focus:ring-opacity-50"
                        data-canvas-color="#FF5733"
                    >
                        Default Theme
                    </button>

                    <button
                        id="themeRedBtn"
                        class="px-6 py-3 rounded-md bg-red-500 text-white font-semibold shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        data-canvas-color="#FF5733"
                    >
                        Inferno Theme
                    </button>

                    <button
                        id="themeBlueBtn"
                        class="px-6 py-3 rounded-md bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        data-canvas-color="#337AFF"
                    >
                        Oceanic Theme
                    </button>

                    <button
                        id="themeGreenBtn"
                        class="px-6 py-3 rounded-md bg-green-500 text-white font-semibold shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        data-canvas-color="#33FF57"
                    >
                        Forest Theme
                    </button>
                </div>

                <canvas id="themePreviewCanvas" width="800" height="400" class="border-2 border-gray-300 bg-gray-100 rounded-md"></canvas>

            </div>
        `;

        const canvas = document.getElementById('themePreviewCanvas') as HTMLCanvasElement;
        if (canvas) {
            const ctx = canvas.getContext('2d');

            const themeButtons = document.querySelectorAll('button[data-canvas-color]');

            const defaultColor = '#DDDDDD';
            const defaultText = 'Default';

            function drawCanvas(color: string, text: string) {
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = color;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.fillStyle = '#333';
                    ctx.font = '24px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
                }
            }

            drawCanvas(defaultColor, defaultText);


            themeButtons.forEach(buttonElement => {
                const button = buttonElement as HTMLButtonElement;
                const themeColor = button.dataset.canvasColor;
                const themeName = button.textContent;

                if (themeColor) {
                    button.addEventListener('mouseenter', () => {
                        drawCanvas(themeColor, `${themeName}`);
                    });

                    button.addEventListener('mouseleave', () => {
                        drawCanvas(defaultColor, defaultText);
                    });
                }
            });
        }
    }
}
