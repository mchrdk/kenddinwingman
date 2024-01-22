let score = 0;

function flashBackgroundRed() {
    const originalColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = 'red';
    setTimeout(() => {
        document.body.style.backgroundColor = originalColor;
    }, 500); // Change the background color back after 500 milliseconds
}

function showDepartment(department) {
    const departmentDiv = document.getElementById('department');
    departmentDiv.innerText = department;
    departmentDiv.style.display = 'block';

    setTimeout(() => {
        departmentDiv.style.display = 'none';
    }, 1000); // Hide the department after 1000 milliseconds (1 second)
}

function updateGame() {
    fetch('/random-data')
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
                img.src = `images/${item.imageName}`;
                img.onclick = () => {
                    if (item.name === randomName) {
                        score++;
                        showDepartment(data[randomIndex].department); // Access randomIndex here
                    } else {
                        score = Math.max(0, score - 1);
                        flashBackgroundRed();
                    }
                    document.getElementById('score').innerText = `Score: ${score}`;

                    if (score === 0) {
                        window.location.href = '/game-over.html';
                    } else {
                        updateGame();
                    }
                };
                gameDiv.appendChild(img);
            });
        });
}


updateGame();
