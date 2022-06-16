import { bem } from '.';

describe('convert to string', () => {
  const block = bem().blockName;

  test('block with $', () => {
    expect(block.$).toBe('block-name');
  });

  test('block string concat', () => {
    expect('' + block).toBe('block-name');
  });

  test('block string interpolation', () => {
    expect(`${block}`).toBe('block-name');
  });

  test('block toString', () => {
    expect(block.toString()).toBe('block-name');
  });
});

describe('without name space', () => {
  const block = bem().block;

  test('block', () => {
    expect(block.$).toBe('block');
  });

  test('block element', () => {
    expect(block.element.$).toBe('block__element');
  });

  test('block element2', () => {
    expect(block.name.$).toBe('block__name');
  });

  test('block element modifier', () => {
    expect(block.element.mod.$).toBe('block__element block__element--mod');
  });

  test('block element modifiers', () => {
    expect(block.element.modX.modY.$).toBe('block__element block__element--mod-x block__element--mod-y');
  });

  test('block element conditional modifiers', () => {
    expect(block.element.modX(false).modY(true).$).toBe('block__element block__element--mod-y');
  });

  test('block modifiers', () => {
    expect(block._.modX.modY.$).toBe('block block--mod-x block--mod-y');
  });

  test('block conditional modifiers', () => {
    expect(block._.modX(false).modY(true).$).toBe('block block--mod-y');
  });
});

describe('with name space', () => {
  const block = bem('moduleA').block;

  test('name space block', () => {
    expect(block.$).toBe('module-a-block');
  });

  test('name space block element', () => {
    expect(block.element.$).toBe('module-a-block__element');
  });

  test('name space block element modifier', () => {
    expect(block.element.mod.$).toBe('module-a-block__element module-a-block__element--mod');
  });

  test('name space block element modifiers', () => {
    expect(block.element.modX.modY.$).toBe(
      'module-a-block__element module-a-block__element--mod-x module-a-block__element--mod-y'
    );
  });

  test('name space block element conditional modifiers', () => {
    expect(block.element.modX(false).ModY(true).$).toBe('module-a-block__element module-a-block__element--mod-y');
  });

  test('name space block element conditional modifiers as a string', () => {
    expect(block.element.modX(false).modY('BlueWhale').$).toBe(
      'module-a-block__element module-a-block__element--blue-whale'
    );
  });

  test('name space block modifiers', () => {
    expect(block._.modX.modY.$).toBe('module-a-block module-a-block--mod-x module-a-block--mod-y');
  });

  test('name space block conditional modifiers', () => {
    expect(block._.modX(false).modY(true).$).toBe('module-a-block module-a-block--mod-y');
  });
});

describe('performancee', () => {
  test('performance test', () => {
    const $ = bem('moduleA');
    const result: any = {};
    for (let i = 0; i < 1000_000; i++) {
      const cond1 = i % 3 === 0;
      const cond2 = i % 5 === 0;
      result[`${cond1}-${cond2}`] = $.block.element.modX(cond1).modY(cond2).$;
    }
    expect(result).toStrictEqual({
      'false-false': 'module-a-block__element',
      'true-false': 'module-a-block__element module-a-block__element--mod-x',
      'false-true': 'module-a-block__element module-a-block__element--mod-y',
      'true-true': 'module-a-block__element module-a-block__element--mod-x module-a-block__element--mod-y',
    });
  });
});
