# Chrome Extension Random String Generator

This Chrome extension allows users to generate random strings of letters by pressing the 'F' key. The extension listens for keyboard events and manages button selection, providing a simple interface for interaction.

## Features

- Press the 'F' key to select a button.
- Generate a short string of random letters.
- View the generated string in the console.

## Installation

1. Download or clone the repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click on "Load unpacked" and select the `chrome-extension` directory.

## Usage

1. Once the extension is installed, press the 'F' key to choose a button.
2. The extension will generate a random string of letters.
3. The result will be printed in the console.

## Development

- The extension consists of several files located in the `src` directory:
  - `background.js`: Handles background processes and keyboard events.
  - `content.js`: Injected into web pages to listen for key presses.
  - `popup/popup.html`: Defines the popup interface.
  - `popup/popup.js`: Contains logic for the popup interactions.
  - `popup/popup.css`: Styles for the popup interface.

## License

This project is licensed under the MIT License.