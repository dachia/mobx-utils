import * as _ from 'lodash'

export type CreateOrUpdateCollection = (json: any, collection: any, model: any, store: any) => any
export type GetCollectionItem = (id: string, collection: any) => any
export type RemoveCollectionItem = (item: any, collection: any) => void
export type CreateCollectionItem = (json: any, model: any, store: any) => any


export class CollectionMixin {
  createOrUpdateCollectionItem(
    json: any,
    collection: any,
    model: any,
    store: any
  ): any {
    const { id } = json
    let item = this.getCollectionItem(id, collection)
    if (!item) {
      item = this.createCollectionItem(json, model, store)
      collection.push(item)
    } else {
      item.updateFromJson(json)
    }
    return item
  }

  getCollectionItem(id: string, collection: any): any {
    return _.find(collection, { id })
  }

  createCollectionItem(json: any, model: any, store: any): any {
    return new model(json, store)
  }

  removeCollectionItem(item: any, collection: any): void {
    _.remove(collection, (value: any) => value.id === item.id)
  }
}
