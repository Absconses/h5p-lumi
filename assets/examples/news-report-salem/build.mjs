// Livre interactif « Breaking News from Salem, 1692 » (anglais, collège) : lancement d'une activité
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

/* ---------- activités ---------- */
const scs = (intro, items, title) => sub('H5P.SingleChoiceSet 1.11', {
  choices: items.map(([q, ...answers]) => ({ subContentId: guid(), question: `<p>${q}</p>`, answers: answers.map(a => `<p>${a}</p>`) })),
  overallFeedback: [
    { from: 0, to: 59, feedback: 'Read the “Remember” box below, then try again.' },
    { from: 60, to: 99, feedback: 'Good! Look at your mistakes and try again.' },
    { from: 100, to: 100, feedback: 'Perfect! You know who says what.' },
  ],
  behavior: { autoContinue: true, timeoutCorrect: 1500, timeoutWrong: 2500, soundEffectsEnabled: false, enableRetry: true, enableSolutionsButton: true, passPercentage: 100 },
}, 'Single Choice Set', title);

const dragText = (task, lines, title) => sub('H5P.DragText 1.10', {
  taskDescription: `<p>${task}</p>`, textField: lines.join('\n'),
  overallFeedback: [
    { from: 0, to: 59, feedback: 'Read the “Remember” box below and try again.' },
    { from: 60, to: 99, feedback: 'Nearly there! Look at the red answers and try again.' },
    { from: 100, to: 100, feedback: 'Perfect!' },
  ],
  behaviour: { enableRetry: true, enableSolutionsButton: true, instantFeedback: false },
}, 'Drag the Words', title);

const blanks = (task, lines, title) => sub('H5P.Blanks 1.14', {
  text: `<p>${task}</p>`, questions: lines.map(l => `<p>${l}</p>`),
  overallFeedback: [
    { from: 0, to: 59, feedback: 'Look at the answer: is it a place, a time, a person, a feeling, a reason? Try again.' },
    { from: 60, to: 99, feedback: 'Nearly there! Check the red boxes.' },
    { from: 100, to: 100, feedback: 'Great! You can ask open questions.' },
  ],
  behaviour: { caseSensitive: false, acceptSpellingErrors: true, enableSolutionsButton: true, enableRetry: true, autoCheck: false },
}, 'Fill in the Blanks', title);

const mc = (question, answers, title) => sub('H5P.MultiChoice 1.16', {
  question: `<p>${question}</p>`,
  answers: answers.map(([t, ok, fb]) => ({ text: `<div>${t}</div>`, correct: ok, tipsAndFeedback: { tip: '', chosenFeedback: `<div>${fb}</div>`, notChosenFeedback: '' } })),
  behaviour: { type: answers.filter(a => a[1]).length > 1 ? 'multi' : 'single', singlePoint: false, randomAnswers: true, enableRetry: true, enableSolutionsButton: true },
  overallFeedback: [
    { from: 0, to: 99, feedback: 'Read the comments under your answers, then try again.' },
    { from: 100, to: 100, feedback: 'Well done: you found the three problems!' },
  ],
}, 'Multiple Choice', title);

const accordion = (panels, title) => sub('H5P.Accordion 1.0', {
  panels: panels.map(([t, html]) => ({ title: t, content: text(html, t) })), hTag: 'h3',
}, 'Accordion', title);

/* ================= COUVERTURE ================= */
const cover = `<h2 style="text-align:center">📺 Breaking News from Salem, 1692</h2>
<p style="text-align:center">Before you write your news report in groups, learn <strong>how a news report works</strong> and pick up <strong>the tools you need</strong>.</p>`;

/* ===== 1. Your mission ===== */
const roleBox = (r, icon, items) => `<div style="border-left:6px solid ${COL[r]};padding:0.3em 1em;margin:0.6em 0;background-color:#fafafa">
<p><strong style="color:${COL[r]}">${icon} ${r[0] + r.slice(1).toLowerCase()}</strong></p><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
const ch1 = chapter('1. Your mission', [
  text(`${head(1, 'Your mission', 3)}
