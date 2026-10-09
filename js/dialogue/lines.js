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
    can: () => ['Hoş geldin! Ben Can, Fener Bar benim. Daha doğrusu babamındı, şimdi benim.', 'Akşam dörtten gece ikiye kadar açığız. İçki, meze, müzik... Bir de iyi sohbet. Yorgun kâşiflere ilk ayran benden!'],
    zeynep: () => ['Oo, yeni bir yüz! Ben Zeynep, çiçekçi. Şu pembe tabelalı dükkân benim.', 'Biliyor musun, her çiçeğin bir anlamı var. Papatya dostluk, sümbül sadakat... Kırmızı gül ise... neyse, sen anlarsın.'],
    emre: () => ['Selam. Emre ben. Balıkçıyım.', 'Sabahları iskelede, akşamları Fener Bar\'da bulursun beni. Nehir bana her gün bir hikâye anlatır... sen de toprağı dinliyormuşsun, duydum.'],
    elif: () => ['Bir dakika... kıpırdama! Işık tam yüzüne vuruyor. Tamam, kaydettim.', 'Ben Elif, ressamım. "Bir yaz için" geldim, üç yıldır buradayım. Bu kasabanın ışığı başka.', 'Kazdığın eserlerin renklerini görmek isterim. Eski boyalar... bir ressam için hazine.'],
    baris: () => ['Hey! Bir şarkı ister misin? Yok yok, şaka. Ama istersen çalarım.', 'Ben Barış. On iki şehir gezdim, burada durdum. Gündüz meydanda, çarşamba-cuma-cumartesi geceleri Fener Bar sahnesindeyim.'],
    ayse: () => ['Hoş geldin canım! Ben Ayşe, Doğu Mahallesi\'nde otururuz. Kocam Oğuz otobüsü sürer.', 'Bir şeye ihtiyacın olursa çekinme. Bu mahallede kimse aç kalmaz, kimse yalnız kalmaz!'],
    oguz: () => ['Merhaba hemşerim! Oğuz. Şehir otobüsünü yirmi yıldır ben sürerim.', 'Uzak kazılara gideceksen bilet durakta. Yolda sana bütün kasabanın dedikodusunu anlatırım, bedava!'],
    bekir: () => ['Ahoy, genç kâşif! Kaptan Bekir. Kırk yıl yedi denizde gezdim.', 'Senin toprağın altını kazman gibi biz de denizin dibini merak ederdik. Bir gün sana batık gemilerden bahsederim...'],
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
  Object.assign(GREET, {
    can: [
      ['Ne içersin? Ayran mı, şalgam mı? Yoksa... merak ettiğin başka bir şey mi?', 'Bar akşam dörtte açılıyor. Erken gelen iyi masayı kapar.', 'Bugün mezeler taze. Emre sabah kalamar getirdi.'],
      ['Kasabanın bütün sırları bu tezgâhtan geçer, bilirsin.', 'Barış bu akşam çalıyor mu? Takvime bakmam lazım, unuttum.'],
      ['{ad}! Sana özel bir kokteyl deniyorum, adı daha belli değil.', 'Bazen kapanıştan sonra iskelede oturup yıldızlara bakıyorum. Sessizlik iyi geliyor.'],
      ['Bar kalabalıkken bile seni gördüğümde içim rahatlıyor. Garip, değil mi?'],
    ],
    zeynep: [
      ['Günaydın! Bugün güller açtı, görmen lazım!', 'Bahçemdeki lalelere dokunma ama, söz mü?', 'Çiçekler de insanlar gibi: biraz ilgi, biraz güneş.'],
      ['Kazıdan dönerken bahçemin önünden geç, bir dal fesleğen veririm.', 'Sümbül sadakat demektir. Bunu bilen pek yok.'],
      ['{ad}, sana bir sır: bahçenin köşesine adını verdiğim bir gül fidanı diktim.', 'Bazen çiçeklerle konuşuyorum. Bazen de seninle konuşmayı hayal ediyorum... yani, ş-şey, sohbet etmeyi!'],
      ['Sen gelince bahçe bile daha renkli görünüyor. Ciddiyim.'],
    ],
    emre: [
      ['Selam.', 'Balık bugün naz yapıyor.', 'Sabahın beşinde iskeledeydim. Nehir sisliydi, harikaydı.'],
      ['Ağıma eski bir çömlek takıldı geçen gün. Senin işin bunlar, değil mi?', 'Akşam barda ol, Bekir Dede yine fırtına hikâyesi anlatacak.'],
      ['{ad}! Bugün ilk tuttuğum balığı sana ayırdım. Lale pişirsin.', 'Babam derdi ki: "Sabırsız balıkçı aç yatar." Sanırım kazı için de geçerli.'],
      ['Seninle iskelede oturmak... nehri bile daha güzel yapıyor.'],
    ],
    elif: [
      ['Ah, sen! Işığa bak, öğleden sonra her şey altın rengi.', 'Göl resmi bir türlü bitmiyor. Su her saat başka renk.', 'Fırçalarım nerede... ah, saçımda.'],
      ['Müzedeki o mavi vazonun rengi... Bin yıl önce o maviyi nasıl elde ettiler?', 'Kazı alanını resmetmek istiyorum. Seni de çizerim, kazarken.'],
      ['{ad}, bir eskizini çizdim. Hayır, gösteremem, daha bitmedi!', 'Eski İstanbul\'daki atölyemi hiç özlemiyorum. Burada kalbim hafif.'],
      ['Bir gün en güzel tablomu yapacağım. İçinde sen olacaksın.'],
    ],
    baris: [
      ['Bir şarkı, bir sohbet, bir çay. Hayat bu kadar basit!', 'Meydanda çalarken turistler para atıyor. Ben de onunla simit alıyorum, hah!', 'Gitarımın teli koptu dün, Kaya tamir etti. Demirci ama ince işten anlıyor.'],
      ['Sana bir şarkı yazıyorum. "Toprağın Altındaki Şehir." Nasıl?', 'Çarşamba, cuma, cumartesi geceleri sahnedeyim. Gel, ön masa senin.'],
      ['{ad}, on iki şehir gezdim ama hiçbirinde senin gibi birine rastlamadım.', 'Bazen şarkıların sözleri kendiliğinden geliyor. Son zamanlarda hep aynı kişiyi anlatıyorlar...'],
      ['Sahnedeyken seni kalabalıkta arıyorum. Gördüğümde şarkı kendiliğinden güzelleşiyor.'],
    ],
    ayse: [
      ['Günaydın canım! Kahvaltı ettin mi? Etmediysen gel!', 'Deniz gece hiç uyumadı, gözlerim kan çanağı.', 'Oğuz yine otobüsü yıkamaya gitti, o otobüsü benden çok seviyor!'],
      ['Mahallenin çocukları seni "toprak kâşifi" diye çağırıyor, biliyor musun?', 'Hatice Teyze\'yle börek yarışmasına gireceğiz, sen jüri ol!'],
      ['Sen bu kasabaya gelince her şey canlandı. Herkes öyle diyor.', 'Deniz büyüyünce arkeolog olacakmış! Daha konuşamıyor ama ben öyle hissediyorum.'],
      ['Sen artık bu ailenin bir parçasısın. Kapımız her zaman açık.'],
    ],
    oguz: [
      ['Hemşerim! Bugün otobüs tıkır tıkır.', 'Şehirde trafik berbat, bizim kasaba cennet.', 'Ayşe\'ye çiçek alacaktım, Zeynep\'in dükkânı kapalıydı. Yarın!'],
      ['Yolcular hep senin müzeden bahsediyor. Reklamını ben yapıyorum!', 'Yirmi yıl, tek bir kaza yok. Bekir Dede bana "karadaki kaptan" der.'],
      ['Sen olmasan bu otobüs bomboş giderdi. Şimdi her sefer dolu!', 'Deniz ilk kelimesini söyledi: "Otobüs!" Ayşe hâlâ küs bana.'],
      ['Dost dediğin yolda belli olur. Sen iyi bir yol arkadaşısın.'],
    ],
    bekir: [
      ['Ahoy! Rüzgâr batıdan, yağmur yakın. Kemiklerim söylüyor.', 'Bir zamanlar Ümit Burnu\'nu dönerken...', 'Denizci her limanda bir dost bırakır. Ben de burada kaldım.'],
      ['Gençken bir batıkta altın sikke bulmuştuk. Hepsini barda harcadık, hah!', 'Haritaları severim. Senin amcanın da güzel bir haritası vardı, bilir misin?'],
      ['{ad}, sana kırk yıllık denizcilikten bir öğüt: Pusulana güven, ama gözlerine daha çok.', 'Karım öleli on yıl oldu. O da çiçekleri severdi, Zeynep gibi.'],
      ['Sen olmasan bu yaşlı denizci hikâyelerini kime anlatırdı? Sağ ol evlat.'],
    ],
  });
  const CHAT = {
    nermin: ['Müzenin üç salonu var: Ana Salon, Doğu Kanadı ve Hazine Salonu. 10 bağışta Doğu Kanadı\'nı, 20 bağışta Hazine Salonu\'nu açabiliriz.', 'Kirli eserleri dükkânındaki temizleme masasında temizle. Temiz bir eser hem daha değerli hem müzeye layık.', 'Yağmurlu günlerde toprak yumuşar, yeni izler ortaya çıkar. Kazı için harika!', 'Sisli günlerde ormanın güneybatısında tuhaf bir şey olurmuş. Amcan "taşlar fısıldıyor" derdi.'],
    kaya: ['Kazma Seviye 2 olunca mağaranın girişindeki kayaları kırabilirsin.', 'Sert topraklı hendek için çelik kürek gerekir. Malzemeyi getir, gerisini ben hallederim.', 'Eski metal getir. Eritir, aletine katarım.', 'Mağara karanlık. Benden iyi bir fener almadan derine inme.'],
    lale: ['Enerjin bitince yürüyüşün yavaşlar. Yemek ye, kendine iyi bak!', 'Gece 2\'ye kadar dışarıda kalırsan bayılırsın, sonra seni evine taşırlar. Başına gelmesin!', 'Restoran akşamları dolar. Herkes buraya gelir, sen de gel!', 'Kil getirirsen fırınımı tamir edebilirim!'],
    riza: ['Dükkânını büyütürsen daha çok sergi masası olur, daha çok müşteri gelir.', 'Kaynakları bana satabilirsin: taş, kil, metal... Hepsi bir işe yarar.', 'Dedektör alırsan toprağın altındaki gizli eserleri duyarsın. Bip, bip, bip!', 'Evine vitrin koy, bulduğun nadir eserleri sergile. Sabahları uyanınca insanın içi açılır.'],
    can: ['Alkollü içkilerden günde üçten fazla vermem, kusura bakma. Burası kazı alanı değil, sağlık her şeyden önce!', 'Barda birine bir içki ısmarlarsan arkadaşlığınız ilerler. Herkesin sevdiği içki farklı ama.', 'Meze tabağı paylaşmak içindir. Biriyle aynı masada otururken yersen ikiniz de keyiflenirsiniz.', 'Barış\'ın sahne geceleri çarşamba, cuma ve cumartesi. O gecelerde bar dolup taşar.'],
    zeynep: ['Gül Buketi sıradan bir hediye değildir. Kalbi tamamen dolu birine verirsen... duygularını anlar.', 'Bahçem çeşmenin kuzeyinde. Dükkân kapalıysa bahçede beni bulabilirsin.', 'Papatyayı herkes sever. Ama Barış sevmez, ona hep allerji yapıyor!', 'Bekir Dede\'nin karısı çiçek severmiş. Her hafta mezarına sümbül götürüyorum.'],
    emre: ['Yağmurlu günlerde balık iyi tutar ama ben öğlene doğru eve dönerim. Islak ip insanı üşütür.', 'Nehrin dibinde eski bir köprünün kalıntıları var. Belki senin işine yarar bir şey vardır.', 'Kalamarı Can\'a satıyorum, o da tavada harika yapıyor. Barda dene.', 'Bekir Dede bana ağ örmeyi öğretti. O olmasa balıkçı olamazdım.'],
    elif: ['Müzenin Ana Salonu\'nda öğleden sonraları eskiz yapıyorum. Eserler en güzel o ışıkta görünüyor.', 'Göletin yanındaki tuvalimi gördün mü? Her gün biraz daha ekliyorum.', 'Renklerin de bir tarihi var. Eski çömlekçiler kırmızıyı topraktan, maviyi taştan yaparmış.', 'Cuma ve cumartesi akşamları barda olurum. Barış\'ı çizmeye çalışıyorum ama hiç durmuyor!'],
    baris: ['Meydanda çaldığımda yanıma gelip dinlersen seviniyorum, söylemedim deme.', 'Ayran içemem, çocukluk travması. Sorma.', 'Her şehirde bir şarkı bıraktım. Bu kasabada ise kalmaya karar verdim. Neden acaba?', 'Kokteyl severim, özellikle Can\'ın Fener Kokteyli. Ama tarifini kimseye vermiyor.'],
    ayse: ['Oğuz cuma akşamları Emre\'yle barda maç izler. Ben de o akşam Hatice Teyze\'ye giderim, kızlar gecesi!', 'Mahalle çeşmesinin suyu buz gibi. Yazın çocuklar başından ayrılmaz.', 'Börek, çikolata, sümbül... Beni mutlu etmek kolay canım!'],
    oguz: ['Otobüs sabah 7:30\'dan akşam 5:30\'a kadar duraktadır. Ben de yanında.', 'Bir gün otobüsü emekli edeceğim, sonra Emre\'yle balığa çıkacağım.', 'Ayşe ile bu barda tanıştık biliyor musun? Can\'ın babası bize ilk çayımızı ısmarlamıştı.'],
    bekir: ['Pusulamı hâlâ saklıyorum. Bir gün sana gösteririm.', 'Rakı yavaş içilir, evlat. Mezeyle, sohbetle. Acele eden sarhoş olur, sabreden keyif.', 'Eski gemimin çıpası evimin önünde. Her sabah ona selam veririm.', 'Can\'ın babası iyi adamdı. Barı ona emanet etmesi doğru karardı.'],
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
    can: { love: 'Vay be! Bunu tezgâhın en güzel yerine koyacağım.', hate: 'Bunu... barın arkasına mı atsam?' },
    zeynep: { love: 'Aaa! Bu çok güzel! Saksıların arasına koyacağım, her sabah göreyim!', hate: 'Rakı mı? Ben içmem ki... yine de sağ ol.' },
    emre: { love: 'Hah! Bunu nereden buldun? Harika, sağ ol.', hate: 'Kil mi? Ağlarıma çamur bulaşır...' },
    elif: { love: 'Şu renklere bak! Bunu kesinlikle resmedeceğim!', hate: 'Taş... gri... ilham verici değil.' },
    baris: { love: 'Bu bir şarkıya bedel! Hayır, bir albüme!', hate: 'Ayran mı? Hayııır! Neden?!' },
    ayse: { love: 'Ay canım, ne düşüncelisin! Deniz de çok sevecek!' },
    oguz: { love: 'Hah! İşte bu! Ayşe\'ye de göstereceğim!' },
    bekir: { love: 'Hah! Bu yaşlı denizcinin kalbini fethettin evlat!', hate: 'Papatya... karım papatyaları severdi. Bakmak istemiyorum, kusura bakma.' },
  };

  const TIPSY = {
    _: ['Senin yanakların biraz pembe mi, {ad}? Barda mıydın yoksa?', 'Hmm, biraz çakırkeyif gibisin. Su iç, iyi gelir!', 'Yürürken biraz yalpalıyorsun, farkında mısın?'],
    can: ['Sana bu gecelik ayran koyuyorum, itiraz istemem!', 'Gülümsemen yüzüne yayılmış. Benim kokteyl mi yaptı bunu?'],
    nermin: ['{ad}! Sen... içtin mi? Amcan da festivallerde böyle olurdu, hah.'],
    defne: ['A-ah, sen biraz... neşeli görünüyorsun bugün. Hıhı.'],
    kaya: ['Hm. Bu halde örse yaklaşma.'],
    bekir: ['Hah! Denizde böyle sallanırdık! Ama karada sallanmak ayıp evlat, otur biraz.'],
    ayse: ['Ay canım, sen çakırkeyifsin! Gel bir çorba içir sana.'],
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

  Object.assign(HEART_EVENTS, {
    can: [
      { h: 2, lines: ['Hey {ad}, gel bir dakika. Senin için bir kural koydum:', 'Her gün ilk ayranın ya da limonatan benden. Kâşiflere destek!', '(Fener Bar\'da her gün bir ücretsiz alkolsüz içecek alabilirsin.)'], fn: () => { AK.state.flags.canFree = true; } },
      { h: 4, lines: ['Sana bir şey göstereceğim. Kimseye söyleme...', 'Nar, nane, biraz bal ve bir tutam sır: Fener Kokteyli! Menüye ekledim, ama tarifini sadece sen biliyorsun.', '(Bar menüsüne Fener Kokteyli eklendi.)'], fn: () => { AK.state.flags.kokteyl = true; } },
      { h: 6, lines: ['Babamın tezgâhın altında sakladığı bir şey buldum. Eski bir şişe.', 'Babam onu dedesinden kalma derdi. Bence senin müzene yakışır.'], fn: () => AK.Exc.giveArtifact('cam_sise', AK.Player.x, AK.Player.y - 16) },
      { h: 8, lines: ['{ad}... kapanıştan sonra iskeleye gidiyorum, biliyorsun.', 'Dün gece yıldızlara bakarken aklıma sen geldin. Garip, değil mi?', 'Neyse! Unut gitsin. Bir şey içer misin?'], fn: () => AK.UI.toast('Can sana karşı bir şeyler hissediyor gibi... Kalbi tamamen dolunca Gül Buketi ile duygularını açabilirsin.', 'heart') },
    ],
    zeynep: [
      { h: 2, lines: ['Al bunlar senin! Bahçemden, sabah topladım.', 'Bir de... dükkânımdaki her şey sana %20 indirimli. Dost fiyatı!', '(2 Papatya Demeti aldın. Çiçekçide %20 indirim!)'], fn: () => { AK.state.flags.zeynepDisc = true; AK.Inv.add({ id: 'papatya', n: 2 }); } },
      { h: 4, lines: ['Çiçekler havayı benden iyi bilir. Sabahları yapraklarına bakıp yarını tahmin ederim.', 'Artık her konuştuğumuzda sana yarının havasını söyleyeceğim. Kazı planların için!', '(Zeynep artık yarının havasını söylüyor.)'], fn: () => { AK.state.flags.zeynepForecast = true; } },
      { h: 6, lines: ['Ihlamur, papatya ve biraz bal. Annemin çay tarifi. Yorgunluğu alır, söz.', 'Kazıya gitmeden önce iç, bütün gün dinç kalırsın.', '(Maksimum enerjin +15 arttı!)'], fn: () => { AK.state.player.maxEnergy += 15; } },
      { h: 8, lines: ['{ad}, bahçemdeki gül fidanı ilk çiçeğini açtı. Hani sana adını verdiğim?', 'Kırmızı. Hem de koyu kırmızı.', 'Kırmızı gülün ne demek olduğunu biliyorsun, değil mi? Yani... ş-şey, bir bilgi olarak söyledim!'], fn: () => AK.UI.toast('Zeynep sana karşı bir şeyler hissediyor gibi... Kalbi tamamen dolunca Gül Buketi ile duygularını açabilirsin.', 'heart') },
    ],
    emre: [
      { h: 2, lines: ['Al. Bugünün en iyi iki balığı. Lale\'ye götür, ızgara yapsın. Ya da kendin ye.', '(2 Izgara Balık aldın.)'], fn: () => AK.Inv.add({ id: 'balik', n: 2 }) },
      { h: 4, lines: ['Ağıma tuhaf bir şey takıldı. Yeşil, paslı... bilezik mi bu?', 'Benim işime yaramaz. Sen temizle, müzeye koy.'], fn: () => AK.Exc.giveArtifact('tunc_bilezik', AK.Player.x, AK.Player.y - 16) },
      { h: 6, lines: ['Can\'la konuştum. Barda balık ve kalamar sana %30 indirimli. Benim tuttuklarım zaten.', '(Fener Bar\'da balık ve kalamar %30 indirimli.)'], fn: () => { AK.state.flags.emreFish = true; } },
      { h: 8, lines: ['Sabah iskelede güneş doğarken... hep yanımda biri olsun isterdim.', 'Son zamanlarda o "biri"nin yüzü belli oldu sanki.', '...Balık kaçtı. Neyse.'], fn: () => AK.UI.toast('Emre sana karşı bir şeyler hissediyor gibi... Kalbi tamamen dolunca Gül Buketi ile duygularını açabilirsin.', 'heart') },
    ],
    elif: [
      { h: 2, lines: ['Sana kartpostallar boyadım! Kasabanın üç köşesi: meydan, göl, iskele.', 'Dilediğine hediye et. İmzalı, değerli, hah!', '(3 Kartpostal aldın.)'], fn: () => AK.Inv.add({ id: 'kart', n: 3 }) },
      { h: 4, lines: ['Dükkânın duvarına küçük bir tablomu astım. Gölün sabah hali.', 'Müşteriler bayılıyor, eserlerine daha çok para veriyorlarmış!', '(Dükkânındaki satışlar %5 daha değerli.)'], fn: () => { AK.state.flags.elifArt = true; } },
      { h: 6, lines: ['Eski boyalar üzerine bir kitap buldum. Bak, şu eserin mavisi lapis lazuliden!', 'Al, bu benim en sevdiğim replika vazo. Müzenin dükkânından aldım ama sende daha güzel durur.'], fn: () => AK.Inv.add({ id: 'replika', n: 1 }) },
      { h: 8, lines: ['{ad}, sana bir şey itiraf edeceğim: o eskiz... seni çiziyordum.', 'Yirmi kere çizdim. Hiçbiri yeterince güzel olmadı.', 'Belki de bazı şeyler resme sığmıyordur.'], fn: () => AK.UI.toast('Elif sana karşı bir şeyler hissediyor gibi... Kalbi tamamen dolunca Gül Buketi ile duygularını açabilirsin.', 'heart') },
    ],
    baris: [
      { h: 2, lines: ['Sana yazdığım şarkının ilk kıtası hazır! Dinle:', '"Toprağı dinler, sabahları erken kalkar / Fırçası elinde, kalbi bir kâşif..."', 'Daha bitmedi. Ama bitince ilk sen dinleyeceksin.'], fn: () => AK.Inv.add({ id: 'kart', n: 1 }) },
      { h: 4, lines: ['Bu hafta meydanda çok para topladım. Yarısı senin, ilham perisi payı!', '(250 altın aldın.)'], fn: () => AK.Game.addMoney(250, 'Hediye') },
      { h: 6, lines: ['Dün gece sahnede senin şarkını çaldım. Bütün bar ayakta alkışladı!', 'Kasabada herkes artık senden bahsediyor.', '(Herkesle arkadaşlığın biraz arttı.)'], fn: () => { for (const d of DEFS_IDS()) if (AK.NPCs.st(d).met) AK.NPCs.addFr(d, 20); } },
      { h: 8, lines: ['On iki şehir... hep bir sonraki şehre gitmek için yaşadım.', 'Ama şimdi... gitmek istemiyorum. Nedenini sen biliyorsun bence.'], fn: () => AK.UI.toast('Barış sana karşı bir şeyler hissediyor gibi... Kalbi tamamen dolunca Gül Buketi ile duygularını açabilirsin.', 'heart') },
    ],
    ayse: [
      { h: 2, lines: ['Al canım, sıcak sıcak börek! Hatice Teyze\'nin tarifi ama benimki daha çıtır, ona söyleme!', '(2 Su Böreği aldın.)'], fn: () => AK.Inv.add({ id: 'borek', n: 2 }) },
      { h: 4, lines: ['Deniz senin için bir resim çizdi! Yani... karaladı. Ama sen olduğunu söylüyor!', 'Bir de bu çikolatalar senin. Oğuz şehirden getirdi.'], fn: () => AK.Inv.add({ id: 'cikolata', n: 1 }) },
      { h: 6, lines: ['Mahalle toplantısında karar aldık: Doğu Mahallesi\'nin fahri hemşerisisin artık!', 'Al, bu küçük sümbül de mahallenin hediyesi.'], fn: () => AK.Inv.add({ id: 'sumbul', n: 1 }) },
    ],
    oguz: [
      { h: 2, lines: ['Hemşerim, bundan sonra otobüs biletin yarı fiyat. Şoför ikramı!', '(Otobüs bileti artık 75 altın.)'], fn: () => { AK.state.flags.oguzBus = true; } },
      { h: 4, lines: ['Şehirden sana kahve getirdim. Has Türk kahvesi, köpüklü olsun!', '(3 Türk Kahvesi aldın.)'], fn: () => AK.Inv.add({ id: 'kahve', n: 3 }) },
      { h: 6, lines: ['Bundan sonra otobüsüme bedava binersin. Sen bu kasabanın yüz akısın!', '(Otobüs yolculukları artık ücretsiz.)'], fn: () => { AK.state.flags.oguzFree = true; } },
    ],
    bekir: [
      { h: 2, lines: ['Otur evlat, bir hikâye anlatayım. 1974, Kızıldeniz. Bir gece pusula durdu...', '...ve sabah olduğunda kendimizi bambaşka bir koyda bulduk! Hah! Al, bu çay da benden.'], fn: () => AK.Inv.add({ id: 'cay', n: 2 }) },
      { h: 4, lines: ['Bunu Ege\'de bir dalgıç dostum çıkarmıştı. Kehribarın içinde minicik bir böcek.', 'Benim yaşımda bunlar çekmecede kalır. Sen müzene koy.'], fn: () => AK.Exc.giveArtifact('kehribar', AK.Player.x, AK.Player.y - 16) },
      { h: 6, lines: ['Al, kırk yıllık pusulam. Gerçek bir denizcinin pusulası.', 'Dedektörüne bağlarsan, toprağın altındakileri daha uzaktan duyarsın. İnan bana.', '(Dedektör menzilin arttı!)'], fn: () => { AK.state.flags.bekirCompass = true; } },
    ],
  });
  const DEFS_IDS = () => AK.NPCs.DEFS.map(d => d.id);

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
      if (id === 'zeynep' && AK.state.flags.zeynepForecast) { const tw = AK.Weather.info(AK.Weather.tomorrow()); return L.fill(U.pick(pool) + (tw ? ` Bu arada yapraklar söylüyor: yarın hava ${tw.name.toLowerCase()} olacak.` : '')); }
      const tp = AK.state.player.tipsy || 0;
      if (tp > 60 && Math.random() < 0.55) return L.fill(U.pick(TIPSY[id] || TIPSY._));
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
    HEART_EVENTS, TIPSY,
  };
})();
