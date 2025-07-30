# Mermaid Editor

A web-based editor for creating and editing Mermaid diagrams with support for both standalone diagrams and inline README documentation.

## Features

### Standalone Mode
- Create and edit individual Mermaid diagrams
- Real-time preview with pan and zoom controls
- Export diagrams as PNG or SVG images
- Save diagrams as `.mmd` files
- Load and edit existing `.mmd` files

### Inline README Mode
- Write markdown documentation with embedded Mermaid diagrams
- Live preview shows rendered markdown with diagrams displayed visually
- Perfect for creating GitHub READMEs with integrated diagrams
- Save as `.md` files with properly formatted mermaid code blocks

### General Features
- Syntax highlighting for Mermaid code
- Support for all Mermaid diagram types (flowcharts, sequence diagrams, class diagrams, etc.)
- Responsive design that works on desktop and mobile
- File management (open/save files)
- Automatic mode switching based on file type

## Usage

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open your browser to `http://localhost:5173`

### Creating Diagrams

#### Standalone Mode (Default)
1. Write your Mermaid diagram code in the editor
2. See the live preview on the right
3. Use pan (drag) and zoom (scroll wheel or buttons) to navigate large diagrams
4. Export as PNG/SVG or save as `.mmd` file

#### Inline README Mode
1. Toggle "Inline README Mode" in the toolbar
2. Write your markdown content with mermaid code blocks:
   ```markdown
   # My Project
   
   ## Architecture
   
   ```mermaid
   graph TD
       A[Client] --> B[Server]
       B --> C[Database]
   ```
   ```
3. The preview shows the full rendered README with diagrams
4. Save as `.md` file for use in GitHub or other platforms

### File Types
- `.mmd` - Standalone Mermaid diagram files (opens in standalone mode)
- `.md` - Markdown files with embedded diagrams (opens in inline mode)
- `.txt` - Plain text files (treated as standalone diagrams)

## Development

Built with:
- React 19
- Vite
- Mermaid.js
- Marked (for markdown rendering)

## License

MIT
