import { Observable } from 'rxjs';
import { ReactiveList } from '../reactive/reactive-list';
import { ReactiveMap } from '../reactive/reactive-map';
import { ReactiveSet } from '../reactive/reactive-set';
import { ReactiveValue } from '../reactive/reactive-value';
import { getEntries, isNotNullish } from '../utils/objects';

// debugging symbol?
type ModsObject = object;

// todo: think if it's needed
// registry with mod refs?
export class ModRef<T extends ModsObject> {
  constructor(readonly mods: Partial<T>) {}
}

// recommendations:
// 1. use numbers (1, 0) instead of flags, numbers can be added/removed to each other
//  this way, if entity has certain 'statuses' upon itself, like 'silenced', it will also be possible
//  to easily calculate the amount of such statuses
// 2. for functions it's probably better to provide objects with method, this way it should be possible
//  to avoid using closures, which potentially can help with serialization and memory usage

// can be extended with some T provided
export class ModGroup<T extends ModsObject> {
  // todo: would it be better to have a map? where modrefs can be associated with anything
  // and later infered using some key as identity
  private readonly modRefs = new ReactiveList<ModRef<T>>();

  private readonly namedParentModGroupsMap = new ReactiveMap<string, ModGroup<T>>();
  // sets? add checks if present/absent ?
  private readonly parentModGroups = new ReactiveSet<ModGroup<T>>();
  private readonly childModGroups = new ReactiveSet<ModGroup<T>>();

  private readonly combinedValues = new ReactiveValue<Partial<T>>({});

  // todo: add dynamic recalculation with parent interactions
  //  reactivity
  //  and unit tests

  listen(): Observable<Partial<T>> {
    return this.combinedValues.listen();
  }

  getModRefs(): ModRef<T>[] {
    return [
      ...this.parentModGroups.getItems().flatMap((group) => group.getModRefs()),
      ...this.modRefs.getValue(),
    ];
  }

  getAllModValues<const K extends keyof T>(modName: K): T[K][] {
    return [
      ...this.parentModGroups.getItems().flatMap((modGroup) => modGroup.getAllModValues(modName)),
      ...(this.modRefs
        .getValue()
        .map((modRef) => modRef.mods[modName])
        .filter(isNotNullish) as T[K][]),
    ];
  }

  getNumericModValue<
    const K extends { [Key in keyof T]: T[Key] extends number ? Key : never }[keyof T],
  >(modName: K): T[K] | undefined {
    return this.combinedValues.getValue()[modName];
  }

  addModRef(modRef: ModRef<T>): void {
    this.modRefs.push(modRef);
    this.processAddedMods(modRef.mods);
    this.childModGroups.getItems().forEach((group) => group.processAddedMods(modRef.mods));
  }

  removeModRef(modRef: ModRef<T>): void {
    this.modRefs.remove(modRef);
    this.processRemovedMods(modRef.mods);
    this.childModGroups.getItems().forEach((group) => group.processRemovedMods(modRef.mods));
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
    // this.combinedValues.update((v) => ({ ...v }));
  }
}
