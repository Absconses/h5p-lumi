// Les « pièces à conviction » : quatrièmes de couverture INVENTÉES (aucun vrai livre résumé).
// Source unique : elles servent aux images (render.mjs), aux textes alternatifs et au graphe (scenario.mjs).
// [[texte|clé]] marque un passage repéré par un point d'intérêt (Image Hotspots) : render.mjs mesure sa
// position et l'écrit dans media/hotspots.json.
// Chaque livre porte un piège tiré d'erreurs réelles d'élèves (cf. README) :
//   p1 diagnostic, net ; p2 a l'air fantastique mais c'est une enquête ; p3/p3b font peur, des gens
//   disparaissent, mais personne n'enquête ; p4/p4b : ni policier ni meurtre, et pourtant polar ;
//   p5 (bonus) : on connaît le coupable dès la première page, polar quand même.
export const PIECES = {
  p1: {
    n: 1, titre: 'Le Manuscrit disparu', auteur: 'Claire Vasseur',
    texte: [
      'La veille de l’exposition, [[le plus vieux livre de la médiathèque disparaît|mefait]] de sa vitrine fermée à clé.',
      '[[Seules trois personnes avaient la clé|suspects]] : le directeur, la bibliothécaire et le gardien de nuit.',
      '[[Zoé, douze ans|enqueteur]], remarque [[une goutte de cire sur le sol|indices]]. Elle interroge, compare les alibis, relie les indices.',
      '[[Et si le voleur était celui qu’on soupçonne le moins ?|question]]',
    ],
  },
  p2: {
    n: 2, titre: 'Le Secret du phare', auteur: 'Yann Le Goff',
    texte: [
      'Chaque nuit, la lumière du vieux phare de Port-Galet s’allume toute seule, alors qu’il est abandonné depuis vingt ans.',
      'Les pêcheurs parlent d’un fantôme. Malo, lui, n’y croit pas.',
      'Avec sa cousine Inès, il relève des traces de pas, interroge le vieux gardien et découvre une barque cachée dans les rochers.',
      'Quelqu’un se sert du phare en secret… Mais qui, et pour quoi faire ?',
    ],
  },
  p3: {
    n: 3, titre: 'La Maison du bout du lac', auteur: 'Agathe Morin',
    texte: [
      'Personne ne s’approche de la maison du bout du lac : ceux qui y sont entrés n’en sont jamais ressortis.',
      'Un soir d’orage, Léa et son petit frère doivent pourtant s’y abriter.',
      'Les portes claquent toutes seules, des voix chuchotent leur nom dans les murs, et la sortie a disparu…',
      'Tiendront-ils jusqu’à l’aube ?',
    ],
  },
  p3b: {
    n: '3 bis', titre: 'Naufrage sur l’île aux Corsaires', auteur: 'Hugo Delmas',
    texte: [
      'Pris dans la tempête, le voilier du capitaine Morel se fracasse sur les récifs. Le capitaine disparaît dans les vagues.',
      'Sur l’île où ils ont échoué, Yanis et les autres passagers doivent trouver de l’eau, construire un abri et se cacher des pirates qui rôdent.',
      'Tiendront-ils jusqu’à l’arrivée des secours ?',
    ],
  },
  p4: {
    n: 4, titre: 'Piratage au club journal', auteur: 'Samia Benali',
    texte: [
      'Lundi matin, le compte du collège annonce une fausse nouvelle : la cantine fermerait pour toujours ! Panique dans la cour.',
      'Mais qui a piraté le compte ? Nour, rédactrice en chef du journal du collège, mène l’enquête.',
      'Elle compare les heures de connexion, interroge trois suspects… et repère une faute d’orthographe qui pourrait bien trahir l’auteur du message.',
    ],
  },
  p4b: {
    n: '4 bis', titre: 'Où est passé Pistache ?', auteur: 'Lucie Arnaud',
    texte: [
      'Ce matin, la cage de Pistache, le hamster de la classe, est vide… et sa petite porte est bien fermée !',
      'Gabin ne croit pas à une évasion. Il ramasse des graines tombées dans le couloir, repère une empreinte de basket sous la fenêtre et note ce que chacun faisait hier à 16 heures.',
      'Quelqu’un ment. Mais qui ?',
    ],
  },
  p5: {
    n: 5, titre: 'Le Coupable idéal', auteur: 'Marc Ferrand',
    texte: [
      'Dès la première page, tu sais tout : c’est Victor Lantier, le riche antiquaire, qui a volé le collier de la duchesse.',
      'Il a tout prévu, même son alibi. Personne ne le soupçonne… sauf l’inspectrice Morvan, qui revient sans cesse lui poser « une dernière petite question ».',
      'Réussira-t-elle à prouver ce qu’elle devine ?',
    ],
  },
};

export const plain = (k) => PIECES[k].texte.join(' ').replace(/\[\[([^|\]]+)\|[^\]]+\]\]/g, '$1');
export const alt = (k) => `Pièce à conviction n° ${PIECES[k].n}. Quatrième de couverture du roman « ${PIECES[k].titre} », de ${PIECES[k].auteur} : ${plain(k)}`;
