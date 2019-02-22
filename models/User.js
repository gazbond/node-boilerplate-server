import { Model } from "objection";

export default class User extends Model {
  constructor() {
    super();
    this.name = null;
    this.email = null;
  }
  static get tableName() {
    return "users";
  }
  static get idColumn() {
    return "id";
  }
}
