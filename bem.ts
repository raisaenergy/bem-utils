const NS_SEPARATOR = '-';
const ELEMENT_SEPARATOR = '__';
const MODIFIER_SEPARATOR = '--';

type ClassNames = ((param: boolean | string | undefined) => ClassNames) & { $: string } & {
  name: ClassNames;
  length: ClassNames;
  [key: string]: ClassNames;
};

/**
 * Dummy object to be wrapped with proxy.
 * in order to use ProxyApi
 */
const DUMMY_TARGET = function (this: ClassNames, param: boolean) {
  return this;
} as ClassNames;

export function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

export function bem(nameSpace = '') {
  return _bem([nameSpace || '']);
}

const cache: any = {};

function _bem(segments: string[]): ClassNames {
  function print() {
    const len = segments.length;
    if (len < 2) throw Error('At least block should be provided');

    const key = segments.join(',');
    let classes = cache[key];

    if (classes === undefined) {
      const _segments = segments.map(toKebabCase);
      classes = _segments[0];
      classes += classes.length > 0 ? NS_SEPARATOR : '';
      classes += _segments[1];

      if (len > 2 && _segments[2] !== '_') {
        classes += ELEMENT_SEPARATOR + _segments[2];
      }

      if (len > 3) {
        let modPrefix = ' ' + classes + MODIFIER_SEPARATOR;
        for (let i = 3; i < len; i++) {
          classes += modPrefix + _segments[i];
        }
      }

      cache[key] = classes;
    }

    return classes;
  }

  return new Proxy<ClassNames>(DUMMY_TARGET, {
    get: (t: any, prop: any) => {
      /**
       * in case it is needed to be changed to string
       * this is called when toString is called (inside string literal or when adding a string to the proxy itself)
       */
      if (prop === Symbol.toPrimitive) return print;
      return prop === '$' ? print() : _bem([...segments, prop]);
    },
    apply: (_: any, __: any, [param]: (boolean | string | undefined)[]) => {
      /**
       * if the last segment was toString, then just call print
       */
      const len = segments.length;
      const prevSegs = segments.slice(0, len - 1);
      if (segments[len - 1] === 'toString') {
        segments = prevSegs;
        return print();
      }
      /**
       * if number of segments less than 3 means no modifier and apply is ignored
       */
      if (len <= 3) {
        return _bem(segments);
      }
      /**
       * if param is of type string consider it as a dynamic modifier
       */

      if (typeof param === 'string') {
        return _bem([...prevSegs, param]);
      }
      /**
       * if all the above pass this means it is a modifier [namespace, block, element, ...modifiers]
       * ignores function calls in block/element
       *
       * .modifier(true) calls get and apply
       * 1. .modifier triggers get => adds a segment
       * 2. (true) triggers apply => check if it is a function call returning false then remove the added segments
       *      else: return segments list as is
       */
      return !param ? _bem(prevSegs) : _bem(segments);
    },
  });
}

function toKebabCase(name: string) {
  let result = cache[name];
  if (result === undefined) cache[name] = result = name.replace(/([^A-Z])([A-Z])/g, '$1-$2').toLowerCase();
  return result;
}
