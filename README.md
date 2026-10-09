# 🏺 Arkeoloji Kasabası

2D pixel-art, yukarıdan bakışlı, sakin bir **yaşam + keşif + arkeoloji + dükkân işletme + müze** oyunu. Tarayıcıda çalışır; kurulum gerektirmez.

**▶ Hemen oyna:** https://efebalci569-dot.github.io/arkeoloji-kasabasi/

## Nasıl oynanır?

`index.html` dosyasına çift tıkla (Chrome / Edge / Firefox). İnternet varsa piksel yazı tipleri de yüklenir, yoksa yedek yazı tipi kullanılır.

> Tüm grafikler, müzik ve ses efektleri **kodla üretilir** — harici görsel ya da ses dosyası yoktur.

### Kontroller

| Tuş | İşlev |
|---|---|
| WASD / Ok tuşları | Yürü (Shift: koş) |
| E / F / sağ tık | Konuş, etkileşime geç, otur / kalk |
| Boşluk / C / sol tık | Seçili aleti kullan, yemek ye |
| 1–0 / fare tekerleği | Hızlı erişim çubuğundan seç |
| I / Tab | Çanta |
| J | Görev defteri |
| K | Keşif (koleksiyon) defteri |
| R | İlişkiler (kalpler, sevgili, sevdikleri) |
| Esc | Menü (ses, kaydet, kontroller) |

### Temel döngü

**Keşfet → Kaz → Eser bul → Temizle → Sat ya da Bağışla → Para kazan → Ekipman/Dükkân geliştir → Yeni bölge aç**

## İçerik (Sürüm 1.3)

