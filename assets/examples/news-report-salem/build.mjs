// Livre interactif « Breaking News from Salem, 1692 » v2 (anglais, 3e advanced) : brief, script, enregistrement à la maison.
// de reportage en groupes de 3 (Reporter / Witness / Historian).
// Paramètres = défauts anglais des semantics.json + nos valeurs (pas de clonage des gabarits français).
// Usage : node build.mjs <gabarit-interactivebook-reporter extrait> <content.json de sortie> <dossier media>
import fs from 'fs';
import crypto from 'crypto';

const [LIBS, OUT, MEDIA] = process.argv.slice(2);
const guid = () => crypto.randomUUID();

/* ---------- défauts depuis semantics.json (anglais) ---------- */
const build = (fields) => { const o = {}; fields.forEach(f => { const v = val(f); if (v !== undefined) o[f.name] = v; }); return o; };
const val = (f) => {
  if (f.type === 'group') { const g = build(f.fields); return f.fields.length === 1 ? g[f.fields[0].name] : g; }
  if (f.type === 'list') return [];
  if (['library', 'image', 'audio', 'video', 'file'].includes(f.type)) return undefined;
  return f.default;
};
const merge = (a, b) => {
  if (b === undefined) return a;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const o = { ...a }; for (const k of Object.keys(b)) o[k] = merge(a[k], b[k]); return o;
  }
  return b;
};
const defaults = (library) => { const [n, v] = library.split(' '); return build(JSON.parse(fs.readFileSync(`${LIBS}/${n}-${v}/semantics.json`, 'utf8'))); };
const sub = (library, params, contentType, title) =>
  ({ library, params: merge(defaults(library), params), subContentId: guid(), metadata: { contentType, license: 'U', title, authors: [], changes: [], extraTitle: title } });
const chapter = (title, items) => ({
  params: { content: items.map(c => ({ content: c, useSeparator: 'auto' })) },
  library: 'H5P.Column 1.18', subContentId: guid(), metadata: { contentType: 'Column', license: 'U', title },
});

/* ---------- médias ---------- */
const jpegSize = (buf) => { let i = 2; while (i < buf.length) { const m = buf[i + 1], len = buf.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xC3) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }; i += 2 + len; } throw new Error('JPEG sans SOF'); };
const file = (name, cr = {}) => ({ path: `images/${name}`, mime: 'image/jpeg', copyright: { license: 'U', ...cr }, ...jpegSize(fs.readFileSync(`${MEDIA}/${name}`)) });
const image = (name, alt, cr) => sub('H5P.Image 1.1', { file: file(name, cr), alt, decorative: false }, 'Image', alt);
const CR_JACOBS = { license: 'PD', author: 'Tompkins H. Matteson (1855), via Wikimedia Commons', title: 'Trial of George Jacobs, August 5, 1692' };
const CR_FIRE = { license: 'PD', author: 'Unknown artist (c. 1675), via Wikimedia Commons', title: 'The Great Fire of London' };

/* ---------- texte et mise en forme ---------- */
const text = (html, title = 'Text') => sub('H5P.AdvancedText 1.1', { text: html }, 'Text', title);
const box = (html, bg = '#eef4fb') => `<div style="background-color:${bg};padding:0.6em 1em;border-radius:6px">${html}</div>`;
const remember = (html) => box(`<p><strong>📌 Remember</strong></p>${html}`, '#fff6dd');
const yourTurn = (html) => `<h3>✋ Your turn</h3>${html}`;
const head = (n, title, min, sub_) => `<h2 style="color:#122040">${n} · ${title}</h2><p style="color:#555555"><em>⏱ about ${min} minutes${sub_ ? ` · ${sub_}` : ''}</em></p>`;
const COL = { REPORTER: '#2f6fba', WITNESS: '#c8601a', HISTORIAN: '#2e8b57' };
const who = (r) => `<strong style="color:${COL[r]}">${r}:</strong>`;
const line = (r, dir, words) => `<p>${who(r)} ${dir ? `<em>(${dir})</em> ` : ''}${words}</p>`;

