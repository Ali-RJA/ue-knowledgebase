// Simple test to verify the parseLegoReferences logic
const parseLegoReferences = (languageStr) => {
  const match = /(\w+)(?:\[([^\]]+)\])?/.exec(languageStr);
  if (!match) {
    return { language: languageStr, legoPieces: [] };
  }

  const language = match[1];
  const legoStr = match[2];

  if (!legoStr) {
    return { language, legoPieces: [] };
  }

  const legoPieces = legoStr.split(',').map(piece => {
    const [slug, label] = piece.split('|');
    return { slug: slug.trim(), label: label?.trim() };
  });

  return { language, legoPieces };
};

// Test cases
console.log('Test 1: Multiple pieces');
const result1 = parseLegoReferences('cpp[superfunction,castt-safe-type-casting,findcomponentbyclass,fvector-math-basics]');
console.log('Language:', result1.language);
console.log('Pieces:', result1.legoPieces);
console.log('Count:', result1.legoPieces.length);

console.log('\nTest 2: Single piece');
const result2 = parseLegoReferences('cpp[uclass-generatedbody]');
console.log('Language:', result2.language);
console.log('Pieces:', result2.legoPieces);

console.log('\nTest 3: With label');
const result3 = parseLegoReferences('cpp[findcomponentbyclass|Find Component]');
console.log('Language:', result3.language);
console.log('Pieces:', result3.legoPieces);

console.log('\nTest 4: No pieces');
const result4 = parseLegoReferences('cpp');
console.log('Language:', result4.language);
console.log('Pieces:', result4.legoPieces);
