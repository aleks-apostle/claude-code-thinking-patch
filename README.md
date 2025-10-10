# Claude Code Thinking Display Patch

Make Claude Code's thinking blocks visible by default without pressing `ctrl+o`.

## The Problem

Claude Code collapses thinking blocks by default, showing only:
```
∴ Thought for 3s (ctrl+o to show thinking)
```

You have to press `ctrl+o` every time to see the actual thinking content. This patch makes thinking blocks visible inline automatically.

**Current Version:** Claude Code 2.0.13 (Updated 2025-10-10)

## Quick Start

```bash
# Clone or download this repository
cd claude-code-thinking

# Run the patch script
node patch-thinking.js

# Restart Claude Code
```

That's it! Thinking blocks now display inline without `ctrl+o`.

## What This Patch Does

**Before:**
```
∴ Thought for 3s (ctrl+o to show thinking)
[thinking content hidden]
```

**After:**
```
∴ Thinking…

  [thinking content displayed inline]
  The actual thinking process is now visible
  without any keyboard shortcuts needed
```

## How It Works

This patch modifies two locations in Claude Code's compiled JavaScript:

### Patch 1: Remove the Banner (v2.0.13)
**Before:**
```javascript
function hGB({streamMode:A}){
  // ... displays "Thought for Xs (ctrl+o to show thinking)"
}
```

**After:**
```javascript
function hGB({streamMode:A}){return null}
```

**Effect:** Removes the collapsed thinking banner entirely.

**Version History:**
- v2.0.9: Function named `Mr2`
- v2.0.10: Renamed to `br2`, used `PE.createElement`
- v2.0.11: Renamed to `er2`, uses `_E.createElement`
- v2.0.13: Renamed to `hGB`, uses `TL.createElement`

### Patch 2: Force Thinking Visibility (v2.0.13)
**Before:**
```javascript
case"thinking":if(!D)return null;if(K)return null;
  return z3.createElement(xlB,{addMargin:B,param:A,isTranscriptMode:D});
```

**After:**
```javascript
case"thinking":if(K)return null;
  return z3.createElement(xlB,{addMargin:B,param:A,isTranscriptMode:!0});
```

**Effect:** Forces thinking content to render as if in transcript mode (visible).

**Version History:**
- v2.0.9: Used `S2B` component
- v2.0.10: Changed to `DOB` component, `z`→`H` variable
- v2.0.11: Changed to `SOB` component, `H`→`z` variable
- v2.0.13: Changed to `xlB` component, `K`→`D` variable swap

## Installation

### Prerequisites
- Claude Code v2.0.13 installed
- Node.js (comes with Claude Code installation)

### Install Steps

1. **Download the patcher:**
   ```bash
   # Clone this repository
   git clone <repository-url>
   cd claude-code-thinking
   ```

2. **Run the patcher:**
   ```bash
   node patch-thinking.js
   ```

3. **Restart Claude Code** for changes to take effect.

## Command-Line Options

The script supports several options:

```bash
# Apply patches (default)
node patch-thinking.js

# Preview changes without applying
node patch-thinking.js --dry-run

# Restore original behavior from backup
node patch-thinking.js --restore

# Show help
node patch-thinking.js --help
```

## Files Modified

The script automatically detects and patches the Claude Code installation:

**Searched Locations:**
- `~/.claude/local/node_modules/@anthropic-ai/claude-code/cli.js`
- `~/.config/claude/local/node_modules/@anthropic-ai/claude-code/cli.js`

**Backup Created:**
- `cli.js.backup` (in the same directory as cli.js)

## Important: After Claude Code Updates

When you run `claude update`, the patches will be **overwritten**. You must re-apply them:

```bash
cd claude-code-thinking
node patch-thinking.js
# Restart Claude Code
```

