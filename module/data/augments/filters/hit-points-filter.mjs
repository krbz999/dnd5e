import FilterData from "./base-filter.mjs";

const { NumberField, SchemaField, StringField } = foundry.data.fields;

export default class HitPointsFilter extends FilterData {
  /** @override */
  static TYPE = "hp";

  /* -------------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    schema.config = new SchemaField({
      v: new NumberField({ min: 0, max: 100, integer: true, initial: 50, nullable: false }),
      o: new StringField({ choices: ["lt", "lte", "eq", "gt", "gte"], initial: "lte" })
    });
    return schema;
  }

  /* -------------------------------------------------- */

  /** @override */
  get _immutable() {
    return {
      k: "system.attributes.hp.pct"
    };
  }
}
