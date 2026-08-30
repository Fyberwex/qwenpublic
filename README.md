# Aparat Follower Counter Overlay for OBS Studio

A real-time follower counter overlay designed for OBS Studio that fetches follower data from Aparat.com profiles.

## Features

- **Real-time Polling**: Automatically fetches follower count at configurable intervals
- **New Follower Detection**: Displays when new followers are gained during your stream session
- **Goal Tracking**: Set a session goal and get animated celebration when reached
- **Multiple Display Formats**: Choose how to display follower information
- **Customizable Animations**: Multiple animation options for events
- **Transparent Background**: Perfect for OBS overlays
- **Persistent Settings**: Configuration saved to browser localStorage

## Installation

### Using in OBS Studio

1. **Add Browser Source**:
   - In OBS, click the `+` button in the Sources panel
   - Select "Browser"
   - Name it (e.g., "Follower Counter")

2. **Configure Browser Source**:
   - Check "Local file"
   - Click "Browse" and select `aparat-follower-counter.html`
   - Set Width: `1920` and Height: `1080` (or your preferred resolution)
   - Ensure "Shutdown source when not visible" is unchecked

3. **Position the Overlay**:
   - The widget will appear centered on your stream
   - You can reposition it by dragging in OBS preview

## Configuration

### Quick Configuration (In-Browser)

Press the **'C' key** while the overlay is active to open the settings panel. This allows you to:

- Change the Aparat username
- Adjust refresh interval
- Set session goals
- Select display formats
- Choose animations

Settings are automatically saved to your browser's localStorage.

### Manual Configuration (Edit the HTML File)

Open `aparat-follower-counter.html` in a text editor and find the `CONFIG` object in the JavaScript section:

```javascript
const CONFIG = {
    // Basic Settings
    username: "esi.khersi",           // Your Aparat username
    refreshInterval: 5,               // Seconds between API polls
    sessionGoal: 10,                  // Follower goal for this session
    
    // Display Format
    displayFormat: "new_goal",        // How to show the count
    
    // Animations
    newFollowerAnimation: "bounce",   // Animation for new followers
    goalReachedAnimation: "rainbowBorder", // Animation when goal is hit
    
    // Goal Reset Behavior
    resetGoalOnDrop: false            // Reset if followers drop below goal
};
```

## Configuration Options Explained

### Basic Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `username` | String | `"esi.khersi"` | Your Aparat profile username |
| `refreshInterval` | Number | `5` | How often (in seconds) to check for new followers (1-60) |
| `sessionGoal` | Number | `10` | The follower goal for your current stream session |

### Display Format

The `displayFormat` option controls what information is shown:

| Value | Example Output | Description |
|-------|---------------|-------------|
| `"new_total"` | `+2 / 3,201` | Shows new followers since page load AND total follower count |
| `"new_goal"` | `+4 / 10` | Shows new followers since page load AND progress toward session goal |
| `"total_only"` | `3,201` | Shows only the total follower count |

**Note**: The `{newCount}` resets to 0 every time you refresh the page or restart the polling.

### New Follower Animations

These animations play on the "+N" portion when new followers are detected:

| Animation | Description |
|-----------|-------------|
| `"fade"` | Smooth fade-in from transparent to visible |
| `"typewriter"` | Text appears character by character like typing |
| `"bounce"` | Scales up large then snaps back to normal size |
| `"slideUp"` | Slides up from below while fading in |

### Goal Reached Animations

These animations activate when `totalFollowers >= sessionGoal`:

| Animation | Description |
|-----------|-------------|
| `"goldenGlow"` | Pulsing golden glow effect on the text |
| `"rainbowBorder"` | Animated rainbow-colored border around the widget |
| `"pulseExplode"` | Repeated scaling and brightness pulse effect |

**Behavior**: Goal animations continue indefinitely until:
- The page is refreshed
- Configuration is changed
- `resetGoalOnDrop` is `true` AND followers drop below the goal

### Reset Goal on Drop

| Value | Behavior |
|-------|----------|
| `false` (default) | Goal animation stays active even if follower count somehow drops |
| `true` | Goal animation stops if total followers fall below the session goal |

## API Information

This tool uses Aparat's public profile API:

```
https://www.aparat.com/etc/api/profile/username/{USERNAME}
```

The API returns a JSON response containing profile information including `follower_cnt`. 

### Handling Decimal Values

Aparat's API sometimes returns follower counts as decimals (e.g., `77.7` for approximately 77,700 followers). This tool automatically handles this by:

- If the value is less than 100 AND has a decimal: Multiplies by 1000
- Otherwise: Uses the value as-is (rounded)

## Troubleshooting

### CORS Issues

If you encounter CORS errors when fetching data:

1. **Use a CORS Proxy**: Modify the fetch URL to use a CORS proxy service
2. **Run a Local Server**: Use a simple local server that handles CORS
3. **Browser Extension**: Install a CORS-disabling extension for testing

### Followers Not Updating

1. Check that the username is correct
2. Verify the Aparat profile is public
3. Check browser console for error messages (F12 → Console)
4. Try increasing the `refreshInterval` value

### Overlay Not Visible in OBS

1. Ensure the background is transparent (it should be by default)
2. Check that the browser source dimensions are large enough
3. Verify the source is not hidden (eye icon in OBS)
4. Make sure no other sources are covering it

### Settings Not Saving

1. Ensure you're using a modern browser (Chrome, Firefox, Edge)
2. Check that localStorage is not disabled in your browser
3. Clear browser cache and try again

## Customization Tips

### Styling

To customize colors, fonts, or sizes, edit the CSS in the `<style>` section:

```css
/* Change the main text color */
.follower-display {
    color: #your-color-here;
    font-size: 100px; /* Adjust size */
}

/* Change the label text */
.follower-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 18px;
}
```

### Adding More Animations

You can add custom animations by:

1. Defining a new `@keyframes` rule in the CSS
2. Creating a class that applies the animation
3. Adding the animation name to the `animationMap` in JavaScript

### Positioning

To change the overlay position, modify the body styles:

```css
body {
    /* Center (default) */
    justify-content: center;
    align-items: center;
    
    /* Top-left corner */
    justify-content: flex-start;
    align-items: flex-start;
    
    /* Bottom-right corner */
    justify-content: flex-end;
    align-items: flex-end;
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `C` | Toggle configuration panel |

## File Structure

```
/workspace/
├── aparat-follower-counter.html    # Main overlay file (use this one)
├── README.md                        # This documentation file
├── index.html                       # Other existing files...
└── script.js                        # Other existing files...
```

## License

This project is provided as-is for personal use. Feel free to modify and distribute as needed.

## Support

For issues or feature requests, please check the browser console (F12) for error messages and report them with details about your setup.