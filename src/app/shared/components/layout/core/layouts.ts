import { ReactiveValue } from '../../../../core/reactive/reactive-value';

export type PanelSize = number;

export type SideValue = number | null;

// probably only suitable for windows
export class WindowPanel {
  readonly width = new ReactiveValue<PanelSize>(100);
  readonly height = new ReactiveValue<PanelSize>(100);

  readonly minWidth = new ReactiveValue(100);
  readonly minHeight = new ReactiveValue(100);

  readonly left = new ReactiveValue<SideValue>(null);
  readonly top = new ReactiveValue<SideValue>(null);
  readonly right = new ReactiveValue<SideValue>(null);
  readonly bottom = new ReactiveValue<SideValue>(null);

  readonly order = new ReactiveValue<number>(0);

  constructor({
    height = 100,
    width = 100,
    right,
    top,
    left,
    bottom,
  }: {
    readonly height?: PanelSize;
    readonly width?: PanelSize;
    readonly right?: number;
    readonly left?: number;
    readonly top?: number;
    readonly bottom?: number;
  } = {}) {
    this.height.setValue(height);
    this.width.setValue(width);

    this.right.setValue(right ?? null);
    this.left.setValue(left ?? null);
    this.top.setValue(top ?? null);
    this.bottom.setValue(bottom ?? null);
  }

  updateDimensions(): void {
    const h = this.height.getValue();
    const w = this.width.getValue();
    const mh = this.minHeight.getValue();
    const mw = this.minWidth.getValue();

    if (h < mh) this.height.setValue(mh);
    if (w < mw) this.width.setValue(mw);
  }
}
