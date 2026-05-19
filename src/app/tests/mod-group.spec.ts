import { describe, expect, it } from 'vitest';
import { ModGroup } from '../core/modifiers/mod-group';

type Mods = Partial< {
  readonly attack: number;
  readonly defence: number;
}>;

class TestMods extends ModGroup<Mods> {}

describe('mod group cases', () => {
  it('should verify scenario', () => {
    const group = new TestMods();

    group.addMods({ attack: 1 });
    group.addMods({ attack: 2 });

    expect(group.getNumericModValue('attack')).toBe(3);

    const parentGroup = new TestMods();

    const negativeAttackMod: Mods = { attack: -4 };

    parentGroup.addMods(negativeAttackMod);

    group.addParentGroup(parentGroup);

    expect(group.getNumericModValue('attack')).toBe(-1);
    expect(group.getMods()).toHaveLength(3);

    const attackModValues = group.getAllModValues('attack');

    expect(attackModValues).toHaveLength(3);
    expect(attackModValues).toContain(1);
    expect(attackModValues).toContain(2);
    expect(attackModValues).toContain(-4);

    parentGroup.removeMods(negativeAttackMod);

    expect(group.getNumericModValue('attack')).toBe(3);
  });
});
