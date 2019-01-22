import * as _ from 'lodash'
import { v4 as uuid } from 'uuid'
import { computed, observable } from 'mobx'

export abstract class BaseModel {
  protected get api(): any {
    throw new Error('Not implemented')
  }

  protected get label(): string {
    throw new Error('Not implemented')
  }

  public id?: string

  @observable
  public isNew: boolean = true

  public store: any
  constructor (jsonObject: any, store: any) {
    this.store = store
    this.initializeDefaults()
    this.setDataAndNewState(jsonObject)
    this.onCreate()
  }

  @computed
  get asOption() {
    return {
      value: this.id,
      label: this.label
    }
  }

  public toJson(omitFields, childrenJsonProperty) {
    const jsonObject = _.omit(this, omitFields)
    const jsonObjectWithNested = _.mapValues(jsonObject, (value: any, key) => {
      if (_.includes(this.childrenObjectKeys, key)) {
        if (_.isArrayLike(value)) return _.map(value, childrenJsonProperty)
        return _.get(value, childrenJsonProperty)
      }
      return value
    })
    return _.omitBy(jsonObjectWithNested, _.isFunction)
  }

  @computed
  public get asNoIdJson() {
    return this.toJson(_.concat(this.nonDataProperties, 'id'), 'asNoIdJson')
  }

  @computed
  public get asJson() {
    return this.toJson(this.nonDataProperties, 'asJson')
  }

  public get childrenObjectMap() {
    return {}
  }

  public get childrenObjectKeys() {
    return _.keys(this.childrenObjectMap)
  }

  protected get excludeFromJson(): string[] {
    return []
  }

  private get nonDataProperties () {
    return _.concat([
      'isNew',
      'store',
      'labelField',
      'api'
    ], this.excludeFromJson)
  }

  public getPlainObjectData(jsonObject) {
    return _.omit(jsonObject, this.childrenObjectKeys)
  }

  public getChildrenObjectData(jsonObject) {
    return _.pick(jsonObject, this.childrenObjectKeys)
  }

  public updateFromJson(jsonObject) {
    const jsonObjectCloned = _.clone(jsonObject)
    delete jsonObjectCloned.id
    const plainObjectData = this.getPlainObjectData(jsonObjectCloned)
    const childrenObjectData = this.getChildrenObjectData(jsonObjectCloned)
    this.setObjectData(plainObjectData)
    this.setChildrenObjects(childrenObjectData)
  }

  public async create () {
    const jsonObject = (await this.api.create(this.asJson)).data
    this.isNew = false
    this.updateFromJson(jsonObject)
  }

  public async read () {
    const jsonObject = (await this.api.read(this.id)).data
    this.updateFromJson(jsonObject)
  }

  public async update () {
    const jsonObject = (await this.api.update(this.id, this.asJson)).data
    this.updateFromJson(jsonObject)
  }

  public async delete () {
    await this.api.delete(this.id)
    this.afterDelete()
  }

  public async save () {
    if (this.isNew) {
      return this.create()
    }
    return this.update()
  }

  public afterDelete () {
    return
  }

  protected initializeDefaults() {
    return
  }

  protected onCreate() {
    return
  }

  private setObjectData(jsonObject) {
    _.mergeWith(this, jsonObject, (objValue, srcValue) => {
      if (_.isArray(srcValue)) return srcValue
    })
  }

  private setChildrenObjects(jsonObject) {
    const mappedChildren = _.mapValues(jsonObject, (value, key) => {
      return _.invoke(this.childrenObjectMap, key, value)
    })
    this.setObjectData(mappedChildren)
  }

  private setDataAndNewState(jsonObject: any) {
    const { id } = jsonObject
    if (!id) {
      this.id = uuid()
      this.isNew = true
    } else {
      this.id = id
      this.isNew = false
    }
    this.updateFromJson(jsonObject)
  }
}
