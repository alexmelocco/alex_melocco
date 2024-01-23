import { data } from './types';
import fs from 'fs';

// Use getData() to access the data
function getData() {
  const JSONData = fs.readFileSync('./export.json');
  return JSON.parse(String(JSONData));
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
function setData(newData: data) {
  const data = JSON.stringify(newData);
  fs.writeFileSync('./export.json', data, { flag: 'w' });
}

export { getData, setData };
