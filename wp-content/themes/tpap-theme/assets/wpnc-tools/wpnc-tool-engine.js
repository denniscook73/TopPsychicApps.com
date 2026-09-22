/* WP-Net-Control interactive tools. No CDN, network calls, or PHP endpoints. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WPNCTool = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function digits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function reduceNumber(value) {
    var n = parseInt(value, 10) || 0;
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce(function (sum, digit) { return sum + Number(digit); }, 0);
    }
    return n;
  }

  function parseIsoDate(value) {
    var match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    var year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    if (year < 1 || month < 1 || month > 12 || day < 1) return null;
    var leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    var days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > days[month - 1]) return null;
    return { year: year, month: month, day: day };
  }

  function lifePath(date) {
    if (!parseIsoDate(date)) return null;
    var d = digits(date);
    return reduceNumber(d.split('').reduce(function (sum, digit) { return sum + Number(digit); }, 0));
  }

  function zodiac(date) {
    var parsed = parseIsoDate(date);
    if (!parsed) return null;
    var month = parsed.month, day = parsed.day;
    var starts = [
      ['Aquarius', 1, 20], ['Pisces', 2, 19], ['Aries', 3, 21],
      ['Taurus', 4, 20], ['Gemini', 5, 21], ['Cancer', 6, 21],
      ['Leo', 7, 23], ['Virgo', 8, 23], ['Libra', 9, 23],
      ['Scorpio', 10, 23], ['Sagittarius', 11, 22], ['Capricorn', 12, 22]
    ];
    var current = 'Capricorn';
    starts.forEach(function (start) {
      if (month > start[1] || (month === start[1] && day >= start[2])) current = start[0];
    });
    return current;
  }

  function hash(value) {
    var h = 2166136261;
    String(value || '').split('').forEach(function (char) {
      h ^= char.charCodeAt(0); h = Math.imul(h, 16777619);
    });
    return h >>> 0;
  }

  function tarotDraw(question, spread, deck) {
    var cards = deck && deck.length ? deck : ['The Star', 'The Hermit', 'The Sun'];
    var count = spread === 'three' ? 3 : 1;
    var seed = hash(String(question || '').trim().toLowerCase() + '|' + spread);
    var result = [];
    for (var i = 0; i < count; i += 1) {
      var card = cards[(seed + i * 31) % cards.length];
      result.push(card && typeof card === 'object' ? card.name : card);
    }
    return result;
  }

  var MAJOR_ARCANA = [
    ['The Fool', 'Beginning with trust, curiosity, and room to learn.', 'Pause before the leap; freedom needs a little grounding.', 'open', '\u2727'],
    ['The Magician', 'Use the tools already within reach and act with intention.', 'Scattered energy or self-doubt is weakening your follow-through.', 'yes', '\u2726'],
    ['The High Priestess', 'Listen beneath the noise; not every answer needs immediate action.', 'Inner knowledge is being ignored or clouded by outside opinions.', 'pause', '\u263e'],
    ['The Empress', 'Nurture what is growing through care, patience, and embodiment.', 'Overgiving or neglecting your own needs is draining the situation.', 'yes', '\u2740'],
    ['The Emperor', 'Create clear boundaries, structure, and dependable next steps.', 'Rigidity or control may be blocking a more workable solution.', 'yes', '\u2654'],
    ['The Hierophant', 'Established wisdom, mentorship, or shared values can steady you.', 'Question a rule or tradition that no longer fits your lived truth.', 'pause', '\u263f'],
    ['The Lovers', 'Choose in alignment with your values, not only immediate desire.', 'Mixed values or avoidance of a choice is creating distance.', 'yes', '\u2661'],
    ['The Chariot', 'Focused effort and emotional self-command can move this forward.', 'Competing impulses need direction before momentum will help.', 'yes', '\u2609'],
    ['Strength', 'Gentle courage and patient self-trust are your strongest influence.', 'Force is replacing confidence; meet fear with compassion first.', 'yes', '\u221e'],
    ['The Hermit', 'Step back long enough to hear your own wise counsel.', 'Isolation or overthinking may be keeping insight from becoming action.', 'pause', '\u2606'],
    ['Wheel of Fortune', 'A cycle is turning; respond well to what you cannot control.', 'Resistance to change is making a temporary turn feel permanent.', 'open', '\u2638'],
    ['Justice', 'Look at the facts, consequences, and agreements with clear eyes.', 'Bias, avoidance, or an uneven exchange needs to be corrected.', 'yes', '\u2696'],
    ['The Hanged Man', 'A willing pause can reveal a perspective that effort cannot.', 'Waiting has become stalling; name what must be released.', 'pause', '\u25c7'],
    ['Death', 'An ending clears space for an honest transformation.', 'Clinging to a completed chapter is delaying renewal.', 'open', '\u273d'],
    ['Temperance', 'Blend patience and practical adjustment; progress comes through balance.', 'Excess or poor timing asks for recalibration before the next move.', 'yes', '\u26b1'],
    ['The Devil', 'Notice the attachment, bargain, or fear that limits your freedom.', 'A binding pattern is becoming visible and can now be interrupted.', 'no', '\u26d3'],
    ['The Tower', 'A false structure is breaking so truth can no longer be avoided.', 'Fear of disruption is prolonging an unstable arrangement.', 'no', '\u26a1'],
    ['The Star', 'Hope becomes useful when paired with honest healing and renewal.', 'Discouragement is obscuring evidence that recovery has begun.', 'yes', '\u2729'],
    ['The Moon', 'Move slowly through uncertainty; feelings are real, but not all are facts.', 'Confusion is lifting, or a hidden fear is ready to be named.', 'pause', '\u263d'],
    ['The Sun', 'Clarity, warmth, and visible progress support a confident yes.', 'Joy is present but muted by fatigue, doubt, or unrealistic expectations.', 'yes', '\u2600'],
    ['Judgement', 'Answer the call to review, forgive, and choose differently now.', 'Harsh self-judgment or avoidance is preventing a clean decision.', 'open', '\u266b'],
    ['The World', 'Integration and completion make the next chapter possible.', 'One unfinished detail needs attention before closure can feel real.', 'yes', '\u25ce']
  ];

  var SUITS = {
    Wands: { symbol: '\u2737', upright: 'creative energy, courage, and purposeful action', reversed: 'burnout, delay, or energy without direction', tone: 'yes' },
    Cups: { symbol: '\u2661', upright: 'emotion, intuition, connection, and receptivity', reversed: 'emotional avoidance, blurred boundaries, or unmet needs', tone: 'open' },
    Swords: { symbol: '\u25c7', upright: 'truth, communication, discernment, and decisive thought', reversed: 'mental strain, mixed messages, or a truth not yet faced', tone: 'pause' },
    Pentacles: { symbol: '\u25c9', upright: 'practical care, resources, the body, and steady results', reversed: 'instability, misplaced effort, or neglected foundations', tone: 'yes' }
  };

  var RANKS = [
    ['Ace', 'A clear beginning is available through', 'Potential stays dormant until you make room for'],
    ['Two', 'A choice asks you to balance', 'Indecision or divided attention complicates'],
    ['Three', 'Collaboration and early progress strengthen', 'Misalignment or weak cooperation slows'],
    ['Four', 'Stability and a deliberate pause protect', 'Stagnation or holding too tightly restricts'],
    ['Five', 'A challenge reveals what must change within', 'Lingering conflict or avoidance drains'],
    ['Six', 'Restoration, support, and measured progress return to', 'Old imbalance or difficult transition affects'],
    ['Seven', 'Discernment and conviction are needed around', 'Doubt, defensiveness, or scattered priorities distort'],
    ['Eight', 'Focused movement and practiced skill develop', 'Delay, repetition, or loss of focus interrupts'],
    ['Nine', 'Experience and resilience bring perspective to', 'Exhaustion, worry, or guardedness overshadows'],
    ['Ten', 'A cycle reaches its full weight or fulfillment through', 'An overdue release or unsustainable burden surrounds'],
    ['Page', 'Curiosity and a useful message open a path through', 'Inexperience or unreliable news complicates'],
    ['Knight', 'Committed movement and momentum activate', 'Haste, inconsistency, or stalled pursuit unsettles'],
    ['Queen', 'Mature inner awareness and steady care guide', 'Self-neglect or an unbalanced inner response clouds'],
    ['King', 'Responsible leadership and practiced command shape', 'Control, stubbornness, or misuse of authority harms']
  ];

  function tarotDeck() {
    var deck = MAJOR_ARCANA.map(function (card, index) {
      return { id: 'major-' + index, name: card[0], arcana: 'Major Arcana', upright: card[1], reversed: card[2], tone: card[3], symbol: card[4] };
    });
    Object.keys(SUITS).forEach(function (suit) {
      var details = SUITS[suit];
      RANKS.forEach(function (rank, index) {
        deck.push({
          id: suit.toLowerCase() + '-' + (index + 1),
          name: rank[0] + ' of ' + suit,
          arcana: suit,
          upright: rank[1] + ' ' + details.upright + '.',
          reversed: rank[2] + ' ' + details.reversed + '.',
          tone: details.tone,
          symbol: details.symbol
        });
      });
    });
    return deck;
  }

  var TAROT_MODES = {
    daily: { count: 1, labels: ['Your card'], question: false },
    yes_no: { count: 1, labels: ['Reflective answer'], question: true },
    three: { count: 3, labels: ['Past', 'Present', 'Future'], question: true },
    love: { count: 3, labels: ['You', 'The connection', 'What wants care'], question: true }
  };

  /* Site configs may override visible copy without changing the shared engine.
   * Keep fallbacks here so older configs remain fully functional. */
  function tarotCopy(config, key, fallback) {
    var copy = config && config.uiCopy;
    var value = copy && copy[key];
    return typeof value === 'string' && value.trim() ? value : fallback;
  }

  function tarotSpread(config, mode) {
    var base = TAROT_MODES[mode] || TAROT_MODES.daily;
    var custom = config && config.spreads && config.spreads[mode];
    if (!custom || typeof custom !== 'object') return base;
    return {
      count: base.count,
      labels: Array.isArray(custom.labels) && custom.labels.length === base.count ? custom.labels.map(String) : base.labels,
      question: base.question,
      prompt: typeof custom.prompt === 'string' ? custom.prompt : ''
    };
  }

  function tarotCta(config) {
    var cta = config && config.cta;
    var href = cta && typeof cta.href === 'string' ? cta.href : '/go/';
    return { href: safeInternalHref(href), text: cta && typeof cta.text === 'string' && cta.text.trim() ? cta.text : 'Explore a personal reading' };
  }
  /* Default CTA remains href="/go/" data-source="tarot-result" for legacy integrations. */

  function seededRandom(seed) {
    var state = hash(seed || 'tarot');
    return function () {
      state += 0x6D2B79F5;
      var value = state;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function shuffledIndexes(length, seed) {
    var indexes = Array.from({ length: length }, function (_, index) { return index; });
    var random = seededRandom(seed);
    for (var i = indexes.length - 1; i > 0; i -= 1) {
      var j = Math.floor(random() * (i + 1));
      var swap = indexes[i]; indexes[i] = indexes[j]; indexes[j] = swap;
    }
    return indexes;
  }

  function cleanQuestion(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 280);
  }

  function createTarotReading(mode, seed, selections, question, suppliedDeck) {
    var spec = TAROT_MODES[mode];
    var deck = suppliedDeck && suppliedDeck.length === 78 ? suppliedDeck : tarotDeck();
    if (!spec || !Array.isArray(selections) || selections.length !== spec.count) return null;
    var unique = {};
    var positions = selections.map(function (value) { return Number(value); });
    for (var p = 0; p < positions.length; p += 1) {
      if (!Number.isInteger(positions[p]) || positions[p] < 0 || positions[p] >= deck.length || unique[positions[p]]) return null;
      unique[positions[p]] = true;
    }
    var order = shuffledIndexes(deck.length, String(seed || 'tarot'));
    var cards = positions.map(function (position, index) {
      var cardIndex = order[position];
      var orientation = hash(String(seed) + '|' + position + '|' + index) % 2 ? 'reversed' : 'upright';
      return { index: cardIndex, orientation: orientation, label: spec.labels[index], card: deck[cardIndex] };
    });
    return { version: 1, mode: mode, seed: String(seed || 'tarot').slice(0, 64), question: cleanQuestion(question), cards: cards };
  }

  function serializeTarotReading(reading, baseUrl) {
    if (!reading || !TAROT_MODES[reading.mode] || !Array.isArray(reading.cards)) return '';
    var base = String(baseUrl || '/');
    var absolute = /^[a-z][a-z0-9+.-]*:/i.test(base);
    var url;
    try { url = new URL(base, 'https://wpnc.local'); } catch (error) { return ''; }
    url.search = '';
    url.hash = '';
    url.searchParams.set('reading', '1');
    url.searchParams.set('mode', reading.mode);
    url.searchParams.set('cards', reading.cards.map(function (item) { return item.index + (item.orientation === 'reversed' ? 'r' : 'u'); }).join('.'));
    return absolute ? url.toString() : url.pathname + url.search;
  }

  function parseTarotReading(search, suppliedDeck) {
    var deck = suppliedDeck && suppliedDeck.length === 78 ? suppliedDeck : tarotDeck();
    var params;
    try { params = new URLSearchParams(String(search || '').replace(/^\?/, '')); } catch (error) { return null; }
    if (params.get('reading') !== '1') return null;
    var mode = params.get('mode');
    var spec = TAROT_MODES[mode];
    var rawCards = String(params.get('cards') || '').split('.');
    if (!spec || rawCards.length !== spec.count) return null;
    var seen = {};
    var cards = [];
    for (var i = 0; i < rawCards.length; i += 1) {
      var match = rawCards[i].match(/^(\d{1,2})([ur])$/);
      if (!match) return null;
      var index = Number(match[1]);
      if (index < 0 || index >= deck.length || seen[index]) return null;
      seen[index] = true;
      cards.push({ index: index, orientation: match[2] === 'r' ? 'reversed' : 'upright', label: spec.labels[i], card: deck[index] });
    }
    return { version: 1, mode: mode, question: '', cards: cards };
  }

  function tarotReadingSignature(reading) {
    if (!reading || !TAROT_MODES[reading.mode] || !Array.isArray(reading.cards)) return '';
    return reading.mode + '|' + reading.cards.map(function (item) { return item.index + (item.orientation === 'reversed' ? 'r' : 'u'); }).join('.');
  }

  function rememberTarotQuestion(reading) {
    var signature = tarotReadingSignature(reading);
    var question = cleanQuestion(reading && reading.question);
    if (!signature || !question || typeof sessionStorage === 'undefined') return;
    try {
      sessionStorage.setItem('wpnc-tarot-question-' + hash(signature), JSON.stringify({ signature: signature, question: question }));
    } catch (error) { /* private mode or disabled storage */ }
  }

  function recallTarotQuestion(reading) {
    var signature = tarotReadingSignature(reading);
    if (!signature || typeof sessionStorage === 'undefined') return '';
    try {
      var stored = JSON.parse(sessionStorage.getItem('wpnc-tarot-question-' + hash(signature)) || 'null');
      return stored && stored.signature === signature ? cleanQuestion(stored.question) : '';
    } catch (error) { return ''; }
  }

  function clarityCoach(question) {
    var clean = String(question || '').trim().replace(/\s+/g, ' ');
    if (!clean) return { question: '', prompts: ['What would you most like to understand?'], ready: false, error: 'Please enter your question' };
    var prompts = [];
    if (clean.length < 25) prompts.push('What part of this situation feels most important right now?');
    if (!/[?]/.test(clean)) prompts.push('Turn it into one open question ending with a question mark.');
    prompts.push('Name the time frame and the choice that is yours to make.');
    return { question: clean, prompts: prompts, ready: clean.length >= 25 && /[?]/.test(clean) };
  }

  function matchMedium(need, readers) {
    var key = String(need || '').toLowerCase();
    return (readers || []).map(function (reader, index) {
      var tags = (reader.tags || []).map(function (tag) { return String(tag).toLowerCase(); });
      var score = tags.indexOf(key) >= 0 ? 3 : 0;
      if (key === 'grief' && tags.indexOf('mediumship') >= 0) score += 2;
      if (key === 'direction' && tags.indexOf('intuitive') >= 0) score += 1;
      return { reader: reader, score: score, index: index };
    }).sort(function (a, b) { return b.score - a.score || a.index - b.index; }).slice(0, 3);
  }

  function scoreIntuition(answers, dimensions) {
    return scoreIntuitionMeta(answers, dimensions).totals;
  }

  function scoreIntuitionMeta(answers, dimensions) {
    var dims = dimensions && dimensions.length ? dimensions : ['pattern', 'feeling', 'timing', 'empathy'];
    var totals = {};
    var counts = {};
    dims.forEach(function (dimension) { totals[dimension] = 0; counts[dimension] = 0; });
    (answers || []).forEach(function (answer, index) {
      var dimension = dims[index % dims.length];
      totals[dimension] += Math.max(0, Math.min(5, Number(answer) || 0));
      counts[dimension] += 1;
    });
    var maxima = {};
    dims.forEach(function (dimension) { maxima[dimension] = counts[dimension] * 5; });
    return { totals: totals, maxima: maxima };
  }

  function compatibility(firstDate, secondDate) {
    var a = lifePath(firstDate), b = lifePath(secondDate), za = zodiac(firstDate), zb = zodiac(secondDate);
    if (!a || !b || !za || !zb) return null;
    var score = 50 + (a === b ? 18 : 0) + ((a + b) % 7) * 3;
    return { firstLifePath: a, secondLifePath: b, firstZodiac: za, secondZodiac: zb, score: Math.min(97, score) };
  }

  function journalPrompt(prompts, seed) {
    var list = prompts && prompts.length ? prompts : ['What do you want to remember about this person?'];
    return list[hash(seed || 'reflection') % list.length];
  }

  function symbolicReflection(symbol, symbols) {
    var key = String(symbol || '');
    return (symbols || []).filter(function (item) { return item && item.key === key; })[0] || null;
  }

  function radarSvg(scores, maxima) {
    var keys = Object.keys(scores || {}), cx = 100, cy = 100, radius = 76;
    if (!keys.length) return '';
    var points = keys.map(function (key, index) {
      var angle = (-Math.PI / 2) + (Math.PI * 2 * index / keys.length);
      var maximum = maxima && Number(maxima[key]) > 0 ? Number(maxima[key]) : 15;
      var scale = Math.max(0, Math.min(1, Number(scores[key]) / maximum));
      return (cx + Math.cos(angle) * radius * scale).toFixed(1) + ',' + (cy + Math.sin(angle) * radius * scale).toFixed(1);
    }).join(' ');
    return '<svg class="wpnc-tool__radar" viewBox="0 0 200 200" role="img" aria-label="Intuition profile radar"><circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" opacity=".2"/><circle cx="100" cy="100" r="38" fill="none" stroke="currentColor" opacity=".2"/><polygon points="' + points + '" fill="currentColor" opacity=".35" stroke="currentColor" stroke-width="2"/></svg>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function resultBox(root, title, body) {
    var output = root.querySelector('[data-result]');
    if (!output) return;
    output.hidden = false;
    output.innerHTML = '<h2>' + escapeHtml(title) + '</h2><div>' + body + '</div>';
    output.focus();
  }

  function safeInternalHref(value) {
    var href = String(value || '');
    var path = href.split('?')[0];
    var hasTraversal = path.split('/').some(function (segment) { return segment === '.' || segment === '..'; });
    return /^\/[a-z0-9/_.-]*\/?(?:\?[a-z0-9%&=._-]*)?$/i.test(href) && href.indexOf('//') !== 0 && !hasTraversal ? href : '#';
  }

  function tarotHeader(config, compact) {
    return '<div class="wpnc-tarot__hero' + (compact ? ' wpnc-tarot__hero--compact' : '') + '">' +
      '<div class="wpnc-tarot__orbit" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<p class="wpnc-tool__eyebrow">' + escapeHtml(config.eyebrow || 'Free tarot workshop') + '</p>' +
      '<h2>' + escapeHtml(config.title || 'A quieter way to read the cards') + '</h2>' +
      '<p>' + escapeHtml(config.intro || '') + '</p>' +
      '</div>';
  }

  function tarotHubMarkup(config) {
    var pages = Array.isArray(config.readings) ? config.readings : [];
    var cards = pages.map(function (page) {
      return '<a class="wpnc-tarot-hub__choice" href="' + escapeHtml(safeInternalHref(page.url)) + '">' +
        '<span class="wpnc-tarot-hub__glyph" aria-hidden="true">' + escapeHtml(page.symbol || '\u2726') + '</span>' +
        '<span><strong>' + escapeHtml(page.title) + '</strong><small>' + escapeHtml(page.description || '') + '</small></span>' +
        '<span class="wpnc-tarot-hub__arrow" aria-hidden="true">\u2192</span></a>';
    }).join('');
    return tarotHeader(config, false) +
      '<div class="wpnc-tarot-hub__body"><div class="wpnc-tarot-hub__intro"><p class="wpnc-tarot__step-label">' + escapeHtml(tarotCopy(config, 'hubStep', 'Choose a reading')) + '</p><p>' + escapeHtml(tarotCopy(config, 'hubIntro', 'Each spread uses a complete 78-card deck. You choose every card yourself, then open a private result link you can bookmark or share.')) + '</p></div>' +
      '<nav class="wpnc-tarot-hub__choices" aria-label="' + escapeHtml(tarotCopy(config, 'hubAria', 'Tarot reading types')) + '">' + cards + '</nav>' +
      '<div class="wpnc-tarot__privacy"><span aria-hidden="true">\u25cc</span><p><strong>' + escapeHtml(tarotCopy(config, 'privacyTitle', 'Your words stay in this browser.')) + '</strong> ' + escapeHtml(tarotCopy(config, 'privacyBody', 'No account, email, or reading API. Share links contain only the card state—never your question.')) + '</p></div></div>';
  }

  function tarotProgress(active, marker, config) {
    var configured = config && config.uiCopy && Array.isArray(config.uiCopy.progress);
    var steps = configured && config.uiCopy.progress.length === 5 ? config.uiCopy.progress : ['Focus', 'Shuffle', 'Choose', 'Reveal', 'Read'];
    return '<ol class="wpnc-tarot__progress" aria-label="Reading progress"' + (marker ? ' data-tarot-progress="' + escapeHtml(marker) + '"' : '') + '>' + steps.map(function (label, index) {
      var position = index + 1;
      return '<li' + (position === active ? ' aria-current="step"' : '') + (position < active ? ' class="is-complete"' : '') + '><span>' + position + '</span>' + escapeHtml(label) + '</li>';
    }).join('') + '</ol>';
  }

  function tarotQuestionMarkup(config) {
    var mode = config.mode || 'daily';
    var spec = tarotSpread(config, mode);
    var prompt = spec.question ?
      '<label for="wpnc-tarot-question">' + escapeHtml(config.questionLabel || 'What would you like clarity around?') + '</label>' +
      '<textarea id="wpnc-tarot-question" maxlength="280" rows="3" data-tarot-question aria-describedby="wpnc-tarot-privacy" placeholder="' + escapeHtml(config.questionPlaceholder || 'Keep it open, specific, and focused on what you can choose...') + '"></textarea>' :
      '<div class="wpnc-tarot__daily-note"><span aria-hidden="true">\u2609</span><p><strong>' + escapeHtml(tarotCopy(config, 'dailyNoteTitle', 'No question needed.')) + '</strong> ' + escapeHtml(tarotCopy(config, 'dailyNote', 'Take one slow breath and notice what deserves your attention today.')) + '</p></div>';
    return tarotHeader(config, true) + '<div class="wpnc-tarot__workspace">' + tarotProgress(1, 'initial', config) +
      '<section class="wpnc-tarot__focus" data-tarot-stage="focus"><p class="wpnc-tarot__step-label">' + escapeHtml(tarotCopy(config, 'focusStep', 'Begin with intention')) + '</p>' + prompt +
      '<p id="wpnc-tarot-privacy" class="wpnc-tarot__microcopy">' + escapeHtml(tarotCopy(config, 'questionPrivacy', 'Your question stays in this browser. The full-reading link contains only the cards and their positions, never what you wrote.')) + '</p>' +
      '<button type="button" class="wpnc-tarot__primary" data-action="tarot-start">' + escapeHtml(tarotCopy(config, 'shuffle', 'Shuffle the 78-card deck')) + ' <span aria-hidden="true">\u2726</span></button>' +
      '<p class="wpnc-tarot__error" data-tarot-error role="alert" hidden></p></section>' +
      '<section data-tarot-stage="draw" hidden></section><section data-tarot-stage="reveal" hidden></section><section data-tarot-stage="teaser" hidden></section>' +
      '<p class="wpnc-tool__disclaimer">' + escapeHtml(config.disclaimer || 'For entertainment and self-reflection only. Tarot does not predict or control events.') + '</p></div>';
  }

  function tarotCardBack(position, config) {
    return '<button class="wpnc-tarot-card wpnc-tarot-card--back" type="button" data-tarot-card="' + position + '" aria-label="' + escapeHtml(tarotCopy(config, 'chooseCardAria', 'Choose face-down card') + ' ' + (position + 1)) + '">' +
      '<span class="wpnc-tarot-card__back"><i aria-hidden="true">\u2736</i><b aria-hidden="true">\u25c7</b></span></button>';
  }

  function newTarotSeed() {
    var bytes;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      bytes = new Uint32Array(2); crypto.getRandomValues(bytes);
      return bytes[0].toString(36) + bytes[1].toString(36);
    }
    return Date.now().toString(36) + hash(String(Math.random())).toString(36);
  }

  function renderTarotDraw(root, config, state) {
    var stage = root.querySelector('[data-tarot-stage="draw"]');
    var count = tarotSpread(config, state.mode).count;
    stage.hidden = false;
    stage.innerHTML = tarotProgress(3, null, config) + '<div class="wpnc-tarot__draw-head"><div><p class="wpnc-tarot__step-label">' + escapeHtml(tarotCopy(config, 'deckReady', 'The deck is ready')) + '</p><h3>' +
      escapeHtml(count === 1 ? tarotCopy(config, 'chooseOne', 'Choose the card that catches you') : tarotCopy(config, 'chooseMany', 'Choose {count} cards, one at a time').replace('{count}', count)) + '</h3></div><p data-tarot-counter aria-live="polite">0 of ' + count + ' ' + escapeHtml(tarotCopy(config, 'chosen', 'chosen')) + '</p></div>' +
      '<div class="wpnc-tarot__fan is-shuffling" data-tarot-fan>' + Array.from({ length: 15 }, function (_, index) { return tarotCardBack(index, config); }).join('') + '</div>' +
      '<div class="wpnc-tarot__picked-row"><div class="wpnc-tarot__picked" data-tarot-picked aria-live="polite"></div><button type="button" class="wpnc-tarot__undo" data-action="tarot-undo" disabled>' + escapeHtml(tarotCopy(config, 'undo', 'Undo last card')) + '</button></div>';
    var fan = stage.querySelector('[data-tarot-fan]');
    var reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(function () {
      fan.classList.remove('is-shuffling');
      var first = fan.querySelector('[data-tarot-card]');
      if (first) first.focus();
    }, reduceMotion ? 0 : 620);
  }

  function renderTarotReveal(root, config, state) {
    var stage = root.querySelector('[data-tarot-stage="reveal"]');
    var spec = tarotSpread(config, state.mode);
    stage.hidden = false;
    stage.innerHTML = tarotProgress(4, null, config) + '<div class="wpnc-tarot__reveal"><p class="wpnc-tarot__step-label">' + escapeHtml(tarotCopy(config, 'spreadSet', 'Your spread is set')) + '</p><h3>' + escapeHtml(tarotCopy(config, 'readyToTurn', 'Ready to turn the cards?')) + '</h3>' +
      '<div class="wpnc-tarot__reveal-row" aria-label="' + spec.count + ' selected face-down cards">' + state.selections.map(function (_, index) {
        return '<div class="wpnc-tarot-card wpnc-tarot-card--back"><span class="wpnc-tarot-card__back"><i aria-hidden="true">\u2736</i><b aria-hidden="true">' + escapeHtml(spec.labels[index].charAt(0)) + '</b></span><small>' + escapeHtml(spec.labels[index]) + '</small></div>';
      }).join('') + '</div><button type="button" class="wpnc-tarot__primary" data-action="tarot-reveal">' + escapeHtml(tarotCopy(config, 'reveal', 'Reveal my cards')) + ' <span aria-hidden="true">\u2726</span></button>' +
      '<button type="button" class="wpnc-tarot__secondary" data-action="tarot-back-to-draw">' + escapeHtml(tarotCopy(config, 'changeSelection', 'Change my selection')) + '</button></div>';
    var revealButton = stage.querySelector('[data-action="tarot-reveal"]');
    if (revealButton) revealButton.focus();
  }

  function tarotAssetUrl(config, item) {
    var base = config && typeof config.assetBase === 'string' ? config.assetBase.replace(/\/+$/, '') : '';
    return base ? safeInternalHref(base + '/cards/' + encodeURIComponent(item.card.id) + '.svg') : '';
  }

  function tarotCardFace(item, detailed, config) {
    var meaning = item.card[item.orientation];
    var asset = tarotAssetUrl(config, item);
    var orientation = item.orientation === 'reversed' ? tarotCopy(config, 'reversed', 'Reversed') : tarotCopy(config, 'upright', 'Upright');
    var art = asset ? '<img class="wpnc-tarot-card-face__image" src="' + escapeHtml(asset) + '" alt="' + escapeHtml(item.card.name + ', ' + orientation) + '" title="' + escapeHtml(item.card.name + ' — ' + orientation) + '" loading="lazy" decoding="async" />' : '';
    return '<article class="wpnc-tarot-card-face' + (item.orientation === 'reversed' ? ' is-reversed' : '') + '">' +
      '<div class="wpnc-tarot-card-face__art">' + art + '<span aria-hidden="true">' + escapeHtml(item.card.symbol || '\u2726') + '</span><small>' + escapeHtml(item.card.arcana) + '</small></div>' +
      '<div class="wpnc-tarot-card-face__copy"><p>' + escapeHtml(item.label) + '</p><h3>' + escapeHtml(item.card.name) + '</h3>' +
      '<span class="wpnc-tarot-card-face__orientation">' + escapeHtml(orientation) + '</span>' +
      (detailed ? '<p class="wpnc-tarot-card-face__meaning">' + escapeHtml(meaning) + '</p>' : '') + '</div></article>';
  }

  function renderTarotTeaser(root, config, state) {
    var reading = createTarotReading(state.mode, state.seed, state.selections, state.question);
    var spread = tarotSpread(config, state.mode);
    if (reading && spread.labels) reading.cards.forEach(function (item, index) { item.label = spread.labels[index] || item.label; });
    var stage = root.querySelector('[data-tarot-stage="teaser"]');
    var current = typeof window !== 'undefined' && window.location ? window.location.href : ('/' + (config.slug || '') + '/');
    var url = serializeTarotReading(reading, current);
    state.reading = reading;
    rememberTarotQuestion(reading);
    stage.hidden = false;
    stage.innerHTML = tarotProgress(5, null, config) + '<div class="wpnc-tarot__teaser"><p class="wpnc-tarot__step-label">' + escapeHtml(tarotCopy(config, 'cardsDrawn', 'Your cards are drawn')) + '</p><h3>' + escapeHtml(tarotCopy(config, 'patternTitle', 'Let the pattern come into view')) + '</h3>' +
      '<div class="wpnc-tarot__spread">' + reading.cards.map(function (item) { return tarotCardFace(item, false, config); }).join('') + '</div>' +
      '<p class="wpnc-tarot__bridge">' + escapeHtml(tarotCopy(config, 'teaserBridge', 'The full reading connects each card to its position and gives you a grounded reflection prompt.')) + '</p>' +
      '<a class="wpnc-tarot__primary wpnc-tarot__primary--link" data-tarot-full-link href="' + escapeHtml(url) + '">' + escapeHtml(tarotCopy(config, 'viewFull', 'View your full reading')) + ' <span aria-hidden="true">\u2192</span></a>' +
      '<button type="button" class="wpnc-tarot__secondary" data-action="tarot-reset">' + escapeHtml(tarotCopy(config, 'chooseDifferent', 'Choose different cards')) + '</button></div>';
    stage.focus();
  }

  function toneLabel(tone, config) {
    return tone === 'yes' ? tarotCopy(config, 'toneYes', 'Leaning yes') : tone === 'no' ? tarotCopy(config, 'toneNo', 'Leaning no') : tone === 'pause' ? tarotCopy(config, 'tonePause', 'Pause and clarify') : tarotCopy(config, 'toneOpen', 'The path is open');
  }

  function tarotPrompt(item, mode) {
    var prompts = {
      daily: 'Where could this quality change one small choice today?',
      yes_no: 'What fact would help you act without giving your power to the card?',
      three: item.label === 'Past' ? 'What from this chapter still shapes the question?' : item.label === 'Present' ? 'What is asking for your attention now?' : 'What next step would make this direction more likely?',
      love: item.label === 'You' ? 'What need or boundary is yours to name?' : item.label === 'The connection' ? 'What pattern is the relationship reinforcing?' : 'What honest act of care belongs next?'
    };
    return prompts[mode] || prompts.daily;
  }

  function renderTarotFull(root, config, reading) {
    var spread = tarotSpread(config, reading.mode);
    if (spread.labels) reading.cards.forEach(function (item, index) { item.label = spread.labels[index] || item.label; });
    var tone = reading.cards[0].card.tone;
    var yesNo = reading.mode === 'yes_no' ? '<div class="wpnc-tarot__lean"><span>' + escapeHtml(tarotCopy(config, 'symbolicLean', 'Symbolic lean')) + '</span><strong>' + escapeHtml(toneLabel(tone, config)) + '</strong><p>' + escapeHtml(tarotCopy(config, 'yesNoBody', 'This is a reflection cue, not a prediction. Keep the decision with you.')) + '</p></div>' : '';
    var question = reading.question ? '<blockquote><span>' + escapeHtml(tarotCopy(config, 'questionHeading', 'Your question')) + '</span>' + escapeHtml(reading.question) + '</blockquote>' : '';
    var details = reading.cards.map(function (item, index) {
      return '<details class="wpnc-tarot__card-detail"' + (index === 0 ? ' open' : '') + '><summary><span>' + escapeHtml(item.label) + '</span><strong>' + escapeHtml(item.card.name) + '</strong><small>' + escapeHtml(item.orientation === 'reversed' ? tarotCopy(config, 'reversed', 'Reversed') : tarotCopy(config, 'upright', 'Upright')) + '</small></summary>' +
        '<div>' + tarotCardFace(item, true, config) + '<div class="wpnc-tarot__prompt"><span>' + escapeHtml(tarotCopy(config, 'journalPromptLabel', 'Journal prompt')) + '</span><p>' + escapeHtml((config.spreads && config.spreads[reading.mode] && Array.isArray(config.spreads[reading.mode].prompts) && config.spreads[reading.mode].prompts[index]) || tarotPrompt(item, reading.mode)) + '</p></div></div></details>';
    }).join('');
    var majorCount = reading.cards.filter(function (item) { return item.card.arcana === 'Major Arcana'; }).length;
    var reversedCount = reading.cards.filter(function (item) { return item.orientation === 'reversed'; }).length;
    var firstMeaning = reading.cards[0].card[reading.cards[0].orientation];
    var lastMeaning = reading.cards[reading.cards.length - 1].card[reading.cards[reading.cards.length - 1].orientation];
    var combined = reading.cards.length === 1 ? firstMeaning : tarotCopy(config, 'combinedTemplate', 'The spread moves from “{first}” toward “{last}” Read that movement as a pattern to test against your real situation.').replace('{first}', firstMeaning).replace('{last}', lastMeaning);
    var observationOne = majorCount ? tarotCopy(config, 'majorObservation', '{count} Major Arcana card{s} suggest the question touches a larger transition or value.').replace('{count}', majorCount).replace('{s}', majorCount > 1 ? 's' : '') : tarotCopy(config, 'minorObservation', 'The Minor Arcana focus keeps this reading close to practical choices and daily patterns.');
    var observationTwo = reversedCount ? tarotCopy(config, 'reversedObservation', '{count} reversed card{s} ask for an inner adjustment before outward action.').replace('{count}', reversedCount).replace('{s}', reversedCount > 1 ? 's' : '') : tarotCopy(config, 'uprightObservation', 'All cards are upright, emphasizing visible choices and direct action.');
    var cleanPath = typeof window !== 'undefined' && window.location ? window.location.pathname : '/';
    root.innerHTML = tarotHeader(config, true) + '<div class="wpnc-tarot__workspace wpnc-tarot__workspace--result">' + tarotProgress(5, null, config) +
      '<section class="wpnc-tarot__full"><div class="wpnc-tarot__full-head"><p class="wpnc-tarot__step-label">' + escapeHtml(tarotCopy(config, 'completeReading', 'Your complete reading')) + '</p><h3>' + escapeHtml(tarotCopy(config, 'conversationTitle', 'Read the cards as a conversation')) + '</h3><p>' + escapeHtml(tarotCopy(config, 'conversationBody', 'Notice what resonates, what challenges you, and what practical choice remains yours.')) + '</p></div>' +
      question + yesNo + '<div class="wpnc-tarot__spread wpnc-tarot__spread--overview">' + reading.cards.map(function (item) { return tarotCardFace(item, false, config); }).join('') + '</div>' +
      '<div class="wpnc-tarot__overview"><div><span>' + escapeHtml(tarotCopy(config, 'combinedLabel', 'Combined meaning')) + '</span><p>' + escapeHtml(combined) + '</p></div><div><span>' + escapeHtml(tarotCopy(config, 'noticeLabel', 'Two things to notice')) + '</span><ul><li>' + escapeHtml(observationOne) + '</li><li>' + escapeHtml(observationTwo) + '</li></ul></div><div><span>' + escapeHtml(tarotCopy(config, 'nextActionLabel', 'Your next action')) + '</span><p>' + escapeHtml(tarotCopy(config, 'nextActionBody', 'Write one sentence beginning “The choice I can make now is…” Then choose one step small enough to complete within 24 hours.')) + '</p></div></div>' +
      '<div class="wpnc-tarot__details"><h3>' + escapeHtml(tarotCopy(config, 'exploreCards', 'Explore each card')) + '</h3>' + details + '</div>' +
      '<div class="wpnc-tarot__synthesis"><span aria-hidden="true">\u2736</span><div><h3>' + escapeHtml(tarotCopy(config, 'ctaTitle', 'Want a more personal perspective?')) + '</h3><p>' + escapeHtml(tarotCopy(config, 'ctaBody', 'Bring your context to a reader. You choose what to share, and this tarot question is not passed along automatically.')) + '</p><a class="wpnc-tarot__primary wpnc-tarot__primary--link" href="' + escapeHtml(tarotCta(config).href) + '" data-source="tarot-result">' + escapeHtml(tarotCta(config).text) + ' <span aria-hidden="true">\u2192</span></a></div></div>' +
      '<div class="wpnc-tarot__result-actions"><a class="wpnc-tarot__secondary wpnc-tarot__secondary--link" href="' + escapeHtml(cleanPath) + '">' + escapeHtml(tarotCopy(config, 'startNew', 'Start a new reading')) + '</a>' +
      '<button type="button" class="wpnc-tarot__secondary" data-action="tarot-copy">' + escapeHtml(tarotCopy(config, 'copyLink', 'Copy reading link')) + '</button><p data-copy-status role="status" aria-live="polite"></p></div></section>' +
      '<p class="wpnc-tool__disclaimer">' + escapeHtml(config.disclaimer || 'For entertainment and self-reflection only. Tarot does not predict or control events.') + '</p></div>';
  }

  function renderTarotTool(root, config) {
    if (config.type === 'tarot_hub') {
      root.innerHTML = tarotHubMarkup(config);
      return;
    }
    var search = typeof window !== 'undefined' && window.location ? window.location.search : '';
    var shared = parseTarotReading(search);
    if (shared && shared.mode === config.mode) {
      shared.question = recallTarotQuestion(shared);
      renderTarotFull(root, config, shared);
    } else {
      root.innerHTML = tarotQuestionMarkup(config);
    }
    root.addEventListener('click', function (event) {
      var actionTarget = event.target.closest ? event.target.closest('[data-action]') : event.target;
      var action = actionTarget && actionTarget.getAttribute ? actionTarget.getAttribute('data-action') : '';
      var cardTarget = event.target.closest ? event.target.closest('[data-tarot-card]') : null;
      if (action === 'tarot-start') {
        var spec = TAROT_MODES[config.mode] || TAROT_MODES.daily;
        var input = root.querySelector('[data-tarot-question]');
        var question = cleanQuestion(input ? input.value : '');
        var error = root.querySelector('[data-tarot-error]');
        if (spec.question && question.length < 5) {
          error.textContent = tarotCopy(config, 'questionError', 'Write at least a few words so the reading has a clear focus.');
          error.hidden = false;
          input.setAttribute('aria-invalid', 'true'); input.focus();
          return;
        }
        if (input) input.removeAttribute('aria-invalid');
        error.hidden = true;
        root.__wpncTarot = { mode: config.mode, seed: newTarotSeed(), question: question, selections: [] };
        root.querySelector('[data-tarot-progress="initial"]').hidden = true;
        root.querySelector('[data-tarot-stage="focus"]').hidden = true;
        renderTarotDraw(root, config, root.__wpncTarot);
      } else if (cardTarget && root.__wpncTarot && !cardTarget.disabled) {
        var state = root.__wpncTarot;
        var specForMode = TAROT_MODES[state.mode];
        var position = Number(cardTarget.getAttribute('data-tarot-card'));
        if (!Number.isInteger(position) || state.selections.indexOf(position) >= 0 || state.selections.length >= specForMode.count) return;
        state.selections.push(position);
        cardTarget.disabled = true;
        cardTarget.classList.add('is-chosen');
        cardTarget.setAttribute('aria-label', tarotCopy(config, 'chosenCardAria', 'Chosen card') + ' ' + state.selections.length);
        var order = shuffledIndexes(tarotDeck().length, state.seed);
        var chosenCard = tarotDeck()[order[position]];
        cardTarget.innerHTML = '<span class="wpnc-tarot-card__peek" aria-hidden="true">' + escapeHtml(chosenCard.symbol) + '</span>';
        var picked = root.querySelector('[data-tarot-picked]');
        picked.innerHTML += '<span>' + escapeHtml(specForMode.labels[state.selections.length - 1]) + ' ' + escapeHtml(tarotCopy(config, 'chosen', 'chosen')) + '</span>';
        root.querySelector('[data-tarot-counter]').textContent = state.selections.length + ' ' + tarotCopy(config, 'of', 'of') + ' ' + specForMode.count + ' ' + tarotCopy(config, 'chosen', 'chosen');
        root.querySelector('[data-action="tarot-undo"]').disabled = false;
        if (state.selections.length === specForMode.count) {
          root.querySelector('[data-tarot-stage="draw"]').hidden = true;
          renderTarotReveal(root, config, state);
        }
      } else if (action === 'tarot-undo' && root.__wpncTarot && root.__wpncTarot.selections.length) {
        var undoState = root.__wpncTarot;
        var removed = undoState.selections.pop();
        var removedButton = root.querySelector('[data-tarot-card="' + removed + '"]');
        if (removedButton) {
          removedButton.disabled = false;
          removedButton.classList.remove('is-chosen');
          removedButton.setAttribute('aria-label', tarotCopy(config, 'chooseCardAria', 'Choose face-down card') + ' ' + (removed + 1));
          removedButton.innerHTML = '<span class="wpnc-tarot-card__back"><i aria-hidden="true">\u2736</i><b aria-hidden="true">\u25c7</b></span>';
          removedButton.focus();
        }
        var undoSpec = TAROT_MODES[undoState.mode];
        root.querySelector('[data-tarot-picked]').innerHTML = undoState.selections.map(function (_, index) { return '<span>' + escapeHtml(undoSpec.labels[index]) + ' ' + escapeHtml(tarotCopy(config, 'chosen', 'chosen')) + '</span>'; }).join('');
        root.querySelector('[data-tarot-counter]').textContent = undoState.selections.length + ' ' + tarotCopy(config, 'of', 'of') + ' ' + undoSpec.count + ' ' + tarotCopy(config, 'chosen', 'chosen');
        actionTarget.disabled = undoState.selections.length === 0;
      } else if (action === 'tarot-back-to-draw' && root.__wpncTarot) {
        root.querySelector('[data-tarot-stage="reveal"]').hidden = true;
        root.querySelector('[data-tarot-stage="draw"]').hidden = false;
        var undoButton = root.querySelector('[data-action="tarot-undo"]');
        if (undoButton) { undoButton.disabled = false; undoButton.focus(); }
      } else if (action === 'tarot-reveal' && root.__wpncTarot) {
        var revealStage = root.querySelector('[data-tarot-stage="reveal"]');
        revealStage.classList.add('is-revealing');
        actionTarget.disabled = true;
        var reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
        setTimeout(function () {
          revealStage.hidden = true;
          revealStage.classList.remove('is-revealing');
          renderTarotTeaser(root, config, root.__wpncTarot);
        }, reduced ? 0 : 560);
      } else if (action === 'tarot-reset') {
        root.__wpncTarot = null;
        root.innerHTML = tarotQuestionMarkup(config);
        var resetInput = root.querySelector('[data-tarot-question]');
        if (resetInput) resetInput.focus();
      } else if (action === 'tarot-copy') {
        var status = root.querySelector('[data-copy-status]');
        var copyValue = typeof window !== 'undefined' && window.location ? window.location.href : '';
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(copyValue).then(function () { status.textContent = tarotCopy(config, 'copySuccess', 'Reading link copied.'); }, function () { status.textContent = tarotCopy(config, 'copyFallback', 'Copy the URL from your browser address bar.'); });
        } else status.textContent = tarotCopy(config, 'copyFallback', 'Copy the URL from your browser address bar.');
      }
    });
  }

  function renderTool(root, config) {
    if (!root || !config || root.getAttribute('data-wpnc-ready') === '1') return;
    root.setAttribute('data-wpnc-ready', '1');
    if (config.theme) Object.keys(config.theme).forEach(function (key) {
      if (/^(ink|muted|accent|accentStrong|surface|soft|night|night2|gold|goldBright|cream|line|cardSurface|privacySurface|onDark)$/.test(key) && /^(#[0-9a-f]{3,8}|rgba?\\([^)]{1,80}\\)|hsla?\\([^)]{1,80}\\))$/i.test(String(config.theme[key]))) {
        root.style.setProperty('--wpnc-' + key.replace(/[A-Z]/g, function (letter) { return '-' + letter.toLowerCase(); }), String(config.theme[key]));
      }
    });
    if (config.skin && /^[a-z0-9_-]{1,32}$/i.test(String(config.skin))) root.setAttribute('data-wpnc-skin', String(config.skin));
    var type = config.type || 'reflection';
    if (type === 'tarot_hub' || type === 'tarot_reading') {
      renderTarotTool(root, config);
      return;
    }
    var intro = '<p class="wpnc-tool__disclaimer">' + escapeHtml(config.disclaimer || 'For entertainment and self-reflection only. This is not professional, medical, legal, or financial advice.') + '</p>';
    var body = '';
    if (type === 'medium_matcher') {
      body = '<label for="wpnc-need">What kind of support are you exploring?</label><select id="wpnc-need" data-need>' + (config.needs || []).map(function (x) { return '<option value="' + escapeHtml(x.value) + '">' + escapeHtml(x.label) + '</option>'; }).join('') + '</select><button type="button" data-action="match">Show reflection matches</button>';
    } else if (type === 'clarity_coach' || type === 'tarot_workshop') {
      body = '<label for="wpnc-question">Your question</label><textarea id="wpnc-question" rows="5" data-question required aria-required="true" placeholder="Write in your own words..."></textarea>' + (type === 'tarot_workshop' ? '<label for="wpnc-spread">Reflection format</label><select id="wpnc-spread" data-spread><option value="single">One card: the focus</option><option value="three">Three cards: context, choice, next step</option></select>' : '') + '<button type="button" data-action="reflect">Continue</button>';
    } else if (type === 'reflection_chat') {
      var firstMessage = (config.conversation || [config.instructions || 'Take a quiet moment and write what is present for you.'])[0];
      body = '<p>' + escapeHtml(config.instructions || 'Take a quiet moment and write what is present for you.') + '</p><div class="wpnc-tool__timer" data-timer aria-live="polite">03:00</div><div class="wpnc-tool__chat" role="log" aria-live="polite"><ol data-transcript><li><strong>Guide:</strong> ' + escapeHtml(firstMessage) + '</li></ol></div><label for="wpnc-reflection">Your reflection</label><textarea id="wpnc-reflection" rows="5" data-reflection></textarea><div class="wpnc-tool__actions"><button type="button" data-action="timer">Start timer</button><button type="button" data-action="save-line">Send reflection</button></div>';
    } else if (type === 'intuition_quiz') {
      body = (config.questions || []).map(function (question, index) { return '<fieldset><legend>' + (index + 1) + '. ' + escapeHtml(question) + '</legend><select data-answer aria-label="Answer ' + (index + 1) + '"><option value="1">Rarely</option><option value="2">Sometimes</option><option value="3" selected>Often</option><option value="4">Usually</option><option value="5">Almost always</option></select></fieldset>'; }).join('') + '<button type="button" data-action="quiz">See your reflection profile</button>';
    } else if (type === 'compatibility') {
      body = '<div class="wpnc-tool__grid"><label>First birth date<input type="date" data-date-a></label><label>Second birth date<input type="date" data-date-b></label></div><button type="button" data-action="compatibility">Explore the pattern</button>';
    } else if (type === 'memorial_journal') {
      body = '<label for="wpnc-symbol">Choose a symbolic focus</label><select id="wpnc-symbol" data-symbol>' + (config.symbols || []).map(function (item) { return '<option value="' + escapeHtml(item.key) + '">' + escapeHtml(item.name) + '</option>'; }).join('') + '</select><button type="button" data-action="symbolic">Reflect on this symbol</button><p data-prompt>' + escapeHtml(journalPrompt(config.prompts, config.id)) + '</p><label for="wpnc-memory">Your private reflection</label><textarea id="wpnc-memory" rows="7" data-journal placeholder="Nothing is sent or saved online."></textarea><div class="wpnc-tool__actions"><button type="button" data-action="new-prompt">New prompt</button><button type="button" data-action="save-journal">Save on this device</button><button type="button" data-action="clear-journal">Clear saved note</button></div>';
    }
    root.innerHTML = '<div class="wpnc-tool__header"><p class="wpnc-tool__eyebrow">' + escapeHtml(config.eyebrow || 'A guided reflection') + '</p><h1>' + escapeHtml(config.title || 'Explore your question') + '</h1><p>' + escapeHtml(config.intro || '') + '</p></div><div class="wpnc-tool__body">' + body + '<section class="wpnc-tool__result" data-result tabindex="-1" aria-live="polite" hidden></section>' + intro + '</div>';
    root.addEventListener('click', function (event) {
      var action = event.target.getAttribute('data-action');
      if (!action) return;
      if (action === 'match') {
        var matches = matchMedium(root.querySelector('[data-need]').value, config.readers || []);
        resultBox(root, 'Possible directions', matches.map(function (m) { return '<p><strong>' + escapeHtml(m.reader.name) + '</strong> — ' + escapeHtml(m.reader.note || 'A possible fit for this reflection.') + '</p>'; }).join(''));
      } else if (action === 'reflect') {
        var questionInput = root.querySelector('[data-question]');
        var q = clarityCoach(questionInput.value);
        if (q.error) {
          resultBox(root, q.error, '<p>' + escapeHtml(q.error) + ' to continue.</p>');
          questionInput.setAttribute('aria-invalid', 'true');
          questionInput.focus();
          return;
        }
        questionInput.removeAttribute('aria-invalid');
        if (type === 'tarot_workshop' && q.question) {
          var cards = tarotDraw(q.question, root.querySelector('[data-spread]').value, config.deck);
          resultBox(root, 'A symbolic reflection spread', '<p>' + cards.map(escapeHtml).join(' · ') + '</p><p>Use each card as a prompt, not a prediction. ' + q.prompts.map(escapeHtml).join(' ') + '</p>');
        } else resultBox(root, q.ready ? 'Your question is taking shape' : 'A little more clarity may help', '<p>' + q.prompts.map(escapeHtml).join(' ') + '</p>');
      } else if (action === 'quiz') {
        var profile = scoreIntuitionMeta(Array.prototype.map.call(root.querySelectorAll('[data-answer]'), function (el) { return el.value; }), config.dimensions);
        resultBox(root, 'Your intuition profile', radarSvg(profile.totals, profile.maxima) + '<div class="wpnc-tool__bars">' + Object.keys(profile.totals).map(function (key) { var max = profile.maxima[key] || 5; return '<p><span>' + escapeHtml(key) + '</span><meter min="0" max="' + max + '" value="' + profile.totals[key] + '" aria-label="' + escapeHtml(key) + ' score" aria-valuetext="' + profile.totals[key] + ' out of ' + max + '"></meter></p>'; }).join('') + '</div><p>These are reflection prompts, not a diagnosis or fixed identity.</p>');
      } else if (action === 'compatibility') {
        var c = compatibility(root.querySelector('[data-date-a]').value, root.querySelector('[data-date-b]').value);
        resultBox(root, c ? 'A shared-pattern reflection' : 'Please add both birth dates', c ? '<p>' + escapeHtml(c.firstZodiac) + ' · Life Path ' + c.firstLifePath + ' + ' + escapeHtml(c.secondZodiac) + ' · Life Path ' + c.secondLifePath + '</p><p>Symbolic resonance score: <strong>' + c.score + '/100</strong>. Talk openly about differences; no number determines a relationship.</p>' : '<p>Both dates are needed to calculate the symbolic pattern.</p>');
      } else if (action === 'symbolic') { var reflection = symbolicReflection(root.querySelector('[data-symbol]').value, config.symbols); resultBox(root, reflection ? 'A symbolic reflection' : 'Choose a symbol', reflection ? '<p>' + escapeHtml(reflection.message) + '</p><p>' + escapeHtml(reflection.prompt) + '</p><p>This is a creative exercise, not spirit contact or a supernatural message.</p>' : '<p>Select a symbol to continue.</p>'); }
      else if (action === 'new-prompt') root.querySelector('[data-prompt]').textContent = journalPrompt(config.prompts, String(Date.now()));
      else if (action === 'save-journal') { try { localStorage.setItem('wpnc-journal-' + config.id, root.querySelector('[data-journal]').value); resultBox(root, 'Saved on this device', '<p>Your note stays in this browser. Clear it any time from browser storage.</p>'); } catch (e) { resultBox(root, 'Not saved', '<p>Browser storage is unavailable; your note remains only on screen.</p>'); } }
      else if (action === 'clear-journal') { try { localStorage.removeItem('wpnc-journal-' + config.id); } catch (e) { /* storage may be disabled */ } root.querySelector('[data-journal]').value = ''; resultBox(root, 'Cleared', '<p>The saved note was removed from this browser.</p>'); }
      else if (action === 'save-line') { var text = root.querySelector('[data-reflection]').value.trim(); if (text) { var transcript = root.querySelector('[data-transcript]'), userLine = document.createElement('li'), guideLine = document.createElement('li'); userLine.textContent = 'You: ' + text; transcript.appendChild(userLine); var replies = config.conversation || []; var reply = replies[Math.min(transcript.children.length - 1, replies.length - 1)]; if (type === 'reflection_chat' && reply) { guideLine.textContent = 'Guide: ' + reply; transcript.appendChild(guideLine); } root.querySelector('[data-reflection]').value = ''; } }
      else if (action === 'timer') startTimer(root.querySelector('[data-timer]'), event.target);
    });
  }

  function startTimer(element, button) {
    if (!element || element.getAttribute('data-running') === '1') return;
    var remaining = 180; element.setAttribute('data-running', '1'); button.disabled = true;
    var tick = function () { var min = Math.floor(remaining / 60), sec = remaining % 60; element.textContent = String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0'); if (remaining <= 0) { button.disabled = false; element.removeAttribute('data-running'); return; } remaining -= 1; setTimeout(tick, 1000); };
    tick();
  }

  function boot(documentObject) {
    var doc = documentObject || (typeof document !== 'undefined' ? document : null); if (!doc) return;
    Array.prototype.forEach.call(doc.querySelectorAll('[data-wpnc-tool]'), function (root) {
      var script = doc.getElementById(root.getAttribute('data-config-id') || 'wpnc-tool-config');
      try { renderTool(root, JSON.parse(script ? script.textContent : '{}')); } catch (e) { root.removeAttribute('data-wpnc-ready'); }
    });
  }

  var api = { digits: digits, reduceNumber: reduceNumber, parseIsoDate: parseIsoDate, lifePath: lifePath, zodiac: zodiac, tarotDraw: tarotDraw, tarotDeck: tarotDeck, shuffledIndexes: shuffledIndexes, createTarotReading: createTarotReading, serializeTarotReading: serializeTarotReading, parseTarotReading: parseTarotReading, tarotReadingSignature: tarotReadingSignature, rememberTarotQuestion: rememberTarotQuestion, recallTarotQuestion: recallTarotQuestion, cleanQuestion: cleanQuestion, escapeHtml: escapeHtml, safeInternalHref: safeInternalHref, clarityCoach: clarityCoach, matchMedium: matchMedium, scoreIntuition: scoreIntuition, scoreIntuitionMeta: scoreIntuitionMeta, compatibility: compatibility, journalPrompt: journalPrompt, symbolicReflection: symbolicReflection, radarSvg: radarSvg, renderTool: renderTool, boot: boot };
  /* The script is defer-loaded by rollout.py, but also works when injected
   * after DOMContentLoaded. The ready marker makes repeated calls harmless. */
  if (typeof document !== 'undefined') {
    var autoStart = function () { api.boot(document); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoStart, { once: true });
    else autoStart();
  }
  return api;
}));
