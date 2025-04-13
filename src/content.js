let hasSearched = false;

document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'S' && !hasSearched) {
        hasSearched = true;
        alert('Click on the element you want to assign a shortcut to.');

        const handleClick = (event) => {
            event.preventDefault();
            event.stopPropagation();

            const element = event.target;
            let currentElement = element;
            let isClickable = false;

            // Check if the element or any of its ancestors has a .click method
            while (currentElement) {
                if (typeof currentElement.click === 'function') {
                    isClickable = true;
                    break;
                }
                currentElement = currentElement.parentElement;
            }

            if (!isClickable) {
                alert('The selected element or its ancestors are not clickable.');
                document.removeEventListener('click', handleClick);
                hasSearched = false;
                return;
            }

            currentElement = element; // Reset for ancestry calculation
            const ancestry = [];
            while (currentElement.parentElement) {
                const tagName = currentElement.tagName.toLowerCase();
                const id = currentElement.id ? `#${currentElement.id.trim()}` : ''; // Safely handle and trim id
                ancestry.unshift(`${tagName}${id}`); // Removed classes calculation
                currentElement = currentElement.parentElement;
            }
            const uniqueIdentifier = ancestry.join(' > ');

            element.style.setProperty('border', '2px solid red', 'important');
            document.removeEventListener('click', handleClick);

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

            let isModifiers = {
                isControl: false,
                isShift: false,
                isAlt: false,
                isMeta: false,
            };

            let shortcut = '';

            document.addEventListener('keydown', async function handleShortcutInput(event) {
                if (!isShortcut) return;
                event.preventDefault();
                if (event.key === 'Escape') {
                    if (['', 'CONTROL', 'SHIFT', 'META', 'ALT'].includes(shortcut)) {
                        alert('Shortcut not complete.');
                        return;
                    }
                    document.removeEventListener('keydown', handleShortcutInput);
                    chrome.storage.local.get({ shortcuts: [] }, async (data) => {
                        const existingShortcut = data.shortcuts.find(s =>
                            s.domain === window.location.hostname &&
                            s.shortcut === shortcut &&
                            s.isModifiers.isControl === isModifiers.isControl &&
                            s.isModifiers.isShift === isModifiers.isShift &&
                            s.isModifiers.isAlt === isModifiers.isAlt &&
                            s.isModifiers.isMeta === isModifiers.isMeta
                        );

                        if (existingShortcut) {
                            const modifiers = [];
                            if (existingShortcut.isModifiers.isControl) modifiers.push('Ctrl');
                            if (existingShortcut.isModifiers.isShift) modifiers.push('Shift');
                            if (existingShortcut.isModifiers.isAlt) modifiers.push('Alt');
                            if (existingShortcut.isModifiers.isMeta) modifiers.push('Meta');
                            const modifiersText = modifiers.length > 0 ? modifiers.join('+') + '+' : '';
                            const response = await showConfirmDialog(`A shortcut for "${modifiersText}${shortcut}" already exists for this domain. Choose an action:`);
                            if (response === "cancel") {
                                alert('Shortcut creation canceled.');
                                document.body.removeChild(shortcutInput);
                                element.style.removeProperty('border');
                                hasSearched = false;
                                return;
                            } else if (response === "replace") {
                                // Remove the existing shortcut
                                data.shortcuts = data.shortcuts.filter(s => s !== existingShortcut);
                            } else if (response === "keep") {
                                // Keep both: do nothing here to preserve the existing shortcut
                            }
                        }

                        const newShortcut = {
                            domain: window.location.hostname,
                            isModifiers,
                            shortcut,
                            uniqueIdentifier,
                        };
                        const updatedShortcuts = [...data.shortcuts, newShortcut];
                        chrome.storage.local.set({ shortcuts: updatedShortcuts }, () => {
                            console.log('Shortcut added:', newShortcut);
                            console.log('Updated shortcuts list:', updatedShortcuts);
                        });
                    });
                    document.body.removeChild(shortcutInput);
                    element.style.removeProperty('border');
                    hasSearched = false;
                } else {
                    isModifiers = {
                        isControl: event.ctrlKey,
                        isShift: event.shiftKey,
                        isAlt: event.altKey,
                        isMeta: event.metaKey,
                    };
                    shortcut = event.key.toUpperCase();

                    const modifiers = [];
                    if (isModifiers.isControl) modifiers.push('Ctrl');
                    if (isModifiers.isShift) modifiers.push('Shift');
                    if (isModifiers.isAlt) modifiers.push('Alt');
                    if (isModifiers.isMeta) modifiers.push('Meta');
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
        };

        document.addEventListener('click', handleClick, { once: true });
    }
});

// Modify the confirm dialog helper to include "Keep Both"
function showConfirmDialog(message) {
    return new Promise(resolve => {
        const dialog = document.createElement('dialog');
        dialog.innerHTML = `<p>${message}</p>
<button id="replaceBtn">Replace</button>
<button id="keepBothBtn">Keep Both</button>
<button id="cancelBtn">Cancel</button>`;
        document.body.appendChild(dialog);
        dialog.showModal();
        dialog.querySelector('#replaceBtn').addEventListener('click', () => {
            resolve("replace");
            dialog.close();
            document.body.removeChild(dialog);
        });
        dialog.querySelector('#keepBothBtn').addEventListener('click', () => {
            resolve("keep");
            dialog.close();
            document.body.removeChild(dialog);
        });
        dialog.querySelector('#cancelBtn').addEventListener('click', () => {
            resolve("cancel");
            dialog.close();
            document.body.removeChild(dialog);
        });
    });
}

chrome.storage.local.get({ shortcuts: [] }, (data) => {
    const shortcuts = data.shortcuts;

    document.addEventListener('keydown', (event) => {
        const isModifiers = {
            isControl: event.ctrlKey,
            isShift: event.shiftKey,
            isAlt: event.altKey,
            isMeta: event.metaKey,
        };
        const shortcut = event.key.toUpperCase();

        const matchingShortcuts = shortcuts.filter(s =>
            s.domain === window.location.hostname &&
            s.shortcut === shortcut &&
            s.isModifiers.isControl === isModifiers.isControl &&
            s.isModifiers.isShift === isModifiers.isShift &&
            s.isModifiers.isAlt === isModifiers.isAlt &&
            s.isModifiers.isMeta === isModifiers.isMeta
        );
        if (matchingShortcuts.length > 0) {
            let clicked = false;
            for (const matchingShortcut of matchingShortcuts) {
                let targetElement = document.querySelector(matchingShortcut.uniqueIdentifier);
                console.log('Target element:', targetElement);
                while (targetElement) {
                    if (typeof targetElement.click === 'function') {
                        targetElement.click();
                        clicked = true;
                        break;
                    }
                    targetElement = targetElement.parentElement;
                }
                if (clicked) break;
            }
            if (!clicked) {
                console.warn('No clickable target element found for any matching shortcuts.');
            }
        }
    });
});