/* ================= V2 (2026-11-13) : 3e advanced, lancement express =================
   Retour de Pierre : trop faible, trop de temps sur l'évident. But : lancer très vite l'écriture du script,
   donner des solutions concrètes pour enregistrer à la maison. Plus d'exercices notés : les aides sont repliées. */
const ph = (items) => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;

const cover = `<h2 style="text-align:center">📺 Breaking News from Salem, 1692</h2>
<p style="text-align:center">Your brief · your script · your recording</p>`;

/* ===== 1. The brief ===== */
const roleCell = (r, icon, task, levelUp) => `<td style="vertical-align:top;padding:0.5em 0.8em;border-top:5px solid ${COL[r]};background-color:#fafafa">
<p><strong style="color:${COL[r]}">${icon} ${r[0] + r.slice(1).toLowerCase()}</strong></p><p><em>${task}</em></p>
<p><strong>Level up</strong></p>${ph(levelUp)}</td>`;
const ch1 = chapter('1. The brief', [
  text(`${head(1, 'The brief', 3, 'then start writing')}
<p>In groups of three, write a <strong>2-to-3-minute news report</strong> on the <strong>Salem Witch Trials</strong>, broadcast “live” from Salem in 1692, with a historian joining the programme <strong>from today</strong>. You write it in class, then you <strong>record it (audio only), at home or in class</strong>.</p>
<table style="width:100%;border-collapse:separate;border-spacing:6px"><tr>
${roleCell('REPORTER', '🎤', 'Asks questions, explains what is happening, uses clear and dramatic language.', [
    'Hook the audience in your very first line.',
    'Signpost: “Joining me now is…”, “Let’s hear from…”.',
    'Push with follow-up questions: “What makes you so sure?”',
    'End on a punchy one-line wrap-up.'])}
${roleCell('WITNESS', '👁️', 'Describes what he or she saw or heard, as someone living in Salem in 1692: fear, accusations, the court.', [
    'Pick a point of view: accuser, neighbour of an accused, servant, relative…',
    'Use sensory details: what you saw, heard, smelt.',
    'Show emotion through what you say, don’t just name it.',
    'You don’t know how the story ends.'])}
${roleCell('HISTORIAN', '📚', 'Explains the context, adds facts, clarifies the bigger picture, comments on why women were targeted.', [
    'Precise facts: dates, numbers, names.',
    'Cause and consequence, not a list.',
    'Nuance: “Historians generally agree…”, “One theory suggests…”.',
    'Give a clear, argued answer on why women were targeted.'])}
</tr></table>
${box(`<p><strong>What makes a strong report</strong></p>${ph([
    '<strong>Structure</strong>: opening → the scene → the witness → the historian → closing. The reporter speaks first and last.',
    '<strong>Interaction</strong>: a real conversation, not three speeches. Every answer gets a reaction or a follow-up.',
    '<strong>Accuracy</strong>: the witness sounds like 1692, the historian’s facts are checked.',
    '<strong>Language</strong>: varied tenses, linking words, vocabulary from the word bank.',
    '<strong>Delivery</strong>: clear, paced, expressive. About 300 to 400 words for the whole group.'])}
<p><strong>Now</strong>: agree on roles and the witness’s identity (2 min), sketch the five parts (5 min), then write. The reporter drafts the questions first, so the answers fit.</p>`)}`, 'Brief'),
]);

