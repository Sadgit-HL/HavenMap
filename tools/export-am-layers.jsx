// Photoshop (ExtendScript) export of attack modifier card parts from "GH Attack Modifier Template.psd".
//
// NOT TESTED. Written without access to Photoshop, from the layer tree read with psd-tools.
// Run on a test pass first (see DO below) and check the output before exporting everything.
//
// Usage: open the PSD, then File > Scripts > Browse... and pick this file.
// Output: PNG-24 with transparency at the full canvas size (874x591), no trimming, into
//   <folder of the PSD>/psd-export/
// plus manifest.txt (file name, layer path, or FAILED and the error).
// The PSD itself is never saved. Layer visibility is restored after every export.
//
// Exported parts:
//   frame-<type>.png        Background + Card Texture Overlay + one Modifier Type (and Petals for Bless/Curse)
//   num-c-<n>.png           Centered Numbers, one file per number
//   num-o-<n>.png           Offset Numbers
//   icon-c-<group>-<item>   every item of every group in Center Icons
//   icon-s-<group>-<item>   every item of every group in Side Icons
//   sphere-*.png            corner sphere variants (empty, shuffle, numbered deck)
// Numbers and icons are exported without the card texture overlay (it is part of the frame files).

#target photoshop

(function () {
  // Switch parts off for a quick test pass, e.g. only numbers.
  // Second pass: the first run already produced frames, numbers, icons and spheres, so only the
  // parts it missed (Empower and Enfeeble) are on by default. Set the others to true to redo them.
  // Third pass: the remaining colored frames, Self/Ally labels on effect icons, and corner badge numbers.
  // Full run for the FH template (its icons match the Frosthaven card scans). Badges stay off: the
  // locked Number/Symbol layer could not be edited by script, those are made separately.
  // plain: Curse and Bless frames WITHOUT the petals (the real cards have none); only this is on for now.
  var DO = { frames: false, numbers: false, icons: false, spheres: false, extras: false,
             frames2: false, labels: false, badges: false, plain: true };

  // Modifier types not exported by the first two passes. A type with Condition/Card sub-groups
  // (Empower and Enfeeble) is exported once per sub-group, other types once.
  var FRAME_TYPES_2 = ['Wound', 'Wind', 'Ward', 'Suffer Damage', 'Stun', 'Strengthen', 'Rupture',
    'Regenerate', 'Refresh Item', 'Push/Pull', 'Provoke', 'Poison', 'Pierce', 'Muddle', 'Mixed Elements',
    'Light', 'Invisible', 'Immobilize', 'Ice', 'Fire', 'Earth', 'Disarm', 'Dark', 'Chill', 'Brittle',
    'Bane', 'Any Element', 'Add Target', 'Offset Number', 'Custom'];
  var BADGE_VALUES = ['+0', '+1', '+2', '+3', '-1', '-2', '-3'];

  var FRAME_TYPES = ['+0', 'Positive', 'Negative', 'Bless', 'Curse', '2x', 'Null'];
  var PETAL_TYPES = { 'Bless': true, 'Curse': true };
  var CENTER_NUMS = ['-3', '-2', '-1', '+0', '+1', '+2', '+3', '+4', '2x'];
  var OFFSET_NUMS = ['-3', '-2', '-1', '+0', '+1', '+2', '+3'];

  var SPHERES = 'Class Icon/Bordered Sphere (Sides)';

  // ---- helpers (ES3: no let/const, no String.trim, no JSON) -------------------------------

  function trim(s) { return String(s).replace(/^\s+|\s+$/g, ''); }

  function slug(s) {
    s = trim(s);
    if (s === '2x') return 'x2';
    s = s.replace(/^\+/, 'p').replace(/^-/, 'm');
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function isGroup(l) { return l.typename === 'LayerSet'; }

  function child(container, name) {
    var want = trim(name);
    for (var i = 0; i < container.layers.length; i++) {
      if (trim(container.layers[i].name) === want) return container.layers[i];
    }
    return null;
  }

  function childByPrefix(container, prefix) {
    for (var i = 0; i < container.layers.length; i++) {
      if (container.layers[i].name.indexOf(prefix) === 0) return container.layers[i];
    }
    return null;
  }

  // ---- visibility with undo log ------------------------------------------------------------

  var changes = [];
  function setVis(layer, v) {
    if (layer.visible !== v) { changes.push([layer, layer.visible]); layer.visible = v; }
  }
  var textChanges = [];
  // The template locks the text layer AND its parent groups (allLocked=true on "Numbered Deck" and
  // "Bordered Sphere (Sides)"). A layer inside a locked group cannot be unlocked or edited, so lift
  // the locks from the outermost group inwards, and put them back in restore().
  function getLocks(l) {
    if (isGroup(l)) return { all: l.allLocked };
    return { all: l.allLocked, pixels: l.pixelsLocked, pos: l.positionLocked, trans: l.transparentPixelsLocked };
  }
  // Each lock is cleared on its own so the error says which property Photoshop refuses.
  function clearLocks(l) {
    var props = isGroup(l) ? ['allLocked'] : ['allLocked', 'pixelsLocked', 'positionLocked', 'transparentPixelsLocked'];
    for (var i = 0; i < props.length; i++) {
      try { l[props[i]] = false; }
      catch (e) { throw new Error(l.name + '.' + props[i] + '=false: ' + String(e.message).replace(/\n/g, ' ')); }
    }
  }
  function applyLocks(l, s) {
    if (!isGroup(l)) { l.pixelsLocked = s.pixels; l.positionLocked = s.pos; l.transparentPixelsLocked = s.trans; }
    l.allLocked = s.all;
  }
  function lockText(l) {
    var s = getLocks(l);
    return l.name + '[all=' + s.all + (isGroup(l) ? '' : ' px=' + s.pixels + ' pos=' + s.pos + ' tr=' + s.trans) + ']';
  }
  function chainText(l) {
    var out = [], p = l;
    while (p && p.typename !== 'Document') { out.push(lockText(p)); p = p.parent; }
    return out.join(' < ');
  }
  // Layer plus ancestors up to (not including) the document, outermost first.
  function chainOf(l) {
    var out = [], p = l;
    while (p && p.typename !== 'Document') { out.unshift(p); p = p.parent; }
    return out;
  }
  // Records the lock states into `saved` first, so restore() can relock even if unlocking fails halfway.
  function unlockChain(l, saved) {
    var chain = chainOf(l);
    for (var i = 0; i < chain.length; i++) saved.push([chain[i], getLocks(chain[i])]);
    for (i = 0; i < chain.length; i++) {
      if (!isGroup(chain[i])) doc.activeLayer = chain[i];   // layer properties need the layer to be active
      clearLocks(chain[i]);
    }
  }
  function relock(saved) {
    for (var i = saved.length - 1; i >= 0; i--) applyLocks(saved[i][0], saved[i][1]);
  }
  function setText(layer, value) {
    var step = 'read';
    try {
      var old = layer.textItem.contents;
      step = 'unlock';
      var saved = [];
      textChanges.push([layer, old, saved]);
      unlockChain(layer, saved);
      step = 'set contents';
      layer.textItem.contents = value;
    } catch (e) {
      throw new Error('setText failed at step "' + step + '" (' + e.message.replace(/\n/g, ' ') +
                      ') chain: ' + chainText(layer) + ' kind=' + layer.kind + ' visible=' + layer.visible);
    }
  }
  function restore() {
    while (changes.length) { var c = changes.pop(); c[0].visible = c[1]; }
    while (textChanges.length) {
      var t = textChanges.pop();
      t[0].textItem.contents = t[1];   // chain is still unlocked here
      relock(t[2]);
    }
  }

  // Make exactly the layers named in `paths` visible, level by level. Every other sibling at each
  // level is hidden. A path that ends at a group leaves that group's inner state as it is.
  // Returns an array of path segments that could not be found.
  function apply(node, paths, trail, missing) {
    var wanted = {}, keys = [], i, k;
    for (i = 0; i < paths.length; i++) {
      k = trim(paths[i][0]);
      if (!wanted.hasOwnProperty(k)) { wanted[k] = []; keys.push(k); }
      if (paths[i].length > 1) wanted[k].push(paths[i].slice(1));
    }
    var found = {};
    for (i = 0; i < node.layers.length; i++) {
      var c = node.layers[i];
      k = trim(c.name);
      var w = wanted.hasOwnProperty(k);
      setVis(c, w);
      if (w) {
        found[k] = true;
        if (wanted[k].length) {
          if (isGroup(c)) apply(c, wanted[k], trail + '/' + k, missing);
          else missing.push(trail + '/' + k + ' is not a group');
        }
      }
    }
    for (i = 0; i < keys.length; i++) {
      if (!found[keys[i]]) missing.push(trail + '/' + keys[i]);
    }
  }

  // ---- export -----------------------------------------------------------------------------

  var doc, card, artboard, outFolder, manifest = [], used = {};

  function uniqueName(name) {
    if (!used[name]) { used[name] = 1; return name; }
    used[name]++;
    return name + '-' + used[name];
  }

  function exportPng(name) {
    var f = new File(outFolder.fsName + '/' + name + '.png');
    var o = new ExportOptionsSaveForWeb();
    o.format = SaveDocumentType.PNG;
    o.PNG8 = false;
    o.transparency = true;
    o.interlaced = false;
    o.optimized = true;
    doc.exportDocument(f, ExportType.SAVEFORWEB, o);
  }

  function pathText(paths) {
    var out = [];
    for (var i = 0; i < paths.length; i++) out.push(paths[i].join(' > '));
    return out.join(' + ');
  }

  // `post` (optional) runs after the layers are set, to force extra layers visible or change text.
  function doExport(rawName, paths, post) {
    var name = uniqueName(rawName);
    try {
      restore();
      if (artboard) setVis(artboard, true);
      setVis(card, true);
      var missing = [];
      apply(card, paths, '', missing);
      if (missing.length) throw new Error('layer not found: ' + missing.join(', '));
      if (post) post();
      exportPng(name);
      manifest.push(name + '.png\t' + pathText(paths));
    } catch (e) {
      manifest.push('FAILED ' + name + '\t' + e.message);
    } finally {
      restore();
    }
  }

  // ---- parts ------------------------------------------------------------------------------

  function exportFrames() {
    for (var i = 0; i < FRAME_TYPES.length; i++) {
      var t = FRAME_TYPES[i];
      var paths = [['Background'], ['Card Texture Overlay'], ['Modifier Type', t]];
      if (PETAL_TYPES[t]) paths.push(['Petals (Bless/Curse/Etc.)', t]);
      doExport('frame-' + slug(t), paths);
    }
  }

  // Curse and Bless without petals: the petal layer is simply not made visible.
  function exportPlainFrames() {
    var names = ['Curse', 'Bless'];
    for (var i = 0; i < names.length; i++) {
      doExport('frame-' + slug(names[i]) + '-plain',
               [['Background'], ['Card Texture Overlay'], ['Modifier Type', names[i]]]);
    }
  }

  function exportNumbers() {
    var i;
    for (i = 0; i < CENTER_NUMS.length; i++) {
      doExport('num-c-' + slug(CENTER_NUMS[i]), [['Numerical Value', 'Centered Numbers', CENTER_NUMS[i]]]);
    }
    for (i = 0; i < OFFSET_NUMS.length; i++) {
      doExport('num-o-' + slug(OFFSET_NUMS[i]), [['Numerical Value', 'Offset Numbers', OFFSET_NUMS[i]]]);
    }
  }

  // Every item of every group below `Icons/Conditions > <setName>`, one file each.
  // A direct child that is a plain layer (e.g. "Rolling") is exported as it is.
  function exportIconSet(setName, prefix) {
    var top = child(card, 'Icons/Conditions');
    var set = top ? child(top, setName) : null;
    if (!set) { manifest.push('FAILED ' + prefix + '\tIcons/Conditions > ' + setName + ' not found'); return; }
    for (var i = 0; i < set.layers.length; i++) {
      var g = set.layers[i];
      if (isGroup(g)) {
        for (var j = 0; j < g.layers.length; j++) {
          var it = g.layers[j];
          doExport(prefix + slug(g.name) + '-' + slug(it.name),
                   [['Icons/Conditions', setName, g.name, it.name]]);
        }
      } else {
        doExport(prefix + slug(g.name), [['Icons/Conditions', setName, g.name]]);
      }
    }
  }

  // Empower and Enfeeble are built differently from the other conditions: the icon group holds hidden
  // smart objects (plain, Major, and "(Target/Range)" variants) and the Modifier Type has two
  // sub-variants (Condition, Card). The first pass exported these as empty images.
  // The Range sub-group (needs a value typed in) and the Minor petal icons are not exported.
  function exportExtras() {
    var names = ['Empower', 'Enfeeble'];
    var sets = [['Center Icons', 'icon-c-'], ['Side Icons', 'icon-s-']];
    var top = child(card, 'Icons/Conditions');
    var i, j, k, n, base;
    for (i = 0; i < sets.length; i++) {
      var set = top ? child(top, sets[i][0]) : null;
      var cond = null;
      if (set) {
        for (j = 0; j < set.layers.length; j++) {
          if (trim(set.layers[j].name).indexOf('Conditions') === 0) { cond = set.layers[j]; break; }
        }
      }
      if (!cond) { manifest.push('FAILED ' + sets[i][1] + 'extras\tConditions group not found in ' + sets[i][0]); continue; }
      for (k = 0; k < names.length; k++) {
        n = names[k];
        base = ['Icons/Conditions', sets[i][0], cond.name, n];
        doExport(sets[i][1] + slug(n), [base.concat([n])]);
        doExport(sets[i][1] + 'major-' + slug(n), [base.concat(['Major ' + n])]);
        doExport(sets[i][1] + slug(n) + '-target-range', [base.concat([n + ' (Target/Range)', n + ' (Target/Range)'])]);
        doExport(sets[i][1] + 'major-' + slug(n) + '-target-range', [base.concat([n + ' (Target/Range)', 'Major ' + n + ' (Target/Range)'])]);
      }
    }
    var variants = ['Condition', 'Card'];
    for (k = 0; k < names.length; k++) {
      for (j = 0; j < variants.length; j++) {
        doExport('frame-' + slug(names[k]) + '-' + slug(variants[j]), [
          ['Background'], ['Card Texture Overlay'],
          ['Modifier Type', names[k], variants[j]],
          ['Petals (Bless/Curse/Etc.)', names[k]]
        ]);
      }
    }
  }

  // Remaining colored frames (Background + Texture + one Modifier Type, no petals).
  function exportFrames2() {
    var mt = child(card, 'Modifier Type');
    for (var i = 0; i < FRAME_TYPES_2.length; i++) {
      var t = FRAME_TYPES_2[i];
      var node = mt ? child(mt, t) : null;
      if (!node) { manifest.push('FAILED frame-' + slug(t) + '\tModifier Type > ' + t + ' not found'); continue; }
      var variants = [];
      for (var j = 0; j < node.layers.length; j++) {
        var n = trim(node.layers[j].name);
        if (isGroup(node.layers[j]) && (n === 'Condition' || n === 'Card')) variants.push(n);
      }
      if (variants.length) {
        for (var v = 0; v < variants.length; v++) {
          doExport('frame-' + slug(t) + '-' + slug(variants[v]),
                   [['Background'], ['Card Texture Overlay'], ['Modifier Type', t, variants[v]]]);
        }
      } else {
        doExport('frame-' + slug(t), [['Background'], ['Card Texture Overlay'], ['Modifier Type', t]]);
      }
    }
  }

  // Effect icons (Heal, Shield, Retaliate) have hidden Self and Ally text layers. Export one file
  // per label with the icon art at its default state. The Range sub-group needs a typed value and
  // is not exported.
  function exportLabels() {
    var top = child(card, 'Icons/Conditions');
    var sets = [['Center Icons', 'icon-c-'], ['Side Icons', 'icon-s-']];
    for (var s = 0; s < sets.length; s++) {
      var set = top ? child(top, sets[s][0]) : null;
      var eff = null, i, j;
      if (set) {
        for (i = 0; i < set.layers.length; i++) {
          if (trim(set.layers[i].name).indexOf('Effects') === 0) { eff = set.layers[i]; break; }
        }
      }
      if (!eff) { manifest.push('FAILED ' + sets[s][1] + 'labels\tEffects group not found in ' + sets[s][0]); continue; }
      for (i = 0; i < eff.layers.length; i++) {
        var item = eff.layers[i];
        if (!isGroup(item)) continue;
        for (j = 0; j < item.layers.length; j++) {
          var lab = item.layers[j];
          var ln = trim(lab.name);
          if (ln !== 'Self' && ln !== 'Ally') continue;
          (function (itemNode, labelNode, labelName) {
            var base = slug(itemNode.name).replace(/-side$/, '');
            doExport(sets[s][1] + 'effects-' + base + '-' + slug(labelName),
                     [['Icons/Conditions', sets[s][0], eff.name, itemNode.name]],
                     function () { setVis(labelNode, true); });
          })(item, lab, ln);
        }
      }
    }
  }

  // Corner badge: the Numbered Deck sphere with its placeholder "X" replaced by a value.
  function exportBadges() {
    var grp = child(card, SPHERES);
    var numbered = grp ? child(grp, 'Numbered Deck') : null;
    var txt = numbered ? child(numbered, 'Number/Symbol') : null;
    if (!txt || txt.kind !== LayerKind.TEXT) {
      manifest.push('FAILED badge\t' + SPHERES + ' > Numbered Deck > Number/Symbol is not a text layer');
      return;
    }
    for (var i = 0; i < BADGE_VALUES.length; i++) {
      (function (val) {
        doExport('badge-' + slug(val),
                 [[SPHERES, 'Numbered Deck', 'Bordered Sphere'], [SPHERES, 'Numbered Deck', 'Number/Symbol']],
                 function () { setText(txt, val); });
      })(BADGE_VALUES[i]);
    }
  }

  function exportSpheres() {
    doExport('sphere-empty', [
      [SPHERES, 'Class Icon', 'Bordered Sphere'],
      [SPHERES, 'Class Icon', 'Glass Sphere Overlay (Class Icon)']
    ]);
    doExport('sphere-shuffle', [[SPHERES, 'Shuffle']]);
    doExport('sphere-numbered', [[SPHERES, 'Numbered Deck', 'Bordered Sphere']]);
  }

  // ---- main -------------------------------------------------------------------------------

  if (app.documents.length === 0) { alert('Open the template PSD first.'); return; }
  doc = app.activeDocument;
  if (doc.name.indexOf('Attack Modifier Template') < 0) {
    alert('The active document is "' + doc.name + '", not the attack modifier template. Aborting.');
    return;
  }

  // Works with the artboard (Trimmed Card > Attack Modifier Card) or after "Ungroup from Artboard"
  // (Attack Modifier Card at the top level). The artboard has an opaque background, so for
  // transparent exports ungroup it first.
  artboard = childByPrefix(doc, 'Trimmed Card');
  card = artboard ? child(artboard, 'Attack Modifier Card') : child(doc, 'Attack Modifier Card');
  if (!card) { alert('Layer tree not as expected (Attack Modifier Card not found). Aborting.'); return; }

  // The FH and GH templates have different icon art, so keep their exports apart.
  outFolder = new Folder(doc.path.fsName + (doc.name.indexOf('FH') === 0 ? '/psd-export-fh' : '/psd-export'));
  if (!outFolder.exists) outFolder.create();

  if (!confirm('Export to:\n' + outFolder.fsName + '\n\nFrames: ' + DO.frames + ', numbers: ' + DO.numbers +
               ', icons: ' + DO.icons + ', spheres: ' + DO.spheres + '\n\nThe PSD will not be saved. Continue?')) return;

  var oldDialogs = app.displayDialogs;
  app.displayDialogs = DialogModes.NO;
  try {
    if (DO.numbers) exportNumbers();
    if (DO.spheres) exportSpheres();
    if (DO.frames)  exportFrames();
    if (DO.icons) {
      exportIconSet('Center Icons', 'icon-c-');
      exportIconSet('Side Icons', 'icon-s-');
    }
    if (DO.extras) exportExtras();
    if (DO.frames2) exportFrames2();
    if (DO.labels) exportLabels();
    if (DO.badges) exportBadges();
    if (DO.plain) exportPlainFrames();
  } finally {
    restore();
    app.displayDialogs = oldDialogs;
  }

  // A second pass must not overwrite the manifest of the first one.
  var firstPass = DO.frames || DO.numbers || DO.icons || DO.spheres;
  var mf = new File(outFolder.fsName + '/' + (firstPass ? 'manifest.txt' : (DO.extras ? 'manifest-extras.txt' : (DO.plain ? 'manifest-plain.txt' : ((DO.frames2 || DO.labels) ? 'manifest-pass3.txt' : 'manifest-badges.txt')))));
  mf.encoding = 'UTF-8';
  mf.open('w');
  mf.write(manifest.join('\n') + '\n');
  mf.close();

  var failed = 0;
  for (var m = 0; m < manifest.length; m++) if (manifest[m].indexOf('FAILED') === 0) failed++;
  alert('Done. ' + (manifest.length - failed) + ' exported, ' + failed + ' failed.\nSee manifest.txt in\n' + outFolder.fsName);
})();
