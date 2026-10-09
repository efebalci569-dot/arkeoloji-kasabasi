// Eşya veritabanı: aletler, kaynaklar, yemekler, özel eşyalar. Eserler de buradan erişilir.
(function () {
  const D = {
    // aletler
    shovel: { name: 'Kürek', type: 'tool', tool: 'shovel', desc: 'Toprağı kazmak için. Kazı işaretlerinde eser çıkarır.' },
    pickaxe: { name: 'Kazma', type: 'tool', tool: 'pickaxe', desc: 'Taşları ve kristalleri kırar.' },
    hammer: { name: 'Çekiç', type: 'tool', tool: 'hammer', desc: 'Büyük kayaları ve sert yüzeyleri parçalar.' },
    brush: { name: 'Fırça', type: 'tool', tool: 'brush', desc: 'Fosil katmanlarını ortaya çıkarır. Temizlikte de kullanılır.' },
    detector: { name: 'Dedektör', type: 'tool', tool: 'detector', desc: 'Elindeyken gizli eserlerin sinyalini alır. Sinyal en güçlüyken kürekle kaz!' },
    // kaynaklar
    tas: { name: 'Taş', type: 'res', value: 5, desc: 'Sıradan bir taş. Demirci ve tadilat için gerekli.' },
    kil: { name: 'Kil', type: 'res', value: 8, desc: 'Yumuşak, kırmızımsı kil.' },
    kemik: { name: 'Kemik Parçası', type: 'res', value: 10, desc: 'Kimliği belirsiz eski bir kemik parçası.' },
    comlek: { name: 'Çömlek Kırığı', type: 'res', value: 12, desc: 'Kırık bir kaptan kalan parça. Mozaikçiler sever.' },
    metal: { name: 'Eski Metal', type: 'res', value: 20, desc: 'Paslı metal parçaları. Demirci eritip kullanabilir.' },
    kuvars: { name: 'Kuvars', type: 'res', value: 45, desc: 'Berrak bir kristal. Mağarada bulunur.' },
    ametist: { name: 'Ametist', type: 'res', value: 90, desc: 'Mor, değerli bir kristal.' },
    altin: { name: 'Altın Külçe', type: 'res', value: 250, desc: 'Çöl kayalarının içinden çıkan saf altın.' },
    // yemekler (energy = yenilenen enerji)
    cay: { name: 'Çay', type: 'food', energy: 12, price: 15, value: 6, desc: 'İnce belli bardakta tavşan kanı çay.' },
    kahve: { name: 'Türk Kahvesi', type: 'food', energy: 18, price: 25, value: 10, desc: 'Köpüklü, bol sohbetli.' },
    simit: { name: 'Simit', type: 'food', energy: 22, price: 20, value: 8, desc: 'Susamlı, çıtır.' },
    corba: { name: 'Mercimek Çorbası', type: 'food', energy: 35, price: 45, value: 18, desc: 'Limonla, sıcacık.' },
    menemen: { name: 'Menemen', type: 'food', energy: 45, price: 60, value: 24, desc: 'Domates, biber, yumurta. Ekmeği batır!' },
    borek: { name: 'Su Böreği', type: 'food', energy: 55, price: 80, value: 32, desc: 'Kat kat, peynirli.' },
    kofte: { name: 'Mercimek Köftesi', type: 'food', energy: 50, price: 70, value: 28, desc: 'Lale\'nin özel tarifi.' },
    kebap: { name: 'Kebap Tabağı', type: 'food', energy: 90, price: 150, value: 60, desc: 'Kazı gününün en iyi ödülü.' },
    // Fener Bar: içecekler (alc = çakırkeyiflik puanı)
    ayran: { name: 'Ayran', type: 'food', drink: true, energy: 12, price: 15, value: 6, desc: 'Köpüklü, buz gibi. Bar menüsünün sigortası.' },
    salgam: { name: 'Şalgam', type: 'food', drink: true, energy: 12, price: 18, value: 7, desc: 'Acılı mı acısız mı? Can her zaman acılı önerir.' },
    limonata: { name: 'Ev Limonatası', type: 'food', drink: true, energy: 16, price: 22, value: 9, desc: 'Nane yapraklı, ferah.' },
    boza: { name: 'Boza', type: 'food', drink: true, energy: 24, price: 30, value: 12, desc: 'Tarçınlı, leblebili. Kışın bir başka güzel.' },
    bira: { name: 'Fıçı Bira', type: 'food', drink: true, alc: 1, energy: 8, price: 35, value: 12, desc: 'Soğuk, köpüklü. (Alkollü)' },
    sarap: { name: 'Kırmızı Şarap', type: 'food', drink: true, alc: 1, energy: 8, price: 50, value: 18, desc: 'Bağ evlerinden gelme. (Alkollü)' },
    raki: { name: 'Rakı', type: 'food', drink: true, alc: 2, energy: 6, price: 70, value: 25, desc: 'Buzlu, mezeyle yavaş yavaş. (Sert, alkollü)' },
    kokteyl: { name: 'Fener Kokteyli', type: 'food', drink: true, alc: 1, energy: 20, price: 65, value: 24, desc: 'Can\'ın gizli tarifi: nar, nane ve bir tutam sır. (Alkollü)' },
    // Fener Bar: mezeler
    cerez: { name: 'Çerez Tabağı', type: 'food', energy: 15, price: 25, value: 10, desc: 'Leblebi, fıstık, kabak çekirdeği.' },
    haydari: { name: 'Haydari', type: 'food', energy: 20, price: 30, value: 12, desc: 'Süzme yoğurt, nane, sarımsak.' },
    ezme: { name: 'Acılı Ezme', type: 'food', energy: 20, price: 30, value: 12, desc: 'İnce kıyılmış, nar ekşili.' },
    peynir_kavun: { name: 'Peynir & Kavun', type: 'food', energy: 28, price: 45, value: 16, desc: 'Meyhane sofrasının olmazsa olmazı.' },
    midye: { name: 'Midye Tava', type: 'food', energy: 35, price: 60, value: 22, desc: 'Tarator soslu, çıtır çıtır.' },
    kalamar: { name: 'Kalamar Tava', type: 'food', energy: 42, price: 75, value: 28, desc: 'Emre\'nin sabah tuttuklarından.' },
    balik: { name: 'Izgara Balık', type: 'food', energy: 65, price: 110, value: 40, desc: 'Günün balığı, roka ve soğanla.' },
    meze_tabagi: { name: 'Karışık Meze Tabağı', type: 'food', energy: 75, price: 135, value: 48, desc: 'Paylaşmak için. Dostlarla yenince daha lezzetli.' },
    // çiçekçi & hediyeler
    gul: { name: 'Gül Buketi', type: 'gift', romance: true, value: 60, price: 250, desc: 'Kırmızı güller. Kalbi tamamen dolu birine duygularını açmak için.' },
    papatya: { name: 'Papatya Demeti', type: 'gift', value: 20, price: 60, desc: 'Sade ve neşeli. Herkes sever.' },
    lale_demet: { name: 'Lale Demeti', type: 'gift', value: 28, price: 80, desc: 'Rengârenk bahar laleleri.' },
    sumbul: { name: 'Sümbül Saksısı', type: 'gift', value: 30, price: 90, desc: 'Mis kokulu mor sümbül.' },
    cikolata: { name: 'Çikolata Kutusu', type: 'gift', value: 40, price: 120, desc: 'Fındıklı, kurdeleli bir kutu.' },
    kolye: { name: 'Gümüş Kolye', type: 'gift', value: 150, price: 450, desc: 'Sevgiline özel, küçük bir kalp madalyonu.' },
    // özel / hediyelik
    kit:{ name: 'Arkeoloji Seti', type: 'key', desc: 'Kazı işaretlerinin nadirliğini renkli ışıltıyla gösterir. Evdeki çalışma masasında araştırma yapmanı sağlar.' },
    kart: { name: 'Kartpostal', type: 'gift', value: 15, price: 30, desc: 'Kasabanın meydanını gösteren bir kartpostal.' },
    figur: { name: 'Altın Kupa Biblosu', type: 'gift', value: 60, price: 120, desc: 'Festival hatırası küçük bir biblo.' },
    replika: { name: 'Replika Vazo', type: 'gift', value: 40, price: 90, desc: 'Müze dükkânından, gerçeğinin birebir kopyası.' },
  };
  for (const k in D) D[k].id = k;

  const QUALITY = [
    { name: 'Hasarlı', mult: 0.6, stars: 0 },
    { name: 'Normal', mult: 1.0, stars: 1 },
    { name: 'İyi', mult: 1.25, stars: 2 },
    { name: 'Mükemmel', mult: 1.5, stars: 3 },
  ];

  AK.Items = {
    D, QUALITY,
    get(id) { return D[id] || AK.Artifacts.byId[id] || null; },
    isArtifact(st) { const d = st && AK.Items.get(st.id); return !!(d && d.type === 'artifact'); },
    stackable(id) { const d = AK.Items.get(id); return d && (d.type === 'res' || d.type === 'food' || d.type === 'gift'); },
    name(st) {
      const d = AK.Items.get(st.id);
      if (!d) return '?';
      if (d.type === 'artifact') return (st.d ? 'Kirli ' : '') + d.name;
      if (d.type === 'tool') return AK.Items.toolName(d.tool);
      return d.name;
    },
    toolName(t) {
      const lv = AK.state.tools[t] || 1;
      const pre = ['', 'Paslı', 'Bakır', 'Çelik', 'Antik'][lv] || '';
      return (t === 'detector' ? ['', 'Basit', 'Hassas', 'Usta', 'Antik'][lv] : pre) + ' ' + D[t].name;
    },
    // satış değeri (dükkân taban fiyatı)
    value(st) {
      const d = AK.Items.get(st.id);
      if (!d) return 0;
      if (d.type === 'artifact') {
        if (d.noSell) return 0;
        if (st.d) return Math.round(d.value * 0.3);
        return Math.round(d.value * QUALITY[st.q != null ? st.q : 1].mult * (st.r ? 1.2 : 1));
      }
      return d.value || 0;
    },
    make(id, n) {
      const d = AK.Items.get(id);
      if (d && d.type === 'artifact') return { id, d: 1, q: 1, r: 0 };
      return { id, n: n || 1 };
    },
  };
})();
