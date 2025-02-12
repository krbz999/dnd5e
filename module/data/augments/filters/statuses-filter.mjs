import FilterData from "./base-filter.mjs";

const { SchemaField, StringField } = foundry.data.fields;

export default class StatusesFilter extends FilterData {
  /** @override */
  static TYPE = "statuses";

  /* -------------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    schema.config = new SchemaField({
      v: new StringField({
        choices: () => Object.fromEntries(CONFIG.statusEffects.map(s => [s.id, s.name]))
      })
    });
    return schema;
  }

  /* -------------------------------------------------- */

  /** @override */
  get _immutable() {
    return {
      k: "statuses",
      o: "has"
    };
  }
}
