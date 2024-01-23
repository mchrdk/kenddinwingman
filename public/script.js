let score = 0;

function flashBackgroundRed() {
    const originalColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = 'red';
    setTimeout(() => {
        document.body.style.backgroundColor = originalColor;
    }, 500); // Change the background color back after 500 milliseconds
}

function showunit(unit) {
    const unitDiv = document.getElementById('unit');
    unitDiv.innerText = unit;
    unitDiv.style.display = 'block';

    setTimeout(() => {
        unitDiv.style.display = 'none';
    }, 1000); // Hide the unit after 1000 milliseconds (1 second)
}

function gameOver() {
    const overlay = document.getElementById('overlay');
    const playAgainBox = document.getElementById('play-again-box');

    overlay.style.display = 'block'; // Show the overlay
    playAgainBox.style.display = 'flex'; // Show the play again box
}


function updateGame() {
    fetch('/getcontacts')
        .then(response => response.json())
        .then(data => {
            const gameDiv = document.getElementById('game');
            const nameDiv = document.getElementById('name');
            gameDiv.innerHTML = '';

            // Declare randomIndex outside of the forEach loop
            const randomIndex = Math.floor(Math.random() * data.length);
            const randomName = data[randomIndex].name;
            nameDiv.innerText = randomName;

            data.forEach(item => {
                const img = document.createElement('img');
                img.src = item.imageUrl;
                img.onclick = () => {
                    if (item.name === randomName) {
                        score++;
                        showunit(data[randomIndex].unit); // Access randomIndex here
                    } else {
                        score = Math.max(0, score - 1);
                        flashBackgroundRed();
                    }
                    document.getElementById('score').innerText = `Score: ${score}`;

                    if (score === 0) {
                        gameOver();
                    } else {
                        updateGame();
                    }
                };
                gameDiv.appendChild(img);
            });
        });
}


updateGame();
