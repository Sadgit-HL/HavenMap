// Special traits of Gloomhaven 2nd edition: traits a character gains or loses through events, on top of the traits and
// species of its class. `key` is the lower case name used by the event requirements (tools/extract-event-text.py).
// Sources: the Gloomhaven Secretariat data (gh2e events: gainTrait and loseTrait effects, requirements, trait labels).
// "Herald of Xorn" is only ever required by an event, nothing in the event data gives it (probably a scenario or sticker).
import { CLASS_TRAITS } from '../games/gh2_class_traits.js';

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
  // the basic traits, which a character can also gain (a class has three of them from the start)
  { key: 'arcane', name: 'Arcane' },
  { key: 'armored', name: 'Armored' },
  { key: 'chaotic', name: 'Chaotic' },
  { key: 'educated', name: 'Educated' },
  { key: 'intimidating', name: 'Intimidating' },
  { key: 'nimble', name: 'Nimble' },
  { key: 'outcast', name: 'Outcast' },
  { key: 'persuasive', name: 'Persuasive' },
  { key: 'resourceful', name: 'Resourceful' },
  { key: 'strong', name: 'Strong' },
  { key: 'unfettered', name: 'Unfettered' },
];
// The traits a character can still gain: not already one of its class traits or sheet traits. Traits it has gained stay in the list
// (to take them off again).
export function specialChoices(cls, traits, special) {
  const own = new Set([...(CLASS_TRAITS[String(cls || '').toLowerCase()] || []), ...(traits || []).map(t => String(t).toLowerCase())]);
  return SPECIAL_TRAITS.filter(t => !own.has(t.key) || (special || []).includes(t.key));
}
export const specialName = key => SPECIAL_TRAITS.find(t => t.key === key)?.name || key;
