document.addEventListener('keydown', function (event) {
    if (event.key === 'f') {
        // Search for all button and anchor elements on the page
        const elements = document.querySelectorAll('button, a, [role="button"], [onclick], input[type="button"], input[type="submit"], input[type="reset"], input, area[href], textarea');
        console.log('Elements found:', elements.length);
        const minLetters = Math.ceil(Math.log(elements.length) / Math.log(26));
        console.log('Minimum letters needed:', minLetters);
        elements.forEach((element, index) => {
            element.style.setProperty('border', '2px solid red', 'important');
            const label = index.toString(26).split('').map(char => {
                const num = parseInt(char, 26);
                return String.fromCharCode(num + 65); // Convert to A-Z
            }).join('');
            const labelBox = document.createElement('div');
            labelBox.textContent = label;
            labelBox.style.position = 'absolute';
            labelBox.style.backgroundColor = 'white';
            labelBox.style.color = 'black';
            labelBox.style.padding = '2px 5px';
            labelBox.style.fontSize = '12px';
            labelBox.style.fontWeight = 'bold';
            labelBox.style.border = '1px solid black';
            labelBox.style.zIndex = '10000';
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) { // Ensure the element is visible
                labelBox.style.top = `${rect.top + window.scrollY}px`;
                labelBox.style.left = `${rect.right + window.scrollX}px`;
                document.body.appendChild(labelBox);
            } else {
                // console.warn('Skipping element with invalid dimensions:', element);
            }

            element.dataset.labelBoxId = labelBox; // Store reference for cleanup
            document.addEventListener('keydown', function undoHighlight(event) {
                if (event.key === 'Escape') {
                    element.style.removeProperty('border');
                    labelBox.remove();
                    document.removeEventListener('keydown', undoHighlight);
                }
            });
        });
    }
});