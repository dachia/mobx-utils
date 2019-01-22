import axios from 'axios'

export abstract class Api {
  abstract get resource()
  abstract get apiUrl()

  public get routes() {
    return {
      obj: id => `${this.apiUrl}/${this.resource}/${id}/`,
      list: `${this.apiUrl}/${this.resource}/`
    }
  }

  public query = queryParams =>
    axios.get(this.routes.list, { params: queryParams })
  public create = data => axios.post(this.routes.list, data)
  public read = id => axios.get(this.routes.obj(id))
  public update = (id, data) => axios.put(this.routes.obj(id), data)
  public delete = (id, query?) =>
    axios.delete(this.routes.obj(id), { params: query })
}
