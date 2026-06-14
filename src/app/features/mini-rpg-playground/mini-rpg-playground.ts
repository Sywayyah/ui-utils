import { Component } from '@angular/core';
import { map, of } from 'rxjs';
import { miniUi, MiniUIImage, MiniUIText } from '../../core/mini-ui/mini-ui';
import { DropdownEditingContext } from '../../core/nodes/editing-context/dropdown';
import { ImageFileEditingContext } from '../../core/nodes/editing-context/image-file';
import { NestedNodeEditingContext } from '../../core/nodes/editing-context/nested-node';
import { NodeRefEditingContext } from '../../core/nodes/editing-context/node-ref';
import { PrimitiveEditingContext } from '../../core/nodes/editing-context/primitives';
import { ScriptEditingContext } from '../../core/nodes/editing-context/script';
import { createNodeConfig } from '../../core/nodes/node-config';
import { UINodesEditor } from '../../core/nodes/nodes-editor';
import { UINodeTypeSwitcher } from '../../core/nodes/nodes-switcher';
import { Btn } from '../../shared/components/btn/btn';
import { NodeEditor } from '../../shared/components/node/node-editor/node-editor';

const Resource = createNodeConfig({
  id: 'resource',
  name: 'Resource',
  inputs: {
    name: {
      uiParts: () => miniUi.textLabel('Name'),
      config: PrimitiveEditingContext.createText({ initVal: '' }),
    },
    img: {
      uiParts: () => miniUi.textLabel('Picture'),
      config: ImageFileEditingContext.create(),
    },
    description: {
      uiParts: () => miniUi.textLabel('Description'),
      config: PrimitiveEditingContext.createText({ initVal: '' }),
    },
  },
});

const ResourceCost = createNodeConfig({
  id: 'resource-cost',
  name: 'Resource Cost',
  inputs: {
    resource: {
      uiParts: () => miniUi.textLabel('Resource'),
      config: NodeRefEditingContext.create({
        pickerTitle: 'Select Resource',
        picker: ({ editor }) => editor.getNodesByConfig(Resource),
      }),
    },
    amount: {
      uiParts: () => miniUi.textLabel('Amount'),
      config: PrimitiveEditingContext.createNumber({ initVal: 0 }),
    },
  },
});

const Building = createNodeConfig({
  id: 'building',
  name: 'Building',
  inputs: {
    name: {
      uiParts: () => miniUi.textLabel('Building Name'),
      config: PrimitiveEditingContext.createText({ initVal: '' }),
    },
    img: {
      uiParts: () => miniUi.textLabel('Picture'),
      config: ImageFileEditingContext.create(),
    },
    description: {
      uiParts: () => miniUi.textLabel('Description'),
      config: PrimitiveEditingContext.createText({ initVal: '' }),
    },
    buildTimeSeconds: {
      uiParts: () => miniUi.textLabel('Building Time (Seconds)'),
      config: PrimitiveEditingContext.createNumber({ initVal: 30 }),
    },
    type: {
      uiParts: () => miniUi.textLabel('Type'),
      config: DropdownEditingContext.create({
        items: [
          { type: 'town center', label: 'Town Center' },
          { type: 'market', label: 'Market' },
        ],
        getValue: (params) => params.item.type,
        getItem: ({ items, value }) => items.find((item) => item.type === value)!,
        getItemParts: (item) => miniUi.textLabel(`Selected - ${item.label}`),
        getTriggerParts: (item) => miniUi.textLabel(`${item.label}`),
      }),
    },
    cost: {
      uiParts: () => miniUi.textLabel('Cost'),
      multi: true,
      config: NestedNodeEditingContext.create([ResourceCost], ResourceCost),
    },
  },
});

const Folder = createNodeConfig({
  id: 'folder',
  name: 'Folder',
  inputs: {},
  options: { canHaveChildren: true },
});

