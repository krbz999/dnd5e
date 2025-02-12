import FilterTypes from "./filters/_module.mjs";
import FormulaField from "../fields/formula-field.mjs";

const { DataModel } = foundry.abstract;
const {
  ArrayField, BooleanField, DocumentIdField, FilePathField, IntegerSortField,
  SchemaField, SetField, StringField, TypedSchemaField
} = foundry.data.fields;

export default class AugmentationData extends DataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {
      _id: new DocumentIdField({ initial: () => foundry.utils.randomID() }),
      name: new StringField(),
      img: new FilePathField({ initial: undefined, categories: ["IMAGE"], base64: false }),
      sort: new IntegerSortField(),
      augments: new SchemaField({
        formula: new FormulaField({ deterministic: false })
      }),
      damage: new SchemaField({
        types: new SetField(new StringField({ choices: () => CONFIG.DND5E.damageTypes }))
      }),
      disabled: new BooleanField(),
      filters: new ArrayField(new TypedSchemaField(FilterTypes)),
      heal: new SchemaField({
        type: new StringField({
          required: true,
          choices: () => CONFIG.DND5E.healingTypes, initial: "healing"
        })
      }),
      targeting: new SchemaField({}),
      types: new SetField(new StringField({
        choices: {
          attack: "DND5E.AUGMENTATION.TYPES.Attack",
          check: "DND5E.AUGMENTATION.TYPES.Check",
          damage: "DND5E.AUGMENTATION.TYPES.Damage",
          heal: "DND5E.AUGMENTATION.TYPES.Heal",
          save: "DND5E.AUGMENTATION.TYPES.Save"
        }
      }))
    };
  }

  /* -------------------------------------------------- */

  /**
   * The actor of this augmentation.
   * @type {Actor5e}
   */
  get actor() {
    return this.parent.parent;
  }

  /**
   * The id of this augmentation.
   * @type {string}
   */
  get id() {
    return this._id;
  }

  /**
   * Should this augmentation be skipped?
   * @type {boolean}
   */
  get ignored() {
    return this.disabled || !this.augments.formula;
  }

  /**
   * The uuid of this augmentation.
   * @type {string}
   */
  get uuid() {
    return `${this.actor.uuid}.Augmentation.${this.id}`;
  }

  /* -------------------------------------------------- */

  /**
   * Delete this augmentation.
   * @param {object} [context]        Deletion options.
   * @returns {Promise<Actor5e>}      A promise that resolves to the updated actor.
   */
  async delete(context={}) {
    return this.actor.update({ [`system.augmentations.-=${this.id}`]: null }, context);
  }

  /**
   * Update this augmentation.
   * @param {object} [changes]        The change to perform.
   * @param {object} [context]        Update options.
   * @returns {Promise<Actor5e>}      A promise that resolves to the updated actor.
   */
  async update(changes={}, context={}) {
    return this.actor.update({ [`system.augmentations.${this.id}`]: changes }, context);
  }

  /* -------------------------------------------------- */

  /**
   * Perform a test of all filters of this augmentation.
   * @param {object} [options]                    Evaluation options.
   * @param {Actor5e|Item5e} [options.target]     A target actor or item to evaluate against.
   * @returns {boolean}                           Whether this augmentation should apply.
   */
  evaluate({ target }={}) {
    if ( this.ignored ) return false;
    const dismissed = this.filters.some(filter => filter.evaluate({ target: target }) !== true);
    return !dismissed;
  }
}
