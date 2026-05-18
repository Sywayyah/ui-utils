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

  addElem<const T extends typeof MiniUIBaseElement<unknown>>(
    elemType: T,
    params: T extends typeof MiniUIBaseElement<infer U> ? U : never,
    styles?: MiniUIElemCSSStyles,
  ): MiniUI {
    const newElem: MiniUIElem = {
      elem: new elemType(params),
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
    return this.flexRowHost().addElem(MiniUIText, text);
  },
};

export class MiniUIBaseElement<T> {
  constructor(readonly params: T) {}
}

// todo: define default components on class level?
export class MiniUIText extends MiniUIBaseElement<string> {}
export class MiniUIImage extends MiniUIBaseElement<{ readonly src: string }> {}
export class MiniUIButton extends MiniUIBaseElement<{ readonly src: string }> {}

miniUi.flexRowHost().addElem(MiniUIText, '').addElem(MiniUIImage, { src: '' });