<p>Work in <strong>groups of three</strong>. Prepare and perform a <strong>short news report about the Salem Witch Trials</strong>. Each student has a role:</p>
${roleBox('REPORTER', '🎤', ['Ask questions.', 'Explain what is happening.', 'Use clear and dramatic language.'])}
${roleBox('WITNESS', '👁️', ['Describe what you saw or heard.', 'Speak as someone living in Salem in 1692.', 'Mention fear, accusations, and the court.'])}
${roleBox('HISTORIAN', '📚', ['Explain the historical context.', 'Add facts and clarify the bigger picture.', 'Comment on why women were targeted.'])}
${box(`<p><strong>Before you start writing, follow these steps:</strong></p>
<ol><li>Read a model news report (on another topic).</li><li>Find the 5 parts of a news report.</li><li>Learn how to write a script.</li><li>Learn to ask good questions.</li><li>Open your toolbox of useful phrases.</li><li>Write, rehearse and record your report.</li></ol>`)}`, 'Mission'),
]);

/* ===== 2. Model ===== */
const MODEL = [
  ['REPORTER', 'looks at the camera, serious voice', 'Good evening. This is Tom Baker for Channel 1666 News, live from London. Tonight, the city is on fire!'],
  ['REPORTER', 'points behind him', 'Behind me, you can see the flames. The fire started early this morning in a small bakery in Pudding Lane. Now it is moving fast, from street to street.'],
  ['REPORTER', 'turns to the witness', 'I’m here with Anne Harris. She lives in Pudding Lane. Anne, what did you see this morning?'],
  ['WITNESS', 'coughs, scared', 'At one o’clock, I heard someone shout “Fire! Fire!” I opened my window and I saw orange flames everywhere.'],
  ['REPORTER', '', 'How did you feel?'],
  ['WITNESS', 'shaking', 'I was terrified! I took my children and we ran to the river. We lost everything.'],
  ['REPORTER', 'walks to the historian', 'Thank you, Anne. Stay safe. A historian joins us from today. Why did the fire spread so fast?'],
  ['HISTORIAN', 'calm voice', 'In 1666, most houses in London were made of wood, and they were very close together. The summer was very dry, and a strong wind was blowing from the east.'],
  ['REPORTER', '', 'How bad was it?'],
  ['HISTORIAN', '', 'Very bad. The fire burned for four days. It destroyed more than 13,000 houses and the old St Paul’s Cathedral. Today, we know that it changed London: after the fire, people built new houses with bricks and stone.'],
  ['REPORTER', 'looks at the camera', 'A terrible night for London. Thousands of families have lost their homes. This was Tom Baker, live from London, for Channel 1666 News. Back to the studio!'],
];
const ch2 = chapter('2. A model: London is on fire!', [
  text(`${head(2, 'A model: London is on fire! (1666)', 8)}
<p>This news report is <strong>not about Salem</strong>: it is about the <strong>Great Fire of London</strong> in 1666. Read it, or perform it with two classmates. Look at <strong>who speaks</strong> and <strong>how the script is written</strong>.</p>`, 'Intro'),
  image('model-fire.jpg', 'A “live” news report from London on 2 September 1666 (painting of the Great Fire of London, c. 1675)', CR_FIRE),
  text(`<div style="border:1px solid #c9ced8;border-radius:6px;padding:0.4em 1.2em;background-color:#ffffff">
<p style="color:#555555"><em>Channel 1666 News · Sunday 2 September 1666</em></p>
${MODEL.map(([r, d, w]) => line(r, d, w)).join('\n')}</div>`, 'Model script'),
  text(yourTurn('<p>Read these new lines. <strong>Who says each one?</strong></p>'), 'Your turn'),
  scs('', [
    ['“Good morning! This is Sara Lee, live from Paris.”', 'the reporter', 'the witness', 'the historian'],
    ['“I heard a terrible noise, and I ran outside.”', 'the witness', 'the historian', 'the reporter'],
    ['“In the 1600s, most people could not read or write.”', 'the historian', 'the reporter', 'the witness'],
    ['“Can you tell us what happened next?”', 'the reporter', 'the historian', 'the witness'],
    ['“I was so scared that I could not sleep.”', 'the witness', 'the reporter', 'the historian'],
    ['“Today, we know that this event changed the country.”', 'the historian', 'the witness', 'the reporter'],
    ['“That’s all for tonight. Back to you in the studio!”', 'the reporter', 'the witness', 'the historian'],
  ], 'Who says it?'),
  text(remember(`<ul>
