import knexfile from "../knexfile";
import Knex from "knex";
const environment = process.env.ENVIRONMENT || "testing";
export default Knex(knexfile[environment]);
