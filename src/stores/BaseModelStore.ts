import { observable } from 'mobx'
import {
  CollectionMixin,
  GetCollectionItem,
  CreateCollectionItem,
  CreateOrUpdateCollection,
  RemoveCollectionItem
} from './CollectionMixin'
import { applyMixins } from '../helpers'
import { BaseStore } from './BaseStore'

export abstract class BaseModelStore<T> extends BaseStore implements CollectionMixin {
  @observable public items: T[] = []
  get model(): { new(json, store): T } {
    throw new Error('Not implemented')
  }
  abstract createOrUpdateCollectionItem: CreateOrUpdateCollection
  abstract getCollectionItem: GetCollectionItem
  abstract createCollectionItem: CreateCollectionItem
  abstract removeCollectionItem: RemoveCollectionItem

  public createOrUpdate(json: any) {
    return this.createOrUpdateCollectionItem(json, this.items, this.model, this.store)
  }

  public remove(item: T) {
    return this.removeCollectionItem(item, this.items)
  }

  public create(json: any) {
    return this.createCollectionItem(json, this.model, this.store)
  }

  public getItem(id: string): T {
    return this.getCollectionItem(id, this.items)
  }

  public async query(qs?: any) {
    this.isLoading = true
    const itemsJson = (await (this.model as any).api.query(qs)).data

    itemsJson.forEach(p => this.createOrUpdate(p))
    this.isLoading = false
  }
}
applyMixins(BaseModelStore, [CollectionMixin])

