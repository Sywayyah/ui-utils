import { describe, expectTypeOf, it } from 'vitest';
import { UINode } from '../core/nodes/node';
import { ContextProperty } from '../core/nodes/node-input-context';
import { UINodesEditor } from '../core/nodes/nodes-editor';
import { UINodeTypeSwitcher } from '../core/nodes/nodes-switcher';
import { AnotherNode, BasicNode, OptionalsNode } from './node-test-configs';
import { NodeRefValue } from '../core/nodes/editing-context/node-ref';

describe('test types', () => {
  it('should test types', async () => {
    const n = await UINode.createNew({ config: BasicNode });
    const n2 = await UINode.createNew({ config: AnotherNode });
    const n3 = await UINode.createNew({ config: OptionalsNode });

    const switchedValue = new UINodeTypeSwitcher<number, { editor: UINodesEditor }>(0)
      .addCase(AnotherNode, (n, { editor }) =>
        n.getInputValue('gold').reduce((prev, next) => prev + next),
      )
      .addCase(BasicNode, (n) => n.getInputValue('name').length)
      .switchNode(n, { editor: new UINodesEditor({ configs: [] }) });

    expectTypeOf<typeof switchedValue>().toEqualTypeOf<number>();

    const itemId = n2.getInputValue('damageType').item.id;
    expectTypeOf<typeof itemId>().toEqualTypeOf<'phys' | 'magic' | 'ligh'>();
    expectTypeOf<typeof itemId>().not.toEqualTypeOf<number>();
    expectTypeOf<typeof itemId>().not.toExtend<'any string'>();
    expectTypeOf<typeof itemId>().not.toBeAny();
    expectTypeOf<typeof itemId>().not.toBeUnknown();
    expectTypeOf<typeof itemId>().not.toBeNever();

    const rollsOptionalArray = n3.getInputValue('rolls');
    expectTypeOf<typeof rollsOptionalArray>().toEqualTypeOf<number[] | undefined>();
    expectTypeOf<typeof rollsOptionalArray>().toBeNullable();
    expectTypeOf<typeof rollsOptionalArray>().not.toBeAny();
    expectTypeOf<typeof rollsOptionalArray>().not.toBeUnknown();
    expectTypeOf<typeof rollsOptionalArray>().not.toBeNever();

    rollsOptionalArray?.forEach((roll) => {
      expectTypeOf<typeof roll>().toEqualTypeOf<number>();
      expectTypeOf<typeof roll>().not.toBeAny();
      expectTypeOf<typeof roll>().not.toBeUnknown();
      expectTypeOf<typeof roll>().not.toBeNever();
    });

    const damageTypeText = n3.getInputValue('damageType');
    expectTypeOf<typeof damageTypeText>().toEqualTypeOf<string | undefined>();
    expectTypeOf<typeof damageTypeText>().toBeNullable();
    expectTypeOf<typeof damageTypeText>().not.toBeAny();
    expectTypeOf<typeof damageTypeText>().not.toBeArray();

    const pickerValue = n2.getInputValue('picker');
    expectTypeOf<typeof pickerValue>().toBeArray();
    expectTypeOf<typeof pickerValue>().toEqualTypeOf<NodeRefValue[]>([]);
    expectTypeOf<(typeof pickerValue)[number]>().toEqualTypeOf<NodeRefValue>();
    expectTypeOf<typeof pickerValue>().not.toBeAny();
    expectTypeOf<typeof pickerValue>().not.toBeUnknown();
    expectTypeOf<typeof pickerValue>().not.toBeNever();

    pickerValue.forEach((val) => {
      const nodeId = val.node?.id;
      expectTypeOf<typeof nodeId>().toEqualTypeOf<string | undefined>();
      expectTypeOf<typeof nodeId>().toBeNullable();
      expectTypeOf<typeof nodeId>().not.toBeAny();
      expectTypeOf<typeof nodeId>().not.toBeUnknown();
      expectTypeOf<typeof nodeId>().not.toBeNever();
    });

    n2.getInputContext('picker').forEach((ctx) => {
      const node = ctx.prop.value.getValue().node;
      expectTypeOf<typeof node>().toEqualTypeOf<UINode | null>();
      expectTypeOf<typeof node>().toBeNullable();
      expectTypeOf<typeof node>().not.toBeAny();
      expectTypeOf<typeof node>().not.toBeUnknown();
      expectTypeOf<typeof node>().not.toBeNever();
    });

    const goldValues = n2.getInputValue('gold');
    expectTypeOf<typeof goldValues>().toEqualTypeOf<number[]>();
    expectTypeOf<typeof goldValues>().toBeArray();
    expectTypeOf<typeof goldValues>().not.toBeAny();
    expectTypeOf<typeof goldValues>().not.toBeNullable();
    expectTypeOf<typeof goldValues>().not.toBeNever();
    expectTypeOf<typeof goldValues>().not.toBeUnknown();

    goldValues.forEach((gold) => {
      expectTypeOf<typeof gold>().toEqualTypeOf<number>();
      expectTypeOf<typeof gold>().not.toBeNullable();
      expectTypeOf<typeof gold>().not.toBeUnknown();
      expectTypeOf<typeof gold>().not.toBeAny();
      expectTypeOf<typeof gold>().not.toBeNever();
    });

    const checks = n2.getInputValue('check');
    expectTypeOf<typeof checks>().toEqualTypeOf<boolean>();
    expectTypeOf<typeof checks>().not.toBeNullable();
    expectTypeOf<typeof checks>().not.toBeArray();
    expectTypeOf<typeof checks>().not.toBeNever();
    expectTypeOf<typeof checks>().not.toBeAny();
    expectTypeOf<typeof checks>().not.toBeUnknown();

    const goldContexts = n.getInputContext('gold');
    expectTypeOf<typeof goldContexts>().toBeArray();
    expectTypeOf<typeof goldContexts>().not.toBeNullable();
    expectTypeOf<typeof goldContexts>().not.toBeAny();
    expectTypeOf<typeof goldContexts>().not.toBeUnknown();
    expectTypeOf<typeof goldContexts>().not.toBeNever();

    const goldContextsFromAll = n.getInputsContexts().gold;
    expectTypeOf<typeof goldContextsFromAll>().toBeArray();
    expectTypeOf<typeof goldContextsFromAll>().not.toBeNullable();
    expectTypeOf<typeof goldContextsFromAll>().not.toBeAny();
    expectTypeOf<typeof goldContextsFromAll>().not.toBeUnknown();
    expectTypeOf<typeof goldContextsFromAll>().not.toBeNever();

    goldContexts.forEach((context) => {
      expectTypeOf<typeof context>().toEqualTypeOf<{
        readonly prop: ContextProperty<number, number>;
      }>();
      expectTypeOf<typeof context>().not.toBeAny();
      expectTypeOf<typeof context>().not.toBeNullable();
      expectTypeOf<typeof context>().not.toBeUnknown();
      expectTypeOf<typeof context>().not.toBeNever();

      const ctxVal = context.prop.value.getValue();
      expectTypeOf<typeof ctxVal>().toEqualTypeOf<number>();
      expectTypeOf<typeof ctxVal>().not.toBeNullable();
      expectTypeOf<typeof ctxVal>().not.toBeAny();
      expectTypeOf<typeof ctxVal>().not.toBeUnknown();
      expectTypeOf<typeof ctxVal>().not.toBeNever();
    });

    const nameContext = n.getInputContext('name');
    expectTypeOf<typeof nameContext>().not.toBeArray();
    expectTypeOf<typeof nameContext>().toEqualTypeOf<{
      readonly prop: ContextProperty<string, string>;
    }>();
    expectTypeOf<typeof nameContext>().not.toBeAny();
    expectTypeOf<typeof nameContext>().not.toBeUnknown();
    expectTypeOf<typeof nameContext>().not.toBeNever();

    const nameContextValue = nameContext.prop.value.getValue();
    expectTypeOf<typeof nameContextValue>().toBeString();
    expectTypeOf<typeof nameContextValue>().not.toBeNullable();
    expectTypeOf<typeof nameContextValue>().not.toBeArray();
    expectTypeOf<typeof nameContextValue>().not.toBeAny();
    expectTypeOf<typeof nameContextValue>().not.toBeUnknown();
    expectTypeOf<typeof nameContextValue>().not.toBeNever();

    const anotherNodeChildId = n.getOr(AnotherNode)?.config.getValue().id;
    expectTypeOf<typeof anotherNodeChildId>().toEqualTypeOf<'std.another' | undefined>();
    expectTypeOf<typeof anotherNodeChildId>().not.toBeAny();
    expectTypeOf<typeof anotherNodeChildId>().not.toBeNever();
    expectTypeOf<typeof anotherNodeChildId>().not.toBeUnknown();

    const contextsNameValue = n.getInputsContexts().name.prop.value.getValue();
    expectTypeOf<typeof contextsNameValue>().toBeString();
    expectTypeOf<typeof contextsNameValue>().not.toBeArray();
    expectTypeOf<typeof contextsNameValue>().not.toBeAny();
    expectTypeOf<typeof contextsNameValue>().not.toBeUnknown();
    expectTypeOf<typeof contextsNameValue>().not.toBeNever();
    expectTypeOf<typeof contextsNameValue>().not.toBeNullable();

    const nested = n2.getInputValue('props');
    expectTypeOf<typeof nested>().toBeArray();
    expectTypeOf<typeof nested>().not.toBeAny();
    expectTypeOf<typeof nested>().not.toBeUnknown();
    expectTypeOf<typeof nested>().not.toBeNever();
    expectTypeOf<typeof nested>().not.toBeNullable();

    nested.forEach((val) => {
      expectTypeOf<typeof val.id>().toEqualTypeOf<'std.new' | 'std.optionals'>();
      expectTypeOf<typeof val.id>().not.toBeAny();
      expectTypeOf<typeof val.id>().not.toBeUnknown();
      expectTypeOf<typeof val.id>().not.toBeNever();
      expectTypeOf<typeof val.id>().not.toBeNullable();

      if (val.id === 'std.new') {
        expectTypeOf<typeof val.values>().toExtend<{ gold: number[]; name: string }>();
        expectTypeOf<typeof val.values>().not.toBeAny();
        expectTypeOf<typeof val.values>().not.toBeUnknown();
        expectTypeOf<typeof val.values>().not.toBeNever();
        expectTypeOf<typeof val.values>().not.toBeNullable();
      } else {
        expectTypeOf<typeof val.values>().toExtend<{
          attack: number | undefined;
          damageType: string | undefined;
          rolls: number[] | undefined;
          speed: number;
        }>();
        expectTypeOf<typeof val.values>().not.toBeAny();
        expectTypeOf<typeof val.values>().not.toBeUnknown();
        expectTypeOf<typeof val.values>().not.toBeNever();
        expectTypeOf<typeof val.values>().not.toBeNullable();
      }
    });
  });
});
