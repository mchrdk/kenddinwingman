document.addEventListener("DOMContentLoaded", async () => {
    const gameContainer = document.getElementById("game");
    const nameContainer = document.getElementById("name");
    const departmentContainer = document.getElementById("department");
    const scoreContainer = document.getElementById("score");

    let score = 0;
    let contacts = []; // Declare the contacts array

    // Function to fetch contact data from the endpoint
    const fetchContacts = async () => {
        try {
            const response = await fetch('/unitmixedcontacts');
            if (!response.ok) {
                throw new Error('Failed to fetch contact data');
            }
            contacts = await response.json(); // Update the contacts array
            return contacts;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const getRandomContacts = (count) => {
        const randomContacts = [];
        while (randomContacts.length < count) {
            const contact = contacts[Math.floor(Math.random() * contacts.length)];
            if (!randomContacts.includes(contact)) {
                randomContacts.push(contact);
            }
        }
        return randomContacts;
    };

    const renderContacts = async () => {
        // Fetch new contacts each time the game refreshes
        await fetchContacts();

        const randomContacts = getRandomContacts(3);

        // Display the contact names
        nameContainer.textContent = randomContacts.map(contact => contact.name).join(', ');

        // Display the department if it's the correct answer
        departmentContainer.textContent = randomContacts.find(contact => contact.correctanswer)?.unit || "";

        // Clear the game container
        gameContainer.innerHTML = "";

        // Create and display the contact images
        randomContacts.forEach((contact) => {
            const img = document.createElement("img");
            img.src = contact.imageUrl; // Set the image source
            img.alt = contact.name; // Set the image alt text
            img.onclick = () => {
                if (contact.correctanswer) {
                    // Correct answer
                    score++;
                    scoreContainer.textContent = `Score: ${score}`;
                } else {
                    // Wrong answer
                    score--;
                    scoreContainer.textContent = `Score: ${score}`;
                    document.body.style.backgroundColor = "red"; // Flash background red
                }
                setTimeout(() => {
                    document.body.style.backgroundColor = "";
                    renderContacts(); // Refresh the game after a short delay
                }, 1000);
            };

            // Append the image to the game container
            gameContainer.appendChild(img);
        });
    };

    renderContacts(); // Initial rendering
});
