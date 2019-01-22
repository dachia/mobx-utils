import * as _ from 'lodash'
import { when, reaction } from 'mobx'
import { BaseStore } from './BaseStore'

export function triggerWhenAuthChanges(
  methods: string[]
) {
  // tslint:disable-next-line
  return function<T extends {new(...args:any[]):{}}>(ogConstructor: T) {
    return class extends ogConstructor {
      public onAuthChange = reaction(
        () => (this as any).store.authStore.userId,
        data => methods.forEach(method => _.invoke(this, method, data))
      )
    }
  }
}

export function toggleLoading(
  target: any,
  propertyName: string,
  // tslint:disable-next-line
  descriptor: any
) {
  const ogMethod = descriptor.value
  descriptor.value = async function () {
    this.isLoading = true
    const result = await ogMethod.apply(this, arguments)
    this.isLoading = false
    return result
  }
}

export function waitUntilIsLoaded(storesNames: string[] = []) {
  // tslint:disable-next-line
  return function (
    target: any,
    propertyName: string,
    descriptor: any
  ) {
    const ogMethod = descriptor.value
    descriptor.value = async function () {
      const stores = storesNames.map((name) => this.store[name]) as BaseStore[]
      const isLoading = () => _.some(stores, { isLoading: true })
      if (isLoading()) await when(() => !isLoading())
      return ogMethod.apply(this, arguments)
    }
  }
}

export function loggedInOnly(
  target: any,
  propertyName: string,
  // tslint:disable-next-line
  descriptor: any
) {
  const ogMethod = descriptor.value
  descriptor.value = function () {
    if (!this.store.isLoggedIn) return
    return ogMethod.apply(this, arguments)
  }
}
