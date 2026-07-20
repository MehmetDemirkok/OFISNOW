Sen deneyimli bir full-stack mobil uygulama geliştiricisisin. Aşağıdaki gereksinimlere göre production-ready, sade, hızlı ve kullanıcı dostu bir mobil sipariş uygulaması geliştir.

# PROJENİN AMACI

Şirket içerisinde çalışanların telefonla garsonlara sipariş vermesi yerine, mobil uygulama üzerinden hızlı ve net bir şekilde sipariş oluşturmasını sağlayan bir sistem geliştirilecek.

Şu anki temel problemler:

* Telefonla verilen siparişler yanlış anlaşılabiliyor.
* Garsonlara telefonla ulaşmak zor olabiliyor.
* Sipariş detayları karışabiliyor.
* Garsonlar aynı anda farklı siparişlerle ilgileniyor.
* Siparişlerin kim tarafından görüldüğü belli olmayabiliyor.

Uygulamanın amacı çalışanların sipariş vermesini mümkün olduğunca kolaylaştırmak ve garsonların siparişleri anında, net ve eksiksiz şekilde almasını sağlamaktır.

Uygulama iOS ve Android cihazlarda çalışmalıdır.

---

# EN ÖNEMLİ TASARIM FELSEFESİ

Bu uygulama klasik ve karmaşık bir restoran sipariş sistemi gibi tasarlanmamalıdır.

Kullanıcıyı:

* Gereksiz formlarla,
* Çok fazla ekranla,
* Karmaşık sipariş durumlarıyla,
* Gereksiz onaylarla,
* Uzun menülerle

yormamalıdır.

Temel hedef:

ÇALIŞAN:

Uygulamayı açar
↓
Ürünü seçer
↓
Gerekirse detay ekler
↓
Siparişi gönderir

GARSON:

Anında özel bildirim alır
↓
Siparişi görür
↓
"Gördüm" butonuna basar
↓
Siparişi hazırlar ve teslim eder

Sistem mümkün olduğunca hızlı ve pratik olmalıdır.

---

# TEKNOLOJİLER

Mobil uygulama:

* React Native
* Expo
* TypeScript
* Expo Router

Backend:

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Realtime
* Supabase Edge Functions

Bildirimler:

* Expo Notifications
* Expo Push Notifications
* Supabase Database Webhooks veya güvenilir server-side event mekanizması

---

# KULLANICI ROLLERİ

## 1. ÇALIŞAN

Çalışan:

* Uygulamaya giriş yapar.
* Ürünleri görür.
* Sipariş oluşturur.
* Aktif siparişini görebilir.
* Geçmiş siparişlerini görebilir.

Çalışan sipariş oluşturduktan sonra sipariş durumu ile sürekli ilgilenmek zorunda kalmamalıdır.

Çalışanın temel amacı sadece hızlı ve doğru sipariş vermektir.

---

## 2. GARSON

Toplam 3 garson bulunmaktadır.

Üç garsonun da yeni siparişleri anında görmesi ve anlık bildirim alması gerekir.

Garson:

* Yeni siparişleri görür.
* Sipariş detaylarını inceler.
* "Gördüm" butonuna basarak siparişle ilgilendiğini belirtir.
* Siparişi hazırlayıp teslim eder.
* Siparişi tamamlar.

---

# SİPARİŞ DURUM SİSTEMİ

Karmaşık 5 veya 6 aşamalı sipariş durumu kullanma.

Temel durumlar:

1. NEW

   * Yeni sipariş
   * Henüz hiçbir garson tarafından görülmemiş olabilir.

2. SEEN

   * Bir garson siparişi gördü ve ilgileniyor.

3. COMPLETED

   * Sipariş tamamlandı.

4. CANCELLED

   * Sipariş iptal edildi.

Çalışan tarafında bu durumlar kullanıcıya karmaşık şekilde gösterilmemelidir.

Çalışan için mümkün olduğunca basit göster:

* Sipariş alındı
* Sipariş tamamlandı

Çalışan sipariş oluşturduktan sonra garsonun "Hazırlanıyor", "Hazır" gibi ara durumlarını takip etmek zorunda olmamalıdır.

---

# ÇALIŞAN ANA SAYFASI

Ana sayfa son derece sade olmalıdır.

Örnek:

Merhaba Mehmet 👋

Ne sipariş etmek istersiniz?

[ ☕ Sıcak İçecekler ]

[ 🥤 Soğuk İçecekler ]

[ 🍽️ Yemekler ]

[ 🍪 Atıştırmalıklar ]

Alt bölümde:

