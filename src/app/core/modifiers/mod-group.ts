import { Observable } from 'rxjs';
import { ReactiveList } from '../reactive/reactive-list';
import { ReactiveMap } from '../reactive/reactive-map';
import { ReactiveSet } from '../reactive/reactive-set';
import { ReactiveValue } from '../reactive/reactive-value';
import { getEntries, isNotNullish } from '../utils/objects';

type ModsObject = object;

export class ModGroup<T extends Partial<ModsObject>> {
  private readonly mods = new ReactiveList<T>();

  private readonly modsByKeysMap = new ReactiveMap<unknown, ReactiveList<T>>();
  private readonly namedParentModGroupsMap = new ReactiveMap<string, ModGroup<T>>();
  private readonly parentModGroups = new ReactiveSet<ModGroup<T>>();
  private readonly childModGroups = new ReactiveSet<ModGroup<T>>();

  private readonly combinedValues = new ReactiveValue<Partial<T>>({});

  listen(): Observable<Partial<T>> {
    return this.combinedValues.listen();
  }

  getMods(): T[] {
    return [
      ...this.parentModGroups.getItems().flatMap((group) => group.getMods()),
      ...this.mods.getValue(),
    ];
  }

  getAllCombinedValues(): Partial<T> {
    return this.combinedValues.getValue();
  }

  getAllModValues<const K extends keyof T>(modName: K): T[K][] {
    return [
      ...this.parentModGroups.getItems().flatMap((modGroup) => modGroup.getAllModValues(modName)),
      ...(this.mods
        .getValue()
        .map((modRef) => modRef[modName])
        .filter(isNotNullish) as T[K][]),
    ];
  }

  getNumericModValue<
    const K extends {
      [Key in keyof Required<T>]: Required<T>[Key] extends number ? Key : never;
    }[keyof T],
  >(modName: K): T[K] | undefined {
    return this.combinedValues.getValue()[modName];
  }

  addMods(mods: T): void {
    this.mods.push(mods);
    this.processAddedMods(mods);
    this.childModGroups.getItems().forEach((group) => group.processAddedMods(mods));
  }

  addModsForKey(key: unknown, mods: T): void {
    this.addMods(mods);
    this.modsByKeysMap.updateEntry(key, (list) => list?.push(mods) ?? new ReactiveList([mods]));
  }

  removeMods(mods: T): void {
    this.mods.remove(mods);
    this.processRemovedMods(mods);
    this.childModGroups.getItems().forEach((group) => group.processRemovedMods(mods));
  }

  removeModsForKey(key: unknown, mods: T): void {
    this.removeMods(mods);
    this.modsByKeysMap.getOr(key)?.remove(mods);
  }

  addParentGroup(group: ModGroup<T>): void {
    this.parentModGroups.add(group);
    group.childModGroups.add(this);
    this.processAddedMods(group.combinedValues.getValue());
  }

  removeParentGroup(group: ModGroup<T>): void {
    this.parentModGroups.remove(group);
    group.childModGroups.remove(this);
    this.processRemovedMods(group.combinedValues.getValue());
  }

  addNamedParentGroup(name: string, group: ModGroup<T>): void {
    this.addParentGroup(group);
    this.namedParentModGroupsMap.set(name, group);
  }

  removeNamedParentGroup(name: string): void {
    const parentGroup = this.namedParentModGroupsMap.get(name);
    this.removeParentGroup(parentGroup);
    this.namedParentModGroupsMap.remove(name);
  }

  private processAddedMods(from: Partial<T>): void {
    getEntries(from).forEach(([modName, modVal]) => {
      if (typeof modVal === 'number') {
        const to = this.combinedValues.getValue();

        if (typeof to[modName] === 'number') {
          (to[modName] as number) += modVal;
        } else {
          (to[modName] as number) = modVal;
        }
      }
    });

    this.updateMods();
  }

  private processRemovedMods(from: Partial<T>): void {
    getEntries(from).forEach(([modName, modVal]) => {
      if (typeof modVal === 'number') {
        const to = this.combinedValues.getValue();

        if (typeof to[modName] === 'number') {
          (to[modName] as number) -= modVal;
        }
      }
    });

    this.updateMods();
  }

  private updateMods(): void {
    // keep immutable for now
    this.combinedValues.update((v) => v);
  }
}
