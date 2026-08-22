import { ReactiveList } from '../reactive/reactive-list';

export class Grid2D<T> {
  readonly state = new ReactiveList<T[]>();

  get cells(): T[][] {
    return this.state.getValue();
  }

  constructor(
    readonly params: { readonly width: number; readonly height: number; cellGenerator(): T },
  ) {
    this.state.setValue(
      Array.from({ length: params.height }, (_, i) =>
        Array.from({ length: params.width }, () => params.cellGenerator()),
      ),
    );
  }

  getXYCell(x: number, y: number): T {
    return this.cells[y][x];
  }
}