/* ===== 2. Write your script ===== */
const MODEL2 = [
  ['REPORTER', 'urgent', 'Good evening. Tonight, London is burning, and nobody seems able to stop it. I’m Tom Baker, live from the north bank of the Thames.'],
  ['REPORTER', 'turns to the witness', 'Anne Harris lives two doors from the bakery where it all began. Anne, what woke you?'],
  ['WITNESS', 'still shaking', 'The smell first: smoke, thick and sweet, like burning sugar. Then the shouting. By the time I reached the window, the whole lane was orange.'],
  ['REPORTER', '', 'And you didn’t try to save the house?'],
  ['WITNESS', 'shakes her head', 'Save it? The flames were jumping from roof to roof faster than we could run.'],
  ['REPORTER', '', 'Our historian joins us from the twenty-first century. Why was this fire so hard to fight?'],
  ['HISTORIAN', 'calmly', 'Three things came together: timber houses packed tightly along narrow streets, a long dry summer, and a strong east wind. And as the Lord Mayor hesitated to pull down houses to create firebreaks, the fire gained precious hours.'],
];
const toolkit = sub('H5P.Accordion 1.0', {
  hTag: 'h3',
  panels: [
    ['🎬 Script format in 30 seconds', `${ph([
      'Speaker’s name in CAPITALS + colon: <code>REPORTER:</code>',
      'Stage directions <em>(in brackets, present simple)</em>: tone, pauses, sounds. Your report is audio only, so they are about the <strong>voice</strong>. They are never read aloud.',
      'Short turns: one to three sentences. A new speaker = a new line.',
      'Every answer triggers something: a reaction (“That must have been terrifying.”) or a follow-up question.',
      'Open questions (What…? Why…? How…?) get stories; yes/no questions get… “yes”.'])}`],
    ['📺 Need a model? An excerpt on another topic (London, 1666)', `<div style="border:1px solid #c9ced8;border-radius:6px;padding:0.3em 1em;background-color:#ffffff">
${MODEL2.map(([r, d, w]) => line(r, d, w)).join('\n')}</div>
<p><em>Notice: the hook, the sensory details, the follow-up question, and the historian’s cause-and-consequence answer.</em></p>`],
    ['🎤 Reporter: language', `${ph([
      '<strong>Hooks</strong>: “Tonight, a quiet village has turned against itself.” · “Fear has a name in Salem tonight…”',
      '<strong>Live narration</strong>: “As I speak, …” · “Crowds have been gathering since dawn.” · “Behind me, …”',
      '<strong>Handing over</strong>: “Joining me now is…” · “Let’s bring in our historian.” · “Over to you, …”',
      '<strong>Follow-ups</strong>: “What makes you so sure?” · “How did people react?” · “Did anyone dare to speak up?”',
      '<strong>Wrap-up</strong>: “A village divided, a court under pressure, and no end in sight. This is …, live from Salem.”'])}`],
    ['👁️ Witness: language', `${ph([
      '<strong>Narrative tenses</strong>: “I was walking home when I heard…” · “By then, they had already arrested…”',
      '<strong>Reported speech</strong>: “She claimed that she had seen…” · “They told us not to…”',
      '<strong>Feelings and doubts</strong>: “I can’t stop thinking about…” · “I’m afraid that if I speak, they’ll accuse me too.” · “I never thought my own neighbour would…”',
      '<strong>1692 world</strong>: the meeting house, the minister, the magistrates, the jail, your farm, the Devil, sin.'])}`],
    ['📚 Historian: language', `${ph([
      '<strong>Context</strong>: “To understand this, we need to go back to…” · “At the time, most people in Massachusetts believed that…”',
      '<strong>Facts</strong>: “Between [month] and [month] 1692, more than [number] people were accused.” · “[Number] were executed.”',
      '<strong>Cause and consequence</strong>: “This was partly due to…” · “As a result, …” · “What made things worse was…”',
      '<strong>Nuance</strong>: “Historians generally agree that…” · “One theory suggests…” · “It’s worth remembering that…”',
      '<strong>Bigger picture</strong>: “Looking back, Salem shows how…” · “Today, the term ‘witch hunt’ means…”'])}
<p><strong>Check before you write</strong>: How many people were accused, and how many executed? Who were the judges? What was “spectral evidence”? Why were most of the accused women? How and when did it end?</p>`],
    ['📖 Salem word bank', `${ph([
      'witchcraft · a witch hunt · the Devil · to bewitch · to be possessed / afflicted',
      'to accuse sb of sth · an accusation · the accused · an accuser · to point the finger at',
      'a trial · the court · a judge / magistrate · evidence · spectral evidence · a testimony',
      'guilty ≠ innocent · to confess · to deny · to plead · a sentence · to be hanged',
      'a Puritan · a minister · a scapegoat · a rumour · hysteria · mass panic · suspicion · a grudge'])}`],
  ].map(([t, html]) => ({ title: t, content: text(html, t) })),
}, 'Accordion', 'Toolkit');

