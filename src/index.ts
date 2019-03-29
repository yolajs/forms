import { useState, useCallback } from "react";
import { produce, Draft, isDraftable } from "immer";

type Accessor<T, P> = (p: T) => P;
type Modifier<T> = (s: Draft<T>) => any;

type FormProps<T> = (<P>(
  accessor: Accessor<T, P>
) => {
  value: P;
  onChange: (event: Event) => void;
}) & {
  fn: (m: Modifier<T>) => void;
};

export function useForm<T extends object>(
  initialValues: T
): [T, FormProps<T>, (() => void)] {
  const [values, setValues] = useState(initialValues);
  const props: FormProps<T> = Object.assign(
    <P>(accessor: Accessor<T, P>) => {
      return {
        value: accessor(values),
        onChange: (event: Event) => {
          const newValue = (event.currentTarget as HTMLInputElement).value;
          setValues(state => {
            return produce(state, draft => {
              const proxy = createProxy(draft as T);
              accessor(proxy)[primitiveSymbol].set(newValue);
            });
          });
        }
      };
    },
    {
      fn: useCallback(
        (modifier: Modifier<T>) => {
          setValues(state => {
            return produce(state, draft => {
              modifier(draft);
            });
          });
        },
        [setValues]
      )
    }
  );

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues, setValues]);

  return [values, props, reset];
}

const primitiveSymbol = Symbol();

export function createProxy<T extends object>(
  draft: T
): T & { [primitiveSymbol]: any } {
  return new Proxy(draft, {
    get(target: any, prop) {
      const gs = {
        set(setValue: any) {
          target[prop] = setValue;
        },
        get() {
          return target[prop];
        }
      };

      if (prop === primitiveSymbol) {
        return gs;
      }
      if (!isDraftable(target[prop])) {
        return {
          [primitiveSymbol]: gs
        };
      } else {
        return createProxy(target[prop]);
      }
    }
  });
}
