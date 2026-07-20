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

Ardından örnek verileri yüklemek için `supabase/seed.sql` dosyasını çalıştırın
(kategoriler, konumlar, örnek ürünler).

## 3) Kullanıcı oluşturma (çalışan / garson / admin)

Güvenlik nedeniyle **Service Role Key mobil uygulamaya asla eklenmez**; bu
yüzden kullanıcılar mobil uygulama içinden değil, Supabase Dashboard >
Authentication > Users > "Add user" üzerinden (veya Admin API ile sunucu
tarafında) oluşturulur. Kullanıcı oluştururken **User Metadata** alanına rolü
belirtin, örnek:

```json
{ "full_name": "Ahmet Yılmaz", "role": "waiter" }
```

`role` alanı `employee`, `waiter` veya `admin` olabilir (belirtilmezse
`employee` varsayılır). `public.profiles` tablosuna karşılık gelen satır,
`handle_new_user` tetikleyicisi ile otomatik oluşturulur.

Üç garson hesabını bu şekilde oluşturun; her biri uygulamaya kendi
e-posta/şifresiyle giriş yapacaktır.

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
