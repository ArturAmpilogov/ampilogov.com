import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import * as layout from '../../src/lib/family-tree-layout.ts';

const require = createRequire(import.meta.url);
const componentCode = ts.transpileModule(fs.readFileSync(new URL('../../src/components/family-tree.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;

// Defer React state updaters until after pointerup/cancel to reproduce the
// scheduling order from the reported crash, using the actual component handlers.
for (const endEvent of ['onPointerUp', 'onPointerCancel']) {
  test(`queued movement is safe after ${endEvent} clears the drag`, () => {
    const states = [], queued = [];
    const react = {
      useState(initial) {
        const index = states.length;
        states.push(typeof initial === 'function' ? initial() : initial);
        return [states[index], update => queued.push(() => { states[index] = typeof update === 'function' ? update(states[index]) : update; })];
      },
      useMemo: factory => factory(), useCallback: callback => callback,
      useRef: current => ({ current }), useEffect() {},
    };
    const module = { exports: {} };
    vm.runInNewContext(componentCode, {
      module, exports: module.exports,
      require: id => id === 'react' ? react : id === '@/lib/family-tree-layout' ? layout : id === 'next/link' ? { default: 'a', __esModule: true } : require(id),
    });
    const tree = module.exports.FamilyTree({ directory: { people: [], range: { minYear: 1483, maxYear: 1950 } } });
    const viewport = tree.props.children.find(child => child?.props?.className === 'tree-viewport');
    const initial = { ...states[0] };
    viewport.props.onPointerDown({ target: { closest: () => null }, button: 0, pointerId: 1, clientX: 100, clientY: 200, currentTarget: { setPointerCapture() {} } });
    viewport.props.onPointerMove({ clientX: 150, clientY: 220 });
    viewport.props.onPointerMove({ clientX: 180, clientY: 260 });
    viewport.props[endEvent]();
    viewport.props.onPointerMove({ clientX: 999, clientY: 999 });
    assert.equal(queued.length, 2, 'movement after releasing the pointer must be ignored');
    assert.doesNotThrow(() => queued.forEach(apply => apply()));
    assert.equal(states[0].x, initial.x + 80);
    assert.equal(states[0].y, initial.y + 60);
    assert.equal(states[0].scale, initial.scale);
  });
}
