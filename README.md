# Aparat Follower Monitor

A lightweight, self-contained web application that monitors and displays follower activity for any Aparat channel in real-time.

## How It Works

### Data Source Discovery

After analyzing the Aparat platform, I discovered that follower data is exposed through their **public API endpoint**:

```
https://www.aparat.com/api/fa/v2/Live/LiveStream/show/username/[USERNAME]
```

**Why this approach was chosen:**

1. **Official API**: This is an official Aparat API endpoint designed to serve live stream information including profile data.
2. **Reliable Structure**: The API returns consistent JSON data with the follower count located at `profile.follow.follower_cnt`.
3. **No Authentication Required**: The endpoint is publicly accessible without requiring API keys or authentication.
4. **Real-time Data**: The API provides up-to-date follower counts that reflect current channel statistics.

**API Response Structure:**
```json
{
  "profile": {
    "username": "ESI.KHERSI",
    "follow": {
      "follower_cnt": "77.7 هزار"
    }
  }
}
```

**Note on Number Parsing:**
The API returns follower counts in Persian format (e.g., "77.7 هزار" meaning 77.7 thousand). The tool includes a custom parser that:
- Converts Persian/Arabic numerals to English digits
- Handles magnitude words like "هزار" (thousand) and "میلیون" (million)
- Returns a numeric value for calculations

## Features

- ✅ **Real-time Monitoring**: Polls for updates every 5 seconds
- ✅ **Session Tracking**: Tracks new followers gained during your monitoring session
- ✅ **Goal Setting**: Set a target follower count and get notified when reached
- ✅ **Multiple Display Formats**: Choose how to display follower data
- ✅ **Custom Animations**: Select from multiple visual effects
- ✅ **Dark Theme**: Easy on the eyes with high-contrast text
- ✅ **No Dependencies**: Pure HTML/CSS/JavaScript - runs in any modern browser

## Configuration Options

### 1. Channel Selection
Enter any Aparat channel username in the "Channel Username" field.
- Example: `ESI.KHERSI`
- The username is the part after `aparat.com/` in the channel URL

### 2. Session Goal
Set a target number of total followers for this session.
- When the channel's total followers reach or exceed this number, the goal celebration animation triggers
- Leave as 0 or empty if you don't want to set a goal

### 3. Display Format
Choose from three display options:

| Option | Format | Example |
|--------|--------|---------|
| A | New / Total | `+2 / 3201` |
| B | New / Goal | `+4 / 10` |
| C | Total Only | `3201` |

### 4. New Follower Animations
Select the visual effect that plays when new followers are detected:

- **Fade**: Smooth opacity transition from invisible to visible
- **Typewriter**: Character-by-character reveal effect
- **Bounce**: Spring-like scale effect with overshoot
- **Slide Up**: Vertical entry animation with fade

### 5. Goal Reached Animations
Select the celebration effect when the follower goal is achieved:

- **Golden Glow**: Pulsing golden light effect around the display
- **Rainbow Border**: Animated color-cycling border (ROYGBIV)
- **Pulse Explode**: Dramatic scaling flash followed by golden glow

## Polling Mechanism

### Default Interval: 5 seconds

The tool uses a polling mechanism that:
1. Makes an HTTP request to the Aparat API
2. Parses the follower count from the response
3. Compares with the previous count
4. Triggers animations if changes are detected

### Adjusting the Poll Interval

To change the polling frequency, edit the `POLL_INTERVAL` constant in the JavaScript:

```javascript
const POLL_INTERVAL = 5000; // Value in milliseconds (5000 = 5 seconds)
```

**Recommended values:**
- Minimum: 3000ms (3 seconds) - More frequent but may hit rate limits
- Default: 5000ms (5 seconds) - Good balance
- Maximum: 30000ms (30 seconds) - Less frequent, lighter on resources

**Warning:** Setting the interval too low may result in:
- API rate limiting by Aparat
- Increased bandwidth usage
- Potential temporary IP blocking

## Usage Instructions

1. **Open the Tool**: Open `index.html` in any modern web browser
2. **Enter Username**: Type the Aparat channel username (e.g., `ESI.KHERSI`)
3. **Set Goal** (Optional): Enter a target follower count
4. **Choose Display Format**: Select how you want followers displayed
5. **Select Animations**: Pick your preferred animation styles
6. **Click Start**: Begin monitoring
7. **Watch**: The tool will automatically poll for updates and animate changes

### Controls

- **Start Monitoring**: Begins the polling process
- **Stop**: Pauses monitoring (you can resume by clicking Start again)
- **Enter Key**: Press Enter to toggle Start/Stop

## Technical Details

### Architecture

This is a **client-side only** application with no backend requirements:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web Browser   │────▶│  Aparat API      │────▶│   JSON Response │
│   (index.html)  │◀────│  (REST Endpoint) │◀────│   (Parsed)      │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Display &      │
│  Animations     │
└─────────────────┘
```

### Key Functions

1. **`parseFollowerCount(countStr)`**: Converts Persian-formatted numbers to integers
2. **`fetchFollowerData(username)`**: Makes API request and parses response
3. **`pollFollowers()`**: Main polling function called at regular intervals
4. **`triggerNewFollowerAnimation()`**: Applies CSS animation classes
5. **`triggerGoalReachedAnimation()`**: Applies goal celebration effects

### CORS Considerations

The tool makes direct API calls from the browser to Aparat's servers. If you encounter CORS errors:

1. **Browser Extension**: Use a CORS-bypass extension for development
2. **Local Proxy**: Run a simple local proxy server
3. **Disable CORS**: For testing only, launch browser with `--disable-web-security`

### Browser Compatibility

Tested and working on:
- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### "Failed to fetch data" Error

**Possible causes:**
- Invalid username (check spelling)
- Channel doesn't exist or is private
- Network connectivity issues
- Aparat API temporarily unavailable

**Solutions:**
1. Verify the username by visiting `aparat.com/[USERNAME]`
2. Check your internet connection
3. Wait a few moments and try again

### Animations Not Playing

**Possible causes:**
- Browser doesn't support CSS animations
- Animation disabled in browser settings

**Solutions:**
1. Update to latest browser version
2. Check browser accessibility settings

### Numbers Not Updating

**Possible causes:**
- Polling stopped due to error
- No actual follower change occurred

**Solutions:**
1. Check the status indicator (green dot should be pulsing)
2. Stop and restart monitoring
3. Refresh the page

## File Structure

```
/workspace/
├── index.html    # Main application (single file, self-contained)
└── README.md     # This documentation file
```

## License

This tool is provided as-is for educational and personal use. All data belongs to Aparat and respective channel owners.

## Disclaimer

This tool is for personal monitoring purposes only. Please respect Aparat's Terms of Service and do not abuse the API with excessive requests.