* Aktif Siparişler
* Son Siparişler

gösterilebilir.

Ancak ana ekranın temel amacı hızlı sipariş vermektir.

---

# ÜRÜN SEÇİMİ

Ürünler kategorilere ayrılmalıdır.

Örnek:

* Sıcak İçecekler
* Soğuk İçecekler
* Yemekler
* Atıştırmalıklar
* Diğer

Ürün kartları sade olmalıdır.

Her ürün kartında:

* Ürün adı
* Açıklama gerekiyorsa kısa açıklama
* Fiyat gerekiyorsa fiyat
* Adet artırma/azaltma

bulunabilir.

Kullanıcı bir ürünü seçtiğinde gereksiz birden fazla ekrana yönlendirilmemelidir.

---

# SİPARİŞ OLUŞTURMA

Sipariş oluşturma mümkün olduğunca hızlı olmalıdır.

Kullanıcı:

1. Ürünü seçer.
2. Adedi belirler.
3. Gerekirse özel istek ekler.
4. Teslimat/servis konumunu seçer.
5. Siparişi gönderir.

Örnek:

2x Türk Kahvesi

* Şekersiz

1x Su

Konum:
Toplantı Odası 2

Not:
Lütfen toplantı odasına bırakın.

[ SİPARİŞİ GÖNDER ]

Sipariş gönderilmeden önce kısa ve anlaşılır bir özet gösterilebilir.

Ancak kullanıcı gereksiz onay ekranlarıyla yormamalıdır.

---

# KONUM SİSTEMİ

Çalışan sipariş verirken siparişin teslim edileceği konumu seçebilmelidir.

Konumlar önceden tanımlı olabilir.

Örneğin:

* Ofis
* Toplantı Odası 1
* Toplantı Odası 2
* Yönetim Ofisi
* Resepsiyon
* Diğer

"Diğer" seçilirse kullanıcı manuel açıklama yazabilir.

Bu özellik siparişlerin yanlış yere götürülmesini önlemek için önemlidir.

---

# GARSON ANA SAYFASI

Garson uygulamasının ana ekranı sipariş yönetimine odaklı olmalıdır.

Üstte:

* Yeni sipariş sayısı
* Görülen/aktif siparişler

gösterilebilir.

Ana bölüm:

## YENİ SİPARİŞLER

Her sipariş kartında çok net olarak:

* Sipariş veren çalışan
* Sipariş saati
* Ürünler
* Adetler
* Özel istekler
* Teslimat konumu

gösterilmelidir.

Örnek:

────────────────────

🔴 YENİ SİPARİŞ

Mehmet Demirkök
10:42

☕ Türk Kahvesi × 2
🥤 Su × 1

Şekersiz

📍 Toplantı Odası 2

[ GÖRDÜM ✓ ]

────────────────────

Sipariş kartı tek bakışta anlaşılmalıdır.

---

# GÖRDÜM SİSTEMİ

Bir garson "GÖRDÜM" butonuna bastığında:

* Sipariş durumu SEEN yapılır.
* Diğer iki garsonun ekranı anında güncellenir.
* Sipariş "Yeni Siparişler" listesinden "Aktif Siparişler" bölümüne taşınır.
* Aynı siparişin birden fazla garson tarafından tekrar alınması engellenir.

Örneğin:

Garson 1:
[GÖRDÜM ✓]

Bastığında:

Garson 1:
Bu siparişle ilgileniyor.

Garson 2:
Bu sipariş Garson 1 tarafından görüldü.

Garson 3:
Bu sipariş Garson 1 tarafından görüldü.

Bu bilgiler Supabase Realtime ile anlık güncellenmelidir.

---

# SİPARİŞİ TAMAMLAMA

Garson siparişi teslim ettikten sonra:

[ ✓ TAMAMLANDI ]

butonuna basar.

Sipariş COMPLETED durumuna geçer.

Bu işlemden sonra:

* Aktif siparişlerden kaldırılır.
* Sipariş geçmişine taşınır.

Çalışan isterse sipariş geçmişinde bu siparişi görebilir.

---

# KRİTİK ÖZELLİK: ANLIK PUSH BİLDİRİMLERİ

Yeni siparişlerin garsonlara mümkün olan en düşük gecikmeyle ulaşması uygulamanın en önemli özelliklerinden biridir.

Yeni sipariş oluşturulduğunda:

