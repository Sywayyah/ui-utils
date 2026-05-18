import { describe, expect, it } from 'vitest';
import { ModGroup, ModRef } from '../core/modifiers/mod-group';

interface Mods {
  readonly attack: number;
  readonly defence: number;
}

class TestMods extends ModGroup<Mods> {}

describe('mod group cases', () => {
  it('should verify scenario', () => {
    const group = new TestMods();

    group.addModRef(new ModRef({ attack: 1 }));
    group.addModRef(new ModRef({ attack: 2 }));

    expect(group.getNumericModValue('attack')).toBe(3);

    const parentGroup = new TestMods();

    const negativeAttackMod = new ModRef({ attack: -4 });

    parentGroup.addModRef(negativeAttackMod);

    group.addParentGroup(parentGroup);

    expect(group.getNumericModValue('attack')).toBe(-1);
    expect(group.getModRefs()).toHaveLength(3);

    const attackModValues = group.getAllModValues('attack');

    expect(attackModValues).toHaveLength(3);
    expect(attackModValues).toContain(1);
    expect(attackModValues).toContain(2);
    expect(attackModValues).toContain(-4);

    parentGroup.removeModRef(negativeAttackMod);

    expect(group.getNumericModValue('attack')).toBe(3);
  });
});
