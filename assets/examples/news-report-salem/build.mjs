// Livre interactif « Breaking News from Salem, 1692 » v3 (anglais, 3e advanced) : brief, boîte à outils (script écrit à la main), tournage vidéo.
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
<p style="text-align:center">Your brief · your toolkit · your video</p>`;

/* ===== 1. The brief ===== */
const roleCell = (r, icon, task, levelUp) => `<td style="vertical-align:top;padding:0.5em 0.8em;border-top:5px solid ${COL[r]};background-color:#fafafa">
<p><strong style="color:${COL[r]}">${icon} ${r[0] + r.slice(1).toLowerCase()}</strong></p><p><em>${task}</em></p>
<p><strong>Level up</strong></p>${ph(levelUp)}</td>`;
const ch1 = chapter('1. The brief', [
  text(`${head(1, 'The brief', 3, 'then start writing')}
<p>In groups of three, write a <strong>2-to-3-minute TV news report</strong> on the <strong>Salem Witch Trials</strong>, broadcast “live” from Salem in 1692, with a historian joining the programme <strong>from today</strong>. You write the script <strong>by hand</strong> in class, then you <strong>film it at home</strong>.</p>
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
    '<strong>Delivery</strong>: clear, paced, expressive, eyes on the camera. About 300 to 400 words for the whole group.'])}
<p><strong>Now</strong>: agree on roles and the witness’s identity (2 min), sketch the five parts (5 min), then write on paper, with the toolkit (step 2) open next to you. The reporter drafts the questions first, so the answers fit.</p>`)}`, 'Brief'),
]);

/* ===== 2. Write your script ===== */
const MODEL2 = [
  ['REPORTER', 'to camera, urgent', 'Good evening. Tonight, London is burning, and nobody seems able to stop it. I’m Tom Baker, live from the north bank of the Thames.'],
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
      'Stage directions <em>(in brackets, present simple)</em>: actions, looks, tone, pauses. They are never read aloud.',
      'Short turns: one to three sentences. A new speaker = a new line.',
      'Every answer triggers something: a reaction (“That must have been terrifying.”) or a follow-up question.',
      'Open questions (What…? Why…? How…?) get stories; yes/no questions get… “yes”.',
      '<strong>On paper</strong>: names in the margin, skip a line between turns, stage directions in another colour, number the turns. You will thank yourselves when you film.'])}`],
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

/* Le script s'écrit à la main (retour de Pierre, 2026-11-13 11:37) : plus de trame en ligne, le chapitre 2 = la boîte à outils. */
const ch2 = chapter('2. Your toolkit', [
  text(`${head(2, 'Your toolkit', '30–40', 'while you write, in your group')}
<p>You write your script <strong>by hand</strong>. Keep this page open next to you and open a box <strong>when you need it</strong>: the format, a model, the language for your role, the Salem word bank.</p>`, 'Intro'),
  toolkit,
]);

/* ===== 3. Film your report (à la maison ou en classe) : vidéo ===== */
const ch3 = chapter('3. Film your report', [
  text(`${head(3, 'Film your report at home', 30)}
<p>Your report is a <strong>video</strong>: the audience sees and hears you. A phone is all you need.</p>`, 'Intro'),
  sub('H5P.Accordion 1.0', {
    hTag: 'h3',
    panels: [
      ['🎥 What to film and edit with', `${ph([
        '<strong>Filming</strong>: a phone or a tablet, with its normal camera app. Use the back camera if someone else is filming (better quality).',
        '<strong>Canva</strong> (canva.com, with your school account if you have one): edit, add titles and a news banner, and even change your background without a green screen. See the two boxes below.',
        '<strong>Clipchamp</strong> (built into Windows) or <strong>iMovie</strong> (iPhone, iPad, Mac): to cut and put your clips together.',
        '<strong>Your phone’s gallery</strong>: enough to trim the beginning and the end of a clip.'])}`],
      ['🎨 Using Canva (edit, titles, news banner)', `${ph([
        'Create a new <strong>Video</strong> design (landscape, 16:9).',
        'Upload the clips you filmed (<strong>Uploads</strong>), or record directly with <strong>Record yourself</strong>.',
        'Place the clips in order on the timeline at the bottom. Trim the beginning and the end of each one.',
        'Add what makes it look like TV news: a title page for your channel, a <strong>“BREAKING NEWS” banner</strong> at the bottom, name captions (“[Name], witness”, “Dr …, historian”), “LIVE · Salem, 1692”.',
        'Open <strong>Audio</strong> to add a short news jingle at the start. Keep music off while people speak.',
        'Working from different homes? Share the design with your group: everyone adds his or her own clips to the same project.',
        'When it is ready: <strong>Share → Download</strong> (MP4), or share the link, as your teacher asks.'])}