<li><strong style="color:${COL.REPORTER}">The reporter</strong> opens and closes the report, explains what is happening <em>now</em> (“the fire <strong>is moving</strong>”) and asks the questions.</li>
<li><strong style="color:${COL.WITNESS}">The witness</strong> says “I”, tells what he or she <strong>saw, heard and felt</strong>, in the past simple (“I <strong>saw</strong>”, “I <strong>was</strong> terrified”). The witness lives in the past and does not know the future.</li>
<li><strong style="color:${COL.HISTORIAN}">The historian</strong> comes from <strong>today</strong>. He or she gives facts, dates and numbers, explains <strong>why</strong> (“because…”) and the bigger picture (“Today, we know that…”).</li></ul>`), 'Remember'),
]);

/* ===== 3. Structure ===== */
const ch3 = chapter('3. The 5 parts of a news report', [
  text(`${head(3, 'The 5 parts of a news report', 4)}
<p>Every news report follows the same <strong>running order</strong>. Here are lines from the model, but they are mixed up. <strong>Drag the name of each part</strong> next to its line.</p>`, 'Intro'),
  dragText('Drag the names of the parts: <strong>Opening</strong>, <strong>The scene</strong>, <strong>The witness</strong>, <strong>The historian</strong>, <strong>Closing</strong>.', [
    '“In 1666, most houses in London were made of wood.” → *The historian*',
    '“Good evening. This is Tom Baker, live from London.” → *Opening*',
    '“I opened my window and I saw orange flames everywhere.” → *The witness*',
    '“This was Tom Baker, live from London. Back to the studio!” → *Closing*',
    '“Behind me, you can see the flames. Now it is moving fast.” → *The scene*',
  ], 'Running order'),
  text(remember(`<p>A news report has <strong>5 parts</strong>, always in this order. The reporter speaks <strong>first and last</strong>.</p>`), 'Remember'),
  image('rundown.jpg', 'The running order: 1 Opening, 2 The scene, 3 The witness, 4 The historian, 5 Closing'),
  text(`<p>⏱ A short news report lasts <strong>2 to 3 minutes</strong>: that is about <strong>300 words</strong> for the whole group. Ask your teacher how long yours must be.</p>`, 'Length'),
]);

/* ===== 4. Script ===== */
const BAD = `<div style="border:1px dashed #b33;border-radius:6px;padding:0.4em 1.2em;background-color:#fff8f8">
<p style="color:#b33"><em>First draft of a news report (with problems!)</em></p>
<p>Good evening, live from London. The fire is very big.<br>Anne, did you see the fire?<br>Yes.<br>Anne looks scared.<br>Did you leave your house?<br>Yes.<br>Today we know that the houses were made of wood.<br>Bye!</p></div>`;
const ch4 = chapter('4. How to write a script', [
  text(`${head(4, 'How to write a script', 6)}
<p>A group wrote this first draft about the Great Fire. Compare it with the model in step 2.</p>${BAD}`, 'Bad draft'),
  mc('This draft has <strong>three big problems</strong>. Find them.', [
    ['We cannot tell who is speaking, because there are no names.', true, 'Yes! Write the speaker’s name before each line: REPORTER:, WITNESS:, HISTORIAN:.'],
    ['“Anne looks scared” is an action, but it looks like words to say.', true, 'Yes! It is a stage direction: put it in brackets, (scared), and don’t read it aloud.'],
    ['The questions get “Yes” answers, so the witness says nothing.', true, 'Yes! These are closed questions. Ask “What did you see?”, not “Did you see the fire?” (step 5).'],
    ['The historian can’t be in this report: he did not live in 1666.', false, 'No: the historian comes from today, like a time-travelling guest. That is normal in this kind of report.'],
    ['The draft is far too long for a news report of two minutes.', false, 'No: it is too short! A two-minute report needs about 300 words.'],
    ['“Good evening” is too polite: real reporters never say hello.', false, 'No: reporters always greet the audience in the opening: “Good evening”, “Hello and welcome”.'],
  ], 'Spot the problems'),
  text(remember(`<p><strong>The 4 rules of a script</strong></p>