const field = (task, ph_, rows = '1') => sub('H5P.TextInputField 1.2', { taskDescription: task, placeholderText: ph_, inputFieldSize: rows, requiredField: false }, 'Text Input Field', 'Field');
const dtext = (html) => sub('H5P.Text 1.1', { text: html }, 'Text', 'Text');
const page = (title, elements, helpText) => sub('H5P.StandardPage 1.5', { elementList: elements, helpTextLabel: 'Help', ...(helpText ? { helpText } : {}) }, 'Standard page', title);
const scriptTool = sub('H5P.DocumentationTool 1.8', {
  taskDescription: 'Our news report script',
  pagesList: [
    page('Our team', [
      field('Reporter:', 'name'), field('Witness: name, and who he or she is in 1692:', 'e.g. a servant in the Parris household'),
      field('Historian:', 'name'), field('Channel and title of the report:', 'e.g. Massachusetts Bay News: “A Village Turns on Itself”'),
    ], '<p>The witness’s identity drives the whole interview. Choose someone close to the events.</p>'),
    page('1-2. Opening and scene', [
      field('REPORTER: hook, who / where / when, then the scene:', 'REPORTER: (urgent) …', '10'),
    ], '<p>See “Reporter: language” in the toolkit.</p>'),
    page('3. The witness', [
      field('Interview with the witness (at least 3 questions, with follow-ups and reactions):', 'REPORTER: (turns to …) …?\nWITNESS: (…) …', '10'),
    ], '<p>Narrative tenses, sensory details, a clear point of view. The witness doesn’t know the ending.</p>'),
    page('4. The historian', [
      field('Interview with the historian (context, facts, why women were targeted):', 'REPORTER: Let’s bring in our historian. …?\nHISTORIAN: …', '10'),
    ], '<p>Cause and consequence, checked facts, nuance.</p>'),
    page('5. Closing', [
      field('REPORTER: wrap-up and sign-off:', 'REPORTER: (slowly, serious) …', '3'),
    ]),
    sub('H5P.DocumentExportPage 1.5', {
      description: '<p>Click <strong>Create document</strong>, then <strong>Export</strong> to download your script (Word). Share it with your group: you will need it to record.</p>',
      createDocumentLabel: 'Create document', exportTextLabel: 'Export', selectAllTextLabel: 'Select all',
    }, 'Document export page', 'Export'),
  ],
}, 'Documentation Tool', 'Our script');

const ch2 = chapter('2. Write your script', [
  text(`${head(2, 'Write your script', '30–40', 'in your group')}
<p>Write straight into the frame below, part by part, and export it at the end. Stuck? Open the toolkit underneath: it is there when you need it, not before.</p>`, 'Intro'),
  scriptTool,
  text('<h3>🧰 Toolkit</h3>', 'Toolkit title'),
  toolkit,
]);

