// Special traits of Gloomhaven 2nd edition: traits a character gains or loses through events, on top of the traits and
// species of its class. `key` is the lower case name used by the event requirements (tools/extract-event-text.py).
// Sources: the Gloomhaven Secretariat data (gh2e events: gainTrait and loseTrait effects, requirements, trait labels).
// "Herald of Xorn" is only ever required by an event, nothing in the event data gives it (probably a scenario or sticker).
export const SPECIAL_TRAITS = [
  { key: 'hero', name: 'Hero' },
  { key: 'friend of the hero', name: 'Friend of the Hero' },
  { key: 'friend of the silent knife', name: 'Friend of the Silent Knife' },
  { key: 'indebted', name: 'Indebted' },
  { key: 'blackmailer', name: 'Blackmailer' },
  { key: 'carapace combatant', name: 'Carapace Combatant' },
  { key: 'memory of serenity', name: 'Memory of Serenity' },
  { key: 'immunity', name: 'Immunity' },
  { key: 'herald of xorn', name: 'Herald of Xorn' },
];
export const specialName = key => SPECIAL_TRAITS.find(t => t.key === key)?.name || key;
