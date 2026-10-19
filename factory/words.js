/* Words: every sentence a maths game shows and says.
 * The game page uses it to show and speak a line. make.py runs it in Node to list every line, so each one can be voiced.
 * Written for old JavaScript engines on purpose: no optional chaining, no modules. */
var WORDS = (function () {
  var NAMES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  var MAX = 10;
  // The numbers each challenge can ask for. The game picks from these, and make.py voices all of them.
  var RANGES = {build: [2, 7], show: [1, 5], total: [3, 10], keep: [1, 3], takeFrom: [2, 6], answer: [0, 5]};

  // A theme can replace any of these. {things} is "tank" or "tanks" to match the number before it.
  var LINES = {
    sum: '{L} plus {R} equals {S}.',
    takeAway: '{a} take away {k} is {b}.',
    same: '{n} equals {n}.',
    bigger: '{a} is bigger than {b}.',
    smaller: '{a} is smaller than {b}.',
    count: '{n} {things}.',
    only: 'Only {n} left.',
    yes: ['Yes!', 'Well done!', 'You did it!'],
    next: 'Tap New challenge for another one.',
    full: 'That side is full. Ten is the most.',
    empty: 'Build some {many} first!',
    clear: 'All clear. Build some {many}!',
    act: '{Many}, fire!',
    modeAdd: "Let's add!",
    modeTake: "Let's take away!",
    modeCompare: "Let's compare!",
    // adding
    taskBuild: 'Build {n} {things} on the left.',
    taskShow: 'Show {a} plus {b}.',
    taskTotal: 'Make {t} {things} in all.',
    // taking away: the left side is what you have, the right side is how many you take away
    taskTakeShow: 'Show {a} take away {b}.',
    taskAnswer: 'Make the answer {n}.',
    taskKeep: 'Blow up {many} until the right side has {n}.',
    taskBelow: 'Make the answer below zero.',
    // comparing
    taskEqual: 'Make both sides equal.',
    taskBigger: 'Make the right side bigger than the left.',
    taskSmaller: 'Make the right side smaller than the left.'
  };
  // Lines that are maths: on screen they show symbols, "3 + 2 = 5", and drop the full stop.
  var MATH = {sum: 1, takeAway: 1, same: 1, bigger: 1, smaller: 1, taskShow: 1, taskTakeShow: 1};

  function tpl(theme, key, i) {
    var t = (theme.lines && theme.lines[key]) || LINES[key];
    return Array.isArray(t) ? t[(i || 0) % t.length] : t;
  }
  function number(v, spoken) {
    if (v < 0) return spoken ? 'negative ' + NAMES[-v] : '−' + (-v);
    return spoken ? NAMES[v] : String(v);
  }
  function fill(text, vars, theme, spoken) {
    var count = vars.n !== undefined ? vars.n : vars.t !== undefined ? vars.t : 2;
    return text.replace(/\{(\w+)\}/g, function (m, k) {
      if (k === 'things') return count === 1 ? theme.one : theme.many;
      if (k === 'many') return theme.many;
      if (k === 'Many') return theme.many.charAt(0).toUpperCase() + theme.many.slice(1);
      if (k === 'one') return theme.one;
      var v = vars[k];
      if (typeof v !== 'number') return m;
      return number(v, spoken);
    });
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  // One line: what the screen shows, what the voice says, and the name of its voice clip.
  function line(theme, key, vars, i) {
    var text = tpl(theme, key, i);
    var speak = cap(fill(text, vars || {}, theme, true));
    var show = fill(text, vars || {}, theme, false);
    if (MATH[key]) {
      show = show.replace(/ is bigger than /g, ' > ').replace(/ is smaller than /g, ' < ')
        .replace(/ take away (\d+) is /g, ' − $1 = ').replace(/ take away /g, ' − ')
        .replace(/ plus /g, ' + ').replace(/ equals /g, ' = ');
    }
    show = show.replace(/\.$/, '');
    return {show: show, speak: speak, clip: slug(speak)};
  }
  // How the left side compares with the right, read left to right: "3 < 5", "Three is smaller than five."
  function compare(theme, L, R) {
    if (L > R) return line(theme, 'bigger', {a: L, b: R});
    if (L < R) return line(theme, 'smaller', {a: L, b: R});
    return line(theme, 'same', {n: L});
  }

  function range(r) { var out = []; for (var i = r[0]; i <= r[1]; i++) out.push(i); return out; }

  // Every line the game can say, for make.py to voice.
  function all(theme) {
    var out = [], seen = {};
    function add(l) { if (!seen[l.clip]) { seen[l.clip] = 1; out.push(l); } }
    var nums = range([0, MAX]);
    nums.forEach(function (L) {
      nums.forEach(function (R) {
        add(line(theme, 'sum', {L: L, R: R, S: L + R}));
        add(line(theme, 'takeAway', {a: L, k: R, b: L - R}));
        add(compare(theme, L, R));
      });
    });
    range(RANGES.build).forEach(function (n) { add(line(theme, 'taskBuild', {n: n})); add(line(theme, 'count', {n: n})); });
    range(RANGES.show).forEach(function (a) { range(RANGES.show).forEach(function (b) { add(line(theme, 'taskShow', {a: a, b: b})); }); });
    range(RANGES.total).forEach(function (t) { add(line(theme, 'taskTotal', {t: t})); });
    range(RANGES.takeFrom).forEach(function (a) { range([1, a]).forEach(function (b) { add(line(theme, 'taskTakeShow', {a: a, b: b})); }); });
    range(RANGES.answer).forEach(function (n) { add(line(theme, 'taskAnswer', {n: n})); });
    range(RANGES.keep).forEach(function (n) { add(line(theme, 'taskKeep', {n: n})); add(line(theme, 'only', {n: n})); });
    var yes = (theme.lines && theme.lines.yes) || LINES.yes;
    yes.forEach(function (y, i) { add(line(theme, 'yes', {}, i)); });
    ['next', 'full', 'empty', 'clear', 'act', 'modeAdd', 'modeTake', 'modeCompare', 'taskBelow', 'taskEqual', 'taskBigger',
      'taskSmaller'].forEach(function (k) { add(line(theme, k, {})); });
    return out;
  }

  return {NAMES: NAMES, MAX: MAX, RANGES: RANGES, LINES: LINES, line: line, compare: compare, all: all, slug: slug};
})();
if (typeof module !== 'undefined') module.exports = WORDS;
