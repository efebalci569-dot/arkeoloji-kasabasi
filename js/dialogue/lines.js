// NPC diyalogları: tanışma, selamlaşma (saat/hava/arkadaşlık/ilerlemeye göre), sohbet, hediye tepkileri, kalp olayları.
(function () {
  const U = AK.U;
  const nm = () => AK.state.player.name;
  const tier = id => { const h = AK.NPCs.hearts(id); return h >= 6 ? 3 : h >= 4 ? 2 : h >= 2 ? 1 : 0; };

  const INTRO = {
    nermin: () => [`Sen... {ad} olmalısın! Amcan Doğan'ın yeğeni. Gözlerin tıpkı onunkiler gibi.`,
      'Ben Nermin, bu müzenin küratörüyüm. Gördüğün gibi pek fazla eserimiz yok... Kasaba unutuldu, ziyaretçi kalmadı.',
      'Amcan kuzeydeki Eski Orman\'da yıllarca kazı yaptı. Toprağın altında hâlâ çok şey olduğuna inanırdı.'],
    kaya: () => ['Hm. Yeni yüz. Demirci Kaya.', 'Aletlerin paslı. Getir bakalım, adam ederiz. Bedava değil ama.'],
    lale: () => ['Merhabaaa! Sen yeni gelen kâşif olmalısın! Ben Lale, restoran benim!', 'Kazıdan yorgun dönersen bir kase çorba seni toparlar. Kapım hep açık... yani saat 10\'dan 22\'ye kadar!'],
    riza: () => ['Hoş geldin evlat! Rıza Usta derler bana.', 'Çanta mı lazım, mobilya mı, dükkânına tadilat mı? Hepsi bende. Doğan Bey\'in dükkânı biraz harap ama ikimiz onu toparlarız.'],
    defne: () => ['A-ah, merhaba... Ben Defne. Kütüphaneye bakıyorum.', 'Eğer üzerinde yazı olan bir şey bulursan... bana getirir misin? Eski dilleri çözmeye çalışıyorum. Araştırma da yapabilirim.'],
  };
  const GREET = {
    nermin: [
      ['Günaydın {ad}! Bugün toprak sana ne verecek acaba?', 'Müzeye her yeni eser girdiğinde bu bina biraz daha nefes alıyor.', 'Amcan da her sabah böyle heyecanla kazıya giderdi.'],
      ['Ziyaretçiler soruyor, "o kâşif kim?" diye. Seni tanımaya başladılar!', 'Bir eseri temizlerken sabırlı ol. Acele eden fırça çatlak bırakır.'],
      ['{ad}, sen bu kasabaya yeniden hayat veriyorsun. Bunu biliyor musun?', 'Bazen gece müzede yalnız oturup vitrinlere bakıyorum. Her biri bir hikâye.'],
      ['Amcan seninle gurur duyardı. Ben de duyuyorum.', 'Kayıp Şehir... Amcan bunu bir masal sanırdım. Artık o kadar emin değilim.'],
    ],
    kaya: [
      ['Hm.', 'Kazman nasıl? Kıvılcım çıkarmıyorsa yeterince sert vurmuyorsun.', 'Örs soğumadan gel.'],
      ['Yine sen. İyi.', 'Bakır alet, paslıdan iki kat iş görür. Benden söylemesi.'],
      ['{ad}! Otur biraz. Çay?', 'Babam da demirciydi. Dedem de. Bu örs onlardan kaldı.'],
      ['Sen olmasan bu kasabanın sesi örsümden ibaret kalacaktı. Teşekkürler... evlat.'],
    ],
    lale: [
      ['Selaaam! Bugün menüde mercimek çorbası var!', 'Karnın aç mı? Yüzünden belli!', 'Kazıdan mı geliyorsun? Ayakkabıların çamur içinde!'],
      ['Turistler gelmeye başlarsa restoran dolacak, düşünsene!', 'Annem derdi ki: "Sofra kuran, dost kazanır."'],
      ['{ad}! Senin için özel bir şey deniyorum, yakında tadına bakacaksın!', 'Bazen kapanıştan sonra meydanda yıldızları seyrediyorum.'],
      ['Sen burada olunca kasaba daha sıcak geliyor. Gerçekten.'],
    ],
    riza: [
      ['Ooo, kâşifimiz! Ne lazım?', 'Çanta dolup taşıyor mu? Bende daha büyüğü var!', 'Bu kasaba eskiden pazar günleri ne kalabalık olurdu...'],
      ['Dükkânın güzelleşiyor! Kasabanın gözü üstünde, haberin olsun.', 'Altın görürsen bana getir, iyi fiyat veririm!'],
      ['{ad}, sana bir sır vereyim: Doğan Bey dükkânın tabanının altına bir şey saklamış olabilir... şaka şaka!', 'Gençliğimde ben de kazıya katıldım. Sırtım hâlâ hatırlar.'],
      ['Seninle çalışmak bana gençliğimi hatırlatıyor. Sağ ol evlat.'],
    ],
    defne: [
      ['Ah! Merhaba... Bir şey mi buldun?', 'Ş-şu an bir metni çözmeye çalışıyordum.', 'Kütüphanede amcanın notları da var, biliyor muydun?'],
      ['Yazıtlar konuşur, sadece doğru soruyu sormak lazım.', 'Bir eseri araştırmak onun hikâyesini ortaya çıkarır. Değeri de artar!'],
      ['{ad}, seninle konuşmak... kolay. Garip, normalde insanlarla konuşmakta zorlanırım.', 'Kayıp Şehir\'in dili, bildiğim tüm dillerden farklı. Ama bir düzeni var.'],
      ['Sen haritaları buldukça ben de kelimeleri buluyorum. İyi bir ekibiz, değil mi?'],
    ],
  };
  const CHAT = {
    nermin: ['Müzenin üç salonu var: Ana Salon, Doğu Kanadı ve Hazine Salonu. 10 bağışta Doğu Kanadı\'nı, 20 bağışta Hazine Salonu\'nu açabiliriz.', 'Kirli eserleri dükkânındaki temizleme masasında temizle. Temiz bir eser hem daha değerli hem müzeye layık.', 'Yağmurlu günlerde toprak yumuşar, yeni izler ortaya çıkar. Kazı için harika!', 'Sisli günlerde ormanın güneybatısında tuhaf bir şey olurmuş. Amcan "taşlar fısıldıyor" derdi.'],
    kaya: ['Kazma Seviye 2 olunca mağaranın girişindeki kayaları kırabilirsin.', 'Sert topraklı hendek için çelik kürek gerekir. Malzemeyi getir, gerisini ben hallederim.', 'Eski metal getir. Eritir, aletine katarım.', 'Mağara karanlık. Benden iyi bir fener almadan derine inme.'],
    lale: ['Enerjin bitince yürüyüşün yavaşlar. Yemek ye, kendine iyi bak!', 'Gece 2\'ye kadar dışarıda kalırsan bayılırsın, sonra seni evine taşırlar. Başına gelmesin!', 'Restoran akşamları dolar. Herkes buraya gelir, sen de gel!', 'Kil getirirsen fırınımı tamir edebilirim!'],
    riza: ['Dükkânını büyütürsen daha çok sergi masası olur, daha çok müşteri gelir.', 'Kaynakları bana satabilirsin: taş, kil, metal... Hepsi bir işe yarar.', 'Dedektör alırsan toprağın altındaki gizli eserleri duyarsın. Bip, bip, bip!', 'Evine vitrin koy, bulduğun nadir eserleri sergile. Sabahları uyanınca insanın içi açılır.'],
    defne: ['Üç tablet olduğunu düşünüyorum: Güneş, Ay ve Yıldız. Eski Orman\'da nadir bulunurlar.', 'Bir eseri bana getirip araştırırsan değeri %20 artar ve hikâyesi koleksiyon defterine yazılır.', 'Çöl Harabeleri\'nden gelen ticaret kayıtları "kuzeydeki ormanın altındaki şehir"den bahsediyor. Bizim kasaba!', 'Gece gökyüzünde yedi parlak yıldız var. Tabletlerdeki yıldızın köşe sayısı da yedi.'],
  };
  const GIFT = {
    love: ['Bu... bu harika! Nereden bildin? Çok teşekkür ederim!', 'Vay canına! Tam da istediğim şey! Bunu unutmayacağım.'],
    like: ['Çok naziksin, teşekkürler!', 'Ne hoş bir düşünce. Sağ ol!'],
    neutral: ['Teşekkürler.', 'Oh, sağ ol.'],
    dislike: ['Hmm... teşekkürler, sanırım.', 'Bunu ne yapacağımı pek bilemedim.'],
    hate: ['Bunu bana neden verdin ki?!', 'Ah... hayır. Bunu hiç sevmem.'],
    dirty: ['Bu kirli bir eser! Önce temizlemelisin, yoksa zarar görür.', 'Toprağıyla mı getirdin? Temizleme masasını kullanmalısın!'],
  };
  const SPECIAL_GIFT = {
    kaya: { love: 'Hah! İşte bu! Ateşime yakışır.', hate: 'Kil mi? Ben çömlekçi miyim?!' },
    lale: { hate: 'Iyy! Kemikli şeyler... ürperdim!' },
    defne: { love: 'Bu yazıt... harfleri görüyor musun? Bunu gece boyu inceleyeceğim!' },
    nermin: { love: 'Ah, ne zarif! Bunu masama koyacağım.' },
    riza: { love: 'Altın gibi parlıyor! Hayır, bu altın! Teşekkürler evlat!' },
  };

  const HEART_EVENTS = {
    nermin: [
      { h: 2, lines: ['{ad}, sana bir şey vermek istiyorum. Amcanın hesabında kalan biraz para... Dükkân için kullan.', '(Nermin Hanım sana 300 altın verdi.)'], fn: () => AK.Game.addMoney(300, 'Hediye') },
      { h: 4, lines: ['Amcanın notlarını okudum. "Güneş, Ay, Yıldız — üçü bir araya gelince kapı açılır" yazıyor.', 'Mağarada mühürlü bir kapıdan bahsediyor. Belki de Defne\'nin tabletleri bununla ilgili...', 'Al, bu küçük biblo amcanındı. Senin olsun.'], fn: () => AK.Inv.add({ id: 'figur', n: 1 }) },
      { h: 6, lines: ['Belediyeyle konuştum. Bundan sonra müzeye yaptığın bağışlar için daha cömert bir ödül alacaksın.', '(Bağış ödülleri artık %50 daha fazla!)'], fn: () => { AK.state.flags.donBonus = true; } },
    ],
    kaya: [
      { h: 2, lines: ['Bak. Sık geliyorsun, iyi müşterisin.', 'Bundan sonra geliştirmelerde %15 indirim. Kimseye söyleme.'], fn: () => { AK.state.flags.kayaDiscount = true; } },
      { h: 4, lines: ['Al şunu. Maden feneri. Kendim yaptım.', 'Mağarada ışığın iki kat uzağa ulaşır. Karanlıkta kaybolma.', '(Maden Feneri aldın! Karanlıkta daha geniş görürsün.)'], fn: () => { AK.state.flags.lantern = true; } },
    ],
    lale: [
      { h: 2, lines: ['Sana bir sır: Restorana her uğradığında bir bardak çay benden!', '(Restoranda her gün bedava çay alabilirsin.)'], fn: () => { AK.state.flags.laleTea = true; } },
      { h: 4, lines: ['Annemin gizli tarifini sana öğretmek istiyorum: Mercimek köftesi!', 'Bunu yiyen yorgunluk nedir bilmez. Ve... sana özel, menüme ekledim.', '(Maksimum enerjin +15 arttı! Restoran menüsüne Mercimek Köftesi eklendi.)'], fn: () => { AK.state.flags.laleRecipe = true; AK.state.player.maxEnergy += 15; } },
    ],
    riza: [
      { h: 2, lines: ['Evlat, kaynaklarını bundan sonra bana %20 fazlasına satabilirsin. Dost fiyatı!'], fn: () => { AK.state.flags.rizaBonus = true; } },
      { h: 4, lines: ['Atölyede boş duran bir vitrin vardı. Evine taşıttım bile!', '(Evine ücretsiz bir vitrin eklendi.)'], fn: () => { const f = AK.state.house.furn; if (!f.vitrin2) f.vitrin2 = true; else if (!f.vitrin3) f.vitrin3 = true; else AK.Game.addMoney(400, 'Hediye'); } },
    ],
    defne: [
      { h: 2, lines: ['Ş-şey... araştırmalarını artık yarı fiyatına yapabilirim. Senin eserlerin benim için de çok öğretici.'], fn: () => { AK.state.flags.defneDiscount = true; } },
      { h: 4, lines: ['Bu benim eski arkeoloji setim. Artık senin olsun.', 'Kazı işaretlerinin etrafındaki ışıltıyı görebileceksin: renk, eserin ne kadar nadir olduğunu gösterir.', 'Evinde bir çalışma masası varsa araştırmayı orada kendin de yapabilirsin.', '(Arkeoloji Seti aldın!)'], fn: () => { AK.state.flags.kit = true; } },
    ],
  };

  const L = AK.Lines = {
    fill(s) {
      return s.replace(/\{ad\}/g, nm()).replace(/\{mevsim\}/g, AK.Time.SEASONS[AK.Time.season()]);
    },
    intro(n) { return (INTRO[n.id] ? INTRO[n.id]() : ['Merhaba!']).map(L.fill); },
    greet(n) {
      const h = AK.Time.hour(), w = AK.Weather.today(), id = n.id, t = tier(id);
      const lw = AK.Law && AK.Law.greetLine(id);
      if (lw && Math.random() < 0.6) return L.fill(lw);
      const pool = [];
      GREET[id].slice(0, t + 1).forEach(a => pool.push(...a));
      if (w === 'yagmur') pool.push('Bu yağmur hiç dinmeyecek mi? Gerçi toprak için iyi...');
      if (w === 'kar') pool.push('Kar her şeyi ne kadar sessiz yapıyor, değil mi?');
      if (w === 'sis') pool.push('Bu sis... insanın içini ürpertiyor. Ormanda dikkatli ol.');
      if (h >= 20) pool.push('Geç oldu, {ad}. Kendini fazla yorma.');
      if (h < 8) pool.push('Erkencisin! Sabahın en güzel saatleri bunlar.');
      const ev = AK.Progress.eventToday();
      if (ev) pool.push(`Bugün ${AK.Progress.EVENTS_BY_ID[ev].name}! Ne heyecanlı!`, `${AK.Progress.EVENTS_BY_ID[ev].name} için her şey hazır mı?`);
      const md = AK.state.museum.length;
      if (id === 'nermin' && md >= 10) pool.push(`Müzede ${md} eser var artık! Doğu Kanadı çok güzel oldu.`);
      if (id === 'riza' && AK.state.shop.level >= 2) pool.push('Dükkânın tadilatı nasıl, beğendin mi? Ustalık işi!');
      return L.fill(U.pick(pool));
    },
    chat(n) { const id = n.id; return L.fill(U.pick(CHAT[id].concat([n.def.bio]))); },
    giftLine(n, r, st) {
      const sp = SPECIAL_GIFT[n.id] && SPECIAL_GIFT[n.id][r];
      return L.fill(sp && Math.random() < 0.6 ? sp : U.pick(GIFT[r]));
    },
    heartEvent(n) {
      const s = AK.NPCs.st(n.id), h = AK.NPCs.hearts(n.id);
      for (const e of HEART_EVENTS[n.id] || []) {
        if (h >= e.h && !s.ev[e.h]) {
          return { lines: e.lines.map(L.fill), done: () => { s.ev[e.h] = true; e.fn(); AK.Audio.sfx('quest'); } };
        }
      }
      return null;
    },
    tourist: ['Ne şirin bir kasaba! Müzeyi gördün mü?', 'Bu kasabanın arkeoloji dükkânından hediyelik bir şey almak istiyorum!', 'Gazetede bu kasabadan bahsediyorlardı, merak edip geldim.', 'Restoranın mercimek çorbası efsane diyorlar!', 'Çeşmenin önünde fotoğraf çekilmeyi unutmayalım!', 'Burada gerçekten eski bir şehir mi varmış? Heyecan verici!'],
    HEART_EVENTS,
  };
})();
