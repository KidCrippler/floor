# 🔧 Audio Troubleshooting Guide

## Quick Test

**Open `test-audio.html` in your browser** to test your audio files directly!

This will help identify if the issue is with:
- The audio files themselves
- Browser permissions
- Volume settings
- File paths

---

## Common Issues & Solutions

### 1. ⚠️ Browser Autoplay Policy (Most Common!)

**Symptoms:** No sound plays when game starts

**Why:** Modern browsers (Chrome, Safari, Firefox) block audio autoplay until user interaction.

**Solutions:**
- ✅ **The countdown sound should work** because it plays AFTER you click "Start Game" (user interaction)
- ✅ **Background music should start** after the countdown finishes
- ❌ If you refresh during a game, audio won't work until you click/press a key

**Test:**
1. Open browser console (F12)
2. Look for messages like: `❌ Failed to play background music: NotAllowedError`
3. If you see this, **click anywhere** on the page to start audio

---

### 2. 🔇 Volume/Mute Settings

**Check:**
- [ ] Computer volume is not muted or too low
- [ ] Browser tab is not muted (look for speaker icon with X on browser tab)
- [ ] Browser volume controls (right-click tab → unmute site)
- [ ] System sound output is correct device (not HDMI/Bluetooth that's off)

**Default Volumes in Game:**
- Countdown: 60%
- Background music: 30% (intentionally lower)

---

### 3. 📁 File Location/Path Issues

**Your files should be at:**
```
/Users/alonc/floor/
  sounds/
    countdown.mp3  ✅ You have this
    background.mp3 ✅ You have this
```

**Check in browser console:**
Look for: `🎵 Audio system initialized`
Then: `Loaded sounds: ["countdown", "go", "correct", "skip", "warning", "gameover"]`

If countdown is NOT in the list, the file isn't loading!

---

### 4. 🎵 File Format Issues

**Requirements:**
- Files must be valid MP3 format
- Not corrupted
- Not zero bytes

**Test:**
- Try playing the files in VLC or QuickTime
- If they don't play outside the browser, they're corrupted

---

### 5. 🌐 Browser-Specific Issues

#### Chrome/Edge
- Usually works fine after user interaction
- Check `chrome://settings/content/sound` → ensure site not blocked

#### Safari
- Stricter autoplay policy
- May need to click after countdown for music to start
- Check Safari → Settings → Websites → Auto-Play → Allow

#### Firefox
- Usually works well
- Check `about:preferences#privacy` → Permissions → Autoplay

---

## 🔍 Debugging Steps

### Step 1: Open Browser Console (F12)

Look for these messages when game starts:

```
✅ GOOD:
🎵 Audio system initialized
Loaded sounds: ["countdown", "go", "correct", ...]
Background music: loaded
🔊 Attempting to play countdown sound...
🔊 Playing sound: countdown
✅ Background music started successfully!

❌ BAD:
⚠️ Sound "countdown" not found in loaded sounds
❌ Failed to play sound "countdown": NotAllowedError
```

### Step 2: Use Test Page

1. Open `test-audio.html` in your browser
2. Click "Test countdown.mp3"
3. Click "Test background.mp3"
4. Read the status messages

### Step 3: Check File Sizes

```bash
ls -lh sounds/
```

Both files should be > 0 bytes. If 0 bytes = corrupted!

### Step 4: Test Direct URL

Try accessing directly in browser:
- `file:///Users/alonc/floor/sounds/countdown.mp3`
- `file:///Users/alonc/floor/sounds/background.mp3`

Should either play or download. If error 404 = wrong location!

---

## 🎮 Expected Audio Flow

When game starts correctly:

1. **Loading screen** → silence
2. **"3" appears** → `countdown.mp3` plays (you should hear it!)
3. **2, 1, GO** → silence (countdown.mp3 continues)
4. **After GO disappears** → `background.mp3` starts and loops
5. **Throughout game** → background music continues
6. **Game over** → music stops

---

## 💡 Quick Fixes to Try

### Fix 1: Clear Browser Cache
```
Chrome: Ctrl+Shift+Delete → Clear cache
Safari: Cmd+Option+E
Firefox: Ctrl+Shift+Delete
```

### Fix 2: Hard Refresh
```
Chrome/Firefox: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
Safari: Cmd+Option+R
```

### Fix 3: Incognito/Private Mode
Try opening the game in incognito/private browsing mode.
This bypasses extensions and cached settings.

### Fix 4: Try Different Browser
If it works in Firefox but not Chrome (or vice versa), it's a browser settings issue.

---

## 📊 System Volume Test

If still no sound, test system audio:

1. **Play a YouTube video** → Do you hear it?
2. **Check System Preferences → Sound** → Correct output device?
3. **Are headphones plugged in but not worn?**

---

## 🆘 Still Not Working?

### Share these details:

1. **Browser & Version:** (Chrome 120, Safari 17, etc.)
2. **Operating System:** (macOS 14, Windows 11, etc.)
3. **Console messages:** (copy/paste from F12 console)
4. **Test page results:** What happened when you clicked test buttons?
5. **File test:** Can you play sounds/countdown.mp3 in VLC?

---

## ✅ Success Indicators

You'll know audio is working when you see in console:

```
🎵 Audio system initialized
🔊 Attempting to play countdown sound...
🔊 Playing sound: countdown
🎵 Starting background music...
✅ Background music started successfully!
```

And **you actually hear sound!** 🎵

---

Good luck! The game works without audio, but sounds make it much better! 🎮

