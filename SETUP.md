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
11. `20260724000001_web_push_subscription.sql` — `profiles.web_push_subscription` kolonu, `update_my_web_push_subscription` RPC'si
12. `20260724000002_notify_order_cancelled_webhook.sql` — sipariş iptalinde `notify-order-cancelled` Edge Function'ını tetikleyen `pg_net` webhook'u

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

## 8) Web Push (ekran kilitliyken/PWA arka plandayken bildirim)

Web'de sayfa açık olsa bile telefon kilitlenince veya sekme arka plana
atılınca normal ses/Realtime kodu çalışmaz. Bunun için gerçek **Web Push**
(Service Worker + Push API + VAPID) kurulu: `public/sw.js`,
`hooks/useWebPushSubscription.ts`, `profiles.web_push_subscription` kolonu ve
`notify-new-order` / `notify-order-cancelled` Edge Function'ları buna göre
güncellendi/eklendi ve deploy edildi. Geriye şu 2 manuel adım kalıyor:

1. **VAPID anahtarları üretin** (bir kere, `npx web-push generate-vapid-keys`
   ile üretilmiştir; kendi projeniz için yeniden üretmek isterseniz aynı
   komutu çalıştırın):

   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Private key'i Supabase Edge Function secret'ı olarak kaydedin** (repo'ya
   ASLA yazılmaz). Supabase CLI kuruluysa:

   ```bash
   supabase secrets set \
     VAPID_PUBLIC_KEY=<public-key> \
     VAPID_PRIVATE_KEY=<private-key> \
     VAPID_SUBJECT=mailto:destek@ofisnow.app \
     --project-ref fsksmdubigkzlsdmrebt
   ```

   CLI yoksa: Supabase Dashboard > Project Settings > Edge Functions >
   "Manage secrets" üzerinden aynı 3 değişkeni girin. Bu adım tamamlanana
   kadar edge function'lar Web Push'u sessizce atlar (native/Expo push
   bildirimleri bundan etkilenmez).

3. **Public key'i istemciye tanıtın**: `.env` dosyanıza
   `EXPO_PUBLIC_VAPID_PUBLIC_KEY=<public-key>` ekleyin ve web'i deploy
   ettiğiniz platformda (ör. Vercel > Project Settings > Environment
   Variables) aynı değişkeni tanımlayıp yeniden deploy edin.

Kurulum tamamlanınca garson, hesap menüsünden "Uygulamayı Yükle" ile PWA'yı
ana ekrana ekleyip tarayıcı bildirim iznini verdiğinde, ekran kilitliyken
veya sekme kapalıyken de yeni sipariş/iptal bildirimi (ses + titreşimle)
alır. iOS'ta bu yalnızca **iOS 16.4+** ve **ana ekrana eklenmiş** PWA'da
çalışır; normal Safari sekmesinde çalışmaz (Apple kısıtlaması).

## 9) Resend ile Auth E-postaları (localhost yönlendirmesini düzeltir)

Supabase'in varsayılan e-posta gönderimi hem çirkin bir şablon kullanır hem de
onay bağlantısı, Dashboard'daki **Site URL** ayarı (genelde `localhost:3000`)
düzeltilmediği sürece kullanıcıyı boş bir localhost sayfasına yönlendirir.
Bunu tamamen ortadan kaldırmak için Supabase'in kendi e-posta gönderimini
devre dışı bırakıp yerine **Resend** üzerinden markalı, Türkçe e-postalar
gönderen bir Auth Hook (`send-auth-email` Edge Function) kullanıyoruz.
İlgili kod: `supabase/functions/send-auth-email/index.ts` ve ortak yardımcı
`supabase/functions/_shared/resend.ts`.

