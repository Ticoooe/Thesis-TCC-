const fs = require('fs');
const path = require('path');

const LIMIT = 8000;

const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const freqRaw = fs.readFileSync('frequency-words.txt', 'utf-8');
const freqWords = freqRaw
  .split('\n')
  .map(line => line.trim().split(' '))
  .filter(parts => parts.length >= 2)
  .map(([word, rank]) => ({ word: word.toLowerCase(), rank: Number(rank) }))
  .filter(item => Number.isFinite(item.rank) && item.rank > 0 && item.rank <= LIMIT);

const dictRaw = fs.readFileSync('pt_BR.dic', 'utf-8');
const dictWords = dictRaw
  .split('\n')
  .map(line => line.split('/')[0])
  .filter(Boolean)
  .filter(word => word === word.toLowerCase())
  .filter(word => /^[a-záàâãéêíóôõúç]+$/.test(word));
const dictSet = new Set(dictWords.map(normalize));

const answersPath = path.join('ninho-tech','src','lib','utils','answers.js');
const answersContent = fs.readFileSync(answersPath,'utf-8');
const answersArray = JSON.parse(answersContent.replace('export default','').trim().replace(/;$/,''));

const disallowedWords = new Set(['aaaah','xanax','aaron','abbey','about']);
const disallowedPrefixes = ['mc','mr','dr','sr','sra'];

const isValid = (word) => {
  if (word.length !== 5) return false;
  if (!/^[a-z]+$/.test(word)) return false;
  if (disallowedWords.has(word)) return false;
  if (disallowedPrefixes.some((p) => word.startsWith(p))) return false;
  if (!dictSet.has(word)) return false;
  return true;
};

const allowedSet = new Set();

for (const { word } of freqWords) {
  const plain = normalize(word);
  if (isValid(plain)) {
    allowedSet.add(plain);
  }
}

for (const word of answersArray) {
  const plain = normalize(word);
  if (plain.length === 5 && /^[a-z]+$/.test(plain)) {
    allowedSet.add(plain);
  }
}

const allowed = Array.from(allowedSet).sort();
const fileContent = `export default ${JSON.stringify(allowed, null, 2)};`;

fs.writeFileSync(path.join('ninho-tech','src','lib','utils','allowedGuesses.js'), fileContent);

console.log('allowed words:', allowed.length);