<ol>
<li><strong>Names</strong>: write the speaker’s name in CAPITALS, then a colon. <code>REPORTER:</code></li>
<li><strong>Stage directions</strong>: put actions and feelings <em>(in brackets and italics)</em>, in the present simple. They tell you <strong>what to do</strong> or <strong>how to speak</strong>. You <strong>don’t read them aloud</strong>.</li>
<li><strong>Turns</strong>: a new speaker = a new line. Keep each turn short: 1 to 3 sentences.</li>
<li><strong>Links</strong>: a question → an answer → a reaction (“Thank you, Anne.”, “That’s terrible!”). Then the next question.</li>
</ol>
<p><strong>Useful stage directions</strong>: (looks at the camera) · (points behind him / her) · (turns to the witness) · (whispers) · (shouts) · (pauses) · (shakes his / her head) · (cries) · (nervous) · (angry) · (calm voice) · (shows a document)</p>`), 'Rules'),
]);

/* ===== 5. Questions ===== */
const ch5 = chapter('5. Asking good questions', [
  text(`${head(5, 'Asking good questions', 6)}
<p>The interview is the heart of your news report. Compare:</p>
<table style="width:100%;border-collapse:collapse"><tr>
<td style="width:50%;vertical-align:top;padding:0.4em 0.8em;background-color:#fff8f8"><p>${who('REPORTER')} Did you see the fire?</p><p>${who('WITNESS')} Yes.</p></td>
<td style="width:50%;vertical-align:top;padding:0.4em 0.8em;background-color:#f3fbf5"><p>${who('REPORTER')} What did you see?</p><p>${who('WITNESS')} I saw orange flames everywhere, and people were running in the street.</p></td>
</tr></table>
<p>The second question gets a much better answer. Why? Sort these questions.</p>`, 'Intro'),
  dragText('Is it an <strong>open</strong> question (long answer) or a <strong>closed</strong> question (“Yes” or “No”)?', [
    'Were you at home? *closed*',
    'What did you hear? *open*',
    'Did your family escape? *closed*',
    'How did you feel? *open*',
    'Was it dangerous? *closed*',
    'Why did people panic? *open*',
    'Is it true? *closed*',
    'Where did you go? *open*',
  ], 'Open or closed?'),
  text(remember(`<ul><li>An <strong>open question</strong> starts with a question word: <strong>What, Where, When, Who, Why, How</strong>. It gets a long, interesting answer.</li>
<li>A <strong>closed question</strong> starts with <em>Did / Was / Is / Are / Can…</em> and gets “Yes” or “No”. You can use one to check a fact, then add: “<strong>Can you tell us more?</strong>” or “<strong>Why?</strong>”.</li></ul>`), 'Remember'),
  text(yourTurn('<p>Read the witness’s answer and write the <strong>question word</strong> the reporter used.</p>'), 'Your turn'),
  blanks('Write the question word.', [
    '*Where* did you go? — We ran to the river.',
    '*How* did you feel? — I was terrified.',
    '*Why* did the fire spread so fast? — Because the houses were made of wood.',
    '*When/What time* did it start? — At one o’clock in the morning.',
    '*Who* shouted “Fire!”? — My neighbour, Mr Smith.',
    '*What* did you hear? — I heard people screaming.',
  ], 'Question words'),
]);

/* ===== 6. Toolbox ===== */
const ph = (items) => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
const ch6 = chapter('6. Your toolbox', [
  text(`${head(6, 'Your toolbox: words and phrases', 5, 'open the box for your role')}
<p>Open the box for <strong>your role</strong>. Use these phrases when you write. The words in [brackets] are for you to complete.</p>`, 'Intro'),
  accordion([
    ['🎤 Reporter: phrases', `<p><strong>Open the report</strong></p>${ph(['Good evening. This is [name] for [channel] News, live from Salem, Massachusetts.', 'Breaking news tonight: …', 'We are here in [place], where …'])}