The patch script automatically:
- Detects your Claude Code installation
- Creates a backup before patching (if it doesn't exist)
- Applies both patches atomically
- Reports success or failure
- Safe to run multiple times

## Rollback

To restore the original behavior:

**Option 1: Using the script**
```bash
node patch-thinking.js --restore
```

**Option 2: Manual restore**
```bash
# The backup is created in the same directory as cli.js
cp ~/.claude/local/node_modules/@anthropic-ai/claude-code/cli.js.backup \
   ~/.claude/local/node_modules/@anthropic-ai/claude-code/cli.js
```

Then restart Claude Code.

## Verification

Check if patches are applied (for v2.0.13):

```bash
# Check hGB patch
grep -n "function hGB" ~/.claude/local/node_modules/@anthropic-ai/claude-code/cli.js

# Should show: function hGB({streamMode:A}){return null}

# Check thinking visibility patch
grep -n 'case"thinking":if(K)return null' ~/.claude/local/node_modules/@anthropic-ai/claude-code/cli.js

# Should show: case"thinking":if(K)return null;return z3.createElement(xlB,{addMargin:B,param:A,isTranscriptMode:!0});
```

## Troubleshooting

### "Could not find Claude Code installation"

**Cause:** The script cannot locate your Claude Code installation.

**Solution:**
1. Verify Claude Code is installed: `claude --version`
2. Check if cli.js exists in one of the searched locations
3. Manually specify the path by editing the script if installed in a custom location

### "Pattern not found"

**Cause:** This means:
1. Claude Code has been updated to a newer version
2. The patches are already applied
3. The file structure has changed

**Solution:**
1. Run `node patch-thinking.js --dry-run` to check status
2. If already applied, you're good!
3. If version changed, the patterns may need updating for the new version

### Thinking Still Collapsed After Patching

**Solution:** You must restart Claude Code for changes to take effect.

### Backup File Missing

The patch script creates a backup automatically on first run. The `--restore` command will fail if the backup doesn't exist.

## Cross-Platform Support

The script works on:
- **macOS** ✅
- **Linux** ✅
- **Windows** ⚠️ (Not tested, but should work)

Path detection is automatic using Node.js `os.homedir()`.

## Technical Details

### File Structure
- **cli.js:** ~3,500+ lines, ~9+ MB (heavily minified)
- **Version:** Claude Code 2.0.13
- **Patches:** Non-invasive, minimal changes

### Why Two Patches?

1. **hGB Function:** Controls the UI banner shown after thinking completes
2. **Thinking Renderer:** Controls whether the actual thinking text is displayed

Both must be patched because they're separate systems:
- Patching only hGB → Blank line appears where thinking should be
- Patching only the renderer → Banner still shows "ctrl+o to show"

### Pattern Evolution Across Versions

The minified code patterns change with each Claude Code update:

| Version | Banner Function | Component | Variables |
|---------|----------------|-----------|-----------|
| 2.0.9   | `Mr2`          | `S2B`     | Various   |
| 2.0.10  | `br2`          | `DOB`     | `H` check |
| 2.0.11  | `er2`          | `SOB`     | `z` check |
| 2.0.13  | `hGB`          | `xlB`     | `K` check |

When Claude Code updates, function names and component identifiers are regenerated during minification.

## Limitations

1. **Breaks on updates:** Must re-run after `claude update`
2. **Minified code:** Fragile, patterns may change with version updates
3. **No official config:** This is a workaround until Anthropic adds a native setting
4. **Version-specific:** Patterns are specific to v2.0.13

## Feature Request

Consider requesting this as an official feature from Anthropic:
- Configuration option to always show thinking
- User preference in settings (`~/.claude/config.json`)
- Toggle command like `/thinking show` or `/thinking hide`
- Environment variable like `CLAUDE_SHOW_THINKING=true`

Submit feedback: https://github.com/anthropics/claude-code/issues

## Contributing

If Claude Code updates and the patches stop working:

1. **Locate the new patterns** in cli.js:
   - Search for the thinking banner function (look for "Thought for" text)
   - Search for `case"thinking"` to find the visibility check

2. **Update the script** with new patterns

3. **Test thoroughly** before committing

4. **Update this README** with the new version information

Pull requests welcome!

## License

This patch is provided as-is for educational purposes. Use at your own risk.

## Credits

Developed through analysis of Claude Code's compiled JavaScript. Special thanks to the community for identifying the thinking display issue.

---

**Last Updated:** 2025-10-10
**Claude Code Version:** 2.0.13
**Status:** ✅ Working

### Quick Reference

```bash
# Install
node patch-thinking.js

# Preview
node patch-thinking.js --dry-run

# Restore
node patch-thinking.js --restore

# Help
node patch-thinking.js --help
```
