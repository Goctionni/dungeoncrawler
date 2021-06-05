import localForage from 'localforage';
export type LocalForage = typeof localForage;
export const store: LocalForage = localForage.createInstance({
  storeName: 'tdc-store',
  description: 'Datastore for Twine Dungeon Crawler',
});

