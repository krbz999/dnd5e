import AugmentationData from "./augmentation.mjs";

const { ObjectField, TypedObjectField } = foundry.data.fields;

export default class AugmentationField extends (TypedObjectField ?? ObjectField) {
  /** @inheritDoc */
  initialize(value, model, options={}) {
    const augmentations = [];
    for (const [k, v] of Object.entries(value)) {
      v._id = k;
      const init = this.element.initialize(v, model, options);
      augmentations.push([k, new AugmentationData(init, { parent: model })]);
    }
    augmentations.sort((a, b) => b[1].sort - a[1].sort);
    const collection = new AugmentationCollection(augmentations);
    return collection;
  }
}

class AugmentationCollection extends foundry.utils.Collection {
  /**
   * Get all augmentations that apply to a certain type.
   * @param {string|string[]} types     A type or types.
   * @returns {AugmentationCollection[]}
   */
  getByType(types) {
    types = new Set(( typeof types === "string" ) ? [types] : types ?? []);
    return this.filter(aug => aug.types.intersects(types));
  }
}
