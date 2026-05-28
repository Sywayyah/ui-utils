import { of } from 'rxjs';
import { miniUi, MiniUINodeInput, MiniUIText } from '../../mini-ui/mini-ui';
import { PrimitiveEditingContext } from '../../nodes/editing-context/primitives';
import { createRootConfig, RootStyle } from '../../nodes/node-roots';
import { UINodeTypeSwitcher } from '../../nodes/nodes-switcher';

export namespace GUIScript {
  export const rootConfig = createRootConfig({
    idPrefix: 'guis',
    style: RootStyle.Inline,
    getInlineUI: ({ node, editor }) => {
      return new UINodeTypeSwitcher(of(miniUi.textLabel('Unknown Node')))
        .addCase(Core.Identifier, (n) =>
          of(
            miniUi
              .flexRowHost()
              .addElem(new MiniUIText('Funciton'))
              .addElem(new MiniUINodeInput({ node: n, inputName: 'id', editor })),
          ),
        )
        .addCase(Core.Expression, (n) => of(miniUi.textLabel('Expression')))
        .switchNode(node);
    },
  });

  export namespace Core {
    export const Identifier = rootConfig.createNodeConfig({
      id: 'core.id',
      name: 'Identifier',
      inputs: {
        id: {
          config: PrimitiveEditingContext.createText({ initVal: '' }),
          uiParts: () => miniUi.textLabel('Identifier'),
        },
      },
    });

    export const Expression = rootConfig.createNodeConfig({
      id: 'core.expr',
      name: 'Expression',
      inputs: {},
    });
  }

  export namespace FlowControl {}

  export namespace Declarations {}

  export namespace Operators {}
}
