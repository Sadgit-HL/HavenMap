// Links of the Resources tab of the group's workbook (WHTracker.xlsx, sheet "Resources"), by game. Edit by hand.
// Google Drive links had the account parameters (authuser, usp) removed: they pointed at another person's account context.
// The pCloud links are personal shares and may expire: replace them here.
export const RESOURCE_GAMES = [['gh2', 'Gloomhaven 2nd Edition'], ['fh', 'Frosthaven'], ['merc', 'Mercenary Pack']];

const drive = id => `https://drive.google.com/open?id=${id}`;
const pcloud = code => `https://e.pcloud.link/publink/show?code=${code}`;

export const RESOURCES = [
  { title: 'Starting Guide', fh: drive('1JQUd7sgXRB1jcyetVPEtODC7TZ4h8-E7') },
  { title: 'Interactive Rule Book', gh2: 'https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/main/wh_rules/GH2e-rules_int.pdf', fh: pcloud('XZTG8rZxskCB2W7uL55zjbnojQ0lQGfYME7') },
  { title: 'Interactive Scenario Book', gh2: pcloud('XZkLOk7Z0Ma7yUyINW0mqPIj3O4S5QGl7Wq7'), fh: pcloud('XZiuIUZtEfz6KI4RFkNGAIG6aBnvSREHp37') },
  // The sheet gives the same link for the GH2 scenario book and section book.
  { title: 'Interactive Section Book', gh2: pcloud('XZkLOk7Z0Ma7yUyINW0mqPIj3O4S5QGl7Wq7'), fh: 'https://drive.google.com/file/d/1-7YSdPcW6NaeNIesMyFIOocb-Fpzx3Tn/view?usp=sharing' },
  { title: 'Puzzle Book', fh: drive('1JkfqC05cLQSvfVKHL9fu9QKeQ_ji_EdC') },
  { title: 'Solo Scenarios', gh2: pcloud('XZcG8rZoQO0FvylnmByfDltN57RBFpsfVR7'), fh: drive('1Jlc2shWrTJsz0vuP7wmHCV8VEqptNpjI') },
  { title: 'FAQ', gh2: 'https://cephalofairgames.github.io/gloomhaven2e-faq/', fh: 'https://cephalofairgames.github.io/frosthaven-faq/', merc: 'https://cephalofairgames.github.io/merc-packs-faq/' },
  { title: 'Enhancement Calculator', gh2: 'https://github.bram.dev/fh-enhancer/', fh: 'https://pikdonker.github.io/frosthaven-enhancement-calculator/', note: 'The sheet says "or use FH calc" next to the Gloomhaven 2nd Edition link.' },
];
