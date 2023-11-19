export default class DamagePartConfig extends FormApplication {
  constructor(item, options={}) {
    super(item, options);
    this.item = item;
    this.clone = item.clone({}, {keepId: true});
    this.idx = options.idx;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "item", "dialog"],
      template: "systems/dnd5e/templates/apps/damage-config.hbs",
      width: 400,
      height: "auto",
      submitOnChange: false,
      closeOnSubmit: false
    });
  }

  getData(options={}) {
    return {
      item: this.item,
      clone: this.clone,
      part: this.clone.system.damage.parts[this.idx],
    };
  }

  async _updateObject(event, formData) {
    return this.item.update({"system.damage.parts": this.clone.toObject().system.damage.parts});
  }

  async _onChangeInput(event) {
    const data = new FormDataExtended(this.form).object;
    const parts = this.clone.toObject().system.damage.parts;
    parts[this.idx].scaling = data;
    this.clone.updateSource({"system.damage.parts": parts});
    return this.render();
  }
}
