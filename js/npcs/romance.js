// İlişkiler: sevgililik (Gül Buketi ile açılma), Fener Bar'da randevu ve arkadaş buluşmaları,
// ısmarlama, birlikte yemek, sarılma, ayrılık ve sevgiliden gelen mektuplar.
(function () {
  const U = AK.U;
  const N = () => AK.NPCs;
  const today = () => AK.Time.abs();
  const DATE_FROM = 1190, DATE_TO = 1380; // 19:50–23:00

  // ---------------- metinler ----------------
  const CONFESS = {
    lale: ['G-güller mi? Bana mı?', 'Biliyor musun, her akşam kapanışta senin geleceğin saati bekliyordum. Annem derdi ki "Sofra kuran, dost kazanır." Ben seni kazandım galiba.', 'Evet! Evet, tabii ki evet! Artık sevgiliyiz, {ad}!'],
    defne: ['Bu... bu bir gül buketi. Kırmızı. Kırmızı gülün anlamını biliyorum...', 'Ş-şey... ben de... yani... bunu kitaplarda okurdum hep. Gerçek hayatta böyle hissettirdiğini bilmiyordum.', 'Evet. Seninle olmak istiyorum, {ad}.'],
    kaya: ['...', 'Ben laf bilmem. Örs bilirim, ateş bilirim.', 'Ama seni gördüğümde ocak bile soğuk geliyor. Evet. Benim ol, {ad}.'],
    can: ['Vay. Bütün kasaba bunu bekliyordu, biliyor musun? Ben dahil.', 'Tezgâhın arkasından seni izlemek yetiyordu sanıyordum. Yetmiyormuş.', 'Evet, {ad}. Bundan sonra senin içkin hep benden — ama bu sefer bir tek ayran değil, kalbim de.'],
    zeynep: ['Kırmızı güller... hem de benim dükkânımdan!', 'Bahçemdeki o fidan... adını verdiğim fidan... bugün tam da bunun için açmış olmalı.', 'Evet! Bin kere evet! Artık sevgiliyiz, {ad}!'],
    emre: ['Ben... şey. Balık tutarken bile bu kadar heyecanlanmamıştım.', 'Her sabah iskelede güneşi beklerken yanımda seni hayal ediyordum.', 'Evet, {ad}. Bundan sonra sabahları ikimiz bekleriz.'],
    elif: ['Dur, kıpırdama... bu anı aklıma kazımam lazım.', 'Yirmi eskiz çizdim, hiçbiri sana yetmedi. Çünkü resim değil, gerçek olmalıymışsın.', 'Evet, {ad}. Seninle olmak istiyorum.'],
    baris: ['Şarkının son kıtası eksikti. Şimdi buldum.', '"...ve kâşif bir gün kalbimi kazdı, içinde kendini buldu."', 'Evet, {ad}! Artık sevgiliyiz. Bu şehirden hiç gitmiyorum.'],
  };
  const PARTNER_GREET = {
    _: ['Sevgilim! Günün nasıl geçti?', '{ad}! Seni gördüğüme çok sevindim.', 'Bugün seni düşündüm. Yani... her gün düşünüyorum.', 'Akşam Fener Bar\'a gidelim mi? Mumlu masa bizim!'],
    lale: ['Sevgilim! Sana sıcak çorba ayırdım, unutma!', 'Mutfakta bile aklım sende. Dün tuzu iki kere attım!'],
    defne: ['Merhaba sevgilim... bugün eski bir şiir buldum. Sanki bizi anlatıyor.', 'Seninle konuşurken kekelemiyorum artık, fark ettin mi?'],
    kaya: ['Gel. Otur. Sana çay demledim.', 'Örsün sesi bile seni görünce yumuşuyor.'],
    can: ['Bak kim gelmiş! Barın en güzel müşterisi.', 'Bu akşam mumlu masayı senin için ayırdım.'],
    zeynep: ['Sevgilim! Bahçede ilk sümbüller açtı, seninle görmek istedim!', 'Bugün bütün çiçekler senin rengindeydi.'],
    emre: ['Sabah iskelede güneş doğarken seni düşündüm.', 'Bugünün en güzel balığı senin. Hep öyle olacak.'],
    elif: ['Seni bugün yine çizdim. Bu sefer gülümsüyordun.', 'Işık bugün altın rengi, tıpkı senin gibi.'],
    baris: ['Sevgilim! Yeni şarkı hazır, adı senin adın!', 'Sahnede seni gördüğüm an sözler kendiliğinden geliyor.'],
  };
  const DATE_LINES = {
    _: ['Geldin! Mumlu masayı ayırttım, otur bakalım.', 'Can bize karışık meze tabağı getirdi. Paylaşalım!', 'Böyle akşamlar... iyi ki varsın.'],
    lale: ['Burada başkası pişirince yemek daha mı lezzetli oluyor ne?', 'Ama benim mercimek çorbam daha iyi, bunu not et!'],
    defne: ['Burası biraz gürültülü ama... seninle olunca fark etmiyor.', 'Bu akşam hiç kekelemedim, fark ettin mi?'],
    kaya: ['...', 'Güzel akşam. Sen buradasın. Yeter.'],
    can: ['Tezgâhı bu gecelik Emre\'ye bıraktım. Bu gece müşteri değil, misafirsin.', 'Fener Kokteyli\'nin adını değiştireceğim. "Kâşifin Kalbi" nasıl?'],
    zeynep: ['Masaya küçük bir vazo getirdim, gördün mü? Gelincik!', 'Barış çalarken dans edelim mi? Ya da... sonra!'],
    emre: ['Bekir Dede bize göz kırptı, gördün mü? Hah!', 'Yarın sabah iskeleye gel. Güneş doğarken sana bir şey göstereceğim.'],
    elif: ['Mum ışığında yüzün... hayır, şimdi çizemem. Sadece bakmak istiyorum.', 'Bu akşamın bir tablosu olsa adını "Fener" koyardım.'],
    baris: ['Bu gecelik sahne yok. Bu gece sadece ikimiz.', 'Sana bir şarkı mırıldanayım mı? Kimse duymasın, sadece sen.'],
  };
  const FRIEND_LINES = ['Geldin! Bir şeyler söyleyelim mi? Can bu akşam çok cömert.', 'Böyle akşamları özlemişim. Kasabada dost olmak güzel.', 'Şerefe! Yeni keşiflere ve eski dostluklara!'];
  const MISSED = {
    date: ['Dün akşam barda seni bekledim... mum söndü, ben de kalktım.', 'Önemli değil. Sadece... bir dahaki sefere haber ver, olur mu?'],
    friend: ['Dün akşam barda seni bekledim. Gelmedin.', 'Neyse, olur böyle şeyler. Ama bir dahaki sefer gelirsin, değil mi?'],
  };
  const PARTNER_GIFT = { lale: 'kofte', defne: 'kahve', kaya: 'kebap', can: 'kokteyl', zeynep: 'sumbul', emre: 'balik', elif: 'kart', baris: 'kart' };

  const Ro = AK.Romance = {
    get s() { return AK.state.rel || (AK.state.rel = { partner: null, since: 0, date: null, dates: 0, lastMail: 0 }); },
    isPartner(id) { return this.s.partner === id; },
    // randevu akşamı NPC'nin programını değiştirir
    override(n, min) {
      const d = this.s.date;
      if (d && d.id === n.id && d.day === today() && min >= DATE_FROM && min < DATE_TO) return 'bar:date';
      return null;
    },
    greet(n) {
      const st = N().st(n.id);
      if (this.isPartner(n.id) && Math.random() < 0.65) return AK.Lines.fill(U.pick((PARTNER_GREET[n.id] || []).concat(PARTNER_GREET._)));
      if (st.ex && today() - st.ex < 7 && Math.random() < 0.6) return AK.Lines.fill(U.pick(['Merhaba... Hâlâ biraz garip, değil mi?', 'Ah, sen. İyiyim, merak etme.', 'Zamanla geçer, değil mi? Umarım.']));
      return AK.Lines.greet(n);
    },
    // konuşma başında özel durumlar: randevu, kaçırılan buluşma
    onTalk(n, end) {
      const R = this.s, st = N().st(n.id), d = R.date;
      if (d && d.id === n.id && d.day === today() && !d.done && n.inside === 'bar' && AK.World.cur.id === 'int_bar' && AK.Time.min() >= DATE_FROM) {
        d.done = true; R.dates = (R.dates || 0) + 1;
        const date = d.kind === 'date';
        const pool = date ? (DATE_LINES[n.id] || []).concat(DATE_LINES._) : FRIEND_LINES;
        const lines = date ? [pool[0], U.pick(pool.slice(1)), U.pick(DATE_LINES._)] : [U.pick(FRIEND_LINES), U.pick(FRIEND_LINES)];
        this.sitAtDate();
        AK.Dialog.open({
          name: n.def.name, look: n.look, lines: [...new Set(lines)],
          onEnd: () => {
            N().addFr(n.id, date ? 90 : 55);
            const p = AK.state.player; p.energy = Math.min(p.maxEnergy, p.energy + 30);
            AK.World.float(AK.Player.x, AK.Player.y - 30, '+30 enerji', '#7cf06a');
            n.bubble = 'heart'; n.bubbleT = 3; setTimeout(() => { n.bubbleT = 0; }, 3000);
            AK.Audio.sfx('heart');
            AK.UI.toast(date ? `${n.def.name} ile romantik bir akşam geçirdiniz. Meze tabağını paylaştınız. ♥` : `${n.def.name} ile barda keyifli bir akşam geçirdiniz.`, 'heart');
            AK.Bus.emit('date', n.id, d.kind);
            end();
          },
        });
        return true;
      }
      if (st.sadDay && st.sadDay >= today() - 1 && !st.sadShown) {
        st.sadShown = true;
        AK.Dialog.open({ name: n.def.name, look: n.look, lines: MISSED[st.sadKind || 'friend'], choices: N().choices(n, end), onEnd: end });
        return true;
      }
      return false;
    },
    // oyuncuyu randevu masasının karşı sandalyesine oturt
    sitAtDate() {
      const m = AK.World.cur, o = m.objects.find(e => e.kind === 'seat' && e.dateSeat);
      if (o && !AK.Player.seated) AK.Player.sitOn(o);
    },
    hasMenu(n) {
      const st = N().st(n.id);
      if (!st.met) return false;
      if (this.isPartner(n.id)) return true;
      if (n.def.romance && N().hearts(n.id) >= 8) return true;
      return N().hearts(n.id) >= 3;
    },
    menu(n, end) {
      const c = [], h = N().hearts(n.id), name = n.def.name;
      if (this.isPartner(n.id)) {
        c.push({ t: 'Sarıl', fn: () => this.hug(n, end) });
        c.push({ t: 'Bu akşam bara gidelim mi?', fn: () => this.invite(n, end) });
        c.push({ t: 'Ayrılmak istiyorum...', fn: () => this.breakup(n, end) });
      } else {
        if (n.def.romance && h >= 8) c.push({ t: 'Duygularını aç ♥', fn: () => this.confess(n, end) });
        if (h >= 3) c.push({ t: 'Bu akşam barda bir şeyler içelim mi?', fn: () => this.invite(n, end) });
      }
      c.push({ t: 'Vazgeç', fn: end });
      const st = N().st(n.id);
      const head = this.isPartner(n.id) ? `(${name} ile sevgilisiniz. ${today() - (this.s.since || today())} gündür birliktesiniz.)` : `(${name} · ${N().status(n.id)} · ${h}/10 kalp${n.def.romance ? '' : ' · sadece arkadaşlık'})`;
      void st;
      AK.Dialog.open({ name, look: n.look, lines: [head], choices: c, onEnd: end });
    },
    // Gül Buketi ile duygularını açma
    confess(n, end, invIdx) {
      const name = n.def.name, R = this.s, h = N().hearts(n.id);
      const idx = invIdx != null ? invIdx : AK.Inv.find(st => st && st.id === 'gul');
      const say = (lines, cb) => AK.Dialog.open({ name, look: n.look, lines, onEnd: () => { if (cb) cb(); end(); } });
      if (R.partner === n.id) {
        const s = N().st(n.id);
        if (s.giftDay === today()) return say(['Bugün zaten bir hediye verdin sevgilim. Yarın yine gel!']);
        AK.Inv.removeAt(idx, 1); s.giftDay = today();
        return say(['Yine mi güller! Seninle her gün ilk gün gibi. ♥'], () => N().addFr(n.id, 80));
      }
      if (!n.def.romance) {
        const married = n.id === 'ayse' || n.id === 'oguz';
        return say(married ? ['Ah canım, çok tatlısın ama ben evliyim! Bu gülleri eşine... yani, birine ver!'] : ['Ah... bu çok tatlı ama ben seni bir dost olarak seviyorum. Bu güller başka birine ait.']);
      }
      if (R.partner && R.partner !== n.id) return say(['Ama senin zaten bir sevgilin var, değil mi? Bütün kasaba biliyor...', `(Önce ${N().byId[R.partner].name} ile ayrılman gerekir.)`]);
      if (idx < 0) return say(['...', '(Duygularını açmak için bir Gül Buketi\'ne ihtiyacın var. Zeynep\'in çiçekçisinde bulabilirsin.)']);
      if (h < 10) return say(['Ah... ş-şey... çok tatlısın, gerçekten.', 'Ama henüz değil. Birbirimizi biraz daha tanıyalım, olur mu?', `(Kalbi tamamen dolu olmalı: ${h}/10 kalp.)`]);
      AK.Inv.removeAt(idx, 1);
      const st = N().st(n.id);
      R.partner = n.id; R.since = today(); R.lastMail = today(); st.ex = 0; st.giftDay = today();
      AK.Audio.sfx('quest');
      AK.Dialog.open({
        name, look: n.look, lines: (CONFESS[n.id] || ['Evet!']).map(AK.Lines.fill),
        onEnd: () => {
          n.bubble = 'heart'; n.bubbleT = 4; setTimeout(() => { n.bubbleT = 0; }, 4000);
          AK.UI.toast(`♥ ${name} ile artık sevgilisiniz! ♥`, 'heart');
          for (let i = 0; i < 6; i++) setTimeout(() => AK.World.sparkle(n.x + U.ri(-10, 10), n.y - 20, '#ff8aa8', 6), i * 150);
          AK.Progress.mail('sevgili_' + n.id + '_' + today(), name, 'Dün geceden beri...', `Sevgili {ad},\n\nDün geceden beri yüzümdeki gülümseme gitmiyor. Herkes "ne oldu sana?" diye soruyor.\n\nBu akşam Fener Bar'da buluşalım mı? Mumlu masa bizim olsun.\n\n— ${name} ♥`, { item: PARTNER_GIFT[n.id] || 'cikolata', n: 1 });
          AK.Bus.emit('partner', n.id);
          end();
        },
      });
    },
    invite(n, end) {
      const name = n.def.name, R = this.s, d = R.date, min = AK.Time.min();
      const say = lines => AK.Dialog.open({ name, look: n.look, lines, onEnd: end });
      if (d && d.day === today() && !d.done) return say(d.id === n.id ? ['Zaten bu akşam buluşuyoruz! Saat 8\'de Fener Bar, unutma.'] : ['Bu akşam başka biriyle buluşmuyor muydun? Başka bir gün olur!']);
      if (min >= 1260) return say(['Bu saatten sonra mı? Yarın akşama ne dersin?']);
      const date = this.isPartner(n.id);
      R.date = { id: n.id, day: today(), done: false, kind: date ? 'date' : 'friend' };
      const acc = date ? ['Evet! Saat 8\'de Fener Bar\'da, mumlu masada. Geç kalma!'] : n.id === 'can' ? ['Bar zaten benim, hah! Saat 8\'de mumlu masaya otur, ben gelirim.'] : [U.pick(['Olur, neden olmasın! Saat 8\'de Fener Bar\'da görüşürüz.', 'Harika fikir! 8\'de barda olurum.', 'Tamam! Akşam 8, Fener Bar. İlk tur benden... şaka, senden!'])];
      AK.Dialog.open({
        name, look: n.look, lines: acc,
        onEnd: () => { AK.UI.toast(`${name} ile bu akşam 20:00–23:00 arası Fener Bar'da buluşacaksınız. (Doğu Mahallesi, mumlu masa)`, 'heart'); AK.UI.refreshTracker && AK.UI.refreshTracker(); end(); },
      });
    },
    hug(n, end) {
      const st = N().st(n.id), name = n.def.name;
      if (st.hugDay === today()) { AK.Dialog.open({ name, look: n.look, lines: ['Hah, bir daha mı? Gel bakalım! ♥'], onEnd: end }); return; }
      st.hugDay = today();
      AK.Dialog.open({
        name, look: n.look, lines: [U.pick(['Mmm... buna ihtiyacım vardı.', 'Seni seviyorum, biliyorsun değil mi?', 'Bütün yorgunluğum geçti.', 'Bırakmasan mı acaba? Hah!'])],
        onEnd: () => {
          const p = AK.state.player; p.energy = Math.min(p.maxEnergy, p.energy + 20);
          N().addFr(n.id, 12);
          n.bubble = 'heart'; n.bubbleT = 2; setTimeout(() => { n.bubbleT = 0; }, 2000);
          AK.World.float(AK.Player.x, AK.Player.y - 30, '♥ +20 enerji', '#ff8aa8');
          AK.Audio.sfx('heart');
          end();
        },
      });
    },
    breakup(n, end) {
      const name = n.def.name;
      AK.UI.confirm(`<b>${U.esc(name)}</b> ile ayrılmak istediğine emin misin? Arkadaşlığınız da büyük zarar görür.`, () => {
        const R = this.s, st = N().st(n.id);
        R.partner = null; st.ex = today();
        if (R.date && R.date.id === n.id) R.date = null;
        st.fr = Math.max(0, st.fr - 450);
        AK.Dialog.open({ name, look: n.look, lines: ['...Anlıyorum.', 'Keşke farklı olsaydı. Ama sana kızgın değilim, sadece... üzgünüm.', '(Artık sevgili değilsiniz.)'], onEnd: end });
      }, () => end(), 'Ayrıl', 'Vazgeç');
    },
    // barda / restoranda birine ısmarla
    treat(n, itemId) {
      const st = N().st(n.id), d = AK.Items.D[itemId];
      if (st.treatDay === today()) { AK.UI.toast(`${n.def.name} için bugün zaten ısmarladın.`, 'heart'); return false; }
      const r = N().reaction(n, { id: itemId });
      const pts = { love: 70, like: 45, neutral: 28, dislike: -10, hate: -25 }[r] || 25;
      st.treatDay = today();
      N().addFr(n.id, this.isPartner(n.id) && pts > 0 ? Math.round(pts * 1.25) : pts);
      if (r === 'love') { st.known = st.known || []; if (!st.known.includes(itemId)) st.known.push(itemId); }
      const line = { love: `${d.name} mı? En sevdiğim! Şerefe, {ad}!`, like: 'Ooo, sağ ol! Şerefe!', neutral: 'Teşekkürler, ne incelik. Şerefe!', dislike: 'Hmm... aslında pek sevmem ama, sağ ol.', hate: 'Bunu mu? Ah... neyse, niyetin önemli.' }[r] || 'Şerefe!';
      if (r === 'love' || r === 'like') { n.bubble = 'heart'; n.bubbleT = 2; setTimeout(() => { n.bubbleT = 0; }, 2000); }
      AK.Dialog.open({ name: n.def.name, look: n.look, lines: [line] });
      AK.Bus.emit('treat', n.id, itemId, r);
      return true;
    },
    // oturarak yerken yakında oturan biri varsa birlikte yemiş sayılırsınız
    sharedMeal() {
      const m = AK.World.cur, P = AK.Player;
      let best = null, bd = 60;
      for (const n of N().list) {
        if (n.map !== m.id || !n.sitting) continue;
        const dd = Math.hypot(n.x - P.x, n.y - P.y);
        if (dd < bd) { bd = dd; best = n; }
      }
      if (!best) return null;
      const st = N().st(best.id);
      if (st.mealDay === today()) return null;
      st.mealDay = today(); st.met = true;
      N().addFr(best.id, this.isPartner(best.id) ? 35 : 25);
      best.bubble = 'heart'; best.bubbleT = 2; setTimeout(() => { best.bubbleT = 0; }, 2000);
      return best;
    },
    // gece: kaçırılan buluşmalar
    nightly() {
      const R = this.s, d = R.date;
      if (d && d.day === today() && !d.done) {
        const st = N().st(d.id);
        N().addFr(d.id, d.kind === 'date' ? -70 : -35);
        st.sadDay = today() + 1; st.sadShown = false; st.sadKind = d.kind;
      }
      if (d && d.day <= today()) R.date = null;
    },
    // sabah: sevgiliden ara sıra mektup ve küçük hediye
    morning() {
      const R = this.s;
      if (!R.partner) return;
      const def = N().byId[R.partner];
      if (today() - (R.lastMail || R.since) >= 5) {
        R.lastMail = today();
        const notes = ['Dün gece rüyamda seni gördüm. Kazıda bir hazine bulmuşsun, sonra o hazine ben çıkmışım. Hah!', 'Bugün seni düşünerek bir şey hazırladım. Küçük ama içten.', 'Yorulma diye sana bir şey gönderiyorum. Akşam görüşürüz, değil mi?', 'Kasabada herkes bize "kâşifle sevgilisi" diyor. Hoşuma gidiyor!'];
        AK.Progress.mail('ask_' + R.partner + '_' + today(), def.name, 'Sana küçük bir not ♥', `Sevgili {ad},\n\n${U.pick(notes)}\n\n— ${def.name} ♥`, { item: PARTNER_GIFT[R.partner] || 'cikolata', n: 1 });
      }
    },
    // görev takipçisi için: bu akşamki buluşma
    trackerLine() {
      const d = this.s.date;
      if (!d || d.day !== today() || d.done) return null;
      return `${d.kind === 'date' ? '♥ Randevu' : 'Buluşma'}: ${N().byId[d.id].name} · 20:00 Fener Bar`;
    },
  };
})();
