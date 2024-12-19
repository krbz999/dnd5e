export default class ActiveEffectSheet5e extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.DocumentSheetV2
) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: {
      addChange: ActiveEffectSheet5e.#addChange,
      deleteChange: ActiveEffectSheet5e.#deleteChange
    },
    classes: ["active-effect-config", "dnd5e2"],
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    position: {
      width: 600
    }
  };

  /** @override */
  static PARTS = {
    // Header: { template: "templates/sheets/active-effect-config/header.hbs" },
    navigation: { template: "templates/generic/tab-navigation.hbs" },
    identity: { template: "systems/dnd5e/templates/active-effect/identity.hbs" },
    application: { template: "systems/dnd5e/templates/active-effect/application.hbs" },
    duration: { template: "systems/dnd5e/templates/active-effect/duration.hbs" },
    changes: { template: "systems/dnd5e/templates/active-effect/changes.hbs" }
  };

  /* -------------------------------------------------- */

  /** @override */
  static TABS = [
    { id: "identity", group: "main", icon: "fas fa-TODO", label: "DND5E.Identity" },
    { id: "application", group: "main", icon: "fas fa-TODO", label: "DND5E.Application" },
    { id: "duration", group: "main", icon: "fas fa-TODO", label: "DND5E.Duration" },
    { id: "changes", group: "main", icon: "fas fa-TODO", label: "DND5E.Changes" }
  ];

  /* -------------------------------------------------- */

  /** @override */
  tabGroups = {
    main: "identity"
  };

  /* -------------------------------------------------- */

  /** @inheritDoc */
  async _prepareContext(options) {
    const prepareField = async (path, options) => {
      const field = path.startsWith("system.")
        ? this.document.system.schema.getField(path.slice(7))
        : this.document.schema.getField(path);
      const value = foundry.utils.getProperty(this.document, path);
      const source = foundry.utils.getProperty(this.document._source, path);

      const fieldContext = {
        field, value, source
      };

      if ( options.choices ) {
        fieldContext.choices = options.choices;
      }

      if ( options.disabled ) {
        fieldContext.disabled = true;
      }

      if ( options.enrich ) {
        fieldContext.enriched = await TextEditor.enrichHTML(value, {
          rollData: this.document.parent.getRollData(), relativeTo: this.document
        });
        fieldContext.height = 300;
      }

      return fieldContext;
    };

    const properties = {
      identity: [
        ["name", { fieldset: "appearance" }],
        ["img", { fieldset: "appearance" }],
        ["tint", { fieldset: "appearance" }],
        ["description", { fieldset: "description", enrich: true }]
      ],
      application: [
        ["transfer", { fieldset: "transfer", skip: this.document.parent.documentName === "Actor"}],
        ["disabled", { fieldset: "transfer" }],
        ["origin", { fieldset: "transfer", disabled: true }],
        ["statuses", {
          fieldset: "statuses",
          choices: CONFIG.statusEffects.map(s => ({ value: s.id, label: s.name }))
        }]
      ],
      duration: [
        ["duration.seconds", { fieldset: "time" }],
        ["duration.startTime", { fieldset: "time" }],
        ["duration.rounds", { fieldset: "combat" }],
        ["duration.turns", { fieldset: "combat" }],
        ["duration.startRound", { fieldset: "combat" }],
        ["duration.startTurn", { fieldset: "combat" }]
      ]
    };

    const context = { document: this.document };

    for ( const [tab, paths] of Object.entries(properties) ) {
      context[tab] = {};
      for ( const [path, options] of paths ) {
        if ( options.skip ) continue;
        context[tab][options.fieldset] ??= {
          label: `DND5E.EFFECT.Fieldset.${options.fieldset.capitalize()}`,
          fields: []
        };
        context[tab][options.fieldset].fields.push(await prepareField(path, options));
      }
    }

    // Changes are prepared separately.
    const modes = Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((modes, [key, value]) => {
      modes[value] = game.i18n.localize(`EFFECT.MODE_${key}`);
      return modes;
    }, {});
    const { key, mode, value, priority } = this.document.schema.getField("changes.element").fields;
    context.changes = [];
    for ( const [i, c] of this.document.changes.entries() ) {
      const group = {
        idx: i,
        fields: {}
      };

      for ( const field of [key, mode, value, priority] ) {
        group.fields[field.name] = {
          field: field,
          value: c[field.name],
          name: `changes.${i}.${field.name}`
        };
      }

      group.fields.mode.choices = modes;
      group.fields.priority.placeholder =
        foundry.applications.sheets.ActiveEffectConfig.DEFAULT_PRIORITIES[group.fields.mode.value];

      context.changes.push(group);
    }

    // Prepare navigation.
    context.tabs = {};
    for ( const tab of ActiveEffectSheet5e.TABS ) {
      const active = this.tabGroups[tab.group] === tab.id;
      context.tabs[tab.id] = {
        active: active,
        cssClass: [active ? "active" : null].filterJoin(" "),
        ...tab
      };
    }

    return context;
  }

  /* -------------------------------------------------- */

  static #addChange(event, target) {
    const changes = this.document.changes.concat([
      this.document.schema.getField("changes.element").initial()
    ]);
    this.document.update({ changes: changes });
  }

  /* -------------------------------------------------- */

  static #deleteChange(event, target) {
    const idx = Number(target.dataset.idx);
    const changes = foundry.utils.deepClone(this.document.changes);
    changes.splice(idx, 1);
    this.document.update({ changes: changes });
  }
}
