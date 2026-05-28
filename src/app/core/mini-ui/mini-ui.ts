import { UINode } from '../nodes/node';
import { UINodeConfig } from '../nodes/node-config';
import { UINodesEditor } from '../nodes/nodes-editor';
import { ReactiveList } from '../reactive/reactive-list';

export interface MiniUIElem<T extends MiniUIBaseElement<unknown> = MiniUIBaseElement<unknown>> {
  readonly elem: T;
  readonly styles?: MiniUIElemCSSStyles;
  // tag to be referenced by, implement later
  readonly tag?: string;
}

type MiniUIElemCSSStyles = Partial<CSSStyleDeclaration>;

interface MiniUIParams {
  readonly hostStyles?: MiniUIElemCSSStyles;
}

export class MiniUI {
  readonly elems = new ReactiveList<MiniUIElem>();
  private lastElem?: MiniUIElem;

  constructor(readonly params: MiniUIParams) {}

  addElem<T extends MiniUIBaseElement<unknown>>(elem: T, styles?: MiniUIElemCSSStyles): MiniUI {
    const newElem: MiniUIElem = {
      elem,
      styles,
    };

    this.elems.push(newElem);

    this.lastElem = newElem;

    return this;
  }
}

export const miniUi = {
  flexRowHost(params: { readonly styles?: MiniUIElemCSSStyles } = {}): MiniUI {
    return new MiniUI({
      hostStyles: { display: 'flex', alignItems: 'center', gap: '4px', ...params.styles },
    });
  },
  skipHost(): MiniUI {
    return new MiniUI({ hostStyles: { display: 'contents' } });
  },
  textLabel(text: string): MiniUI {
    return this.flexRowHost().addElem(new MiniUIText(text));
  },
  nodeInput<const K extends keyof T['inputs'], const T extends UINodeConfig>(params: {
    readonly node: UINode<T>;
    readonly inputName: K;
    readonly editor: UINodesEditor;
  }): MiniUI {
    return this.flexRowHost().addElem(new MiniUINodeInput(params));
  },
};

export class MiniUIBaseElement<T> {
  constructor(readonly params: T) {}
}

// todo: define default components on class level?
export class MiniUIText extends MiniUIBaseElement<string> {}
export class MiniUIImage extends MiniUIBaseElement<{ readonly src: string }> {}
export class MiniUIButton extends MiniUIBaseElement<{ readonly src: string }> {}
export class MiniUINodeInput<
  const K extends keyof T['inputs'],
  const T extends UINodeConfig,
> extends MiniUIBaseElement<{
  readonly node: UINode<T>;
  readonly inputName: K;
  readonly editor: UINodesEditor;
}> {}
