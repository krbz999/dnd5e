const {
  EmbeddedDataField, NumberField, SchemaField, StringField, TypedObjectField, TypedSchemaField
} = foundry.data.fields;

const validateKey = key => Number.isInteger(Number(key)) && key > 0;
const numberField = () => new NumberField({ integer: true, nullable: false, initial: 0 });

export default class Spellcasting extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      configuration: new TypedSchemaField({
        combined: new SpellcastingCombined(),
        separate: new SpellcastingSeparate()
      })
    };
  }

  /* -------------------------------------------------- */

  slotsAtLevel(level) {
    switch (this.configuration.type) {
      case "combined": return this.#combinedSlotsAtLevel(level);
      case "separate": return this.#separateSlotsAtLevel(level);
    }
    return {};
  }

  /* -------------------------------------------------- */

  #combinedSlotsAtLevel(level) {
    const slots = { level: 0, amount: 0};
    for (const [k, v] of Object.entries(this.configuration.progression)) {
      if (Number(k) > level) continue;
      slots.level += v.level;
      slots.amount += v.amount;
    }
    return slots;
  }

  #separateSlotsAtLevel(level) {
    const slots = {};
    for (const [k, v] of Object.entries(this.configuration.progression)) {
      if (Number(k) > level) continue;
      for (const [slotLevel, increase] of Object.entries(v)) {
        if (!increase) continue;
        slots[slotLevel] ??= 0;
        slots[slotLevel] += increase;
      }
    }
    return slots;
  }
}

/* -------------------------------------------------- */

class SpellcastingData extends SchemaField {
  constructor(fields={}, options={}) {
    fields = {
      type: new StringField({ required: true, blank: false }),
      ...fields
    };
    super(fields, options);
  }
}

/* -------------------------------------------------- */

class SpellcastingCombined extends SpellcastingData {
  constructor(fields = {}, options = {}) {
    fields = {
      progression: new TypedObjectField(new SchemaField({
        level: numberField(),
        amount: numberField()
      }), { validateKey }),
      ...fields
    };
    super(fields, options);
  }
}

/* -------------------------------------------------- */

class SpellcastingSeparate extends SpellcastingData {
  constructor(fields = {}, options = {}) {
    fields = {
      progression: new TypedObjectField(
        new TypedObjectField(numberField(), { validateKey }),
        { validateKey }
      ),
      ...fields
    };
    super(fields, options);
  }
}
