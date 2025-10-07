const fs = require('fs');
const path = '/Users/aleks/.claude/local/node_modules/@anthropic-ai/claude-code/cli.js';

console.log('🔍 Reading cli.js...');
let content = fs.readFileSync(path, 'utf8');

// Patch 1: Remove Mr2 banner function (line ~1909)
const mr2SearchPattern = 'function Mr2({streamMode:A}){let[B,Q]=BY1.useState(null),[Z,G]=BY1.useState(null);if(BY1.useEffect(()=>{if(A==="thinking"&&B===null)Q(Date.now());else if(A!=="thinking"&&B!==null)G(Date.now()-B),Q(null)},[A,B]),A==="thinking")return RE.createElement(S,{marginTop:1},RE.createElement(E,{dimColor:!0},"∴ Thinking…"));if(Z!==null)return RE.createElement(S,{marginTop:1},RE.createElement(E,{dimColor:!0},"∴ Thought for ",Math.max(1,Math.round(Z/1000)),"s"," ",RE.createElement(E,{dimColor:!0,bold:!0},"(ctrl+o")," ","to show thinking)"));return null}';
const mr2Replacement = 'function Mr2({streamMode:A}){return null}';

// Patch 2: Make thinking content visible (line ~2212)
// Pattern: case"thinking":if(!K)return null;if(z)return null;return R8.createElement(S2B,{addMargin:B,param:A,isTranscriptMode:K});
const thinkingVisibilityPattern = 'case"thinking":if(!K)return null;if(z)return null;return R8.createElement(S2B,{addMargin:B,param:A,isTranscriptMode:K});';
const thinkingVisibilityReplacement = 'case"thinking":if(z)return null;return R8.createElement(S2B,{addMargin:B,param:A,isTranscriptMode:!0});';

console.log('🔧 Applying patches...');
console.log('');

let patchCount = 0;

// Apply Mr2 patch
if (content.includes(mr2SearchPattern)) {
  content = content.replace(mr2SearchPattern, mr2Replacement);
  console.log('✅ Patch 1/2: Removed Mr2 banner');
  patchCount++;
} else {
  console.log('⚠️  Patch 1/2: Mr2 pattern not found (may already be patched)');
}

// Apply thinking visibility patch
if (content.includes(thinkingVisibilityPattern)) {
  content = content.replace(thinkingVisibilityPattern, thinkingVisibilityReplacement);
  console.log('✅ Patch 2/2: Made thinking content visible');
  patchCount++;
} else {
  console.log('⚠️  Patch 2/2: Thinking visibility pattern not found (may already be patched)');
}

if (patchCount > 0) {
  fs.writeFileSync(path, content, 'utf8');
  console.log('');
  console.log(`✅ Successfully applied ${patchCount} patch(es)!`);
  console.log('');
  console.log('Changes made:');
  console.log('  1. Mr2 function now returns null (removes banner)');
  console.log('  2. Thinking content renders without transcript mode check');
  console.log('');
  console.log('Restart Claude Code to see thinking blocks visible inline.');
} else {
  console.error('');
  console.error('❌ No patches applied - patterns not found.');
  console.error('');
  console.error('This could mean:');
  console.error('  - Claude Code has been updated to a new version');
  console.error('  - The patches have already been applied');
  console.error('  - The file structure has changed');
  console.error('');
  console.error('You can restore the original file with:');
  console.error('  mv /Users/aleks/.claude/local/node_modules/@anthropic-ai/claude-code/cli.js.backup \\');
  console.error('     /Users/aleks/.claude/local/node_modules/@anthropic-ai/claude-code/cli.js');
  process.exit(1);
}
