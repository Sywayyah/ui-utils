import { map, of } from 'rxjs';
import { miniUi } from '../core/mini-ui/mini-ui';
import { DropdownEditingContext } from '../core/nodes/editing-context/dropdown';
import { ImageFileEditingContext } from '../core/nodes/editing-context/image-file';
import { NestedNodeEditingContext } from '../core/nodes/editing-context/nested-node';
import { NodeRefEditingContext } from '../core/nodes/editing-context/node-ref';
import { PrimitiveEditingContext } from '../core/nodes/editing-context/primitives';
import { createNodeConfig } from '../core/nodes/node-config';
import { UINodeTypeSwitcher } from '../core/nodes/nodes-switcher';

export const BasicNode = createNodeConfig({
  id: 'std.new',
  name: 'Basic',
  inputs: {
    gold: {
      config: PrimitiveEditingContext.createNumber({ initVal: 0 }),
      multi: true,
      canDisable: true,
      uiParts: () => miniUi.textLabel('Gold'),
    },
    name: {
      config: PrimitiveEditingContext.createText({ initVal: '' }),
      uiParts: () => miniUi.textLabel('Name'),
    },
  },
});

export const OptionalsNode = createNodeConfig({
  id: 'std.optionals',
  name: 'Optionals',
  inputs: {
    speed: {
      config: PrimitiveEditingContext.createNumber({ initVal: 5 }),
      uiParts: () => miniUi.textLabel('Speed'),
    },
    rolls: {
      config: PrimitiveEditingContext.createNumber({ initVal: 2 }),
      multi: true,
      optional: true,
      uiParts: () => miniUi.textLabel('Rolls'),
    },
    attack: {
      config: PrimitiveEditingContext.createNumber({ initVal: 3 }),
      optional: true,
      uiParts: () => miniUi.textLabel('Attack'),
    },
    damageType: {
      config: PrimitiveEditingContext.createText({ initVal: 'Magic' }),
      optional: true,
      uiParts: () => miniUi.textLabel('Damage Type'),
    },
  },
});

export const AnotherNode = createNodeConfig({
  id: 'std.another',
  name: 'Another',
  inputs: {
    damageType: {
      uiParts: () => miniUi.textLabel('Damage Type'),
      config: DropdownEditingContext.create({
        items: [
          { id: 'magic', label: 'Magical' },
          { id: 'phys', label: 'Physical' },
          { id: 'ligh', label: 'Lightning' },
        ] as const,
        getItem: ({ items, value }) => items.find((item) => item.id === value)!,
        getItemParts: (item) => miniUi.textLabel(`Type - ${item.label}`),
        getTriggerParts: (item) => miniUi.textLabel(`Selected Type - ${item.label}`),
        getValue: ({ item }) => item.id,
        getDefaultValue: (items) => items.find((item) => item.id === 'phys'),
      }),
    },
    gold: {
      config: PrimitiveEditingContext.createNumber({ initVal: 0 }),
      multi: true,
      uiParts: () => miniUi.textLabel('Gold'),
    },
    check: {
      config: PrimitiveEditingContext.createCheckbox({ initVal: true }),
      uiParts: () => miniUi.textLabel('Check'),
    },
    bools: {
      config: PrimitiveEditingContext.createCheckbox({ initVal: false }),
      multi: true,
      uiParts: () => miniUi.textLabel('Booleans'),
    },
    picker: {
      multi: true,
      canDisable: true,
      config: NodeRefEditingContext.create({
        picker: ({ editor }) => editor.getNodesByConfig(BasicNode),
        // todo: in future can try to create util on top of this implementation to hide some implementation details
        nodeItemMapper: (node) => ({
          parts: () => {
            const switcher = new UINodeTypeSwitcher(
              miniUi.textLabel(`Unknown node, ${node.getConfigId()}`),
            );

            switcher.addCase(BasicNode, (n) => {
              return miniUi.textLabel(`Basic Node: ${n.getInputValue('name')}`);
            });

            return switcher.switchNode(node);
          },
          text: node.id,
        }),
        resultParts: ({ node }) =>
          new UINodeTypeSwitcher(of(miniUi.textLabel('Unknown Node')))
            .addCase(BasicNode, (n) =>
              n
                .listenInputsValues()
                .pipe(
                  map((inputValues) =>
                    miniUi.textLabel(
                      `Items ${inputValues.name}: Gold ${inputValues.gold.length}, total: ${inputValues.gold.reduce((acc, next) => acc + next, 0)}`,
                    ),
                  ),
                ),
            )
            .switchNode(node),
      }),

      uiParts: () => miniUi.textLabel('Node Picker'),
    },
    props: {
      uiParts: () => miniUi.textLabel('Properties'),
      multi: true,
      config: NestedNodeEditingContext.create([OptionalsNode, BasicNode], OptionalsNode),
    },
    img: {
      config: ImageFileEditingContext.create(),
      uiParts: () => miniUi.textLabel('Picture'),
    },
  },
});