<p><em>Menu names can change a little between the app and the website.</em></p>`],
      ['🪄 No green screen needed: Canva’s background remover', `<p>Canva can <strong>cut you out of your video</strong> and put you in front of any background. You don’t need a green screen.</p>${ph([
        'Film each person in front of a <strong>plain wall</strong>, with good light, wearing colours that are different from the wall. One clip per speaker and per turn works best (keep the clips short).',
        'In Canva, click the clip, then <strong>Edit → Background Remover</strong> (BG Remover). The background disappears.',
        'Add a background <strong>behind</strong> the clip: a photo, a painting or an <strong>animated video</strong> from Canva’s library. For example: a newsroom for the reporter, a dark wooden village or a courtroom for the witness, a library for the historian.',
        'Resize and move each person: you can put the reporter and the guest <strong>side by side</strong> on the same screen, like a live link-up, even if you filmed in different places.',
        'Add the “LIVE · Salem, 1692” label and the name captions on top.',
        'Keep it believable: no modern objects in the 1692 background, and the same light direction for everyone if you can.'])}
<p><em>The background remover is part of Canva for Education and Canva Pro. If you don’t see it, log in with your school account.</em></p>`],
      ['🎬 Framing, light and sound', `${ph([
        'Film in <strong>landscape</strong> (phone horizontal), like a TV screen.',
        'Camera at <strong>eye level</strong> and steady: lean the phone on books or use a tripod. No hand-held shaking.',
        'Head and shoulders in the frame, a little space above the head.',
        '<strong>Light in front of you</strong> (face a window). Never stand with a window behind you.',
        'Sound matters more than the picture: quiet place, stand 1 to 1.5 m from the phone, speak up. Earphones with a microphone work well as a hand-held reporter’s mic.',
        'Do a 10-second test and watch it before filming everything.'])}`],
      ['🎭 Setting the scene', `${ph([
        '<strong>Reporter</strong>: a plain wall or outdoors, something to hold as a microphone, a serious look.',
        '<strong>Witness</strong>: 1692. A shawl, a dark coat, a plain shirt, a hat; a wooden door, a tree, a dark corner or a candle-like lamp. No logos, no phones, no posters in the frame.',
        '<strong>Historian</strong>: today. Books, a desk, a map or a laptop behind you.',
        'Different places or backgrounds for each guest make it clear that the historian is not in 1692.',
        'No suitable place? Film in front of a plain wall and add the background in Canva (see “No green screen needed”).',
        'Simple props are enough. Acting and language matter more than costumes.'])}`],
      ['🏠 Together or separately?', `${ph([
        '<strong>Together</strong>: meet at someone’s home. Ask a brother, a sister or a parent to film, or lean the phone on a pile of books. Film it in one take, like a live broadcast: two takes maximum, then keep the best one.',
        '<strong>Separately</strong>: each person films <strong>his or her own lines</strong>, one clip per turn, phone in landscape, same distance from the camera.',
        'Look slightly to the side of the camera when you answer, as if the reporter were standing there. The reporter looks into the camera for the opening and the closing.',
        'Name each clip with its number in the script: <code>03-witness.mp4</code>, <code>04-reporter.mp4</code>…',
        'Send the clips to one person, or add them all to a shared Canva design, and put them in order.'])}`],
      ['✅ On camera', `${ph([
        '<strong>Know your lines</strong>: don’t read your paper on screen. Write key words in big letters on a sheet held next to the camera.',
        'The reporter looks <strong>into the lens</strong> for the opening and the closing, and at the guest during the interview.',
        'Speak more slowly than you think. Stress the key words. Pause before big news.',
        'Act: the reporter is urgent, the witness frightened, the historian calm. Follow your stage directions.',
        'Start filming 2 seconds before the first word and stop 2 seconds after the last one: it makes editing much easier.',
        'A mistake? Pause, go back to the start of the sentence, carry on. You can cut it later.'])}`],
      ['📤 Before you hand it in', `${ph([
        'Length: 2 to 3 minutes.',
        'Landscape, everyone can be seen and heard clearly, the five parts are there.',
        'File name: <code>Salem_Group-names.mp4</code>.',
        'Hand it in the way your teacher tells you. <strong>Don’t post it on social media or anywhere public</strong>: your classmates’ faces are in it.'])}`],
    ].map(([t, html]) => ({ title: t, content: text(html, t) })),
  }, 'Accordion', 'Filming'),
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