<p><strong>Explain what is happening (present continuous)</strong></p>${ph(['Right now, people are …', 'Behind me, you can see …', 'The whole village is talking about …'])}
<p><strong>Dramatic words</strong>: shocking · terrifying · unbelievable · chaos · panic · fear · a nightmare · a town in shock</p>
<p><strong>Introduce your guests</strong></p>${ph(['I’m here with [name], who lives in Salem.', 'Let’s ask a historian. Why …?'])}
<p><strong>React</strong></p>${ph(['Thank you, [name].', 'That’s terrible!', 'Really? What happened next?', 'Can you tell us more?'])}
<p><strong>Close the report</strong></p>${ph(['So, a dark day for Salem …', 'This was [name], live from Salem, for [channel] News. Back to the studio!'])}`],
    ['👁️ Witness: phrases', `<p><strong>Tell what happened (past simple)</strong></p>${ph(['I saw … / I heard … / I was …', 'My neighbour said that …', 'First, … Then, … Suddenly, … After that, …'])}
<p><strong>Say how you felt</strong></p>${ph(['I was scared / terrified / shocked / angry / sad.', 'I couldn’t believe it!', 'Now I am afraid of … / I am afraid that …'])}
<p><strong>Speak as someone from 1692</strong></p>${ph(['Talk about your village, your church, your family, your neighbours.', 'You don’t know what happens later: only the historian knows!'])}`],
    ['📚 Historian: phrases', `<p><strong>Give the context</strong></p>${ph(['In 1692, … / At that time, …', 'Most people in Salem believed that …'])}
<p><strong>Give facts and numbers</strong></p>${ph(['More than [number] people were …', 'It started in [month] and ended in [month].'])}
<p><strong>Explain why</strong></p>${ph(['… because …', '… so …', 'One reason is that … Another reason is that …', 'As a result, …'])}
<p><strong>Give the bigger picture and your comment</strong></p>${ph(['Today, we know that …', 'Many historians think that …', 'This shows that …'])}
<p><strong>Questions to research</strong> (find the answers in your lessons and documents): When and where did it happen? How many people were accused? What happened to them? Who accused them? Why were most of the accused women? How did it end?</p>`],
    ['📖 Word bank: the Salem Witch Trials', `${ph(['a witch (witches) · witchcraft · the Devil', 'to accuse someone of … · an accusation · the accused', 'a trial · the court · a judge · evidence', 'guilty ≠ innocent · to confess · to deny', 'to be arrested · prison (jail) · to be hanged', 'a Puritan · a rumour · to blame · a neighbour', 'fear · afraid · panic · hysteria'])}`],
    ['🗣️ Performing: your voice', `${ph(['Speak <strong>slowly</strong> and <strong>loudly</strong>.', 'Look at the camera (or the class), not only at your paper.', 'Make a short pause before important news.', 'Show emotions with your voice and your face (follow your stage directions).', 'Listen to the others and react: you are a team!'])}`],
  ], 'Toolbox'),
]);

/* ===== 7. Write and rehearse ===== */
const field = (task, ph_, rows = '1') => sub('H5P.TextInputField 1.2', { taskDescription: task, placeholderText: ph_, inputFieldSize: rows, requiredField: false }, 'Text Input Field', 'Field');
const dtext = (html) => sub('H5P.Text 1.1', { text: html }, 'Text', 'Text');
const page = (title, elements, helpText) => sub('H5P.StandardPage 1.5', { elementList: elements, helpTextLabel: 'Help', ...(helpText ? { helpText } : {}) }, 'Standard page', title);
const scriptTool = sub('H5P.DocumentationTool 1.8', {
  taskDescription: 'Our news report script',
  pagesList: [
    page('Our team', [
      dtext('<p>Who plays which role?</p>'),
      field('Reporter (name):', 'Lucas'), field('Witness (name, and who he or she is in 1692):', 'Emma, a farmer’s wife from Salem Village'),
      field('Historian (name):', 'Inès'), field('Name of our news channel:', 'Channel 1692 News'),
    ], '<p>Choose a witness who can speak about fear, accusations and the court: a neighbour, a farmer, a servant, someone who went to a trial…</p>'),
    page('1-2. Opening and scene', [
      dtext('<p><strong>REPORTER</strong>: greet the audience, say who you are, where and when you are. Then explain what is happening, with dramatic words. Add stage directions in (brackets).</p>'),
      field('Opening:', 'REPORTER: (looks at the camera) Good evening. This is …', '3'),
      field('The scene:', 'REPORTER: (points behind him / her) Right now, …', '3'),
    ], '<p>Look at the “Reporter” box in step 6.</p>'),
    page('3. The witness', [
      dtext('<p>The reporter writes the questions <strong>first</strong> (open questions!), then the witness writes the answers: what he or she saw, heard and felt.</p>'),
      field('Question 1 and answer:', 'REPORTER: (turns to the witness) …?\nWITNESS: (…) I saw …', '3'),
      field('Question 2 and answer:', 'REPORTER: How …?\nWITNESS: …', '3'),
      field('Question 3 and answer:', 'REPORTER: …?\nWITNESS: …', '3'),
    ], '<p>Remember: the witness says “I”, uses the past simple and does not know the future.</p>'),
    page('4. The historian', [
      dtext('<p>The reporter asks, the historian explains the context, gives facts and comments on why women were targeted.</p>'),
      field('Question 1 and answer (context and facts):', 'REPORTER: Can you explain …?\nHISTORIAN: In 1692, …', '3'),
      field('Question 2 and answer (why were women targeted?):', 'REPORTER: Why …?\nHISTORIAN: Many historians think that …', '3'),
    ], '<p>Use “because”, “so”, “one reason is that…” and “Today, we know that…”.</p>'),
    page('5. Closing', [
      dtext('<p><strong>REPORTER</strong>: sum up in one sentence, then sign off.</p>'),
      field('Closing:', 'REPORTER: (looks at the camera) So, … This was …, live from Salem …', '3'),
    ]),
    sub('H5P.DocumentExportPage 1.5', {
      description: '<p>Your script is ready! Click <strong>Create document</strong>, then <strong>Export</strong> to download it (Word). Print it or share it with your group to rehearse.</p>',
      createDocumentLabel: 'Create document', exportTextLabel: 'Export', selectAllTextLabel: 'Select all',
    }, 'Document export page', 'Export'),
  ],
}, 'Documentation Tool', 'Our script');

const recorder = sub('H5P.AudioRecorder 1.0', { title: 'Record your rehearsal' }, 'Audio Recorder', 'Rehearsal');

const ch7 = chapter('7. Write and rehearse', [
  text(`${head(7, 'Write and rehearse', '40', 'in your group')}
