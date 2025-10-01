# Legal Deadline Calculator - Local Setup Guide

## Quick Start

### Prerequisites
- Python 3.6 or higher
- Web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required!

### Method 1: Using Python's Built-in HTTP Server (Recommended)

1. **Download the project files**
   ```bash
   # Create a new directory for the project
   mkdir legal-deadline-calculator
   cd legal-deadline-calculator
   ```

2. **Copy all files to your local directory**
   - Copy `index.html`, `about.html`, `help.html`, `main.js`
   - Copy the `resources/` directory with all images

3. **Start the local server**
   ```bash
   # For Python 3
   python -m http.server 8000
   
   # For Python 2 (if you still have it)
   python -m SimpleHTTPServer 8000
   ```

4. **Open in browser**
   - Navigate to `http://localhost:8000`
   - The calculator should load immediately

### Method 2: Using Node.js (Alternative)

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Create a simple server file**
   ```javascript
   // server.js
   const http = require('http');
   const fs = require('fs');
   const path = require('path');

   const server = http.createServer((req, res) => {
       let filePath = req.url === '/' ? '/index.html' : req.url;
       filePath = path.join(__dirname, filePath);

       fs.readFile(filePath, (err, data) => {
           if (err) {
               res.writeHead(404);
               res.end('File not found');
               return;
           }
           
           const ext = path.extname(filePath);
           const contentType = {
               '.html': 'text/html',
               '.js': 'text/javascript',
               '.css': 'text/css',
               '.jpg': 'image/jpeg',
               '.png': 'image/png'
           }[ext] || 'text/plain';
           
           res.writeHead(200, { 'Content-Type': contentType });
           res.end(data);
       });
   });

   server.listen(8000, () => {
       console.log('Server running at http://localhost:8000');
   });
   ```

3. **Run the server**
   ```bash
   node server.js
   ```

### Method 3: Using Live Server (VS Code Extension)

1. **Install Visual Studio Code**
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

2. **Install Live Server extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Live Server" and install

3. **Open project in VS Code**
   - File → Open Folder → Select your project directory

4. **Start Live Server**
   - Right-click on `index.html`
   - Select "Open with Live Server"

### Method 4: Using PHP (If you have PHP installed)

```bash
# Navigate to project directory
cd legal-deadline-calculator

# Start PHP development server
php -S localhost:8000
```

## File Structure

```
legal-deadline-calculator/
├── index.html              # Main calculator interface
├── about.html              # About page
├── help.html               # Help documentation
├── main.js                 # Core JavaScript functionality
├── resources/              # Images and assets
│   ├── hero-legal-office.jpg
│   ├── hero-abstract-time.jpg
│   └── hero-courthouse.jpg
└── README.md               # This file
```

## Features Available

All features work identically to the deployed version:

- ✅ Real-time deadline calculations
- ✅ Business days vs calendar days
- ✅ Federal holiday exclusion
- ✅ Forward and backward calculations
- ✅ Rollover protection
- ✅ Calculation history
- ✅ Urgency indicators
- ✅ Preset common deadlines
- ✅ Mobile-responsive design

## Troubleshooting

### Common Issues

1. **Images not loading**
   - Ensure the `resources/` directory is in the same folder as your HTML files
   - Check that image files are not corrupted

2. **JavaScript not working**
   - Open browser developer tools (F12) and check console for errors
   - Ensure `main.js` is in the same directory as `index.html`

3. **Styles not applying**
   - All styles are embedded in the HTML files, so this should not be an issue
   - Check if you're opening the files directly (file:///) - use a local server instead

4. **Calculator not calculating**
   - Check that JavaScript is enabled in your browser
   - Look for any error messages in the browser console

### Browser Compatibility

The calculator works on all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Security Note

When running locally, the calculator:
- Stores calculation history in browser localStorage (persists between sessions)
- Does not require internet connection once loaded
- Does not send any data to external servers
- Is completely self-contained

## Development Tips

### Making Changes

1. **Edit HTML files** to modify layout and content
2. **Edit `main.js`** to change calculation logic or add features
3. **Replace images** in the `resources/` folder to customize appearance
4. **Test changes** by refreshing your browser (Live Server auto-refreshes)

### Adding New Features

The code is modular and well-commented. Key areas to modify:

- **Calculation logic**: `calculateDate()` function in `main.js`
- **Holiday database**: `federalHolidays` object in `main.js`
- **UI elements**: HTML files with Tailwind CSS classes
- **Animations**: Anime.js and other library integrations

### Performance Tips

- The calculator is optimized for performance
- All external libraries are loaded from CDNs
- Images are optimized for web delivery
- JavaScript is vanilla (no frameworks) for fast execution

## Support

If you encounter issues running the calculator locally:

1. Check this README for solutions
2. Verify your file structure matches the expected layout
3. Test with different browsers
4. Check browser developer tools for error messages

The calculator is designed to work out-of-the-box with minimal setup required.