const Spell = createNodeConfig({
  id: 'spell',
  name: 'Spell',
  inputs: {
    name: {
      config: PrimitiveEditingContext.createText({ initVal: 'Name' }),
      uiParts: () => miniUi.textLabel('Name'),
    },
    code: {
      config: ScriptEditingContext.createScriptEditor({
        types: `
        declare const appTitle: string;
         interface SpellHandler {
          onSpellTargeted(): void;
        }
        `,
        initialScript: [
          '// do not remove this constant or method',
          '// game expects them to be present in order to work',
          'const spellHandler: SpellHandler = {',
          '  onSpellTargeted(): void {',
          '  }',
          '};',
        ].join('\n'),
      }),
      uiParts: () => miniUi.textLabel('Script'),
    },
  },
});

const Unit = createNodeConfig({
  id: 'unit',
  name: 'Unit',
  inputs: {
    name: {
      config: PrimitiveEditingContext.createText({ initVal: '' }),
      uiParts: () => miniUi.textLabel('Name'),
    },
    img: {
      config: ImageFileEditingContext.create(),
      uiParts: () => miniUi.textLabel('Image'),
    },
    cost: {
      config: NestedNodeEditingContext.create([ResourceCost], ResourceCost),
      uiParts: () => miniUi.textLabel('Resources Cost'),
      multi: true,
    },
    spells: {
      uiParts: () => miniUi.textLabel('Spells'),
      multi: true,
      config: NodeRefEditingContext.create({
        picker({ editor }) {
          return editor.getNodesByConfig(Spell);
        },
      }),
    },
  },
});

@Component({
  selector: 'app-mini-rpg-playground',
  imports: [NodeEditor, Btn],
  templateUrl: './mini-rpg-playground.html',
  styleUrl: './mini-rpg-playground.scss',
})
export class MiniRpgPlayground {
  readonly editor = new UINodesEditor({
    configs: [Resource, ResourceCost, Building, Spell, Folder, Unit],
    nodeRoots: {
      resources: { title: 'Resources', configs: [Folder, Resource] },
      units: { title: 'Units', configs: [Folder, Unit] },
      buildings: { title: 'Buildings', configs: [Folder, Building] },

      spells: {
        title: 'Spells',
        configs: [Spell],
      },
    },
    nodePreviewer: (node) =>
      new UINodeTypeSwitcher({
        parts: miniUi.textLabel(node?.getConfigName() ?? 'No Value'),
        text: '',
      })
        .addCase(Spell, (n) => ({
          parts: miniUi.flexRowHost().addElem(new MiniUIText('Spell - ' + n.getInputValue('name'))),
          text: 'Spell ' + n.getInputValue('name'),
        }))
        .addCase(Building, (n) => ({
          parts: miniUi
            .flexRowHost()
            .addElem(new MiniUIText('Building - '))
            .addElem(new MiniUIImage({ src: n.getInputValue('img').image?.objectUrl ?? '' }), {
              width: '25px',
              height: '25px',
            })
            .addElem(new MiniUIText(n.getInputValue('name'))),
          text: 'Building ' + n.getInputValue('name'),
        }))
        .addCase(Unit, (n) => ({
          parts: miniUi
            .flexRowHost()
            .addElem(new MiniUIText('Unit - '))
            .addElem(new MiniUIImage({ src: n.getInputValue('img').image?.objectUrl ?? '' }), {
              width: '25px',
              height: '25px',
            })
            .addElem(new MiniUIText(n.getInputValue('name'))),
          text: 'Unit ' + n.getInputValue('name'),
        }))
        .addCase(Resource, (n) => ({
          text: 'Resource ' + n.getInputValue('name'),
          parts: miniUi
            .flexRowHost()
            .addElem(new MiniUIText('Resource - '))
            .addElem(new MiniUIImage({ src: n.getInputValue('img').image?.objectUrl ?? '' }), {
              width: '25px',
              height: '25px',
            })
            .addElem(new MiniUIText(n.getInputValue('name') || 'Unnamed')),
        }))
        .switchNode(node),
  });
}