<p><strong>How to work as a team</strong> (suggested times; your teacher decides):</p>
<ol>
<li><strong>Choose your roles</strong> and your witness’s identity. (2 min)</li>
<li><strong>Plan together</strong> with the 5 parts: what will each person say? (5 min)</li>
<li><strong>The reporter writes the questions first</strong>, then gives them to the witness and the historian, who write their answers. (15 min)</li>
<li><strong>Read the script aloud together.</strong> Add stage directions and reactions. (5 min)</li>
<li><strong>Rehearse twice</strong>, record yourselves and listen. Time it with a stopwatch: 2 to 3 minutes. (10 min)</li>
</ol>
<p>✍️ Write your script below, page by page. When it is finished, export it.</p>`, 'Teamwork'),
  scriptTool,
  text(`<h3>🎙️ Record a rehearsal</h3><p>Click to record your news report, then listen. Can you understand every word? Is it too fast? Then try again!</p>`, 'Record'),
  recorder,
  text(box(`<p><strong>✅ Checklist before you perform</strong></p>
<ul>
<li>Our report has the 5 parts, in order.</li>
<li>Each line starts with a NAME:, and stage directions are in (brackets).</li>
<li>The reporter asks open questions and reacts to the answers.</li>
<li>The witness speaks as someone from 1692: fear, accusations, the court.</li>
<li>The historian gives facts and explains why women were targeted.</li>
<li>We speak slowly and loudly, and we look at the audience.</li>
<li>Our report lasts 2 to 3 minutes.</li>
</ul>`, '#e8f6ee'), 'Checklist'),
]);

/* ================= LIVRE ================= */
const book = merge(defaults('H5P.InteractiveBook 1.11'), {
  showCoverPage: true,
  bookCover: { coverDescription: cover, coverMedium: image('cover-salem.jpg', 'Breaking news: the Salem Witch Trials, 1692 (painting by T. H. Matteson, 1855)', CR_JACOBS) },
  chapters: [ch1, ch2, ch3, ch4, ch5, ch6, ch7],
  behaviour: { defaultTableOfContents: true, progressIndicators: true, progressAuto: true, displaySummary: true },
});
fs.writeFileSync(OUT, JSON.stringify(book));
console.log('OK', book.chapters.length, 'chapters');
