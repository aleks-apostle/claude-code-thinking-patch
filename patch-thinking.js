#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isRestore = args.includes('--restore');
const showHelp = args.includes('--help') || args.includes('-h');

// Display help
if (showHelp) {
  console.log('Claude Code Thinking Visibility Patcher v2.0.13');
  console.log('==============================================\n');
  console.log('Usage: node patch-thinking.js [options]\n');
  console.log('Options:');
  console.log('  --dry-run    Preview changes without applying them');
  console.log('  --restore    Restore from backup file');
  console.log('  --help, -h   Show this help message\n');
  console.log('Examples:');
  console.log('  node patch-thinking.js              # Apply patches');
  console.log('  node patch-thinking.js --dry-run    # Preview changes');
  console.log('  node patch-thinking.js --restore    # Restore original');
  process.exit(0);
}

console.log('Claude Code Thinking Visibility Patcher v2.0.13');
console.log('==============================================\n');

// Auto-detect Claude Code installation path
function getClaudeCodePath() {
  const homeDir = os.homedir();

  // Try different possible installation locations
  const possiblePaths = [
    path.join(homeDir, '.claude', 'local', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'),
    path.join(homeDir, '.config', 'claude', 'local', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'),
  ];

  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }

  return null;
}

const targetPath = getClaudeCodePath();

if (!targetPath) {
  console.error('❌ Error: Could not find Claude Code installation');
  console.error('\nSearched in:');
  console.error('  - ~/.claude/local/node_modules/@anthropic-ai/claude-code/cli.js');
  console.error('  - ~/.config/claude/local/node_modules/@anthropic-ai/claude-code/cli.js');
  console.error('\nPlease ensure Claude Code is installed.');
  process.exit(1);
}

console.log(`Found Claude Code at: ${targetPath}\n`);

const backupPath = targetPath + '.backup';

// Restore from backup
if (isRestore) {
  if (!fs.existsSync(backupPath)) {
    console.error('❌ Error: Backup file not found at:', backupPath);
    process.exit(1);
  }

  console.log('Restoring from backup...');
  fs.copyFileSync(backupPath, targetPath);
  console.log('✅ Restored successfully!');
  console.log('\nPlease restart Claude Code for changes to take effect.');
  process.exit(0);
}

// Read file
console.log('Reading cli.js...');
if (!fs.existsSync(targetPath)) {
  console.error('❌ Error: cli.js not found at:', targetPath);
  process.exit(1);
}

let content = fs.readFileSync(targetPath, 'utf8');

// Patch 1: hGB Banner Removal (v2.0.13)
const bannerSearchPattern = 'function hGB({streamMode:A}){let[B,Q]=RX1.useState(null),[Z,G]=RX1.useState(null);if(RX1.useEffect(()=>{if(A==="thinking"&&B===null)Q(Date.now());else if(A!=="thinking"&&B!==null)G(Date.now()-B),Q(null)},[A,B]),A==="thinking")return TL.createElement(j,{marginTop:1},TL.createElement($,{dimColor:!0},"∴ Thinking…"));if(Z!==null)return TL.createElement(j,{marginTop:1},TL.createElement($,{dimColor:!0},"∴ Thought for ",Math.max(1,Math.round(Z/1000)),"s"," ",TL.createElement($,{dimColor:!0,bold:!0},"(ctrl+o")," ","to show thinking)"));return null}';
const bannerReplacement = 'function hGB({streamMode:A}){return null}';

// Patch 2: Thinking Visibility (v2.0.13)
const thinkingSearchPattern = 'case"thinking":if(!D)return null;if(K)return null;return z3.createElement(xlB,{addMargin:B,param:A,isTranscriptMode:D});';
const thinkingReplacement = 'case"thinking":if(K)return null;return z3.createElement(xlB,{addMargin:B,param:A,isTranscriptMode:!0});';

let patch1Applied = false;
let patch2Applied = false;

// Check if patches can be applied
console.log('Checking patches...\n');

console.log('Patch 1: hGB banner removal');
if (content.includes(bannerSearchPattern)) {
  patch1Applied = true;
  console.log('  ✅ Pattern found - ready to apply');
} else if (content.includes(bannerReplacement)) {
  console.log('  ⚠️  Already applied');
} else {
  console.log('  ❌ Pattern not found - may need update for newer version');
}

console.log('\nPatch 2: Thinking visibility');
if (content.includes(thinkingSearchPattern)) {
  patch2Applied = true;
  console.log('  ✅ Pattern found - ready to apply');
} else if (content.includes(thinkingReplacement)) {
  console.log('  ⚠️  Already applied');
} else {
  console.log('  ❌ Pattern not found - may need update for newer version');
}

// Dry run mode - just preview
if (isDryRun) {
  console.log('\n📋 DRY RUN - No changes will be made\n');
  console.log('Summary:');
  console.log(`- Patch 1 (banner): ${patch1Applied ? 'WOULD APPLY' : 'SKIP'}`);
  console.log(`- Patch 2 (visibility): ${patch2Applied ? 'WOULD APPLY' : 'SKIP'}`);

  if (patch1Applied || patch2Applied) {
    console.log('\nRun without --dry-run to apply patches.');
  }
  process.exit(0);
}

// Apply patches
if (!patch1Applied && !patch2Applied) {
  console.error('\n❌ No patches to apply');
  console.error('Patches may already be applied or version may have changed.');
  console.error('Run with --dry-run to see details.');
  process.exit(1);
}

// Create backup if it doesn't exist
if (!fs.existsSync(backupPath)) {
  console.log('\nCreating backup...');
  fs.copyFileSync(targetPath, backupPath);
  console.log(`✅ Backup created: ${backupPath}`);
}

console.log('\nApplying patches...');

// Apply Patch 1
if (patch1Applied) {
  content = content.replace(bannerSearchPattern, bannerReplacement);
  console.log('✅ Patch 1 applied: hGB function now returns null');
}

// Apply Patch 2
if (patch2Applied) {
  content = content.replace(thinkingSearchPattern, thinkingReplacement);
  console.log('✅ Patch 2 applied: thinking content forced visible');
}

// Write file
console.log('\nWriting patched file...');
fs.writeFileSync(targetPath, content, 'utf8');
console.log('✅ File written successfully\n');

console.log('Summary:');
console.log(`- Patch 1 (banner): ${patch1Applied ? 'APPLIED' : 'SKIPPED'}`);
console.log(`- Patch 2 (visibility): ${patch2Applied ? 'APPLIED' : 'SKIPPED'}`);
console.log('\n🎉 Patches applied! Please restart Claude Code for changes to take effect.');
console.log('\nTo restore original behavior, run: node patch-thinking.js --restore');
process.exit(0);
