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
        nodeItemMapper: (node) =>
          new UINodeTypeSwitcher({
            parts: () => miniUi.textLabel('Unknown Node'),
            text: node.id,
          })
            .addCase(Resource, (n) => ({
              parts: () =>
                miniUi
                  .flexRowHost()
                  .addElem(
                    new MiniUIImage({
                      src: n.getInputValue('img').image?.objectUrl ?? 'no-img',
                    }),

                    { width: `20px`, height: `20px`, imageRendering: 'pixelated' },
                  )
                  .addElem(new MiniUIText(n.getInputValue('name'))),
              text: n.getInputValue('name'),
            }))
            .switchNode(node),
        resultParts: ({ node }) =>
          new UINodeTypeSwitcher(of(miniUi.textLabel('Unknown Node')))
            .addCase(Resource, (n) =>
              n.listenInputsValues().pipe(
                map((vals) =>
                  miniUi
                    .flexRowHost()
                    .addElem(
                      new MiniUIImage({
                        src: vals.img.image?.objectUrl ?? 'no-img',
                      }),
                      { width: `20px`, height: `20px`, imageRendering: 'pixelated' },
                    )
                    .addElem(new MiniUIText(vals.name)),
                ),
              ),
            )
            .switchNode(node),
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
      config: ScriptEditingContext.createScriptEditor({ types: `declare const appTitle: string;` }),
      uiParts: () => miniUi.textLabel('Script'),
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
    configs: [Resource, ResourceCost, Building, Spell, Folder],
    nodeRoots: {
      resources: { title: 'Resources', configs: [Folder, Resource] },
      units: { title: 'Units', configs: [Folder] },
      buildings: { title: 'Buildings', configs: [Folder, Building] },

      spells: {
        title: 'Spells',
        configs: [Spell],
      },
    },
    nodePreviewer: (node) =>
      new UINodeTypeSwitcher(of(miniUi.textLabel(node.getConfigName())))
        .addCase(Resource, (n) =>
          n.listenInputsValues().pipe(
            map((values) =>
              miniUi
                .flexRowHost()
                .addElem(new MiniUIText('Resource - '))
                .addElem(new MiniUIImage({ src: values.img.image?.objectUrl ?? '' }), {
                  width: '25px',
                  height: '25px',
                })
                .addElem(new MiniUIText(values.name || 'Unnamed')),
            ),
          ),
        )
        .switchNode(node),
  });
}
