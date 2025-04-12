let hasSearched = false;
document.addEventListener('keydown', function (event) {
    if (event.key === 'f' && !hasSearched) {
        hasSearched = true;
        // Search for all button and anchor elements on the page
        const elements = document.querySelectorAll('button, a, [role="button"], [onclick], input[type="button"], input[type="submit"], input[type="reset"], input, area[href], textarea');
        console.log('Elements found:', elements.length);
        const letters = Math.ceil(Math.log(elements.length) / Math.log(26));
        console.log('Minimum letters needed:', letters);
        elements.forEach((element, index) => {
            element.style.setProperty('border', '2px solid red', 'important');

            // Generate a unique identifier for the element
            const ancestry = [];
            let currentElement = element;
            while (currentElement.parentElement) {
                const tagName = currentElement.tagName.toLowerCase();
                const id = currentElement.id ? `#${currentElement.id}` : '';
                const classes = currentElement.className ? `.${currentElement.className.split(' ').join('.')}` : '';
                ancestry.unshift(`${tagName}${id}${classes}`);
                currentElement = currentElement.parentElement;
            }
            const uniqueIdentifier = ancestry.join(' > ');

            const label = index.toString(26).split('').map(char => {
                const num = parseInt(char, 26);
                return String.fromCharCode(num + 65); // Convert to A-Z
            }).join('').padStart(letters, 'A');
            const labelBox = document.createElement('div');
            labelBox.textContent = label;
            labelBox.dataset.label = label; // Store label for filtering
            labelBox.dataset.uniqueIdentifier = uniqueIdentifier; // Store unique identifier
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

            element.dataset.labelBoxId = label; // Store reference for cleanup
        });

        // Add filtering logic
        let typedKeys = '';
        document.addEventListener('keydown', function filterLabels(event) {
            if (event.key === 'Escape') {
                // Cleanup logic
                elements.forEach(element => {
                    const labelBox = document.querySelector(`[data-label="${element.dataset.labelBoxId}"]`);
                    if (labelBox) labelBox.remove();
                    element.style.removeProperty('border');
                });
                document.removeEventListener('keydown', filterLabels);
                return;
            }

            if (event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
                typedKeys += event.key.toUpperCase();

                elements.forEach(element => {
                    const labelBox = document.querySelector(`[data-label="${element.dataset.labelBoxId}"]`);
                    if (labelBox) {
                        const label = labelBox.dataset.label;
                        if (label.startsWith(typedKeys)) {
                            labelBox.style.display = 'block';
                            labelBox.innerHTML = `<span style="color: red;">${typedKeys}</span>${label.slice(typedKeys.length)}`;
                        } else {
                            labelBox.style.display = 'none';
                            element.style.removeProperty('border');
                        }
                    }
                });

                const visibleLabels = Array.from(document.querySelectorAll('[data-label]')).filter(labelBox => labelBox.style.display !== 'none');
                if (visibleLabels.length === 1) {
                    console.log('Only one element left:', visibleLabels[0]);
                    visibleLabels[0].style.display = 'none';
                    elements.forEach(element => {
                        if (element.dataset.labelBoxId === typedKeys) {
                            element.style.removeProperty('border');
                            console.log('Unique identifier:', visibleLabels[0].dataset.uniqueIdentifier);
                            const shortcutInput = document.createElement('div');
                            shortcutInput.innerHTML = '<p>Type the shortcut you want to assign to this button. Press Escape to confirm.</p>';
                            shortcutInput.style.position = 'fixed';
                            shortcutInput.style.top = '50%';
                            shortcutInput.style.left = '50%';
                            shortcutInput.style.transform = 'translate(-50%, -50%)';
                            shortcutInput.style.zIndex = '10001';
                            shortcutInput.style.padding = '10px';
                            shortcutInput.style.fontSize = '16px';
                            shortcutInput.style.border = '1px solid black';
                            shortcutInput.style.borderRadius = '5px';
                            shortcutInput.style.backgroundColor = 'white';
                            shortcutInput.style.color = 'black';
                            shortcutInput.style.textAlign = 'center';
                            document.body.appendChild(shortcutInput);
                            shortcutInput.focus();
                            
                            let isShortcut = true;

                            document.addEventListener('keydown', function handleShortcutInput(event) {
                                if (!isShortcut) return;
                                event.preventDefault();
                                console.log('Key pressed:', event.key);
                                if (event.key === 'Escape') {
                                    shortcutInput.removeEventListener('keydown', handleShortcutInput);
                                    isShortcut = false;
                                    document.body.removeChild(shortcutInput);
                                } else {
                                    const isControl = event.ctrlKey;
                                    const isShift = event.shiftKey;
                                    const isAlt = event.altKey;
                                    const isMeta = event.metaKey;
                                    const shortcut = event.key.toUpperCase();
                                    const modifiers = [];
                                    if (isControl) modifiers.push('Ctrl');
                                    if (isShift) modifiers.push('Shift');
                                    if (isAlt) modifiers.push('Alt');
                                    if (isMeta) modifiers.push('Meta');
                                    const shortcutKey = modifiers.length > 0 ? `${modifiers.join('+')}+${shortcut}` : shortcut;
                                    console.log('Shortcut:', shortcutKey);
                                    shortcutInput.innerHTML = '<p>Type the shortcut you want to assign to this button. Press Escape to confirm.</p>';
                                    modifiers.map(modifier => {
                                        const modifierKBD = document.createElement('kbd');
                                        modifierKBD.textContent = modifier;
                                        shortcutInput.appendChild(modifierKBD);
                                        shortcutInput.appendChild(document.createTextNode('+'));
                                    });
                                    if (!['CONTROL', 'SHIFT', 'META', 'ALT'].includes(shortcut)) {
                                        const shortcutKBD = document.createElement('kbd');
                                        shortcutKBD.textContent = shortcut;
                                        shortcutInput.appendChild(shortcutKBD);
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    }
});