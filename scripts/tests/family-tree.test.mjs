import assert from 'node:assert/strict';
import test from 'node:test';
import { centuryOf, layoutPeople, NODE_W, NODE_H, YEAR_HEIGHT, splitTreeName, regionsOf } from '../../src/lib/family-tree-layout.ts';
const person = (id, year, parents = []) => ({ personId: id, displayName: `Иван Ампилогов ${id}`, timelineYear: year, parentIds: parents, places: [], sex: 'unknown', birthYear: '', life: { birth: '?', death: '?', age: '?' }, needsReview: false });
const directory = (people) => ({ people, range: { minYear: 1483, maxYear: 1950 } });
test('century boundaries include the last year and stop at the public range', () => {
  assert.deepEqual([1500, 1501, 1600, 1601, 1900, 1901, 1950].map(centuryOf), [15,16,16,17,19,20,20]);
});
test('preserves full documented names and surname spelling', () => {
  assert.deepEqual(splitTreeName('Елена Матвеевна Ампилогова'), { surname: 'Ампилогова', givenName: 'Елена Матвеевна' });
  assert.deepEqual(splitTreeName('Онпилоговъ Иван'), { surname: 'Онпилоговъ', givenName: 'Иван' });
  assert.equal(splitTreeName('Терентий, отец Павла Анфилогова').surname, '');
  assert.equal(splitTreeName('Иван Антилогов').surname, 'Антилогов');
  assert.equal(splitTreeName('Анфилог Иванов сын Констянтинова').givenName, 'Анфилог Иванов сын Констянтинова');
});
test('church dedications cannot assign a person to another region', () => {
  assert.deepEqual(regionsOf(['Михайло-Архангельская церковь, Оренбург', 'Казанско-Богородицкая церковь города Оренбурга']), ['Оренбургский регион']);
  assert.deepEqual(regionsOf(['Место не установлено']), ['Регион не уточнён']);
  assert.deepEqual(regionsOf(['Курская губерния', 'Орловский уезд']), ['Курский регион', 'Орловский регион']);
});
test('crowded isolated people stay at their known date rather than drifting centuries', () => {
  const scene = layoutPeople(directory(Array.from({length: 100}, (_, i) => person(`p${i}`, 1650))));
  assert.equal(scene.people.length, 100);
  assert.ok(scene.people.every(p => p.y === 70 + (1650 - 1483) * YEAR_HEIGHT));
  assert.equal(new Set(scene.people.map(p => p.x)).size, 100);
});
test('connected cards do not overlap and children remain below parents', () => {
  const scene = layoutPeople(directory([person('a', 1700), person('b', 1700), person('c', 1720, ['a','b']), person('d', 1720, ['a','b']), person('e', 1730, ['c']), person('f', null, ['d'])]));
  const byId = new Map(scene.people.map(p => [p.personId,p]));
  for (const p of scene.people) {
    for (const id of p.parentIds) assert.ok(p.y >= byId.get(id).y + NODE_H);
    for (const q of scene.people) if (p !== q) assert.ok(Math.abs(p.x-q.x) >= NODE_W || Math.abs(p.y-q.y) >= NODE_H, `${p.personId} overlaps ${q.personId}`);
  }
  assert.equal(byId.get('f').timelineYear, null, 'visual estimates must not become documented dates');
});