/* ===== 3. Record (at home or in class) : audio uniquement ===== */
const ch3 = chapter('3. Record at home or in class', [
  text(`${head(3, 'Record at home or in class', 30)}
<p>Your report is <strong>audio only</strong>: no video, no faces, just your voices. That means your voice has to do all the work: tone, pace, pauses, emotion.</p>`, 'Intro'),
  sub('H5P.Accordion 1.0', {
    hTag: 'h3',
    panels: [
      ['🎧 What to record with', `${ph([
        '<strong>Right here</strong>: the recorder at the bottom of this page works in your browser (computer, tablet or phone). Record, listen, then <em>Download</em> the file.',
        '<strong>Your phone</strong>: the built-in voice recorder app (Voice Memos on iPhone, Recorder on Android).',
        '<strong>Vocaroo</strong> (vocaroo.com): free, no account. Record, then copy the link or download the MP3.',
        '<strong>Audacity</strong> (free, on a computer): to cut mistakes and put several recordings together.'])}`],
      ['🏫 Recording in class', `${ph([
        'Find the quietest spot you can: a corner, the corridor or another room if your teacher agrees.',
        'Sit close together around <strong>one device</strong>, placed on a pencil case or a jumper (not directly on the table: it picks up every knock).',
        'Everyone stays 15 to 20 cm from the microphone. Lean in when it is your turn.',
        'If you have earphones with a microphone, pass them from speaker to speaker.',
        'Record in <strong>one take</strong>, like a live broadcast. Two takes maximum, then keep the best one.'])}`],
      ['🏠 Recording at home', `${ph([
        '<strong>Together</strong>: meet at someone’s home and record as in class, in one take.',
        '<strong>Separately</strong>: each person records <strong>his or her own lines</strong>, one file per turn, with the same app, in a quiet room.',
        'Name each file with its number in the script: <code>03-witness.m4a</code>, <code>04-reporter.m4a</code>…',
        'Send all the files to one person (the reporter, for example), who puts them in order in Audacity.',
        'Leave a short pause between turns, and it sounds like a real conversation.'])}`],
      ['🔔 Optional · Sound atmosphere', `${ph([
        'With no pictures, sounds set the scene. Free sound effects: <strong>Pixabay</strong> (pixabay.com/sound-effects), for example a church bell, a crowd, wind, a door.',
        'You can also make them yourselves: knock on a table for the judge, whisper for the crowd.',
        'Keep them very quiet under the voices, and only at the start or between parts.'])}`],
      ['✅ Recording tips', `${ph([
        'Door closed, no background noise. A room with curtains, a bed or a sofa gives less echo than a kitchen or an empty classroom.',
        'Do a 10-second test and listen to it before recording everything.',
        'Speak more slowly than you think. Stress the key words. Pause before big news.',
        'Nobody can see you, so <strong>act with your voice</strong>: the reporter sounds urgent, the witness frightened, the historian calm.',
        'Say who is speaking: “Joining me now is…”. Listeners cannot see who is who.',
        'A mistake? Pause, go back to the start of the sentence, carry on. You can cut it later, or simply keep going.'])}`],
      ['📤 Before you hand it in', `${ph([
        'Length: 2 to 3 minutes.',
        'Everyone can be heard clearly. The five parts are there.',
        'File name: <code>Salem_Group-names.mp3</code> (or .m4a / .wav).',
        'Send it the way your teacher tells you. Don’t post it publicly online.'])}`],
    ].map(([t, html]) => ({ title: t, content: text(html, t) })),
  }, 'Accordion', 'Recording options'),
  text('<h3>🎙️ Record here</h3><p>Allow the microphone, record, listen, then download your file.</p>', 'Record'),
  sub('H5P.AudioRecorder 1.0', { title: 'Breaking News from Salem' }, 'Audio Recorder', 'Recorder'),
]);

/* ================= LIVRE ================= */
const book = merge(defaults('H5P.InteractiveBook 1.11'), {
  showCoverPage: true,
  bookCover: { coverDescription: cover, coverMedium: image('cover-salem.jpg', 'Breaking news: the Salem Witch Trials, 1692 (painting by T. H. Matteson, 1855)', CR_JACOBS) },
  chapters: [ch1, ch2, ch3],
  behaviour: { defaultTableOfContents: true, progressIndicators: true, progressAuto: true, displaySummary: false },
});
fs.writeFileSync(OUT, JSON.stringify(book));
console.log('OK', book.chapters.length, 'chapters');