1. Sipariş Supabase veritabanına kaydedilir.
2. Server-side event veya Database Webhook tetiklenir.
3. Supabase Edge Function çalışır.
4. Sistemde kayıtlı 3 garsonun push token bilgileri alınır.
5. Üç garsonun tamamına push notification gönderilir.
6. Bildirim özel sipariş sesine sahip olur.
7. Bildirim yüksek öncelikli olur.
8. Garson bildirime bastığında doğrudan sipariş detayına yönlendirilir.

Bildirim uygulama:

* Açıkken,
* Arka plandayken,
* Telefon kilitliyken

çalışmalıdır.

Uygulama tamamen kapalıyken de işletim sistemi push notification mekanizması kullanılmalıdır.

---

# ÖZEL BİLDİRİM SESİ

Yeni siparişler için uygulamaya özel kısa ve dikkat çekici bir bildirim sesi kullanılmalıdır.

Örneğin:

assets/sounds/new-order.wav

Ses:

* Kısa olmalı.
* Dikkat çekici olmalı.
* Rahatsız edici derecede uzun olmamalı.
* Yeni sipariş bildirimine özel olmalı.

Android için:

* Ayrı bir notification channel oluştur.
* Channel importance HIGH olmalı.
* Özel notification sound kullanılmalı.
* Heads-up notification desteklenmeli.
* Gerekirse titreşim kullanılmalı.

iOS için:

* Özel notification sound payload içerisinde gönderilmeli.
* Ses dosyası iOS bildirim kurallarına uygun formatta hazırlanmalı.

Bildirim başlığı:

🔔 Yeni Sipariş

Bildirim içeriği:

Mehmet Demirkök • 2x Türk Kahvesi, 1x Su • Toplantı Odası 2

Bildirim tıklandığında:

Garson uygulaması açılmalı
↓
İlgili sipariş bulunmalı
↓
Doğrudan sipariş detay ekranı açılmalı.

Garsonun uygulamayı açıp siparişi manuel olarak araması gerekmemelidir.

---

# BİLDİRİM GÜVENİLİRLİĞİ

Supabase Realtime, uygulama açıkken ekranların anlık güncellenmesi için kullanılmalıdır.

Ancak gerçek cihaz bildirimi için yalnızca Supabase Realtime'a güvenilmemelidir.

Push notification sistemi:

* Expo Push Notifications
* Supabase Edge Functions
* Supabase Database Webhooks veya güvenilir event sistemi

ile kurulmalıdır.

Bildirim gönderimi başarısız olursa:

* Hata loglanmalıdır.
* Sistem hata durumunu yönetmelidir.
* Push token geçersizse token güncellenmelidir.

Bildirim sistemi mümkün olan en düşük gecikmeyle çalışmalıdır.

---

# 3 GARSONUN SENKRONİZASYONU

Aynı sipariş üç garsona da bildirim olarak gönderilmelidir.

Örneğin:

Yeni sipariş
↓
Garson  🔔

Garsonlardan biri "Gördüm" dediğinde:

* Sipariş durumu anında SEEN olmalı.
* Diğer garsonların ekranı anında güncellenmeli.
* Siparişi kimin gördüğü gösterilmelidir.

Race condition durumlarını engelle.

İki garson aynı anda "Gördüm" butonuna basarsa sistem tutarlı çalışmalıdır.

Siparişin yalnızca bir garson tarafından sahiplenilmesini sağla.

---

# VERİTABANI

Supabase PostgreSQL kullan.

## profiles

* id
* full_name
* email
* role
* phone
* push_token
* is_active
* created_at

role:

* employee
* waiter
* admin

---

## categories

* id
* name
* sort_order
* is_active
* created_at

---

## products

* id
* category_id
* name
* description
* price
* is_active
* created_at

---

## locations

* id
* name
* is_active
* sort_order
* created_at

---

## orders

* id
* order_number
* employee_id
* status
* location_id
* custom_location
* note
* seen_by
* seen_at
* completed_at
* created_at
* updated_at

status:

* new
* seen
* completed
* cancelled

---

## order_items

* id
* order_id
* product_id
* product_name
* quantity
* special_request
* created_at

Sipariş oluşturulduğu andaki product_name değerini snapshot olarak kaydet.

Böylece ürün adı daha sonra değişse bile eski sipariş bozulmamalıdır.

---

# GÜVENLİK

Supabase Row Level Security kullanılmalıdır.

Çalışan:

* Kendi siparişlerini görebilir.
* Sipariş oluşturabilir.
* Kendi siparişlerinin durumunu görebilir.
* Başka çalışanların siparişlerini göremez.

Garson:

* Tüm siparişleri görebilir.
* Sipariş durumunu güncelleyebilir.
* Siparişi SEEN olarak işaretleyebilir.
* Siparişi COMPLETED olarak işaretleyebilir.