- **Bölgeler:** Nehirli ve limanlı kasaba (belediye, saat kulesi, postane, kütüphane, demirci, restoran, mağaza, liman deposu, evler, bahçe, park), oyuncunun evi, arkeoloji dükkânı, 3 salonlu müze, Eski Orman Kazı Alanı, Küçük Mağara (Bakır Kazma ile açılır), Çöl Harabeleri (Keşif Ruhsatı ile otobüsle gidilir).
- **38 eser:** her birinin adı, nadirliği (COMMON → LEGENDARY), değeri, bölgesi, dönemi, açıklaması, araştırma bilgisi ve müze kategorisi var. Bazıları mevsime ya da havaya özel.
- **Aletler:** Kürek, Kazma, Çekiç, Fırça, Dedektör — her biri 4 seviye (Paslı → Bakır → Çelik → Antik).
- **Eser temizleme mini oyunu:** fırça + keski, kırılgan çatlaklar, 4 kalite seviyesi.
- **Dükkân:** 4 seviye, fiyat etiketleri, 5 müşteri tipi (Turist, Koleksiyoncu, Akademisyen, Zengin Koleksiyoncu, Gizemli Müşteri), sadık müşteriler ve sipariş panosu.
- **Müze:** bağışlanan her eser kendi vitrininde fiziksel olarak sergilenir; 10 ve 20 bağışta yeni salonlar açılır.
- **Her binanın içi var:** Kütüphane, demirhane, mağaza, restoran, belediye, postane, liman deposu, pansiyon ve evler (Nermin, Defne, Hatice Teyze) — her biri kendi açılış saatlerinde girilebilir. NPC'ler tezgâh arkasında çalışır, akşamları restoranda oturup yemek yer, gece evlerine döner.
- **Oturma:** Sandalye, bank, koltuk ve kanepelere oturup kalkabilirsin (E). Oturmak seni yavaşça dinlendirir; otururken Boşluk ile yiyip içebilirsin.
- **Doğu Mahallesi (1.3):** Nehrin doğusunda yeni bir mahalle: Fener Bar, Zeynep'in Çiçekçisi, çiçek bahçesi, mahalle çeşmesi ve 6 yeni ev (her birinin içi var).
- **8 yeni kasabalı:** Can (barmen), Zeynep (çiçekçi), Emre (balıkçı, iskelede olta atar), Elif (ressam, gölün yanında resim yapar), Barış (müzisyen; meydanda ve çarşamba/cuma/cumartesi gecesi bar sahnesinde çalar), Ayşe & Oğuz (evli çift; Oğuz otobüs şoförü) ve Kaptan Bekir (emekli denizci). Hepsinin günlük programı, hediye zevkleri, sohbetleri ve kalp olayları var.
- **Fener Bar:** Her akşam 16:00–02:00. İçecekler (ayran, şalgam, limonata, boza, bira, şarap, rakı, gizli Fener Kokteyli) ve mezeler (çerez, haydari, ezme, peynir-kavun, midye, kalamar, ızgara balık, karışık meze tabağı). Müzik kutusu, dart, sahne. Alkol çakırkeyif yapar (yalpalayan yürüyüş, sallanan kamera); Can günde en fazla 3 alkollü içki verir, uyuyunca geçer.
- **İlişkiler & kalp sistemi:** Her kasabalının 10 kalbi var. Konuşmak, sevdiği hediyeler, barda/restoranda **ısmarlamak**, yanında oturup **birlikte yemek**, buluşmalar kalpleri doldurur. Konuşma kutusunda ve **R** menüsünde kalpler görünür.
- **Sevgili olmak:** Lale, Defne, Kaya, Can, Zeynep, Emre, Elif ve Barış ile sevgili olabilirsin. Kalbi tamamen dolunca (10 kalp) çiçekçiden alacağın **Gül Buketi** ile duygularını aç. Sevgilinle sarılabilir (enerji), akşam Fener Bar'daki mumlu masada **randevuya** çıkabilir, ondan mektup ve hediye alabilirsin. Arkadaşlarını (3+ kalp) da barda buluşmaya çağırabilirsin — ama gitmezsen kırılırlar!
- **Yasal & yasa dışı satış:** Belediye'deki *Kültür Varlıkları Ofisi* eserleri belgeli ve sabit fiyatla alır (dürüstlük puanı, güvenilir kâşif bonusu). Geceleri liman deposunda bekleyen karaborsacı *Gölge* çok daha fazla öder — ama her satış **şüphe** biriktirir: jandarma devriyesine yakalanabilir ya da sabah *Müfettiş Kemal*'in baskınıyla para cezası yiyip eserlerine el konulabilir.
- **Kasaba gelişimi:** Unutulmuş Kasaba → Ünlü Arkeoloji Merkezi (çeşme, bayraklar, turistler, pansiyon, hediyelik eşya standı, heykel).
- **13 kasabalı:** Nermin (küratör), Kaya (demirci), Lale (restoran), Rıza Usta (genel mağaza), Defne (kütüphaneci) ve Doğu Mahallesi'nin 8 sakini — günlük programlar, arkadaşlık kalpleri, hediye tercihleri, kalp olayları ve yan görevler.
- **Ana hikâye:** Üç tablet → mühürlü kapı → Kayıp Şehir haritası (2/4 parça). Hikâye bittikten sonra oyun serbestçe sürer.
- **Mevsimler & hava:** 4 mevsim (14'er gün); güneşli, bulutlu, yağmur (toprak yumuşar), fırtına (kazı kapalı), kar (gizli kalıntılar), sis (gizli koru açılır).
- **Etkinlikler:** Hazine Avı, Müze Gecesi, Gece Kazısı, Antik Kostüm Günü, Büyük Arkeoloji Festivali.
- **Kayıt:** tarayıcıda otomatik (uyurken, bölge değiştirirken ve her dakika).

## Kod yapısı

```
js/core        yardımcılar, giriş
js/gfx         piksel çizim, karolar, nesne/bina/karakter/ikon üreticileri
js/world       dünya motoru, kasaba, iç mekânlar, kasaba gelişimi & etkinlikler
js/player      oyuncu
js/inventory   envanter
js/items       eşyalar
js/artifacts   eser veritabanı
js/excavation  kazı, ganimet, kazı alanları, temizleme mini oyunu
js/shop        dükkân, müşteriler
js/museum      müze
js/npcs        NPC'ler, ilişkiler & sevgililik (romance.js)
js/dialogue    diyalog kutusu ve metinler
js/quests      görevler
js/weather     hava
js/seasons     zaman ve takvim
js/save        kayıt
js/ui          arayüz, menüler, hizmetler, başlık ekranı
js/audio       prosedürel müzik ve sesler
```

Yeni eser eklemek için `js/artifacts/artifacts.js` listesine bir satır eklemek yeterli; koleksiyon defteri, ganimet tabloları ve siparişler otomatik güncellenir. Müzede sergilenmesi için `js/world/interiors.js` içindeki ilgili salonun `slots` listesine bir kaide konumu ekle.
