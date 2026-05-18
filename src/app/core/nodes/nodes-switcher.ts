import { UINodeConfig } from './node-config';
import { UINode } from './node';

type UINodeResultGetter<C extends UINodeConfig, R = void, Ctx extends object | void = void> = (
  n: UINode<C>,
  context: Ctx,
) => R;

export class UINodeTypeSwitcher<R = void, Ctx extends object | void = void> {
  private readonly casesMap = new Map<
    UINodeConfig,
    UINodeResultGetter<UINodeConfig, R, Ctx>
  >();

  constructor(private readonly fallbackValue: R) {}

  addCase<const C extends UINodeConfig>(
    config: C,
    get: UINodeResultGetter<C, R, Ctx>,
  ): UINodeTypeSwitcher<R, Ctx> {
    if (this.casesMap.has(config)) {
      console.warn(`Node Switcher: case for ${config.id} is already registered`);
    }
    this.casesMap.set(config, get as UINodeResultGetter<any, R, Ctx>);

    return this;
  }

  switchNode(node: UINode<any> | undefined | null, context: Ctx): R {
    if (!node) return this.fallbackValue;

    return this.casesMap.get(node.config.getValue())?.(node, context) ?? this.fallbackValue;
  }

  switchNodes(nodes: UINode[], context: Ctx): R[] {
    return nodes.map((node) => this.switchNode(node, context));
  }
}
