document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('button');
    let selectedButton = null;

    // Function to generate a random string of letters
    function generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // Function to handle button selection
    function selectButton(index) {
        if (selectedButton) {
            selectedButton.classList.remove('selected');
        }
        selectedButton = buttons[index];
        selectedButton.classList.add('selected');
        console.log('Selected button:', selectedButton.textContent);
    }

    // Add click event listeners to buttons
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            selectButton(index);
            const randomString = generateRandomString(5);
            console.log('Generated string:', randomString);
        });
    });

    // Listen for key presses
    document.addEventListener('keydown', (event) => {
        if (event.key === 'f') {
            const randomString = generateRandomString(5);
            console.log('Generated string:', randomString);
            // Simulate button click for the selected button
            if (selectedButton) {
                selectedButton.click();
            }
        }
    });
});