Admin:

* Kullanıcıları yönetebilir.
* Ürünleri yönetebilir.
* Kategorileri yönetebilir.
* Konumları yönetebilir.
* Siparişleri görebilir.

Supabase Service Role Key hiçbir şekilde mobil uygulamaya eklenmemelidir.

---

# ADMIN

İlk versiyonda basit bir admin paneli oluştur.

Admin:

* Ürün ekleyebilir.
* Ürün düzenleyebilir.
* Ürünleri aktif/pasif yapabilir.
* Kategori yönetebilir.
* Konum yönetebilir.
* Çalışanları görebilir.
* Garsonları görebilir.

Admin paneli temel sipariş akışını geciktirmemelidir.

Öncelik:

1. Çalışan sipariş verir.
2. Garson anında bildirim alır.
3. Garson siparişi görür.
4. Sipariş tamamlanır.

---

# TASARIM

Tasarım:

* Modern
* Minimal
* Çok sade
* Hızlı
* Kurumsal
* Kullanıcı dostu

olmalıdır.

Türkçe dil desteği olmalıdır.

Büyük ve kolay dokunulabilir butonlar kullan.

Garsonların telefonu hızlı kullanacağını düşün.

Sipariş bilgileri:

* Büyük,
* Okunaklı,
* Net,
* Hiyerarşik

gösterilmelidir.

Gereksiz animasyonlar kullanma.

Gereksiz popup kullanma.

Kullanıcıyı gereksiz ekran geçişlerine sokma.

---

# HATA VE BAĞLANTI DURUMLARI

İnternet bağlantısı yoksa kullanıcıya açıkça göster:

"İnternet bağlantısı yok. Siparişiniz gönderilemedi."

Sipariş başarıyla oluşturulmadan kullanıcıya:

"Siparişiniz alındı"

mesajı gösterme.

Sipariş gönderilirken loading state göster.

Çift tıklama ile aynı siparişin iki kez oluşturulmasını engelle.

Network timeout durumlarını yönet.

---

# MVP GELİŞTİRME SIRASI

Öncelikle aşağıdaki temel akışı eksiksiz çalışır hale getir:

## ÇALIŞAN

Giriş yapar
↓
Ana ekranı görür
↓
Ürün seçer
↓
Adet seçer
↓
Özel istek ekler
↓
Konum seçer
↓
Siparişi gönderir

## SİSTEM

Siparişi Supabase'e kaydeder
↓
Server-side event tetiklenir
↓
Üç garsona push notification gönderilir
↓
Özel bildirim sesi çalar

## GARSON

Bildirime tıklar
↓
Doğrudan sipariş detayını açar
↓
"Gördüm" butonuna basar
↓
Sipariş SEEN olur
↓
Diğer garsonların ekranı anında güncellenir
↓
Sipariş teslim edilir
↓
"Tamamlandı" butonuna basılır

## ÇALIŞAN

Siparişin alındığını görür.

Bu temel akış tamamen çalışır hale gelmeden gereksiz gelişmiş özelliklere geçme.

---

# GELİŞTİRME KURALLARI

Kod TypeScript ile yazılmalıdır.

Component yapısı modüler olmalıdır.

Tekrarlanan kodları azalt.

Supabase sorgularını merkezi ve düzenli bir yapıda organize et.

Loading, error ve empty state durumlarını mutlaka ele al.

Form validasyonlarını yap.

Türkçe ve anlaşılır hata mesajları kullan.

Mobil uygulama performansını önemse.

Supabase güvenlik kurallarını doğru yapılandır.

Race condition ve duplicate order durumlarını engelle.

Push notification sistemini gerçek cihazlarda test edilebilir şekilde kur.

Önce mevcut proje klasörünü analiz et.

Mevcut dosyaları incele.

Gereksiz yere çalışan mevcut kodları silme veya bozma.

Kod yazmaya başlamadan önce proje mimarisini ve uygulanacak geliştirme adımlarını kısa şekilde planla.

Ardından projeyi adım adım geliştir.

Her önemli adımdan sonra uygulamanın çalıştığını kontrol et.

Hata alırsan hatayı analiz et ve düzelt.

Öncelik her zaman:

1. Basitlik
2. Hız
3. Güvenilir bildirim
4. Net sipariş bilgisi
5. Kullanıcı deneyimi

olmalıdır.
 
 UYGULAMANIN TAMAMI TÜRKÇE DİLİNDE YAZILMALIDIR. HERŞEY TÜRKÇE OLACAK.