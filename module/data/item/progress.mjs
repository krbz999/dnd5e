import AdvancementTemplate from "./templates/advancement.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

const { NumberField, SchemaField } = foundry.data.fields;

/**
 * Data definition for Background items.
 * @mixes AdvancementTemplate
 * @mixes ItemDescriptionTemplate
 */
export default class BackgroundData extends ItemDataModel.mixin(
  AdvancementTemplate, ItemDescriptionTemplate
) {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      progression: new SchemaField({
        value: new NumberField({ nullable: false, min: 0, integer: true, initial: 0, required: true }),
        max: new NumberField({ nullable: true, min: 0, integer: true, initial: null, required: true })
      })
    });
  }

  /* -------------------------------------------------- */

  /** @override */
  async getSheetData(context) {
    context.singleDescription = true;
    context.parts = ["dnd5e.details-progress"];
  }
}