1. **Resend hesabı açın ve domain doğrulayın**: https://resend.com üzerinden
   hesap oluşturun, kendi domaininizi (ör. `ofisnow.app`) DNS kayıtlarıyla
   doğrulayın. Domain doğrulanana kadar test amaçlı yalnızca kendi Resend
   hesabınıza kayıtlı e-posta adresine `onboarding@resend.dev` adresinden
   gönderim yapabilirsiniz — üretimde gerçek kullanıcılara göndermek için
   domain doğrulaması **zorunludur**.
2. **API key oluşturun**: Resend Dashboard > API Keys > Create API Key.
   Bu anahtarı repo'ya, `.env` dosyasına veya herhangi bir committed dosyaya
   **asla yazmayın** — yalnızca Supabase Edge Function secret'ı olarak saklanır.
3. **Edge Function'ı deploy edin**:

   ```bash
   supabase functions deploy send-auth-email --project-ref fsksmdubigkzlsdmrebt
   ```

4. **Auth Hook'u Dashboard'da etkinleştirin**: Supabase Dashboard >
   Authentication > Hooks > "Send Email hook" > Enable. Hook türü olarak
   "Edge Function" seçip `send-auth-email` fonksiyonunu bağlayın. Bu adım
   otomatik olarak bir **Signing Secret** üretir (`v1,whsec_...` formatında);
   bu değeri kopyalayın.
5. **Secret'ları kaydedin** (CLI kuruluysa):

   ```bash
   supabase secrets set \
     RESEND_API_KEY=<resend-api-key> \
     SEND_EMAIL_HOOK_SECRET=<dashboard-dan-kopyalanan-v1-whsec-degeri> \
     RESEND_FROM_EMAIL="OfisNow <no-reply@ofisnow.app>" \
     --project-ref fsksmdubigkzlsdmrebt
   ```

   CLI yoksa: Project Settings > Edge Functions > "Manage secrets" üzerinden
   aynı 3 değişkeni girin. `RESEND_FROM_EMAIL` domain doğrulanana kadar
   `onboarding@resend.dev` olarak bırakılabilir.
6. **Redirect URL'i izin listesine ekleyin**: Authentication > URL
   Configuration > Redirect URLs kısmına `ofisnow://**` ekleyin. Uygulama
   artık kayıt olurken `emailRedirectTo: "ofisnow://login"` gönderiyor
   (bkz. `context/AuthContext.tsx`); bu satır olmadan Supabase bağlantıyı
   reddedip Site URL'e (localhost) düşer — localhost sorununun asıl kökeni
   budur. Site URL'i de gerçek bir değere (ör. `https://ofisnow.app` veya
   yine `ofisnow://login`) güncellemeniz önerilir.

Kurulum tamamlanınca yeni kayıt olanlara onay e-postası, OfisNow markalı
Türkçe şablonla otomatik gider ve onay bağlantısı doğrudan mobil uygulamayı
açar.

### Şifremi Unuttum akışı

Kayıt onayından farklı olarak şifre sıfırlama, mobil derin bağlantı (deep
link) URL fragment'ı ayrıştırma karmaşasına girmemek için **6 haneli kod**
üzerinden çalışır — tarayıcıdaki gizli bağlantılar yerine, tanıdık bir
"SMS doğrulama kodu" deneyimi:

1. Uygulamada `/forgot-password` ekranından e-posta girilir →
   `supabase.auth.resetPasswordForEmail` çağrılır.
2. `send-auth-email` hook'u `recovery` tipini yakalayıp Resend üzerinden
   6 haneli kodu içeren e-postayı gönderir (bağlantı değil, kod — bkz.
   `buildEmail` içindeki `recovery` case'i).
3. Kullanıcı `/reset-password` ekranında kodu + yeni şifreyi girer →
   `supabase.auth.verifyOtp({ type: "recovery" })` ile kod doğrulanır,
   ardından `supabase.auth.updateUser({ password })` ile şifre güncellenir.

Bu akış için ek bir secret veya Dashboard ayarı gerekmez; yukarıdaki 1-6
adımları (Send Email Hook aktif + secret'lar tanımlı) yeterlidir.

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