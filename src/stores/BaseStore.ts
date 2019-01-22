import { observable, when } from 'mobx'

export abstract class BaseStore {
  @observable public isLoading = true

  public store: any

  constructor (store: any) {
    this.store = store

    this.waitAndLoad()
  }

  public async load () {
    this.isLoading = false
  }

  private async waitAndLoad () {
    await when(() => !this.store.isLoading)
    this.load()
  }
}
