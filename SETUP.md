# OfisNow — Kurulum Rehberi

Bu depo, mobil uygulamanın (Expo/React Native/TypeScript) tüm kaynak kodunu ve
Supabase backend'inin tüm tanımını (migration'lar, RLS politikaları, RPC
fonksiyonları, Edge Function) içerir. Bir Supabase projesi henüz bağlanmadığı
için canlıya almak üzere aşağıdaki adımları izleyin.

## 1) Supabase projesi oluşturun

1. https://supabase.com üzerinden yeni bir proje oluşturun.
2. Project Settings > API üzerinden `Project URL` ve `anon public` anahtarını not edin.

## 2) Veritabanı şemasını uygulayın

`supabase/migrations/` klasöründeki dosyaları **sırasıyla** Supabase Dashboard
> SQL Editor içinde çalıştırın (veya Supabase CLI kuruluysa
`supabase link` + `supabase db push` kullanın):

1. `20260720000001_init_schema.sql` — tablolar, enum'lar, `handle_new_user` tetikleyicisi
2. `20260720000002_rls_policies.sql` — Row Level Security politikaları
3. `20260720000003_functions.sql` — `create_order`, `claim_order`, `complete_order`, `cancel_order`, `update_my_push_token`
4. `20260720000004_realtime.sql` — `orders` tablosunu realtime yayınına ekler
5. `20260720000005_drop_product_price.sql` — ürünlerden fiyat kolonunu kaldırır
6. `20260720000006_location_contacts.sql` — konum başına kişi dizini
7. `20260721000001_multi_tenant.sql` — çok kiracılı (multi-tenant) `companies` yapısına geçiş
8. `20260721000002_harden_security_definer_functions.sql` — `SECURITY DEFINER` fonksiyonlarda `search_path` sabitleme
9. `20260721000003_revoke_anon_execute.sql` — RPC fonksiyonlarına `anon` erişimini kaldırma
10. `20260721000004_remove_admin_role.sql` — **admin** rolünü kaldırır; kategori/ürün/konum yönetimi garson rolüne geçer

Ardından örnek verileri yüklemek için `supabase/seed.sql` dosyasını çalıştırın
(kategoriler, konumlar, örnek ürünler).

## 3) Kullanıcı oluşturma (çok kiracılı / multi-tenant)

Kullanıcılar artık mobil uygulamanın kendi kayıt ekranından (`/register`)
oluşturulur — Dashboard'dan manuel "Add user" akışı **kullanılmaz**. İki mod
vardır:

- **Yeni Şirket Kur**: Ad Soyad + E-posta + Şifre + Şirket Adı girilir.
  Kaydolan kişi otomatik olarak o şirketin **garson**'u olur ve şirket için
  benzersiz bir davet kodu üretilir (`companies.invite_code`).
- **Davet Koduyla Katıl**: Garsonun paylaştığı davet kodu + Ad Soyad +
  E-posta + Şifre + rol seçimi (**employee** ya da **waiter**) girilir.
  `handle_new_user` tetikleyicisi davet kodunu şirkete çözümleyip
  `public.profiles` satırını (doğru `company_id` ve `role` ile) otomatik
  oluşturur.

Garson, kendi şirketinin davet kodunu uygulamanın sağ üstündeki hesap
rozetinden görüp kopyalayabilir. Kategori/ürün/konum yönetimi de garson
rolünün kendi sekmelerinden (Ürünler, Kategoriler, Konumlar) yapılır; ayrı
bir admin veya kullanıcı yönetimi ekranı yoktur.

## 4) Push bildirimleri için Edge Function'ı deploy edin

```bash
supabase functions deploy notify-new-order --project-ref <PROJECT_REF>
```

Fonksiyon, `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` ortam değişkenlerini
Supabase tarafından otomatik olarak alır; ek bir ayar gerekmez.

## 5) Database Webhook'u bağlayın

Supabase Dashboard > Database > Webhooks > "Create a new hook":

- **Table**: `orders`
- **Events**: `Insert`
- **Type**: `Supabase Edge Function`
- **Edge Function**: `notify-new-order`

Bu webhook, her yeni sipariş oluşturulduğunda `notify-new-order`
fonksiyonunu tetikleyerek aktif garsonlara anında push bildirimi gönderir.

## 6) Mobil uygulama ortam değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayıp kendi proje bilgilerinizi girin:

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxxxxxx
```

## 7) Uygulamayı çalıştırın

```bash
npm install
npx expo start
```

Push bildirimleri yalnızca **gerçek cihazlarda** çalışır (simülatör/emülatörde
çalışmaz). Test için Expo Go veya bir development build kullanın:

```bash
npx expo run:ios      # veya
npx expo run:android
```

## Notlar

- `assets/sounds/new-order.wav` örnek/placeholder bir bildirim sesidir;
  isterseniz kurumunuza özel kısa ve dikkat çekici bir ses dosyasıyla
  değiştirebilirsiniz (aynı dosya adını koruyun veya `app.json` ve
  `hooks/useNotifications.ts` içindeki referansları güncelleyin).
- Tüm sipariş durum geçişleri (`GÖRDÜM`, `TAMAMLANDI`, sipariş oluşturma,
  iptal) veritabanındaki `SECURITY DEFINER` fonksiyonlar üzerinden yapılır;
  bu sayede iki garsonun aynı siparişi aynı anda "görmesi" gibi yarış
  durumları (race condition) tek bir atomik `UPDATE` ile güvenle engellenir.


## Demo hesapları

Şirket: **OfisNow Demo** — davet kodu: `4C56604A`

┌──────────┬─────────────────────┬───────────┐
│   Rol    │       E-posta       │   Şifre   │
├──────────┼─────────────────────┼───────────┤
│ employee │ calisan@ofisnow.com │ Test1234! │
├──────────┼─────────────────────┼───────────┤
│ waiter   │ garson@ofisnow.com  │ Test1234! │
└──────────┴─────────────────────┴───────────┘