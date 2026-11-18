import { ChapterDef } from '../types';

export const CHAPTERS: ChapterDef[] = [
  {
    id: 1,
    slug: 'base-current',
    pageRef: 'pp. 3, 5, 15, 27, 50, 57',
    title: {
      fr: '1. Comment un doigt allume-t-il une LED ?',
      ar: '١. كيف يضيء إصبعٌ مصباحاً؟',
    },
    subtitle: {
      fr: 'Le courant de base commande le courant collecteur',
      ar: 'تيار القاعدة الصغير يتحكم في تيار المجمّع الكبير',
    },
    analogyTitle: {
      fr: 'Analogie du livre : la vanne hydraulique (p. 5, Schéma C)',
      ar: 'تشبيه الكتاب: صمّام الماء (ص ٥، الشكل C)',
    },
    analogyText: {
      fr: 'Imaginez le transistor comme un clapet dans un tuyau : une minuscule pression d’eau sur le levier de base (I_B) ouvre le grand passage entre le collecteur (C) et l’émetteur (E). Plus vous appuyez sur les fils, plus votre peau laisse passer de micro-ampères.',
      ar: 'تخيّل الترانزستور كصمّام ماء: تيار ضئيل يدخل القاعدة (B) يفتح المجرى الواسع بين المجمّع (C) والباعث (E). كلما ضغطتَ أقوى على السلكين، قلّت مقاومة جلدك وزاد تيار القاعدة.',
    },
    theory: [
      {
        fr: 'Un transistor bipolaire n’est pas un interrupteur commandé par une tension seule : il faut un courant réel entrant dans sa base (au-delà du seuil V_BE ≈ 0,6 V) pour qu’il conduise.',
        ar: 'لا يعمل الترانزستور بالجهد وحده، بل يحتاج إلى تيار فعلي يدخل القاعدة (بعد تجاوز عتبة V_BE ≈ 0.6 V) ليسمح بمرور تيار المجمّع.',
      },
      {
        fr: 'Dans le « Circuit le plus simple au monde » (p. 27), la résistance de votre peau laisse passer quelques micro-ampères dans la base, multipliés par le gain β (≈ 100 à 200) entre C et E.',
        ar: 'في «أبسط دارة في العالم» (ص ٢٧)، تمرّر مقاومة إصبعك بضعة ميكروأمبيرات إلى القاعدة، فيضاعفها الترانزستور بنحو β (١٠٠ إلى ٢٠٠ مرة) لإضاءة الـ LED.',
      },
    ],
    formula: 'I_C = β × I_B',
    formulaVars: [
      { symbol: 'I_B', meaning: { fr: 'Courant de base (commande)', ar: 'تيار القاعدة (التحكم)' }, unit: 'µA' },
      { symbol: 'β (h_FE)', meaning: { fr: 'Gain en courant du BC547', ar: 'معامل التضخيم β' }, unit: '×200' },
      { symbol: 'I_C', meaning: { fr: 'Courant collecteur (charge)', ar: 'تيار المجمّع (الحِمل)' }, unit: 'mA' },
    ],
    examples: [
      {
        id: 'simplest',
        pageRef: 'p. 3 & p. 27',
        title: { fr: 'Circuit le plus simple (doigt)', ar: 'أبسط دارة (مفتاح الإصبع)' },
        summary: {
          fr: 'Deux doigts relient la base au +9 V. Plus la pression augmente, plus R_peau chute (2 MΩ → 20 kΩ) et la LED brille.',
          ar: 'إصبعان يصلان القاعدة بالموجب. كلما اشتد الضغط هبطت مقاومة الجلد وسطع الـ LED.',
        },
        components: ['BC547', 'LED', '220R', 'Pile 9V'],
      },
      {
        id: 'plant',
        pageRef: 'p. 14–15',
        title: { fr: 'Détecteur plante à arroser', ar: 'كاشف جفاف تربة النبات' },
        summary: {
          fr: 'Montage à 3 V avec 220 kΩ en base : les sondes dans la terre modulent I_B selon l’humidité du sol (courant limité à ~2 mA sans résistance de LED).',
          ar: 'دارة ٣ فولت بمقاومة قاعدة 220k: رطوبة التربة تغيّر المقاومة بين المسبارين وتتحكم بسطوع الـ LED بتيار آمن (~2mA).',
        },
        components: ['BC547', '220k', 'LED Rouge', '3V'],
      },
      {
        id: 'staircase',
        pageRef: 'p. 49–50 & p. 57',
        title: { fr: 'Détecteur de mensonge / Force', ar: 'كاشف الكذب / مقياس الضغط' },
        summary: {
          fr: 'Montage en escalier (4 LEDs) : chaque étage ajoute 0,6 V (diode 1N4148 ou jonction B-E). Plus on serre les bornes, plus le nombre de LEDs allumées grimpe !',
          ar: 'دارة متدرجة بـ ٤ مصابيح LED: كل درجة تضيف 0.6V، فكلما ضغطتَ أقوى أضاءت مصابيح أكثر بالتتابع.',
        },
        components: ['4×BC547', '3×1N4148', '4×LED', '100R', '9V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Vous serrez plus fort les deux fils avec vos doigts. Que deviennent la résistance de votre peau et le courant de base I_B ?',
        ar: 'تضغط أقوى على السلكين بأصابعك. ماذا يحدث لمقاومة جلدك ولتيار القاعدة I_B؟',
      },
      options: [
        { fr: 'La résistance augmente et I_B diminue', ar: 'تزداد المقاومة وينقص I_B' },
        { fr: 'La résistance diminue et I_B augmente', ar: 'تنقص المقاومة ويزداد I_B' },
        { fr: 'Seule la tension augmente, I_B reste nul', ar: 'يرتفع الجهد فقط ويبقى I_B صفراً' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'En appuyant plus fort, la surface de contact et la conductivité augmentent : R_peau chute fortement, donc I_B = (V_CC − 0,6 V) / R_peau augmente, et I_C = β × I_B illumine davantage la LED (p. 3, Schéma F).',
        ar: 'عند زيادة الضغط تزداد مساحة التلامس وتقلّ مقاومة الإصبع، فيزداد تيار القاعدة I_B، وبما أن I_C = β × I_B يزداد سطوع الـ LED (ص ٣، الشكل F).',
      },
    },
    teacherNote: {
      fr: 'Note du livre (p. 3 & p. 27) : le livre cite β ≈ 100 p. 3 et ≈ 200 p. 27. En régime saturé avec R_LED = 220 Ω sous 9 V, I_C plafonne à I_max ≈ (9 − 2) / 220 ≈ 31,8 mA.',
      ar: 'ملاحظة: يذكر الكتاب تضخيماً نحو ١٠٠ في ص٣ ونحو ٢٠٠ في ص٢٧. عند التشبّع بـ 9V ومقاومة 220Ω، يحدّ الحِمل التيار عند I_max ≈ 31.8 mA.',
    },
  },
  {
    id: 2,
    slug: 'npn-vs-pnp',
    pageRef: 'pp. 1, 21–24, 55',
    title: {
      fr: '2. NPN ou PNP : polarités opposées',
      ar: '٢. NPN أم PNP: القطبية المعكوسة',
    },
    subtitle: {
      fr: 'Deux familles complémentaires qui exigent une alimentation inversée',
      ar: 'نوعان متكاملان يعملان بقطبية بطارية متعاكسة',
    },
    analogyTitle: {
      fr: 'Erreur courante traitée : le câblage identique',
      ar: 'الخطأ الشائع: توصيل النوعين بنفس الطريقة',
    },
    analogyText: {
      fr: 'Sur le symbole NPN (BC547), la flèche de l’émetteur pointe vers l’extérieur (« Ne Pointe Pas » dedans) : le courant entre par C et B et sort par E. Sur le PNP (BC557), la flèche pointe vers l’intérieur : le courant entre par E et sort par B et C.',
      ar: 'في رمز NPN (مثل BC547) يتجه السهم للخارج: يدخل التيار من C و B ويخرج من E. أما في PNP (مثل BC557) فيتجه السهم للداخل: يدخل من E ويخرج من B و C.',
    },
    theory: [
      {
        fr: 'Dans le « Testeur de transistor le plus simple » (p. 23–24), une pile de 9 V, une résistance de 1 kΩ et une LED suffisent à distinguer NPN et PNP : pour tester un PNP dans le même montage, il faut retourner la pile.',
        ar: 'في «أبسط فاحص ترانزستور» (ص ٢٣–٢٤)، يكفي 9V و1k وLED للتمييز بينهما: لاختبار PNP يجب قلب أقطاب البطارية.',
      },
      {
        fr: 'En combinant un NPN et un PNP côte à côte (comme dans la Sonde Logique p. 55), on détecte à la fois les niveaux HAUT (> 2,3 V) et BAS (0 V) sans consommer de courant au repos !',
        ar: 'بجمع NPN و PNP معاً (مثل المجسّ المنطقي ص ٥٥)، نكشف الحالة المرتفعة (HIGH) والمنخفضة (LOW) دون استهلاك تيار في وضع السكون.',
      },
    ],
    formula: 'NPN ⇄ PNP',
    formulaVars: [
      { symbol: 'NPN (BC547)', meaning: { fr: 'C > E, courant I_B entrant dans B', ar: 'C أعلى جهداً من E، وتيار B يدخل القاعدة' }, unit: '+V_BE' },
      { symbol: 'PNP (BC557)', meaning: { fr: 'E > C, courant I_B sortant de B', ar: 'E أعلى جهداً من C، وتيار B يخرج من القاعدة' }, unit: '−V_BE' },
    ],
    examples: [
      {
        id: 'tester',
        pageRef: 'p. 23–24',
        title: { fr: 'Testeur NPN / PNP à pile 9V', ar: 'فاحص NPN / PNP ببطارية 9V' },
        summary: {
          fr: 'Choisissez BC337 (NPN) ou BC327 (PNP) et inversez la polarité de la batterie : la LED ne s’allume que lorsque type et polarité concordent.',
          ar: 'اختر NPN أو PNP واقلب البطارية: لا يضيء الـ LED إلا إذا تطابق نوع الترانزستور مع قطبية المصدر.',
        },
        components: ['BC547 / BC557', '1k', 'LED', '9V'],
      },
      {
        id: 'logic-probe',
        pageRef: 'p. 55',
        title: { fr: 'Sonde logique complémentaire', ar: 'المجسّ المنطقي البسيط (HIGH / LOW)' },
        summary: {
          fr: 'Sonde du livre : à vide (2,1 + 0,6 + 1,7 + 0,6 = 5 V > 3 V), aucune LED ne s’allume. Sur LOW (0 V), le BC557 allume la LED verte. Sur HIGH (> 2,3 V), le BC547 allume la LED rouge.',
          ar: 'عند السكون لا يضيء أي مصباح لأن مجموع الجهود (5V) أكبر من 3V. عند لمس LOW يضيء الأخضر عبر PNP، وعند HIGH يضيء الأحمر عبر NPN.',
        },
        components: ['BC547', 'BC557', 'LED Verte', 'LED Rouge', '2×10k', '2×100R', '3V'],
      },
    ],
    prediction: {
      question: {
        fr: 'On branche un PNP (BC557) avec le « + » côté collecteur (comme pour un NPN) et on appuie fort sur les fils de test. La LED s’allume-t-elle ?',
        ar: 'وصلتَ ترانزستور PNP كما يُوصل NPN (الموجب جهة المجمّع) وضغطتَ بقوة. هل يضيء الـ LED؟',
      },
      options: [
        { fr: 'Oui, elle brille normalement', ar: 'نعم، يضيء بشكل عادي' },
        { fr: 'Non, elle reste totalement éteinte', ar: 'لا، يبقى مطفأً تماماً' },
        { fr: 'Elle clignote rapidement', ar: 'يومض بسرعة' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'Non ! Pour polariser la jonction Base-Émetteur d’un PNP en direct, l’émetteur doit être plus positif que la base et le collecteur. Il faut inverser la batterie (p. 24).',
        ar: 'لا! لأن ترانزستور PNP يحتاج أن يكون الباعث E أكثر إيجابية من القاعدة والمجمّع، لذا لا يعمل إلا عند عكس البطارية (ص ٢٤).',
      },
    },
    teacherNote: {
      fr: 'Astuce du livre (p. 2) : BC547 peut être remplacé par presque tout petit NPN (BC337, 2N2222, 2N3904) et BC557 par tout petit PNP (BC327, 2N3906), en vérifiant le brochage E-B-C.',
      ar: 'معلومة من الكتاب (ص ٢): يمكن استبدال BC547 بأي NPN شائع مثل BC337 أو 2N2222، وBC557 بأي PNP مثل BC327 بعد التأكد من ترتيب الأرجل.',
    },
  },
  {
    id: 3,
    slug: 'capacitor-timing',
    pageRef: 'pp. 5–6 (H, I) & p. 64',
    title: {
      fr: '3. Condensateur & Transistor : Flashs et Temporisation',
      ar: '٣. المكثف والترانزستور: الوميض والتأخير الزمني',
    },
    subtitle: {
      fr: 'Un condensateur laisse passer le courant jusqu’à sa charge complète',
      ar: 'يمرّر المكثف التيار فقط أثناء شحنه ثم يقطعه عند الامتلاء',
    },
    analogyTitle: {
      fr: 'Schémas H & I du livre (pp. 5–6) : le réservoir qui se remplit',
      ar: 'الشكلان H و I في الكتاب (ص ٥–٦): الخزّان الذي يمتلئ',
    },
    analogyText: {
      fr: 'Un condensateur déchargé agit d’abord comme un fil : le courant de charge traverse la base et allume vivement la LED. Dès qu’il est plein, plus aucun courant continu ne circule : la LED s’éteint. Il faut le décharger pour recommencer !',
      ar: 'المكثف الفارغ يمرّر تياراً لحظياً يشغّل الترانزستور بقوة، لكن ما إن يمتلئ بالشحنة حتى يتوقف التيار وتنطفئ الـ LED. لإعادة التجربة لا بد من تفريغ المكثف.',
    },
    theory: [
      {
        fr: 'Schéma H (p. 5–6) : placé sur la base, un grand condensateur (ex. 100 µF ou 220 µF) maintient le courant de base plus longtemps avant de se bloquer. La durée suit la constante de temps τ = R × C.',
        ar: 'الشكل H: عند وضع مكثف على القاعدة، تزداد مدة إضاءة الـ LED كلما كبرت سعة المكثف وفق الثابت الزمني τ = R × C.',
      },
      {
        fr: 'Dans l’« Extenseur d’éclairage voiture MkII » (p. 64), quand la portière se ferme, un condensateur de 47 µF se charge lentement à travers 100 kΩ et garde le plafonnier allumé plusieurs secondes pour que le passager s’installe.',
        ar: 'في «ممدّد إضاءة السيارة MkII» (ص ٦٤)، يحافظ مكثف 47µF على إضاءة المصباح الداخلي لعدة ثوانٍ بعد إغلاق الباب ثم يطفئه تدريجياً.',
      },
    ],
    formula: 'τ = R × C',
    formulaVars: [
      { symbol: 'τ', meaning: { fr: 'Constante de temps (≈ 63 % de charge)', ar: 'الثابت الزمني للشحن' }, unit: 's' },
      { symbol: 'R', meaning: { fr: 'Résistance de charge / base', ar: 'مقاومة الشحن' }, unit: 'kΩ' },
      { symbol: 'C', meaning: { fr: 'Capacité du condensateur', ar: 'سعة المكثف' }, unit: 'µF' },
    ],
    examples: [
      {
        id: 'cap-base',
        pageRef: 'p. 5–6 (Schéma H)',
        title: { fr: 'Condensateur sur la base', ar: 'مكثف على القاعدة (الشكل H)' },
        summary: {
          fr: 'Appuyez sur « Toucher » : la LED s’allume puis s’éteint dès que C est chargé. Cliquez sur « Décharger » pour réarmer.',
          ar: 'المس السلكين: يضيء الـ LED ثم ينطفئ عند تمام شحن المكثف. اضغط «تفريغ» لإعادة المحاولة.',
        },
        components: ['2×BC547', 'Condensateur 10–470µF', '100k', '220R', 'LED', '6V'],
      },
      {
        id: 'courtesy-light',
        pageRef: 'p. 64',
        title: { fr: 'Extenseur d’éclairage voiture MkII', ar: 'مؤخّر إطفاء ضوء السيارة (ص ٦٤)' },
        summary: {
          fr: 'À la fermeture de la porte, le BC557 + BD679 maintiennent la lampe allumée le temps que le 47 µF se charge via 100 kΩ.',
          ar: 'عند غلق الباب، يبقى المصباح مضيئاً ريثما يشحن مكثف 47µF عبر مقاومة 100k.',
        },
        components: ['BC557', 'BD679', '47µF', '2×100k', '10k', 'Lampe 12V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans le Schéma H (p. 6), on remplace le condensateur de 10 µF par un 220 µF déchargé et on touche les fils. Que se passe-t-il ?',
        ar: 'في الشكل H (ص ٦)، استبدلنا مكثف 10µF بآخر سعته 220µF فارغ ولمسنا السلكين. ماذا يحدث؟',
      },
      options: [
        { fr: 'La LED reste allumée beaucoup plus longtemps avant de s’éteindre', ar: 'يبقى الـ LED مضيئاً مدة أطول بكثير قبل أن ينطفئ' },
        { fr: 'La LED ne s’allume plus du tout', ar: 'لا يضيء الـ LED إطلاقاً' },
        { fr: 'La LED reste allumée pour toujours', ar: 'يبقى مضيئاً إلى الأبد' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'Un condensateur 22 fois plus grand stocke 22 fois plus de charge pour une même tension : le courant de charge circule donc beaucoup plus longtemps dans la base avant de s’annuler.',
        ar: 'المكثف الأكبر يستوعب شحنة أكبر قبل أن يمتلئ، فيستمر تيار القاعدة مدة أطول (τ = R × C) قبل أن يتوقف عند اكتمال الشحن.',
      },
    },
    teacherNote: {
      fr: 'Attention (p. 6) : si on oublie de décharger le condensateur (bouton ou diode de décharge 1N4148 comme p. 41 & 64), la seconde touche ne produit plus aucun flash !',
      ar: 'ملاحظة (ص ٦ و٦٤): إذا لم يُفرَّغ المكثف (عبر زر أو ثنائي 1N4148 كما في ص٤١ و٦٤)، فلن تضيء الدارة عند المحاولة الثانية.',
    },
  },
  {
    id: 4,
    slug: 'darlington-8million',
    pageRef: 'pp. 24, 28, 29',
    title: {
      fr: '4. Cascade Darlington & Gain de 8 Millions',
      ar: '٤. الترانزستورات المتتالية وتضخيم ٨ ملايين مرة',
    },
    subtitle: {
      fr: 'Les gains en courant se multiplient d’un étage à l’autre',
      ar: 'التضخيم يتضاعف بالضرب لا بالجمع عبر المراحل',
    },
    analogyTitle: {
      fr: 'De « Second Simplest Circuit » à « 8 Million Gain » (p. 28–29)',
      ar: 'من «ثاني أبسط دارة» إلى «تضخيم ٨ ملايين» (ص ٢٨–٢٩)',
    },
    analogyText: {
      fr: 'Au lieu d’un seul transistor (β = 200), l’émetteur de Q1 alimente directement la base de Q2, puis Q2 alimente Q3. Chaque étage multiplie le courant par 200 : 200 × 200 = 40 000, puis 200³ = 8 000 000 !',
      ar: 'بدل ترانزستور واحد، يغذّي باعث Q1 قاعدة Q2، ثم يغذّي Q2 قاعدة Q3. كل مرحلة تضرب التيار في ٢٠٠: من ٤٠ ألفاً بترانزستورين إلى ٨ ملايين بثلاثة!',
    },
    theory: [
      {
        fr: 'À 2 transistors (paire Super-Alpha / Darlington, p. 28), un effleurement imperceptible suffit à saturer la LED.',
        ar: 'بترانزستورين (الزوج الفائق Darlington، ص ٢٨)، يكفي أخفّ لمسة لإشباع الـ LED بالكامل.',
      },
      {
        fr: 'À 3 transistors (p. 28–29), l’impédance d’entrée devient si colossale qu’une simple antenne ou piste de cuivre détecte l’électricité statique de votre main à distance et le ronflement 50 Hz des câbles secteur à 2 cm à travers le mur !',
        ar: 'بثلاثة ترانزستورات (ص ٢٨–٢٩)، تصبح الحساسية هائلة لدرجة أن صفيحة نحاسية صغيرة تلتقط كهرباء اليد الساكنة عن بُعد أو طنين أسلاك الكهرباء 50Hz داخل الجدار من مسافة 2cm دون تلامس!',
      },
    ],
    formula: 'β_total = β₁ × β₂ × β₃',
    formulaVars: [
      { symbol: 'n = 1', meaning: { fr: '1 transistor (Simple)', ar: 'ترانزستور واحد' }, unit: 'β = 200' },
      { symbol: 'n = 2', meaning: { fr: 'Paire Darlington', ar: 'زوج دارلنغتون' }, unit: 'β = 40 000' },
      { symbol: 'n = 3', meaning: { fr: '8 Million Gain (p. 28)', ar: 'كسب ٨ ملايين (ص ٢٨)' }, unit: 'β = 8 000 000' },
    ],
    examples: [
      {
        id: 'darlington-stages',
        pageRef: 'p. 28',
        title: { fr: 'Cascade à 1, 2 ou 3 étages', ar: 'تضخيم متدرج بـ ١ أو ٢ أو ٣ ترانزستورات' },
        summary: {
          fr: 'Ajoutez Q2 et Q3 sur la platine et observez chaque courant d’étage ainsi que le seuil d’entrée n × 0,6 V.',
          ar: 'أضف Q2 و Q3 على اللوحة وراقب تيار كل مرحلة وعتبة الجهد n × 0.6V.',
        },
        components: ['1 à 3×BC547', '1M', '100k', '220R', 'LED', '6V'],
      },
      {
        id: 'mains-hum',
        pageRef: 'p. 28–29',
        title: { fr: 'Détecteur de champ statique & 50Hz', ar: 'كاشف الكهرباء الساكنة وطنين 50Hz' },
        summary: {
          fr: 'Approchez votre main ou un câble secteur sous tension (sans dénuder !) : dès 2–5 cm, les 3 étages captent le champ et allument la LED + buzzer piézo.',
          ar: 'قرّب يدك أو كابلاً كهربائياً مغلّفاً (دون لمس النحاس!): على بعد 2cm تلتقط المراحل الثلاث المجال وتُضيء الـ LED مع صافرة البيزو.',
        },
        components: ['3×BC547', '1M', '100k', '220R', 'Piezo + LED', 'Antenne PCB'],
      },
    ],
    prediction: {
      question: {
        fr: 'En mettant deux transistors de gain β = 200 en Darlington, le gain total vaut-il 400 (addition) ou 40 000 (multiplication) ?',
        ar: 'عند ربط ترانزستورين بتضخيم β = 200 في دارة دارلنغتون، هل يصبح التضخيم الكلي 400 أم 40 000؟',
      },
      options: [
        { fr: '400 (200 + 200)', ar: '400 (نجمع التضخيمين)' },
        { fr: '40 000 (200 × 200)', ar: '40 000 (نضرب التضخيمين)' },
        { fr: '200 (le second n’amplifie pas)', ar: '200 (الثاني لا يضخّم)' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'Tout le courant de sortie du premier transistor (200 × I_B) devient le courant d’entrée du second, qui le multiplie encore par 200 → 200 × 200 = 40 000 !',
        ar: 'تيار الخرج من الترانزستور الأول (200 × I_B) يدخل بأكمله إلى قاعدة الثاني فيضخّمه مجدداً 200 مرة: 200 × 200 = 40 000.',
      },
    },
    teacherNote: {
      fr: 'Précision importante : chaque jonction Base-Émetteur en série demande ~0,6 V. Il faut donc au moins 1,2 V pour 2 étages et 1,8 V pour 3 étages (I_B = (V_CC − n·0,6) / R_f).',
      ar: 'تنبيه: كل وصلة قاعدة-باعث على التوالي تستهلك ~0.6V، لذا يلزم 1.2V لترانزستورين و1.8V لثلاثة ترانزستورات.',
    },
  },
  {
    id: 5,
    slug: 'switches-sensors',
    pageRef: 'pp. 50–54, 71, 99, 120',
    title: {
      fr: '5. Interrupteurs, Verrouillage & Capteurs Réels',
      ar: '٥. المفاتيح الذكية، التثبيت بالذاكرة والحساسات',
    },
    subtitle: {
      fr: 'Applications concrètes du livre : tactile ON/OFF, LDR, Schmitt et Clap',
      ar: 'تطبيقات حقيقية من الكتاب: مفتاح اللمس 4M7، كاشف الظلام، شميت وتصفيق اليد',
    },
    analogyTitle: {
      fr: 'De la commande continue à la décision logique tout-ou-rien',
      ar: 'من التضخيم التناسبي إلى القرار المنطقي (تشغيل / إطفاء)',
    },
    analogyText: {
      fr: 'En ajoutant une boucle de rétroaction (comme la résistance 4M7 p. 50) ou un Trigger de Schmitt (p. 120), le transistor acquiert une mémoire : il bascule franchement et reste verrouillé même après la disparition du signal.',
      ar: 'بإضافة تغذية راجعة موجبة (مثل مقاومة 4M7 في ص ٥٠) أو قادح شميت (ص ١٢٠)، يكتسب الترانزستور ذاكرة: ينقلب بسرعة ويبقى ثابتاً حتى بعد زوال اللمسة.',
    },
    theory: [
      {
        fr: 'Interrupteur tactile à verrouillage (p. 50) : toucher ON active la paire BC547 qui pilote le BC557 ; la sortie renvoie du courant vers la base via 4M7 pour auto-maintenir le circuit ! Toucher OFF court-circuite la base à la masse via un BC547 et coupe tout.',
        ar: 'مفتاح اللمس الحقيقي (ص ٥٠): لمس لوح ON يشغّل الزوج الفائق ثم BC557، وتُرجع مقاومة 4M7 تياراً يثبت الدارة مضاءة. ولمس لوح OFF يفرّغ القاعدة فيطفئها.',
      },
      {
        fr: 'Veilleuse LDR & Trigger de Schmitt (p. 71 & 120) : une LDR ORP12 voit sa résistance chuter à la lumière et monter dans le noir, commandant un relais ou une bande LED. Le Schmitt Trigger évite les battements au crépuscule.',
        ar: 'كاشف الظلام وقادح شميت (ص ٧١ و١٢٠): تنخفض مقاومة LDR في الضوء وترتفع في الظلام، ويمنع قادح شميت ارتعاش المصباح عند الغسق.',
      },
    ],
    formula: 'I_B = (V_in − V_BE) / R_B',
    formulaVars: [
      { symbol: '4M7', meaning: { fr: 'Boucle de maintien (Touch Switch p. 50)', ar: 'مقاومة التثبيت الراجعة (ص ٥٠)' }, unit: 'MΩ' },
      { symbol: 'ORP12', meaning: { fr: 'Photorésistance LDR (p. 71)', ar: 'مقاومة ضوئية LDR (ص ٧١)' }, unit: 'kΩ' },
    ],
    examples: [
      {
        id: 'touch-latch',
        pageRef: 'p. 50–51',
        title: { fr: 'Touch Switch ON/OFF (verrouillage 4M7)', ar: 'مفتاح اللمس ON/OFF بالتثبيت (ص ٥٠)' },
        summary: {
          fr: 'Testez les vraies pastilles ON et OFF de la page 50 : une simple impulsion sur ON verrouille la lampe grâce à la 4M7, OFF la coupe.',
          ar: 'اضغط على لوح ON: تبقى الـ LED مضاءة حتى بعد رفع الإصبع بفضل التغذية الراجعة 4M7، ولوح OFF يطفئها.',
        },
        components: ['3×BC547', 'BC557', '4M7', '470k', '4k7', '10k', '6V'],
      },
      {
        id: 'dark-schmitt',
        pageRef: 'p. 71 & p. 120',
        title: { fr: 'Veilleuse LDR & Trigger de Schmitt', ar: 'مصباح الليل LDR وقادح شميت (ص ١٢٠)' },
        summary: {
          fr: 'Faites varier l’éclairage ambiant (Lux) : sous le seuil bas la LED/bande s’allume franchement ; il faut remonter plus haut pour l’éteindre (hystérésis).',
          ar: 'حرّك منزلق الإضاءة: عند حلول الظلام يشتعل المصباح فوراً، وبفضل الهسترة لا ينطفئ إلا عند إضاءة أقوى.',
        },
        components: ['LDR ORP12', '3×BC547', '22k', '4k7', '330R', '6V'],
      },
      {
        id: 'clap-sound',
        pageRef: 'p. 54 & p. 99',
        title: { fr: 'Détecteur sonore / Clap Switch', ar: 'مفتاح التصفيق والصوت (ص ٥٤ و٩٩)' },
        summary: {
          fr: 'Un micro électret amplifié pompe des charges via 1N4148 dans un 10 µF (ou 100 µF) : clappez des mains pour allumer la LED temporairement !',
          ar: 'الميكروفون يضخ شحنة عبر الدايود 1N4148 إلى المكثف: صفّق بيديك ليضيء الـ LED مدة مؤقتة ثم ينطفئ!',
        },
        components: ['Micro Électret', '2×BC547', '1N4148', '10u', '100n', '6V'],
      },
      {
        id: 'motor-relay',
        pageRef: 'p. 43 & p. 62',
        title: { fr: 'Pilotage Moteur & Relais avec D1', ar: 'تشغيل محرك أو مرحّل مع دايود الحماية' },
        summary: {
          fr: 'Un BC338 (800 mA) pilote un moteur ou un relais 12 V. Notez la diode 1N4148 en parallèle sur la bobine pour absorber les pics de surtension à la coupure.',
          ar: 'يتحكم الترانزستور بمحرك أو مرحّل، ويحمي الدايود 1N4148 الترانزستور من شرارة الارتداد المغناطيسي عند الفصل.',
        },
        components: ['BC338', 'Relais / Moteur', '1N4148', '10k', '12V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans le Touch Switch de la page 50, on touche brièvement les pastilles ON puis on retire le doigt. Pourquoi la lampe reste-t-elle allumée ?',
        ar: 'في مفتاح اللمس (ص ٥٠)، نلمس لوح ON لحظة ثم نرفع الإصبع. لماذا يظل المصباح مضيئاً؟',
      },
      options: [
        { fr: 'Le doigt laisse une charge statique sur la carte', ar: 'يترك الإصبع شحنة ساكنة على اللوحة' },
        { fr: 'La résistance 4M7 renvoie le courant de sortie vers l’entrée', ar: 'المقاومة 4M7 تُعيد جزءاً من تيار الخرج إلى قاعدة الدخل' },
        { fr: 'Le BC557 reste bloqué mécaniquement', ar: 'يبقى BC557 مقفولاً ميكانيكياً' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'La résistance de 4,7 MΩ connecte le collecteur de sortie (BC557) à la base d’entrée : une fois allumé, le circuit s’auto-alimente (« take the place of your finger », p. 50).',
        ar: 'تصل مقاومة 4M7 خرج BC557 بمدخل الزوج الفائق فتقوم مقام إصبعك وتحافظ على الترانزستورات في حالة توصيل مستمر حتى تلمس لوح OFF.',
      },
    },
    teacherNote: {
      fr: 'Détail du livre (p. 50) : toucher OFF active un BC547 qui tire la base de la paire Darlington vers 0 V (« robs the super transistor of voltage ») et casse la boucle de maintien.',
      ar: 'تفصيل من الكتاب (ص ٥٠): لمس لوح OFF يشغّل ترانزستور BC547 إضافياً يسحب جهد القاعدة نحو الصفر فينكسر التثبيت وتنطفئ الدارة.',
    },
  },
  {
    id: 6,
    slug: 'oscillators-multivibrators',
    pageRef: 'pp. 32–33, 48, 58, 74–75, 91',
    title: {
      fr: '6. Oscillateurs, Clignotants & Sirènes',
      ar: '٦. المذبذبات، الوماضات وصفّارات الإنذار',
    },
    subtitle: {
      fr: 'Comment deux transistors battent la mesure sans aucun circuit intégré',
      ar: 'كيف تتبادل الترانزستورات التوصيل لتوليد النبضات والأصوات',
    },
    analogyTitle: {
      fr: 'La balançoire électronique (Multivibrateur astable)',
      ar: 'الأرجوحة الإلكترونية (المذبذب غير المستقر)',
    },
    analogyText: {
      fr: 'Deux transistors reliés en boucle par deux condensateurs ne peuvent jamais rester allumés en même temps : quand Q1 conduit, le condensateur coupe Q2 pendant qu’il se charge, puis Q2 bascule et coupe Q1. L’oscillation continue à l’infini !',
      ar: 'ترانزستوران مترابطان بمكثفين يتبادلان الأدوار تلقائياً: عندما يعمل Q1 يُشحن المكثف ويُطفئ Q2، وحين يمتلئ ينعكس المشهد باستمرار بلا توقف.',
    },
    theory: [
      {
        fr: 'Dans « Robot Man » (p. 58 & 91), deux BC547 + deux condensateurs de 100 µF + deux 10 kΩ font clignoter les deux yeux rouges en alternance à ~1,4 Hz.',
        ar: 'في «الرجل الآلي» (ص ٥٨ و٩١)، يتبادل ترانزستورا BC547 ومكثفا 100µF إضاءة عينيه الحمراوين بالتناوب.',
      },
      {
        fr: 'Dans le « Chenillard 3 LEDs — Running Hole » (p. 74–75), 3 étages bouclés en anneau font courir un « trou » lumineux. Avec un NPN + PNP couplés en audio (« Ticking Bomb / Siren », p. 48), on obtient des clics ou une sirène !',
        ar: 'في «ملاحق المصابيح الثلاثي» (ص ٧٤–٧٥)، تدور الإضاءة في حلقة مغلقة، وبدمج NPN و PNP (ص ٤٨) نولّد صوت قنبلة موقوتة أو صفارة إنذار!',
      },
    ],
    formula: 'f ≈ 1 / (1,38 × R × C)',
    formulaVars: [
      { symbol: 'f', meaning: { fr: 'Fréquence d’oscillation', ar: 'تردد التذبذب' }, unit: 'Hz' },
      { symbol: 'R', meaning: { fr: 'Résistance de base (ex. 10k–220k)', ar: 'مقاومة القاعدة' }, unit: 'kΩ' },
      { symbol: 'C', meaning: { fr: 'Condensateur de couplage', ar: 'مكثف الربط' }, unit: 'µF' },
    ],
    examples: [
      {
        id: 'flipflop-2led',
        pageRef: 'p. 58 & p. 91',
        title: { fr: 'Clignotant 2 LEDs (Robot Man)', ar: 'ومّاض مصباحين بالتناوب (ص ٥٨ و٩١)' },
        summary: {
          fr: 'Multivibrateur astable à 2×BC547 : ajustez la résistance R de 4k7 à 47k et observez le basculement alterné de LED1 et LED2 + signaux sur l’oscilloscope.',
          ar: 'مذبذب متناوب بترانزستورين: غيّر قيمة المقاومة وراقب تبادل LED1 و LED2 على اللوحة وعلى راسم الإشارة.',
        },
        components: ['2×BC547', '2×100u', '2×10k', '2×330R', '2×LED', '6V'],
      },
      {
        id: 'chaser-3led',
        pageRef: 'p. 74–75',
        title: { fr: 'Chenillard 3 LEDs « Running Hole »', ar: 'ملاحق ٣ مصابيح «الثقب الجاري» (ص ٧٤)' },
        summary: {
          fr: 'Boucle impaire de 3 transistors BC547 : à chaque instant, l’onde de charge fait tourner l’état éteint/allumé en cercle.',
          ar: 'ثلاث مراحل مترابطة في حلقة فردية تجعل حالة الإضاءة تدور باستمرار من LED1 إلى LED2 ثم LED3.',
        },
        components: ['3×BC547', '3×22u', '3×39k', '3×1k', '3×LED', '6V'],
      },
      {
        id: 'siren-tick',
        pageRef: 'p. 48',
        title: { fr: 'Tic-Tac & Sirène NPN + PNP', ar: 'صوت الساعة والصفارة NPN+PNP (ص ٤٨)' },
        summary: {
          fr: 'Montage BC547 + BC557 avec condensateur 2u2 et haut-parleur 8 Ω. Activez le son pour entendre le rythme du potentiomètre ou la sirène !',
          ar: 'دارة BC547 مع BC557 ومكبر صوت 8Ω: فعّل الصوت لتسمع نبضات الساعة أو تدرّج نغمة الصفارة.',
        },
        components: ['BC547', 'BC557', '2u2 / 100n', '200k pot', 'HP 8Ω', '9V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans le clignotant à 2 transistors (p. 91), si on double la valeur des deux condensateurs (100 µF → 220 µF), comment évolue le clignotement ?',
        ar: 'في ومّاض الترانزستورين (ص ٩١)، إذا ضاعفنا سعة المكثفين (من 100µF إلى 220µF)، كيف يتغيّر الوميض؟',
      },
      options: [
        { fr: 'Il devient environ deux fois plus lent', ar: 'يصبح أبطأ بنحو الضعف' },
        { fr: 'Il devient deux fois plus rapide', ar: 'يصبح أسرع بنحو الضعف' },
        { fr: 'Les deux LEDs restent allumées en continu', ar: 'يظل المصباحان مضيئين معاً بلا انقطاع' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'La période de basculement est proportionnelle à R × C. Un condensateur deux fois plus grand met deux fois plus de temps à se charger/décharger, donc la fréquence est divisée par 2.',
        ar: 'زمن الدورة يتناسب طردياً مع R × C؛ فمضاعفة السعة تضاعف زمن الشحن والتفريغ فتقلّ سرعة الوميض للنصف.',
      },
    },
    teacherNote: {
      fr: 'Note de Faraday (p. 75) : le chenillard « Running Hole » exige un nombre impair de transistors (3, 5, 7...) ; un nombre pair bloquerait la boucle en deux moitiés statiques !',
      ar: 'ملاحظة مهمة (ص ٧٥): دارة «الثقب الجاري» تتطلب عدداً فردياً من المراحل (٣ أو ٥)، لأن العدد الزوجي يتوقف في حالة مستقرة!',
    },
  },
  {
    id: 7,
    slug: 'boost-1v5',
    pageRef: 'pp. 34–38, 103, 105',
    title: {
      fr: '7. Allumer une LED 3,4 V avec une pile de 1,5 V',
      ar: '٧. تشغيل LED من بطارية 1.5V واحدة (مضخة الشحنة والرفع)',
    },
    subtitle: {
      fr: 'Pompe de charge capacitive et surtension d’inductance (Joule Thief)',
      ar: 'كيف نرفع 1.5V إلى أكثر من 3.4V لإضاءة الـ LED الأبيض؟',
    },
    analogyTitle: {
      fr: 'L’élévateur de tension : condensateur ou bobine',
      ar: 'مضاعِف الجهد بالمكثف أو بالملف المغناطيسي',
    },
    analogyText: {
      fr: 'Une LED rouge demande ≥ 1,7 V et une blanche ≥ 3,2 V : une seule pile de 1,5 V ne suffit jamais en direct ! Le livre montre deux astuces géniales : empiler un condensateur chargé en série (p. 34), ou couper brutalement le courant d’une bobine pour déclencher un pic inductif (p. 36 & 103).',
      ar: 'يحتاج الـ LED الأحمر إلى 1.7V والأبيض إلى 3.4V، لذا لا يكفي 1.5V مباشرة. يعرض الكتاب حيلتين: تكديس مكثف مشحون على التوالي (ص ٣٤)، أو قطع تيار ملفّ فجأة لتوليد نبضة جهد عالية (ص ٣٦ و١٠٣).',
    },
    theory: [
      {
        fr: 'Pompe de charge « LED on 1.5V Supply » (p. 34) : Phase A, le condensateur 1 µF se charge à ~1,3 V ; Phase B, le transistor tire son pôle positif à 0 V, ce qui place son pôle négatif à −1 V. La LED voit alors 1,5 V − (−1 V) = 2,5 V !',
        ar: 'مضخة الشحنة (ص ٣٤): في الطور A يُشحن المكثف إلى ~1.3V؛ وفي الطور B يسحب الترانزستور طرفه الموجب للصفر فيصبح السالب عند −1V، فيرى الـ LED مجموع 2.5V!',
      },
      {
        fr: 'Torche 1,5 V / Bike Flasher sans ferrite (p. 36–38 & 103) : tant que le transistor conduit, la bobine stocke de l’énergie magnétique. Dès qu’il se bloque, le flux s’effondre et la tension grimpe (V = L·dI/dt) jusqu’à ce que la LED blanche conduise.',
        ar: 'كشّاف 1.5V وومّاض الدراجة (ص ٣٦ و١٠٣): يخزّن الملف طاقة مغناطيسية أثناء التوصيل، وعند انقطاع الترانزستور ينهار المجال فينشأ جهد مرتفع (> 4V) يضيء الـ LED الأبيض بلمعان قوي.',
      },
    ],
    formula: 'V_LED = V_batt + |V_boost|',
    formulaVars: [
      { symbol: 'V_batt', meaning: { fr: 'Pile 1,5 V (même usée !)', ar: 'بطارية 1.5V (حتى الضعيفة)' }, unit: 'V' },
      { symbol: 'V_cap / L·dI/dt', meaning: { fr: 'Surtension ajoutée par C ou L', ar: 'الجهد المضاف من المكثف أو الملف' }, unit: '+1 à +5 V' },
    ],
    examples: [
      {
        id: 'charge-pump',
        pageRef: 'p. 34–35',
        title: { fr: 'Pompe de charge 1,5 V → 2,5 V (Schémas A & B)', ar: 'مضخة الشحنة 1.5V ← 2.5V (ص ٣٤)' },
        summary: {
          fr: 'Basculez entre Phase A (Charge du 1 µF) et Phase B (Addition des tensions dans la LED), ou laissez tourner en mode auto !',
          ar: 'بدّل يدوياً أو تلقائياً بين الطور A (شحن المكثف) والطور B (جمع 1.5V + 1.0V لإضاءة الـ LED).',
        },
        components: ['3×BC547', '1u', '2×10n', '100R', 'LED Rouge', '1.5V'],
      },
      {
        id: 'joule-thief',
        pageRef: 'p. 36–38 & p. 103',
        title: { fr: 'Torche LED Blanche 1,5 V / Bobine à air', ar: 'مصباح LED أبيض من 1.5V (ص ٣٦ و١٠٣)' },
        summary: {
          fr: 'Ajustez la tension de pile (de 0,9 V à 1,5 V) et voyez comment la bobine (30+30 spires) génère des impulsions de > 3,4 V qui maintiennent la LED blanche brillante.',
          ar: 'حرّك جهد البطارية (حتى 0.9V!) وشاهد نبضات الانهيار المغناطيسي في الملف ترفع الجهد فوق 3.4V لتشغيل الـ LED الأبيض.',
        },
        components: ['BC337 / BC547', 'Bobine 60t+40t', '2k7', '10n', 'LED Blanche', '1.5V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans le Bike Flasher / Joule Thief (p. 38 & 103), si on retire la LED blanche pendant que le circuit oscille, que risque le transistor ?',
        ar: 'في دارة رفع الجهد بالملف (ص ١٠٣)، ماذا يحدث للترانزستور إذا فصلنا الـ LED أثناء العمل؟',
      },
      options: [
        { fr: 'La tension de pic n’est plus absorbée et peut dépasser 25–45 V et détruire le transistor', ar: 'يرتفع جهد النبضة بلا حمل يمتصّه وقد يتلف الترانزستور' },
        { fr: 'La pile se recharge instantanément', ar: 'تشحن البطارية نفسها فوراً' },
        { fr: 'Rien, la bobine reste à 1,5 V', ar: 'لا شيء، يبقى الجهد 1.5V' },
      ],
      correctIndex: 0,
      explanation: {
        fr: 'Le livre avertit expressément p. 40 et p. 103 : sans la LED pour absorber et limiter les pointes de tension à ~3,4 V, la bobine génère 25 V à 100 V en circuit ouvert !',
        ar: 'يحذّر الكتاب صراحةً (ص ٤٠ و١٠٣): بدون الـ LED الذي يثبّت الجهد عند ~3.4V ويمتص الطاقة، يقفز جهد الملف إلى عشرات الفولتات ويدمّر الترانزستور.',
      },
    },
    teacherNote: {
      fr: 'Observation du livre (p. 37 & 103) : nos yeux perçoivent la luminosité de crête des impulsions rapides, ce qui rend une LED pulsée plus lumineuse à courant moyen égal !',
      ar: 'ملاحظة فيزيائية من الكتاب (ص ٣٧ و١٠٣): تلتقط العين السطوع الذروي للنبضات السريعة، فتبدو الإضاءة أقوى بنفس متوسط التيار.',
    },
  },
  {
    id: 8,
    slug: 'solar-and-regulation',
    pageRef: 'pp. 15–18, 45–47',
    title: {
      fr: '8. Régulateur Solaire & Courant Constant',
      ar: '٨. الشاحن الشمسي ومنظم التيار الثابت',
    },
    subtitle: {
      fr: 'Hystérésis de charge 12,5 V–13,7 V et régulation active sans gaspiller',
      ar: 'التحكم الذكي في الشحن (هسترة 12.5V–13.7V) وتثبيت التيار',
    },
    analogyTitle: {
      fr: 'La zone mémoire (hystérésis) et la soupape de limitation',
      ar: 'نطاق الذاكرة (الهسترة) وصمّام تحديد التيار',
    },
    analogyText: {
      fr: 'Sans hystérésis, un relais solaire vibrerait sans cesse autour de 13,7 V ! Le livre règle la coupure à 13,7 V et n’autorise la reprise que lorsque la batterie redescend à 12,5 V, tout en dérivant les 3,25 W du panneau vers une charge factice 100 Ω.',
      ar: 'بدون نطاق ذاكرة سيتذبذب المرحّل باستمرار عند 13.7V! يضبط الكتاب الفصل عند 13.7V ولا يعيد الشحن إلا عند 12.5V، ويحوّل الطاقة لحِمل وهمي 100Ω.',
    },
    theory: [
      {
        fr: 'Chargeur solaire 12 V (p. 18) : un panneau 18 V (28 cellules × 0,6 V) est nécessaire pour dépasser les ~15 V d’une batterie 12 V chargée et la chute de diode. À 13,7 V, le BC547 coupe le relais K1 vers la charge factice 100 Ω / 5 W (P = 18²/100 ≈ 3,24 W).',
        ar: 'الشاحن الشمسي (ص ١٨): يلزم لوح 18V (٢٨ خلية) لتجاوز جهد البطارية المشحونة (~15V). عند 13.7V يفصل المرحّل الشحن ويحوّله للحِمل الوهمي (3.24W) حتى يهبط الجهد إلى 12.5V.',
      },
      {
        fr: 'Source de courant constant (p. 45–46) : quand le courant dans R_sense atteint I × R = 0,6 V, un BC547 « vole » le courant de base du transistor de puissance. Résultat : 25 mA constants que l’alimentation fasse 6 V ou 15 V !',
        ar: 'مصدر التيار الثابت (ص ٤٥–٤٦): عندما يبلغ هبوط الجهد على مقاومة الاستشعار R2 قيمة 0.6V، يفتح BC547 ويسحب جزءاً من تيار قاعدة الترانزستور الرئيسي فيثبت تيار الـ LED مهما تغيّر جهد المصدر (6V–15V).',
      },
    ],
    formula: 'P = V² / R   |   I_const ≈ 0,6 V / R_sense',
    formulaVars: [
      { symbol: '13,7 V / 12,5 V', meaning: { fr: 'Seuils haut et bas (Hystérésis)', ar: 'عتبتا الفصل وإعادة الشحن' }, unit: 'V' },
      { symbol: 'P_dummy', meaning: { fr: 'Puissance dissipée (18² / 100)', ar: 'القدرة في الحِمل الوهمي' }, unit: '3,24 W' },
      { symbol: 'I_const', meaning: { fr: 'Courant régulé (ex. R = 22 Ω → 27 mA)', ar: 'التيار الثابت المضبوط بـ R2' }, unit: 'mA' },
    ],
    examples: [
      {
        id: 'solar-charger',
        pageRef: 'p. 18',
        title: { fr: 'Régulateur Solaire à Relais 12V', ar: 'منظّم الشاحن الشمسي 12V (ص ١٨)' },
        summary: {
          fr: 'Montez V_batt jusqu’à 13,7 V (le relais bascule vers 100 Ω qui chauffe à 3,24 W), puis redescendez : la charge ne reprend qu’à ≤ 12,5 V.',
          ar: 'ارفع جهد البطارية إلى 13.7V فينفصل الشحن ويسخن الحِمل الوهمي، ثم انزل بالمنزلق: لن يعود الشحن عند 13V بل عند 12.5V!',
        },
        components: ['Panneau 18V (28 cel.)', 'BC547', 'Pot 1k', 'Relais 12V', '100R 5W', 'Batterie 12V'],
      },
      {
        id: 'constant-current',
        pageRef: 'p. 45–46',
        title: { fr: 'Source de Courant Constant (6V–15V)', ar: 'مصدر التيار الثابت (ص ٤٥–٤٦)' },
        summary: {
          fr: 'Variez la tension de 6 V à 15 V et choisissez R_sense (120R, 47R, 22R) : le BC547 régule automatiquement I_LED sans recalculer la résistance !',
          ar: 'غيّر جهد المصدر من 6V إلى 15V واختر R_sense: يحافظ BC547 على تيار ثابت تماماً للـ LED دون زيادة خطرة.',
        },
        components: ['BC547', 'BD679 / BC338', 'R_sense (22R–120R)', '10k', 'LEDs', '6–15V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Dans le régulateur solaire (p. 18), la batterie vient d’atteindre 13,7 V et le relais coupe la charge. Si la tension redescend ensuite à 13,0 V, le chargeur reprend-il ?',
        ar: 'في الشاحن الشمسي (ص ١٨)، وصل جهد البطارية إلى 13.7V فتوقف الشحن. إذا نزل الجهد إلى 13.0V، هل يعود الشحن؟',
      },
      options: [
        { fr: 'Oui, immédiatement sous 13,7 V', ar: 'نعم، يعود فوراً تحت 13.7V' },
        { fr: 'Non, il reste coupé jusqu’à environ 12,5 V', ar: 'لا، يبقى متوقفاً حتى يهبط الجهد إلى ~12.5V' },
        { fr: 'Il grille la batterie', ar: 'يحرق البطارية' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'C’est tout le rôle de l’hystérésis du relais : à 13,0 V la charge reste coupée pour laisser la batterie se reposer ; elle ne réenclenche qu’à ~12,5 V (p. 18).',
        ar: 'لا يعود الشحن عند 13.0V بل يبقى في نطاق الذاكرة متوقفاً، ولا يعود للعمل إلا عند ~12.5V لحماية المرحّل والبطارية.',
      },
    },
    teacherNote: {
      fr: 'Écarts relevés dans le livre (p. 18) : le texte écrit « 3,25 W » (arrondi de 18²/100 = 3,24 W) et le schéma dessine 24 cellules alors que le texte corrige lui-même qu’il en faut 28 pour atteindre ~17–18 V.',
      ar: 'تدقيق من الكتاب (ص ١٨): يكتب الكتاب 3.25W تقريبًا لـ 18²/100 = 3.24W، ويرسم ٢٤ خلية بينما ينبه في النص على وجوب ٢٨ خلية.',
    },
  },
  {
    id: 9,
    slug: 'self-bias-challenge',
    pageRef: 'pp. 3 (D, E) & 6',
    title: {
      fr: '9. Défi d’ingénierie : Polarisation à mi-tension',
      ar: '٩. تحدّي الهندسة: التحيّز الذاتي عند نصف الجهد',
    },
    subtitle: {
      fr: 'Régler V_C = V_CC / 2 pour obtenir une amplification sans écrêtage',
      ar: 'ضبط جهد المجمّع على 2.5V لتكبير الموجة دون تشويه (Clipping)',
    },
    analogyTitle: {
      fr: 'Le point de repos (Q-Point) : centrer l’oscillation au milieu',
      ar: 'نقطة التشغيل الوسطى: لماذا نختار نصف جهد المصدر؟',
    },
    analogyText: {
      fr: 'Pour qu’un signal audio puisse monter ET descendre librement entre 0 V et 5 V, il faut placer le collecteur au centre exact (2,5 V) au repos. Trop haut ou trop bas, la crête ou le creux de la sinusoïde s’écrase !',
      ar: 'لكي تتأرجح الإشارة الصوتية صعوداً وهبوطاً بحرية بين 0V و 5V، يجب تثبيت جهد المجمّع في المنتصف تماماً (2.5V). إذا اقترب من 0V أو 5V يتقصّف أحد طرفي الموجة!',
    },
    theory: [
      {
        fr: 'Dans l’étage émetteur commun auto-polarisé (p. 3, Schéma E), R_L = 22 kΩ et V_CC = 5 V. Le livre explique comment choisir R_B (environ 2,2 MΩ) jusqu’à mesurer V_C = 2,5 V au collecteur.',
        ar: 'في مرحلة الباعث المشترك ذاتية التحيّز (ص ٣، الشكل E)، لدينا V_CC = 5V و R_L = 22kΩ. نضبط مقاومة القاعدة R_B (قرابة 2.2MΩ) حتى يقرأ المجمّع 2.5V.',
      },
      {
        fr: 'L’auto-polarisation stabilise le point de fonctionnement : si le transistor tend à conduire davantage, V_C baisse, ce qui réduit I_B (car R_B est reliée au collecteur dans certains montages) ou stabilise le courant de repos.',
        ar: 'بعد ضبط R_B نحو 2.2MΩ، جرّب حقن إشارة جيبية AC على المدخل وراقب راسم الإشارة لتكتشف عملياً سبب اشتراط نصف الجهد!',
      },
    ],
    formula: 'V_C = V_CC − I_C × R_L',
    formulaVars: [
      { symbol: 'V_CC', meaning: { fr: 'Tension d’alimentation', ar: 'جهد التغذية' }, unit: '5,0 V' },
      { symbol: 'R_L', meaning: { fr: 'Résistance de charge (collecteur)', ar: 'مقاومة حِمل المجمّع' }, unit: '22 kΩ' },
      { symbol: 'V_C cible', meaning: { fr: 'Demi-tension de repos idéale', ar: 'نصف الجهد المثالي' }, unit: '2,50 V' },
    ],
    examples: [
      {
        id: 'half-rail-challenge',
        pageRef: 'p. 3 & p. 6',
        title: { fr: 'Défi : Ajuster R_B pour V_C = 2,50 V + Test AC', ar: 'التحدّي: ضبط R_B واختبار موجة AC' },
        summary: {
          fr: 'Ajustez R_B pour viser 2,50 V (± 0,10 V pour 3 étoiles), puis activez le signal sinusoïdal d’entrée pour voir l’écrêtage disparaître au centre !',
          ar: 'اضبط R_B للاقتراب من 2.50V (واحصل على ٣ نجوم)، ثم فعّل موجة الدخل لتشاهد اختفاء التشويه في منتصف النطاق.',
        },
        components: ['BC547', 'R_L 22k', 'R_B ≈ 2M2', '5V'],
      },
    ],
    prediction: {
      question: {
        fr: 'Si vous diminuez la résistance de base R_B (de 2,2 MΩ vers 220 kΩ), que fait la tension du collecteur V_C ?',
        ar: 'إذا صغّرتَ مقاومة القاعدة R_B (من 2.2MΩ إلى 220kΩ)، ماذا يحدث لجهد المجمّع V_C؟',
      },
      options: [
        { fr: 'V_C monte vers 5 V', ar: 'يرتفع V_C نحو 5V' },
        { fr: 'V_C descend vers 0,2 V', ar: 'يهبط V_C نحو 0.2V' },
        { fr: 'V_C reste figé à 2,5 V', ar: 'يبقى V_C ثابتاً عند 2.5V' },
      ],
      correctIndex: 1,
      explanation: {
        fr: 'Une R_B plus petite laisse entrer un courant I_B plus grand → I_C augmente → la chute de tension I_C × R_L augmente → donc V_C = V_CC − I_C × R_L baisse fortement vers la saturation (0,2 V).',
        ar: 'تصغير R_B يزيد تيار القاعدة I_B فيزداد I_C، وبما أن V_C = V_CC − I_C × R_L يهبط جهد المجمّع نحو جهد التشبّع (0.2V).',
      },
    },
    teacherNote: {
      fr: 'Note pédagogique (p. 3) : le livre ne précise ni β ni V_BE dans ce paragraphe. Avec V_BE = 0,6 V et β = 57 (typique à faible I_C ≈ 113 µA), R_B = (5 − 0,6) / (113,6 µA / 57) ≈ 2,2 MΩ donne exactement V_C = 2,50 V !',
      ar: 'ملاحظة للمعلم: لم يحدد الكتاب β هنا؛ استخدام β = 57 و V_BE = 0.6V يعطي تطابقاً تاماً مع القيمة المذكورة في الكتاب (R_B ≈ 2.2 MΩ عند V_C = 2.50 V).',
    },
  },
];
