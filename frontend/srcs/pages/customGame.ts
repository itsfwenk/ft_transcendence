import i18n from '../i18n';

export default function customGame() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = /*html*/`
            <div class="text-black font-jaro text-9xl mt-16 mb-16 select-none">${i18n.t('general.pongGame')}</div>
            <div class="flex flex-col justify-center items-center gap-6">
                <div class="flex gap-4 mb-8">
                    <button
                        id="defaultTheme"
                        class="w-40 h-12 rounded-md bg-gray-500 text-white font-jaro font-semibold cursor-pointer select-none
                            hover:translate-y-2
                            hover:[box-shadow:0_10px_0_0_transparent,0_15px_0_0_transparent]
                            hover:border-b-[1px] hover:border-transparent
                            transition-all duration-150
                            [box-shadow:0_10px_0_0_#374151,0_15px_0_0_#37415141]
                            border-b-[1px] border-gray-400"
                        data-theme-palette='{"background": "#DDDDDD", "paddle1": "#4F46E5", "paddle2": "#DC2626", "ball": "black", "line": "rgba(0, 0, 0, 0.2)", "score": "rgba(200, 200, 200, 0.7)"}'
                    >
                        Default
                    </button>

                    <button
                        id="BnWTheme"
                        class="w-40 h-12 rounded-md bg-gray-800 text-white font-jaro font-semibold cursor-pointer select-none
							hover:translate-y-2 
							hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
							hover:border-b-[0px]
							transition-all duration-150 
							[box-shadow:0_10px_0_0_#193cb8,0_15px_0_0_#1b70f841]
                            border-b-[1px] border-gray-400"
                        data-theme-palette='{"background": "#1A1A1A", "paddle1": "white", "paddle2": "white", "ball": "white", "line": "rgba(255, 255, 255, 0.2)", "score": "rgba(255, 255, 255, 0.6)"}'
                        data-shadow-main="#000000"
                        data-shadow-accent="#00000041"
                        data-border-color="#4D4D4D"
                    >
                        Black n White
                    </button>

                    <button
                        id="NetherBtn"
                        class="w-40 h-12 flex items-center justify-center rounded-md bg-[#8B0000] text-white font-jaro font-semibold cursor-pointer select-none
                            hover:translate-y-2
                            hover:[box-shadow:0_10px_0_0_transparent,0_15px_0_0_transparent]
                            hover:border-b-[1px] hover:border-transparent
                            transition-all duration-150
                            [box-shadow:0_10px_0_0_#5A0000,0_15px_0_0_#5A000041]
                            border-b-[1px] border-[#B22222] mb-[11px]"
                        data-theme-palette='{"background": "#220000", "paddle1": "#FF4500", "paddle2": "#6A006A", "ball": "#FFD700", "line": "rgba(255, 69, 0, 0.2)", "score": "rgba(255, 165, 0, 0.7)"}'
                        data-shadow-main="#5A0000"
                        data-shadow-accent="#5A000041"
                        data-border-color="#B22222"
                    >
                        Nether
                    </button>

                    <button
                        id="MarioBtn"
                        class="w-40 h-12 flex items-center justify-center rounded-md bg-red-600 text-white font-jaro font-semibold cursor-pointer select-none
                            hover:translate-y-2
                            hover:[box-shadow:0_10px_0_0_transparent,0_15px_0_0_transparent]
                            hover:border-b-[1px] hover:border-transparent
                            transition-all duration-150
                            [box-shadow:0_10px_0_0_#1C3D88,0_15px_0_0_#1C3D8841]
                            border-b-[1px] border-blue-500 mb-[11px]"
                        data-theme-palette='{"background": "#6495ED", "paddle1": "#E4002B", "paddle2": "#008C4A", "ball": "#FFD700", "line": "rgba(255, 255, 255, 0.4)", "score": "rgba(255, 255, 255, 0.9)"}'
                        data-shadow-main="#1C3D88"
                        data-shadow-accent="#1C3D8841"
                        data-border-color="#3B82F6"
                    >
                        Super Mario
                    </button>
                </div>

                <canvas id="themePreviewCanvas" width="800" height="400" class="border-2 border-gray-300 bg-gray-100 rounded-md"></canvas>

                <div id="backBtn" class='button w-24 h-13 mt-10 bg-gray-700 rounded-full cursor-pointer select-none
                    hover:translate-y-2  hover:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
                    hover:border-b-[0px]
                    transition-all duration-150 [box-shadow:0_10px_0_0_#181818,0_15px_0_0_#1b70f841]
                    border-b-[1px] border-gray-400'>
                    <span class='flex flex-col justify-center items-center h-full text-white font-jaro'>${i18n.t('general.back')}</span>
                </div>
            </div>
        `;

        const canvas = document.getElementById('themePreviewCanvas') as HTMLCanvasElement;
        if (canvas) {
            const ctx = canvas.getContext('2d');

            interface ThemePalette {
                background: string;
                paddle1: string;
                paddle2: string;
                ball: string;
                line: string;
                score: string;
            }

            const paddleWidth = 10;
            const paddleHeight = 80;
            const ballRadius = 8;
            const player1Score = 0;
            const player2Score = 0;

            const initialBallX = canvas.width / 2;
            const initialBallY = canvas.height / 2;
            const initialPaddleY = (canvas.height - paddleHeight) / 2;

            const themeButtons = document.querySelectorAll('button[data-theme-palette]');

            const defaultPalette: ThemePalette = {
                background: "#DDDDDD",
                paddle1: "#4F46E5",
                paddle2: "#DC2626",
                ball: "black",
                line: "rgba(0, 0, 0, 0.2)",
                score: "rgba(200, 200, 200, 0.7)"
            };

            let activeThemePalette: ThemePalette = defaultPalette;

            function drawCanvas(palette: ThemePalette) {
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    ctx.fillStyle = palette.background;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.beginPath();
                    ctx.setLineDash([5, 5]);
                    ctx.moveTo(canvas.width / 2, 0);
                    ctx.lineTo(canvas.width / 2, canvas.height);
                    ctx.strokeStyle = palette.line;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.setLineDash([]);

                    ctx.fillStyle = palette.paddle1;
                    ctx.fillRect(0, initialPaddleY, paddleWidth, paddleHeight);

                    ctx.fillStyle = palette.paddle2;
                    ctx.fillRect(canvas.width - paddleWidth, initialPaddleY, paddleWidth, paddleHeight);

                    ctx.font = 'bold 120px Arial';
                    ctx.fillStyle = palette.score;
                    ctx.textAlign = 'center';

                    ctx.fillText(`${player1Score}`, canvas.width / 4, canvas.height / 2 + 40);

                    ctx.fillText(`${player2Score}`, (canvas.width / 4) * 3, canvas.height / 2 + 40);

                    ctx.beginPath();
                    ctx.arc(initialBallX, initialBallY, ballRadius, 0, Math.PI * 2);
                    ctx.fillStyle = palette.ball;
                    ctx.fill();
                    ctx.closePath();
                }
            }

            drawCanvas(activeThemePalette);

            themeButtons.forEach(buttonElement => {
                const button = buttonElement as HTMLButtonElement;
                const themePaletteString = button.dataset.themePalette;

                if (themePaletteString) {
                    const themePalette: ThemePalette = JSON.parse(themePaletteString);

                    button.addEventListener('mouseenter', () => {
                        drawCanvas(themePalette);
                    });

                    button.addEventListener('mouseleave', () => {
                        drawCanvas(activeThemePalette);
                    });

                    button.addEventListener('click', () => {
                        activeThemePalette = themePalette;
                        drawCanvas(activeThemePalette);

                        localStorage.setItem('selectedGamePalette', JSON.stringify(activeThemePalette));
                        themeButtons.forEach(btn => btn.classList.remove('active-theme-button'));
                        button.classList.add('active-theme-button');
                    });
                }
            });

            const style = document.createElement('style');
            style.innerHTML = `
                .active-theme-button {
                    transform: translateY(2px);
                    box-shadow: 0 10px 0 0 transparent, 0 15px 0 0 transparent !important;
                    border-bottom: 1px solid transparent !important;

                    transition: transform 150ms ease-out, box-shadow 150ms ease-out, border 150ms ease-out;
                    filter: brightness(0.9);
                }

                button:active {
                    outline: none !important;
                    border: 1px solid transparent !important;
                    box-shadow: 0 10px 0 0 transparent, 0 15px 0 0 transparent !important;
                    
                    transform: translateY(2px) !important;
                    filter: brightness(0.9) !important;
                    transition: none;
                }

                button:focus {
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }
            `;
            document.head.appendChild(style);

            // const defaultButton = document.getElementById('defaultTheme') as HTMLButtonElement;
            // if (defaultButton) {
            //     defaultButton.click();
            // }

            const backBtn = document.getElementById('backBtn');
                backBtn?.addEventListener('click', () => {
                    history.pushState(null, '', '/profile');
                    window.dispatchEvent(new PopStateEvent('popstate'));
            });

            const savedPaletteString = localStorage.getItem('selectedGamePalette');
            let foundSavedTheme = false;

            if (savedPaletteString) {
                try {
                    const savedPalette = JSON.parse(savedPaletteString);

                    themeButtons.forEach(buttonElement => {
                        const button = buttonElement as HTMLButtonElement;
                        const buttonPaletteString = button.dataset.themePalette;

                        if (buttonPaletteString) {
                            const buttonPalette = JSON.parse(buttonPaletteString);
                            if (JSON.stringify(buttonPalette) === JSON.stringify(savedPalette)) {
                                activeThemePalette = buttonPalette;
                                button.click();
                                foundSavedTheme = true;
                                return;
                            }
                        }
                    });
                } catch (e) {
                    console.error("Error parsing saved palette from local storage:", e);
                }
            }

            if (!foundSavedTheme) {
                const defaultButton = document.getElementById('defaultTheme') as HTMLButtonElement;
                if (defaultButton) {
                    defaultButton.click();
                }
            }
        }
    }
}