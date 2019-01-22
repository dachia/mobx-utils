import * as _ from 'lodash'
import * as fp from 'lodash/fp'
import { observable, computed } from 'mobx'
import { FormState, ValidatableMapOrArray, FieldState } from 'formstate'

export class ModelFormState<TValue extends ValidatableMapOrArray> extends FormState<TValue> {
  instance: BaseForm
  constructor ($: TValue, instance: BaseForm) {
    super($)
    this.instance = instance
  }
}


export class BaseForm {
  instance
  form
  action
  serverErrorHandler

  @observable
  error = ''

  constructor (instance, action, serverErrorHandler = () => 'Unexpected server error') {
    this.serverErrorHandler = serverErrorHandler
    this.action = action
    this.instance = instance
    this.createFields()
    this.createForm()
  }

  createFields () { throw new Error('Not implemmented') }

  get nonFieldProperties () {
    return [
      'form',
      'instance',
      'error',
      'onSubmit',
      'onChange',
      'serverErrorHandler',
      'action'
    ]
  }

  public get childrenObjectKeys() {
    return []
  }

  get fields (): any {
    const isInstance = tipe => x => x instanceof tipe
    const getFields = fp.flow(
      fp.pickBy(_.overSome([isInstance(FieldState), isInstance(FormState), isInstance(ModelFormState)])),
      fp.omit(['form'])
    )
    return getFields(this)
  }

  get asJson () {
    return _.merge(_.mapValues(this.fields, (value: any, key: string) => {
      if (_.includes(this.childrenObjectKeys, key)) {
        if (_.isArrayLike(value.$)) return _.map(value.$, 'instance.asJson')
        return value.instance.asJson
      }
      return value.$
    }), { id: this.instance.id })
  }

  async onSubmit () {
    const validateResponse = await this.form.validate()
    if (validateResponse.hasError) {
      this.error = this.form.error
      return
    }
    this.instance.updateFromJson(this.asJson)

    try {
      await this.action()
    } catch (e) {
      console.error(e)
      this.error = this.serverErrorHandler(e)
    }
  }

  createForm () {
    this.form = new ModelFormState(this.fields, this)
  }

  @computed
  get hasError () {
    return !!this.error
  }

  onChange = () => {
    this.error = ''
  }
}
