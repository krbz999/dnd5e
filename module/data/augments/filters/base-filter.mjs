const { SetField, StringField } = foundry.data.fields;

export default class FilterData extends foundry.abstract.DataModel {
  /**
   * The type of this filter data.
   * @type {string}
   */
  static TYPE = "";

  /* -------------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return {
      type: new StringField({
        required: true,
        blank: false,
        initial: this.TYPE,
        validate: value => value === this.TYPE,
        validationError: `must be equal to "${this.TYPE}"`
      }),
      properties: new SetField(new StringField({
        choices: {
          target: "DND5E.AUGMENTATION.PROPERTIES.Target"
        }
      }))
    };
  }

  /* -------------------------------------------------- */

  /**
   * The actor.
   * @type {Actor5e}
   */
  get actor() {
    return this.parent.parent.parent;
  }

  /* -------------------------------------------------- */

  /**
   * Properties that cannot be mutated as part of document updates.
   * @type {Record<"k"|"v"|"o", any>}
   */
  get _immutable() {
    return {};
  }

  /* -------------------------------------------------- */

  /** @inheritDoc */
  _initialize(...args) {
    const result = super._initialize(...args);
    for (const [k, v] of Object.entries(this._immutable)) {
      Object.defineProperty(this.config, k, { get: () => v });
    }
    return result;
  }

  /* -------------------------------------------------- */

  /**
   * Evaluate this single filter.
   * @param {object} options                      Filter evaluation options.
   * @param {Actor5e|Item5e} [options.target]     A target actor or item being evaluated against.
   * @returns {boolean|void}                      Whether the augmentation should apply.
   */
  evaluate({ target }) {
    const { k, v, o } = this.config;
    const subject = this.properties.has("target") ? target : this.actor;
    if ( !subject ) throw new Error("Subject is not defined!");
    return dnd5e.Filter.performCheck(subject, [{ k, v, o }]);
  }
}
