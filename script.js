document.addEventListener('DOMContentLoaded', () => {
    let emptyCellIndex = 4; 
    const tiles = document.querySelectorAll('.tile');
            
    let startX, startY, currentTile = null;

    // --- FRASES ---
    const phrasesDB = {
        0: ["Qué risa, eh.", "Hay un secreto escondido...", "Sigue moviendo fichas.", "No está aquí, busca más."],
        1: ["Alberto, ¿serías tan amable de invitarme a un cigarro?", "El vídeo sorpresa no está aquí.", "Prueba en las esquinas.", "Frío, frío..."],
        2: ["Me gustas pucho, me gustas pucho tú", "Sigue buscando el regalo.", "Mueve más las fotos.", "Casi, pero no."],
        3: ["Hola, ¿conocéis a mi amigo Alberto?", "Busca abajo a la derecha.", "El tesoro está cerca.", "Sigue jugando..."],
        5: ["Este es mi amigo Manu, ya os he hablado de él", "Aquí no hay vídeo.", "Mira en la fila de abajo.", "Mueve esa ficha otra vez."],
        6: ["Amigas para siempre", "Estás muy cerca del vídeo.", "Caliente, caliente...", "No te rindas."],
        7: ["Cucú", "¡Mira a tu derecha!", "El vídeo está al lado.", "Una vez más..."],
        8: [
            "Manu es el mejor", 
            "¡Casi lo tienes!", 
            "¡Sigue moviendo esta ficha!",
            "¡PREMIO!<br><a href='sorpresa.mp4' class='video-link'>VER VÍDEO ▶</a>"
        ]
    };

    tiles.forEach(tile => {
        tile.addEventListener('mousedown', handleStart);
        tile.addEventListener('touchstart', handleStart, {passive: false});
    });

    function handleStart(e) {
        if (e.target.classList.contains('is-empty')) return;
                
        currentTile = e.target;
                
        // ELEVACIÓN SUPREMA
        currentTile.style.zIndex = "1000"; 
        currentTile.style.transition = "none";

        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
            e.preventDefault(); 
        }

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove, {passive: false});
        document.addEventListener('touchend', handleEnd);
    }

    function handleMove(e) {
        if (!currentTile) return;
                
        let clientX, clientY;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            if (e.cancelable) e.preventDefault(); // Bloquear scroll
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
                
        const diffX = clientX - startX;
        const diffY = clientY - startY;
                
        // Mover visualmente
        currentTile.style.transform = `translate(${diffX}px, ${diffY}px) scale(1.1)`;
        currentTile.style.boxShadow = "10px 10px 0px rgba(0,0,0,0.5)";
    }

    function handleEnd(e) {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);

        if (!currentTile) return;

        // Restaurar estilos base
        currentTile.style.transform = ''; 
        currentTile.style.zIndex = ''; 
        currentTile.style.transition = 'transform 0.2s ease';
        currentTile.style.boxShadow = '';

        const currentCell = currentTile.parentElement;
        const currentCellIndex = parseInt(currentCell.id.split('-')[1]);
                
        if (isAdjacent(currentCellIndex, emptyCellIndex)) {
            let clientX, clientY;
            if (e.changedTouches && e.changedTouches.length > 0) { 
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const diffX = clientX - startX;
            const diffY = clientY - startY;
            const dist = Math.sqrt(diffX*diffX + diffY*diffY);

            if (dist < 10 || dist > 30) {
                // 1. Actualizamos el mensaje del hueco que vamos a tapar
                updateHiddenMessage(emptyCellIndex);
                        
                // 2. Movemos las fichas
                swapTiles(currentCellIndex, emptyCellIndex);
                        
                // 3. Efecto confeti en la casilla que SE HA DESTAPADO
                setTimeout(() => {
                    const revealedCell = document.getElementById(`cell-${currentCellIndex}`);
                    if(revealedCell) triggerConfetti(revealedCell);
                }, 50);
            }
        }
                
        currentTile = null;
    }

    function isAdjacent(idx1, idx2) {
        const row1 = Math.floor(idx1 / 3);
        const col1 = idx1 % 3;
        const row2 = Math.floor(idx2 / 3);
        const col2 = idx2 % 3;
        return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    }

    function swapTiles(clickedIndex, emptyIndex) {
        const clickedCell = document.getElementById(`cell-${clickedIndex}`);
        const emptyCell = document.getElementById(`cell-${emptyIndex}`);
        const clickedTile = clickedCell.querySelector('.tile');
        const emptyTile = emptyCell.querySelector('.tile');
                
        emptyCell.appendChild(clickedTile);
        clickedCell.appendChild(emptyTile);
                
        emptyCellIndex = clickedIndex;
    }

    function updateHiddenMessage(cellIndex) {
        if (cellIndex === 4) return;
        const phrases = phrasesDB[cellIndex];
        if (phrases) {
            const newOptions = phrases.slice(1);
            let randomPhrase = newOptions[Math.floor(Math.random() * newOptions.length)];
            
            // Si la frase contiene un enlace, significa que es la final.
            if (randomPhrase.includes("video-link")) {
                setTimeout(celebrate, 100);
            }

            const cell = document.getElementById(`cell-${cellIndex}`);
            const msgLayer = cell.querySelector('.message-layer');
            setTimeout(() => { msgLayer.innerHTML = randomPhrase; }, 200);
        }
    }

    function triggerConfetti(element) {
        const rect = element.getBoundingClientRect();
        const x = (rect.left + rect.right) / 2 / window.innerWidth;
        const y = (rect.top + rect.bottom) / 2 / window.innerHeight;

        confetti({
            particleCount: 50,
            spread: 40,
            origin: { x, y },
            colors: ['#d22828', '#f2c52c', '#8fbcd4', '#e85d4e', '#ffffff']
        });
    }

    function celebrate() {
        confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#d22828', '#f2c52c', '#8fbcd4', '#e85d4e', '#ffffff']
        });
    }
});