<!-- Garson Paneli -->
<!DOCTYPE html>

<html class="light" lang="tr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Garson Sipariş Yönetimi</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-tertiary-container": "#ef9900",
                    "surface-dim": "#dad9e1",
                    "inverse-on-surface": "#f1f0f7",
                    "on-error-container": "#93000a",
                    "on-primary-fixed-variant": "#264191",
                    "surface-container": "#eeedf4",
                    "on-secondary-fixed-variant": "#005236",
                    "tertiary": "#3e2400",
                    "on-primary-fixed": "#00164e",
                    "secondary-fixed-dim": "#4edea3",
                    "inverse-surface": "#2f3036",
                    "tertiary-fixed": "#ffddb8",
                    "surface-container-low": "#f4f3fa",
                    "on-secondary-container": "#00714d",
                    "on-error": "#ffffff",
                    "on-primary": "#ffffff",
                    "surface-variant": "#e3e1e9",
                    "tertiary-fixed-dim": "#ffb95f",
                    "primary-fixed-dim": "#b6c4ff",
                    "error": "#ba1a1a",
                    "on-surface": "#1a1b21",
                    "surface-container-highest": "#e3e1e9",
                    "background": "#faf8ff",
                    "on-background": "#1a1b21",
                    "on-surface-variant": "#444651",
                    "on-secondary": "#ffffff",
                    "surface-tint": "#4059aa",
                    "on-tertiary-fixed-variant": "#653e00",
                    "surface-bright": "#faf8ff",
                    "tertiary-container": "#5c3800",
                    "secondary-container": "#6cf8bb",
                    "primary": "#00236f",
                    "on-tertiary-fixed": "#2a1700",
                    "surface": "#faf8ff",
                    "outline": "#757682",
                    "on-tertiary": "#ffffff",
                    "on-secondary-fixed": "#002113",
                    "on-primary-container": "#90a8ff",
                    "outline-variant": "#c5c5d3",
                    "primary-fixed": "#dce1ff",
                    "secondary-fixed": "#6ffbbe",
                    "inverse-primary": "#b6c4ff",
                    "surface-container-high": "#e9e7ef",
                    "primary-container": "#1e3a8a",
                    "secondary": "#006c49",
                    "surface-container-lowest": "#ffffff",
                    "error-container": "#ffdad6"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "8px",
                    "xl": "12px",
                    "full": "9999px"
            },
            "spacing": {
                    "unit": "4px",
                    "lg": "24px",
                    "container-padding": "16px",
                    "gutter": "12px",
                    "sm": "8px",
                    "xs": "4px",
                    "md": "16px",
                    "xl": "32px"
            },
            "fontFamily": {
                    "body-lg": ["Inter"],
                    "label-md": ["Inter"],
                    "label-lg": ["Inter"],
                    "headline-lg-mobile": ["Inter"],
                    "headline-md": ["Inter"],
                    "headline-sm": ["Inter"],
                    "body-md": ["Inter"],
                    "headline-lg": ["Inter"]
            },
            "fontSize": {
                    "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                    "label-md": ["11px", {"lineHeight": "14px", "fontWeight": "500"}],
                    "label-lg": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                    "headline-lg-mobile": ["22px", {"lineHeight": "28px", "fontWeight": "700"}],
                    "headline-md": ["20px", {"lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                    "headline-sm": ["18px", {"lineHeight": "24px", "fontWeight": "600"}],
                    "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                    "headline-lg": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.02em", "fontWeight": "700"}]
            }
          },
        },
      }
    </script>
<style>
      body {
        background-color: #F9FAFB;
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .card-shadow {
        box-shadow: 0px 2px 4px rgba(0,0,0,0.05);
      }
      .active-card-shadow {
        box-shadow: 0px 10px 15px rgba(0,0,0,0.1);
      }
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      @keyframes pulse-ring {
        0% { transform: scale(0.95); opacity: 0.5; }
        50% { transform: scale(1.05); opacity: 0.8; }
        100% { transform: scale(0.95); opacity: 0.5; }
      }
      .pulse-animation {
        animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background min-h-screen pb-20">
<!-- Top Navigation Header -->
<header class="flex items-center justify-between px-md py-sm w-full bg-surface border-b border-outline-variant sticky top-0 z-50">
<div class="flex items-center gap-sm">
<h1 class="font-headline-sm text-headline-sm font-bold text-primary">Merhaba, Mehmet</h1>
</div>
<div class="flex items-center gap-md">
<div class="relative">
<span class="material-symbols-outlined text-on-surface-variant">notifications</span>
<span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] text-white font-bold">3</span>
</div>
<div class="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-container">
<img class="h-full w-full object-cover" data-alt="A professional headshot of a waiter in a modern corporate uniform, standing in a brightly lit, high-end corporate cafe. The lighting is soft and natural, emphasizing a trustworthy and efficient personality. The background features a blurred minimalist office interior with clean lines and a palette of white and soft blues." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdY_LZ_0vXV2NGz1fu4j5LNFdgwVVnR89QWu-ZrZ58huuv63xFHDCJPXWEhPX3XcgICnkzNEbG-BBvp4EB_eXH7_S-doGF7qk3B76JKqDNZeALsVdaPCUOJJrtWQscjFLbyXubf1ym400Hx8DeZG9ysNTSk5UzYvDCIJAhJPN4RN5zK0sy4q0e0aVwVrgWcckQjcbb3Yrc0KxgVD5Q04uUryHTJZ0ikIdxBVh5I9zNHUbqVtMpxqWOXlKzlhNJigpQIDN45tiEYbI"/>
</div>
</div>
</header>
<main class="p-container-padding max-w-2xl mx-auto space-y-md">
<!-- Dashboard Summary Header -->
<div class="flex items-center justify-between py-xs">
<div class="flex items-center gap-sm">
<h2 class="font-headline-md text-headline-md text-on-surface">Yeni Siparişler</h2>
<span class="bg-tertiary-container text-on-tertiary-container px-sm py-xs rounded-full font-label-lg text-label-lg pulse-animation">
                    3 YENİ
                </span>
</div>
<button class="text-primary font-label-lg text-label-lg flex items-center gap-xs">
<span class="material-symbols-outlined text-[18px]">refresh</span>
                GÜNCELLE
            </button>
</div>
<!-- Order Card List -->
<div class="space-y-gutter">
<!-- Card 1: NEW (Highlighted) -->
<div class="bg-surface-container-lowest rounded-xl p-md border-2 border-secondary-container active-card-shadow transition-all duration-200">
<div class="flex justify-between items-start mb-sm">
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Mehmet Demirkök</h3>
<div class="flex items-center gap-xs text-on-surface-variant">
<span class="material-symbols-outlined text-[16px]">schedule</span>
<span class="font-body-md text-body-md">10:42</span>
</div>
</div>
<span class="bg-amber-100 text-[#B45309] px-sm py-xs rounded font-label-lg text-label-lg uppercase">YENİ</span>
</div>
<div class="bg-surface-container-low rounded-lg p-sm mb-md space-y-xs">
<div class="flex items-start gap-sm">
<span class="material-symbols-outlined text-primary text-[20px]">coffee</span>
<p class="font-body-lg text-body-lg text-on-surface">2x Türk Kahvesi, 1x Su</p>
</div>
<div class="flex items-center gap-sm mt-xs">
<span class="material-symbols-outlined text-on-surface-variant text-[18px]">sticky_note_2</span>
<p class="font-body-md text-body-md text-on-surface-variant">Not: <span class="font-bold">Şekersiz</span></p>
</div>
</div>
<div class="flex items-center gap-xs text-on-surface-variant mb-md">
<span class="material-symbols-outlined text-[18px]">location_on</span>
<span class="font-label-lg text-label-lg">Toplantı Odası 2</span>
</div>
<button class="w-full bg-secondary text-white py-md rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-sm active:scale-[0.98] transition-transform shadow-lg shadow-secondary/20">
                    GÖRDÜM
                    <span class="material-symbols-outlined">check_circle</span>
</button>
</div>
<!-- Card 2: SEEN -->
<div class="bg-surface-container-lowest rounded-xl p-md card-shadow border border-outline-variant opacity-90 transition-all duration-200">
<div class="flex justify-between items-start mb-sm">
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Ayşe Yılmaz</h3>
<div class="flex items-center gap-xs text-on-surface-variant">
<span class="material-symbols-outlined text-[16px]">schedule</span>
<span class="font-body-md text-body-md">10:35</span>
</div>
</div>
<span class="bg-blue-100 text-primary px-sm py-xs rounded font-label-lg text-label-lg uppercase">GÖRÜLDÜ</span>
</div>
<div class="bg-surface-container-low rounded-lg p-sm mb-md space-y-xs">
<div class="flex items-start gap-sm">
<span class="material-symbols-outlined text-primary text-[20px]">local_cafe</span>
<p class="font-body-lg text-body-lg text-on-surface">1x Latte</p>
</div>
</div>
<div class="flex items-center justify-between mb-md">
<div class="flex items-center gap-xs text-on-surface-variant">
<span class="material-symbols-outlined text-[18px]">location_on</span>
<span class="font-label-lg text-label-lg">Ofis</span>
</div>
<div class="flex items-center gap-xs text-primary font-label-lg text-label-lg italic">
<span class="material-symbols-outlined text-[16px]">person</span>
                        Garson 1 ilgileniyor
                    </div>
</div>
<button class="w-full border-2 border-primary text-primary py-md rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-sm active:scale-[0.98] transition-transform">
                    TAMAMLANDI
                    <span class="material-symbols-outlined">done_all</span>
</button>
</div>
<!-- Card 3: COMPLETED (Partial) -->
<div class="bg-surface-container-lowest rounded-xl p-md card-shadow border border-outline-variant opacity-70">
<div class="flex justify-between items-start">
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Caner Uzun</h3>
<div class="flex items-center gap-xs text-on-surface-variant">
<span class="material-symbols-outlined text-[16px]">schedule</span>
<span class="font-body-md text-body-md">10:20</span>
</div>
</div>
<span class="bg-green-100 text-green-800 px-sm py-xs rounded font-label-lg text-label-lg uppercase">TAMAMLANDI</span>
</div>
</div>
</div>
</main>
<!-- Bottom Navigation Bar -->
<nav class="fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-16 px-container-padding border-t border-outline-variant">
<a class="flex flex-col items-center justify-center text-primary font-bold transition-transform duration-150 scale-95" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">home</span>
<span class="font-label-lg text-label-lg">Home</span>
</a>
<a class="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200" href="#">
<span class="material-symbols-outlined">list_alt</span>
<span class="font-label-lg text-label-lg">Orders</span>
</a>
<a class="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200" href="#">
<span class="material-symbols-outlined">history</span>
<span class="font-label-lg text-label-lg">History</span>
</a>
</nav>
<script>
        // Simple micro-interaction for marking as "seen"
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function(e) {
                if(this.innerText.includes('GÖRDÜM')) {
                    const card = this.closest('.bg-surface-container-lowest');
                    this.classList.replace('bg-secondary', 'border-2');
                    this.classList.add('border-primary', 'text-primary');
                    this.classList.remove('bg-secondary', 'text-white', 'shadow-lg');
                    this.innerHTML = 'TAMAMLANDI <span class="material-symbols-outlined">done_all</span>';
                    
                    const badge = card.querySelector('.bg-amber-100');
                    if(badge) {
                        badge.classList.replace('bg-amber-100', 'bg-blue-100');
                        badge.classList.replace('text-[#B45309]', 'text-primary');
                        badge.innerText = 'GÖRÜLDÜ';
                    }
                    card.classList.replace('border-secondary-container', 'border-outline-variant');
                    card.classList.add('opacity-90');
                }
            });
        });
    </script>
</body></html>

<!-- Design System -->
<!DOCTYPE html>

<html class="light" lang="tr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-tertiary-container": "#ef9900",
                    "surface-dim": "#dad9e1",
                    "inverse-on-surface": "#f1f0f7",
                    "on-error-container": "#93000a",
                    "on-primary-fixed-variant": "#264191",
                    "surface-container": "#eeedf4",
                    "on-secondary-fixed-variant": "#005236",
                    "tertiary": "#3e2400",
                    "on-primary-fixed": "#00164e",
                    "secondary-fixed-dim": "#4edea3",
                    "inverse-surface": "#2f3036",
                    "tertiary-fixed": "#ffddb8",
                    "surface-container-low": "#f4f3fa",
                    "on-secondary-container": "#00714d",
                    "on-error": "#ffffff",
                    "on-primary": "#ffffff",
                    "surface-variant": "#e3e1e9",
                    "tertiary-fixed-dim": "#ffb95f",
                    "primary-fixed-dim": "#b6c4ff",
                    "error": "#ba1a1a",
                    "on-surface": "#1a1b21",
                    "surface-container-highest": "#e3e1e9",
                    "background": "#faf8ff",
                    "on-surface-variant": "#444651",
                    "on-secondary": "#ffffff",
                    "surface-tint": "#4059aa",
                    "on-tertiary-fixed-variant": "#653e00",
                    "surface-bright": "#faf8ff",
                    "tertiary-container": "#5c3800",
                    "secondary-container": "#6cf8bb",
                    "primary": "#00236f",
                    "on-tertiary-fixed": "#2a1700",
                    "surface": "#faf8ff",
                    "outline": "#757682",
                    "on-tertiary": "#ffffff",
                    "on-secondary-fixed": "#002113",
                    "on-primary-container": "#90a8ff",
                    "outline-variant": "#c5c5d3",
                    "primary-fixed": "#dce1ff",
                    "secondary-fixed": "#6ffbbe",
                    "on-background": "#1a1b21",
                    "inverse-primary": "#b6c4ff",
                    "surface-container-high": "#e9e7ef",
                    "primary-container": "#1e3a8a",
                    "secondary": "#006c49",
                    "surface-container-lowest": "#ffffff",
                    "error-container": "#ffdad6"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "unit": "4px",
                    "lg": "24px",
                    "container-padding": "16px",
                    "gutter": "12px",
                    "sm": "8px",
                    "xs": "4px",
                    "md": "16px",
                    "xl": "32px"
            },
            "fontFamily": {
                    "body-lg": ["Inter"],
                    "label-md": ["Inter"],
                    "label-lg": ["Inter"],
                    "headline-lg-mobile": ["Inter"],
                    "headline-md": ["Inter"],
                    "headline-sm": ["Inter"],
                    "body-md": ["Inter"],
                    "headline-lg": ["Inter"]
            },
            "fontSize": {
                    "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                    "label-md": ["11px", {"lineHeight": "14px", "fontWeight": "500"}],
                    "label-lg": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                    "headline-lg-mobile": ["22px", {"lineHeight": "28px", "fontWeight": "700"}],
                    "headline-md": ["20px", {"lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                    "headline-sm": ["18px", {"lineHeight": "24px", "fontWeight": "600"}],
                    "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                    "headline-lg": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.02em", "fontWeight": "700"}]
            }
          },
        },
      }
    </script>
<style>
        body {
            background-color: #F9FAFB;
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .card-shadow {
            box-shadow: 0px 2px 4px rgba(0,0,0,0.05);
        }
        .active-glow {
            position: relative;
        }
        .active-glow::after {
            content: '';
            position: absolute;
            inset: -2px;
            background: linear-gradient(45deg, #1e3a8a, #4edea3);
            border-radius: 14px;
            z-index: -1;
            opacity: 0.3;
            filter: blur(4px);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background min-h-screen flex flex-col pb-20">
<!-- TopAppBar Component -->
<header class="flex items-center justify-between px-md py-sm w-full bg-surface border-b border-outline-variant fixed top-0 z-50">
<div class="flex items-center gap-sm">
<div class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
<img class="w-full h-full object-cover" data-alt="A professional headshot of a friendly young male office worker with short dark hair, smiling warmly. The lighting is soft and corporate, set against a blurred modern office background with neutral gray and white tones. The overall aesthetic is professional, clean, and reliable, consistent with a high-end corporate application." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQBkjwXj4v0GbxZ2miJEedNoC3fF0oEkhO0gaReUr-RCYKBW_ccO8rClNuyKsg0iq0Zf3PV2Oeac_N5rP7e2We5-qws_Ds7IInlcm8cM7dKTWKhtxgZyj2E_z1l881nO9QJgnLT9edkGeHd1OoNnPNag_r7hWQFnQHMhQby5SfxR4u9WDAek-82mbcTNA7Hi4iXdBAuNytcMiNLCJE2dQ12F_2JxURRYNIplEGUANVN6dy0dR8Y878NjM343U9Lg7Vo8zQNDEDLr8"/>
</div>
<h1 class="font-headline-sm text-headline-sm text-on-surface">Merhaba, Mehmet</h1>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-low transition-colors duration-200">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
</header>
<main class="mt-16 px-container-padding py-lg flex-grow space-y-xl">
<!-- Welcome Section -->
<section class="space-y-xs">
<h2 class="font-headline-lg-mobile text-headline-lg-mobile text-primary-container tracking-tight">Ne sipariş etmek istersiniz?</h2>
<p class="font-body-md text-body-md text-on-surface-variant">Size özel menüden seçiminizi yapın.</p>
</section>
<!-- Category Grid (Bento Style) -->
<section class="grid grid-cols-2 gap-md">
<!-- Category Item 1 -->
<button class="flex flex-col items-start justify-between p-md bg-surface-container-lowest rounded-xl card-shadow border border-outline-variant hover:border-primary transition-all duration-200 group h-32 relative overflow-hidden">
<div class="bg-secondary-container/20 p-sm rounded-full text-secondary transition-colors group-hover:bg-secondary-container">
<span class="material-symbols-outlined text-[24px]" data-icon="coffee">coffee</span>
</div>
<span class="font-label-lg text-label-lg text-on-surface">Sıcak İçecekler</span>
<div class="absolute -right-2 -bottom-2 opacity-5 text-on-surface">
<span class="material-symbols-outlined text-6xl" data-icon="coffee">coffee</span>
</div>
</button>
<!-- Category Item 2 -->
<button class="flex flex-col items-start justify-between p-md bg-surface-container-lowest rounded-xl card-shadow border border-outline-variant hover:border-primary transition-all duration-200 group h-32 relative overflow-hidden">
<div class="bg-primary-container/10 p-sm rounded-full text-primary transition-colors group-hover:bg-primary-container/20">
<span class="material-symbols-outlined text-[24px]" data-icon="local_drink">local_drink</span>
</div>
<span class="font-label-lg text-label-lg text-on-surface">Soğuk İçecekler</span>
<div class="absolute -right-2 -bottom-2 opacity-5 text-on-surface">
<span class="material-symbols-outlined text-6xl" data-icon="local_drink">local_drink</span>
</div>
</button>
<!-- Category Item 3 -->
<button class="flex flex-col items-start justify-between p-md bg-surface-container-lowest rounded-xl card-shadow border border-outline-variant hover:border-primary transition-all duration-200 group h-32 relative overflow-hidden">
<div class="bg-on-tertiary-container/10 p-sm rounded-full text-on-tertiary-container transition-colors group-hover:bg-on-tertiary-container/20">
<span class="material-symbols-outlined text-[24px]" data-icon="restaurant">restaurant</span>
</div>
<span class="font-label-lg text-label-lg text-on-surface">Yemekler</span>
<div class="absolute -right-2 -bottom-2 opacity-5 text-on-surface">
<span class="material-symbols-outlined text-6xl" data-icon="restaurant">restaurant</span>
</div>
</button>
<!-- Category Item 4 -->
<button class="flex flex-col items-start justify-between p-md bg-surface-container-lowest rounded-xl card-shadow border border-outline-variant hover:border-primary transition-all duration-200 group h-32 relative overflow-hidden">
<div class="bg-error-container/20 p-sm rounded-full text-error transition-colors group-hover:bg-error-container">
<span class="material-symbols-outlined text-[24px]" data-icon="cookie">cookie</span>
</div>
<span class="font-label-lg text-label-lg text-on-surface">Atıştırmalıklar</span>
<div class="absolute -right-2 -bottom-2 opacity-5 text-on-surface">
<span class="material-symbols-outlined text-6xl" data-icon="cookie">cookie</span>
</div>
</button>
</section>
<!-- Aktif Sipariş (Active Order) -->
<section class="space-y-md">
<h3 class="font-label-lg text-label-lg text-on-surface-variant flex items-center gap-xs">
                AKTİF SİPARİŞ
                <span class="block w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
</h3>
<div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant flex items-center justify-between card-shadow active-glow">
<div class="flex items-center gap-md">
<div class="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-primary-container">
<span class="material-symbols-outlined" data-icon="coffee_maker">coffee_maker</span>
</div>
<div>
<p class="font-headline-sm text-headline-sm text-on-surface">1x Filtre Kahve</p>
<p class="font-body-md text-body-md text-on-tertiary-container font-medium">Hazırlanıyor • 3 dk kaldı</p>
</div>
</div>
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</section>
<!-- Son Siparişler (Recent Orders) -->
<section class="space-y-md">
<div class="flex items-center justify-between">
<h3 class="font-label-lg text-label-lg text-on-surface-variant">SON SİPARİŞLER</h3>
<button class="text-primary font-label-lg text-label-lg hover:underline transition-all">Tümünü Gör</button>
</div>
<div class="space-y-sm">
<!-- Recent Item 1 -->
<div class="flex items-center justify-between bg-surface-container-lowest p-md rounded-xl border border-outline-variant card-shadow hover:bg-surface-container-low transition-colors cursor-pointer">
<div class="flex items-center gap-md">
<div class="w-10 h-10 bg-secondary-container/10 rounded-full flex items-center justify-center text-secondary">
<span class="material-symbols-outlined text-[20px]" data-icon="history">history</span>
</div>
<div>
<p class="font-body-lg text-body-lg text-on-surface">Latte & Kruvasan</p>
<p class="font-label-md text-label-md text-on-surface-variant">Dün, 09:45</p>
</div>
</div>
<button class="px-md py-xs bg-primary-container text-white rounded-full font-label-lg text-label-lg hover:shadow-lg transition-all active:scale-95">Tekrarla</button>
</div>
<!-- Recent Item 2 -->
<div class="flex items-center justify-between bg-surface-container-lowest p-md rounded-xl border border-outline-variant card-shadow hover:bg-surface-container-low transition-colors cursor-pointer">
<div class="flex items-center gap-md">
<div class="w-10 h-10 bg-secondary-container/10 rounded-full flex items-center justify-center text-secondary">
<span class="material-symbols-outlined text-[20px]" data-icon="history">history</span>
</div>
<div>
<p class="font-body-lg text-body-lg text-on-surface">Türk Kahvesi</p>
<p class="font-label-md text-label-md text-on-surface-variant">Salı, 14:20</p>
</div>
</div>
<button class="px-md py-xs bg-primary-container text-white rounded-full font-label-lg text-label-lg hover:shadow-lg transition-all active:scale-95">Tekrarla</button>
</div>
</div>
</section>
</main>
<!-- BottomNavBar Component -->
<nav class="fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-16 px-container-padding border-t border-outline-variant">
<!-- Home (Active) -->
<button class="flex flex-col items-center justify-center text-primary font-bold scale-95 active:scale-90 transition-transform duration-150">
<span class="material-symbols-outlined" data-icon="home" style="font-variation-settings: 'FILL' 1;">home</span>
<span class="font-label-lg text-label-lg">Home</span>
</button>
<!-- Orders -->
<button class="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200">
<span class="material-symbols-outlined" data-icon="list_alt">list_alt</span>
<span class="font-label-lg text-label-lg">Orders</span>
</button>
<!-- History -->
<button class="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200">
<span class="material-symbols-outlined" data-icon="history">history</span>
<span class="font-label-lg text-label-lg">History</span>
</button>
</nav>
<!-- Visual Polish: Subtle Background Noise/Gradient -->
<div class="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]">
<svg viewbox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<filter id="noiseFilter">
<feturbulence basefrequency="0.65" numoctaves="3" stitchtiles="stitch" type="fractalNoise"></feturbulence>
</filter>
<rect filter="url(#noiseFilter)" height="100%" width="100%"></rect>
</svg>
</div>
<script>
        // Simple micro-interaction for re-order buttons
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('touchstart', function() {
                this.classList.add('scale-95');
            });
            btn.addEventListener('touchend', function() {
                this.classList.remove('scale-95');
            });
        });

        // Simulating some dynamic status for the active order
        const activeOrderLabel = document.querySelector('.animate-pulse').parentElement;
        setInterval(() => {
            // Placeholder for real-time status update logic
        }, 5000);
    </script>
</body></html>

<!-- Çalışan Ana Sayfası -->
<!DOCTYPE html>

<html class="light" lang="tr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Product Selection - Sıcak İçecekler</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-tertiary-container": "#ef9900",
                    "surface-dim": "#dad9e1",
                    "inverse-on-surface": "#f1f0f7",
                    "on-error-container": "#93000a",
                    "on-primary-fixed-variant": "#264191",
                    "surface-container": "#eeedf4",
                    "on-secondary-fixed-variant": "#005236",
                    "tertiary": "#3e2400",
                    "on-primary-fixed": "#00164e",
                    "secondary-fixed-dim": "#4edea3",
                    "inverse-surface": "#2f3036",
                    "tertiary-fixed": "#ffddb8",
                    "surface-container-low": "#f4f3fa",
                    "on-secondary-container": "#00714d",
                    "on-error": "#ffffff",
                    "on-primary": "#ffffff",
                    "surface-variant": "#e3e1e9",
                    "tertiary-fixed-dim": "#ffb95f",
                    "primary-fixed-dim": "#b6c4ff",
                    "error": "#ba1a1a",
                    "on-surface": "#1a1b21",
                    "surface-container-highest": "#e3e1e9",
                    "background": "#faf8ff",
                    "on-surface-variant": "#444651",
                    "on-secondary": "#ffffff",
                    "surface-tint": "#4059aa",
                    "on-tertiary-fixed-variant": "#653e00",
                    "surface-bright": "#faf8ff",
                    "tertiary-container": "#5c3800",
                    "secondary-container": "#6cf8bb",
                    "primary": "#00236f",
                    "on-tertiary-fixed": "#2a1700",
                    "surface": "#faf8ff",
                    "outline": "#757682",
                    "on-tertiary": "#ffffff",
                    "on-secondary-fixed": "#002113",
                    "on-primary-container": "#90a8ff",
                    "outline-variant": "#c5c5d3",
                    "primary-fixed": "#dce1ff",
                    "secondary-fixed": "#6ffbbe",
                    "on-background": "#1a1b21",
                    "inverse-primary": "#b6c4ff",
                    "surface-container-high": "#e9e7ef",
                    "primary-container": "#1e3a8a",
                    "secondary": "#006c49",
                    "surface-container-lowest": "#ffffff",
                    "error-container": "#ffdad6"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "unit": "4px",
                    "lg": "24px",
                    "container-padding": "16px",
                    "gutter": "12px",
                    "sm": "8px",
                    "xs": "4px",
                    "md": "16px",
                    "xl": "32px"
            },
            "fontFamily": {
                    "body-lg": ["Inter"],
                    "label-md": ["Inter"],
                    "label-lg": ["Inter"],
                    "headline-lg-mobile": ["Inter"],
                    "headline-md": ["Inter"],
                    "headline-sm": ["Inter"],
                    "body-md": ["Inter"],
                    "headline-lg": ["Inter"]
            },
            "fontSize": {
                    "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                    "label-md": ["11px", {"lineHeight": "14px", "fontWeight": "500"}],
                    "label-lg": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                    "headline-lg-mobile": ["22px", {"lineHeight": "28px", "fontWeight": "700"}],
                    "headline-md": ["20px", {"lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                    "headline-sm": ["18px", {"lineHeight": "24px", "fontWeight": "600"}],
                    "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                    "headline-lg": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.02em", "fontWeight": "700"}]
            }
          },
        },
      }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            line-height: 1;
            text-transform: none;
            letter-spacing: normal;
            word-wrap: normal;
            white-space: nowrap;
            direction: ltr;
        }
        /* Custom scrollbar for minimalist look */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        
        .bento-card {
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
        }
        .bento-card:active { transform: scale(0.98); }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background min-h-screen pb-32">
<!-- Top App Bar -->
<header class="flex items-center justify-between px-md py-sm w-full bg-surface sticky top-0 z-40 border-b border-outline-variant">
<div class="flex items-center gap-md">
<div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden">
<img class="w-full h-full object-cover" data-alt="A professional studio portrait of a friendly Turkish businessman in his 30s, wearing a clean white shirt, with soft natural lighting and a minimalist blurred corporate background. The aesthetic is high-quality, corporate modern, and trustworthy, using a palette of soft whites and deep blues." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA8bHhnL9GKCB7zJZgtVZFQqtLA0-RQPqwODXRJtlMHWckHglhEjlzltq6XY7uFlzVdDNwvr_WMr1ynXEfNZMGiKqAS_N_W6KE7m8fiaO02PLPjC9IEnfx34TUMrbO2mS1GR7KuTuZQ5_eY69HxF78sMRSYGG-5vB0S6CtDTVY_L17fv77QqVu4Ep3tJ_zd_-i8igYtOl7nctZw9QZqOkmgO9KcJXbye7_Yqja28UxCDOBYvAt64umzimh-IAQPs7n6gEoMA4cvR4"/>
</div>
<div>
<h1 class="font-headline-sm text-headline-sm text-on-surface">Merhaba, Mehmet</h1>
<p class="font-label-md text-label-md text-on-surface-variant">Kurumsal Sipariş Paneli</p>
</div>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors duration-200">
<span class="material-symbols-outlined text-on-surface-variant">notifications</span>
</button>
</header>
<!-- Main Content Canvas -->
<main class="px-container-padding pt-md">
<!-- Search & Filter Area -->
<div class="mb-lg space-y-md">
<div class="relative group">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
<input class="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-body-md" placeholder="Ürün ara..." type="text"/>
</div>
<div class="flex items-center gap-sm overflow-x-auto pb-2 no-scrollbar">
<span class="px-md py-2 bg-primary text-on-primary rounded-full font-label-lg text-label-lg whitespace-nowrap shadow-sm">Sıcak İçecekler</span>
<span class="px-md py-2 bg-surface-container-high text-on-surface-variant rounded-full font-label-lg text-label-lg whitespace-nowrap hover:bg-surface-variant transition-colors">Soğuk İçecekler</span>
<span class="px-md py-2 bg-surface-container-high text-on-surface-variant rounded-full font-label-lg text-label-lg whitespace-nowrap hover:bg-surface-variant transition-colors">Tatlılar</span>
<span class="px-md py-2 bg-surface-container-high text-on-surface-variant rounded-full font-label-lg text-label-lg whitespace-nowrap hover:bg-surface-variant transition-colors">Atıştırmalıklar</span>
</div>
</div>
<h2 class="font-headline-md text-headline-md mb-md text-on-surface flex items-center gap-sm">
<span class="w-1 h-6 bg-primary rounded-full"></span>
            Sıcak İçecekler
        </h2>
<!-- Product Bento List -->
<div class="grid grid-cols-1 gap-md">
<!-- Product: Türk Kahvesi -->
<div class="bento-card bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-sm flex gap-md">
<div class="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
<img class="w-full h-full object-cover" data-alt="A top-down, minimalist close-up shot of a traditional Turkish coffee cup on a sleek marble surface. The coffee has a perfect thick foam, served next to a single piece of Turkish delight. High-contrast, clean aesthetic, bright professional lighting, focusing on the deep brown of the coffee and pristine white ceramic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQ3D4_zLeaJPBC-V4zpiFYbZBCwbPGTU-q2GGc6zcoJ-iR9ST6U1Cv3DIHOvdk5F7u0YYJn5IOfRefZ83SYRlIVcwOqBeti2gB688LvUohlp2GoVsiQh9g-2BrJ4b63armPUpuW-WBupPnMlu4SuHJi8Vopq0dOh6INkqceQhvGeQQyslSnrgnMtFUzjo8dN0Zxxq190loFZnCQjyXKCXopKQIRpjvobsNIisqPSllRC8ZjXo-ucMCRTtgutejYMRF4a0sSGu65Ko"/>
</div>
<div class="flex-1 flex flex-col justify-between">
<div>
<div class="flex justify-between items-start">
<h3 class="font-headline-sm text-headline-sm text-on-surface">Türk Kahvesi</h3>
<span class="font-label-lg text-label-lg text-primary bg-primary-fixed px-2 py-1 rounded">₺45.00</span>
</div>
<p class="font-body-md text-body-md text-on-surface-variant mt-xs line-clamp-2">Geleneksel yöntemle pişirilmiş, yoğun kıvamlı ve bol köpüklü.</p>
</div>
<div class="flex items-center justify-between mt-sm">
<div class="flex items-center bg-surface-container-low rounded-lg p-1 border border-outline-variant">
<button class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-variant transition-colors" onclick="decrement('q1')">
<span class="material-symbols-outlined text-body-lg">remove</span>
</button>
<span class="w-10 text-center font-headline-sm text-headline-sm" id="q1">1</span>
<button class="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-md shadow-sm transition-transform active:scale-90" onclick="increment('q1')">
<span class="material-symbols-outlined text-body-lg">add</span>
</button>
</div>
</div>
</div>
</div>
<!-- Product: Filtre Kahve -->
<div class="bento-card bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-sm flex gap-md">
<div class="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
<img class="w-full h-full object-cover" data-alt="A modern glass mug filled with dark, clear filter coffee, capturing light refracting through the liquid. The setting is a bright, minimalist office desk with soft morning shadows. Professional photography, clean corporate vibe, high-end utility aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDLzHwwgzTejcSW5Li5CYTK0bA1ahyH_HDRb7GvUSldrDzjGFWz75sjfzoBppyxb2i8A3DqtvhwUfGTt-M1vV7hoTurJ1UpjmaGnXf6Ao0QHefXmgZJzKMZE2q1o9Jf52GYkW8l7q0QHp5FsyfIbaNr9fCqeoDHcARfJA8Tfx9UtlPPHMlDbKCWbvC9RFoXiheqek-gLNHWM7Guuy5MN7En5w5_ij7vdiiitbSMZ0TvAdezN3uSzfN4z2VxrhvTH3wjSXanM4miGc"/>
</div>
<div class="flex-1 flex flex-col justify-between">
<div>
<div class="flex justify-between items-start">
<h3 class="font-headline-sm text-headline-sm text-on-surface">Filtre Kahve</h3>
<span class="font-label-lg text-label-lg text-primary bg-primary-fixed px-2 py-1 rounded">₺55.00</span>
</div>
<p class="font-body-md text-body-md text-on-surface-variant mt-xs">Premium harman çekirdeklerden taze demlenmiş.</p>
</div>
<div class="flex items-center justify-between mt-sm">
<div class="flex items-center bg-surface-container-low rounded-lg p-1 border border-outline-variant">
<button class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-variant transition-colors" onclick="decrement('q2')">
<span class="material-symbols-outlined text-body-lg">remove</span>
</button>
<span class="w-10 text-center font-headline-sm text-headline-sm" id="q2">1</span>
<button class="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-md shadow-sm transition-transform active:scale-90" onclick="increment('q2')">
<span class="material-symbols-outlined text-body-lg">add</span>
</button>
</div>
</div>
</div>
</div>
<!-- Product: Çay -->
<div class="bento-card bg-surface-container-lowest rounded-xl p-md border border-outline-variant shadow-sm flex gap-md">
<div class="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
<img class="w-full h-full object-cover" data-alt="A traditional Turkish tea glass on a small saucer, showing the vibrant 'rabbit blood' red color of the tea. Steam rises gently against a soft-focus corporate kitchen background. Clean, minimalist, professional food photography, focusing on clarity and warmth." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwOL79Y4e4Fr8Vqf7ZjOH2eMoQLG0Bc2bfqvGEf7vSgZeWm42oTxxE5mFDDyC5Ep3C6LdOvsp_De2XYFBDgGA8CXuVM4z1HVBqyZ2HJwcvFp3Y8F9KWEg_yTVuL3LAOX-s7Vvy_Pw9qpqqn4Uc7_9vqmFRE05lMcvLfE85pPD2R7g91dnNejpqR0KA4rbMsfPcjo7p7nAA2iG21QKkGQWDQU7ZZiueZ2xX2r-ZDM0mCBj8UhPDxqNZHpQu-YrwgBWDmLUld7v2ZAw"/>
</div>
<div class="flex-1 flex flex-col justify-between">
<div>
<div class="flex justify-between items-start">
<h3 class="font-headline-sm text-headline-sm text-on-surface">Çay</h3>
<span class="font-label-lg text-label-lg text-primary bg-primary-fixed px-2 py-1 rounded">₺20.00</span>
</div>
<p class="font-body-md text-body-md text-on-surface-variant mt-xs">Doğu Karadeniz'in seçkin çay yapraklarından demlenmiş.</p>
</div>
<div class="flex items-center justify-between mt-sm">
<div class="flex items-center bg-surface-container-low rounded-lg p-1 border border-outline-variant">
<button class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-variant transition-colors" onclick="decrement('q3')">
<span class="material-symbols-outlined text-body-lg">remove</span>
</button>
<span class="w-10 text-center font-headline-sm text-headline-sm" id="q3">0</span>
<button class="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-md shadow-sm transition-transform active:scale-90" onclick="increment('q3')">
<span class="material-symbols-outlined text-body-lg">add</span>
</button>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Floating Action Button Area -->
<div class="fixed bottom-0 left-0 w-full p-container-padding z-50 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
<div class="pointer-events-auto">
<button class="w-full h-14 bg-primary-container text-on-primary-container rounded-xl shadow-xl flex items-center justify-between px-lg transform active:scale-[0.98] transition-all duration-150">
<div class="flex items-center gap-sm">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">shopping_cart</span>
<span class="font-headline-sm text-headline-sm">Sepeti Gör</span>
</div>
<div class="flex items-center gap-md">
<span class="font-label-lg text-label-lg bg-on-primary-container text-primary-container px-3 py-1 rounded-full">2 Ürün</span>
<span class="material-symbols-outlined">chevron_right</span>
</div>
</button>
</div>
</div>
<!-- Bottom Navigation (Shell Logic applied) -->
<nav class="fixed bottom-0 w-full z-40 flex justify-around items-center bg-surface h-16 border-t border-outline-variant px-container-padding md:hidden">
<a class="flex flex-col items-center justify-center text-primary font-bold transition-transform duration-150 active:scale-95" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">home</span>
<span class="font-label-lg text-label-lg">Home</span>
</a>
<a class="flex flex-col items-center justify-center text-on-surface-variant transition-transform duration-150 active:scale-95" href="#">
<span class="material-symbols-outlined">list_alt</span>
<span class="font-label-lg text-label-lg">Orders</span>
</a>
<a class="flex flex-col items-center justify-center text-on-surface-variant transition-transform duration-150 active:scale-95" href="#">
<span class="material-symbols-outlined">history</span>
<span class="font-label-lg text-label-lg">History</span>
</a>
</nav>
<script>
        function increment(id) {
            const el = document.getElementById(id);
            let val = parseInt(el.innerText);
            el.innerText = val + 1;
            updateCart();
        }

        function decrement(id) {
            const el = document.getElementById(id);
            let val = parseInt(el.innerText);
            if (val > 0) {
                el.innerText = val - 1;
            }
            updateCart();
        }

        function updateCart() {
            // Logic to update the floating button count if needed
            const q1 = parseInt(document.getElementById('q1').innerText);
            const q2 = parseInt(document.getElementById('q2').innerText);
            const q3 = parseInt(document.getElementById('q3').innerText);
            const total = q1 + q2 + q3;
            
            const cartText = document.querySelector('.bg-on-primary-container.text-primary-container');
            if(cartText) {
                cartText.innerText = `${total} Ürün`;
            }
        }

        // Ripple Effect Implementation for Buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function(e) {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement('span');
                ripple.style.position = 'absolute';
                ripple.style.width = '100px';
                ripple.style.height = '100px';
                ripple.style.background = 'rgba(255, 255, 255, 0.3)';
                ripple.style.borderRadius = '50%';
                ripple.style.transform = 'translate(-50%, -50%) scale(0)';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.style.pointerEvents = 'none';
                ripple.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.style.transform = 'translate(-50%, -50%) scale(4)';
                    ripple.style.opacity = '0';
                }, 10);
                
                setTimeout(() => {
                    ripple.remove();
                }, 500);
            });
        });
    </script>
</body></html>

<!-- Ürün Seçimi -->
<!DOCTYPE html>

<html class="light" lang="tr"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Siparişi Tamamla</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-tertiary-container": "#ef9900",
                        "surface-dim": "#dad9e1",
                        "inverse-on-surface": "#f1f0f7",
                        "on-error-container": "#93000a",
                        "on-primary-fixed-variant": "#264191",
                        "surface-container": "#eeedf4",
                        "on-secondary-fixed-variant": "#005236",
                        "tertiary": "#3e2400",
                        "on-primary-fixed": "#00164e",
                        "secondary-fixed-dim": "#4edea3",
                        "inverse-surface": "#2f3036",
                        "tertiary-fixed": "#ffddb8",
                        "surface-container-low": "#f4f3fa",
                        "on-secondary-container": "#00714d",
                        "on-error": "#ffffff",
                        "on-primary": "#ffffff",
                        "surface-variant": "#e3e1e9",
                        "tertiary-fixed-dim": "#ffb95f",
                        "primary-fixed-dim": "#b6c4ff",
                        "error": "#ba1a1a",
                        "on-surface": "#1a1b21",
                        "surface-container-highest": "#e3e1e9",
                        "background": "#faf8ff",
                        "on-surface-variant": "#444651",
                        "on-secondary": "#ffffff",
                        "surface-tint": "#4059aa",
                        "on-tertiary-fixed-variant": "#653e00",
                        "surface-bright": "#faf8ff",
                        "tertiary-container": "#5c3800",
                        "secondary-container": "#6cf8bb",
                        "primary": "#00236f",
                        "on-tertiary-fixed": "#2a1700",
                        "surface": "#faf8ff",
                        "outline": "#757682",
                        "on-tertiary": "#ffffff",
                        "on-secondary-fixed": "#002113",
                        "on-primary-container": "#90a8ff",
                        "outline-variant": "#c5c5d3",
                        "primary-fixed": "#dce1ff",
                        "secondary-fixed": "#6ffbbe",
                        "on-background": "#1a1b21",
                        "inverse-primary": "#b6c4ff",
                        "surface-container-high": "#e9e7ef",
                        "primary-container": "#1e3a8a",
                        "secondary": "#006c49",
                        "surface-container-lowest": "#ffffff",
                        "error-container": "#ffdad6"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "unit": "4px",
                        "lg": "24px",
                        "container-padding": "16px",
                        "gutter": "12px",
                        "sm": "8px",
                        "xs": "4px",
                        "md": "16px",
                        "xl": "32px"
                    },
                    "fontFamily": {
                        "body-lg": ["Inter"],
                        "label-md": ["Inter"],
                        "label-lg": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "headline-md": ["Inter"],
                        "headline-sm": ["Inter"],
                        "body-md": ["Inter"],
                        "headline-lg": ["Inter"]
                    },
                    "fontSize": {
                        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                        "label-md": ["11px", {"lineHeight": "14px", "fontWeight": "500"}],
                        "label-lg": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                        "headline-lg-mobile": ["22px", {"lineHeight": "28px", "fontWeight": "700"}],
                        "headline-md": ["20px", {"lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                        "headline-sm": ["18px", {"lineHeight": "24px", "fontWeight": "600"}],
                        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                        "headline-lg": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.02em", "fontWeight": "700"}]
                    }
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            line-height: 1;
            text-transform: none;
            letter-spacing: normal;
            word-wrap: normal;
            white-space: nowrap;
            direction: ltr;
        }
        .bento-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        .chip-active {
            background-color: #1e3a8a;
            color: #ffffff;
        }
        body {
            background-color: #F9FAFB;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="font-body-md text-on-surface antialiased">
<!-- Top App Bar -->
<header class="flex items-center justify-between px-md py-sm w-full bg-surface border-b border-outline-variant fixed top-0 z-50">
<div class="flex items-center gap-md">
<button class="material-symbols-outlined text-primary p-xs hover:bg-surface-container-low rounded-full transition-colors">arrow_back</button>
<h1 class="font-headline-sm text-headline-sm font-bold text-primary">Siparişi Tamamla</h1>
</div>
<div class="flex items-center gap-md">
<div class="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
<img class="w-full h-auto" data-alt="A professional business portrait of a modern office worker in a high-key, bright studio setting. The subject is wearing a clean white shirt and has a warm, confident expression. The lighting is soft and corporate, utilizing a minimalist aesthetic with clean lines and a soft gray background that perfectly matches a professional corporate UI." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCK_rFfyuufy28XDqIbtxAcXAqOftv5gfklzlaII-aSO71FRJxFsTu_p2brBfnleI82GTHvMe00PvySKZS_vcGecBa2y2yhI5onCLTaHahQ8F9EgC130-ttgvrTE11tmMfso_2WDMDbXV-vrLoK7AKKfKfB3yc1sT8tso-0BucI9FxHNcqETHzfhABaFWZnZmUPnT_j13kft2kHS0oH_FM4LWc3nsJ5uej3PIjtADAFP7vXFbC-QzdXgPiej6t1qal5qgiKiU1_Hls"/>
</div>
</div>
</header>
<main class="mt-20 px-container-padding pb-32 max-w-2xl mx-auto space-y-md">
<!-- Order Summary Section -->
<section class="space-y-sm">
<div class="flex items-center justify-between">
<h2 class="font-headline-sm text-headline-sm text-on-surface">Sipariş Özeti</h2>
<span class="text-label-lg font-label-lg text-primary bg-primary-fixed px-sm py-xs rounded-full">3 ÜRÜN</span>
</div>
<div class="bg-surface-container-lowest rounded-xl shadow-[0px_2px_4px_rgba(0,0,0,0.05)] border border-outline-variant overflow-hidden transition-all hover:shadow-md">
<div class="p-md flex items-center justify-between border-b border-outline-variant last:border-0">
<div class="flex items-center gap-md">
<div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant">coffee</span>
</div>
<div>
<p class="font-headline-sm text-headline-sm">Türk Kahvesi</p>
<p class="text-body-md text-on-surface-variant">Şekersiz</p>
</div>
</div>
<div class="text-right">
<span class="font-headline-sm text-headline-sm text-primary">2 Adet</span>
</div>
</div>
<div class="p-md flex items-center justify-between border-b border-outline-variant last:border-0">
<div class="flex items-center gap-md">
<div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant">water_full</span>
</div>
<div>
<p class="font-headline-sm text-headline-sm">Su</p>
<p class="text-body-md text-on-surface-variant">330ml Cam Şişe</p>
</div>
</div>
<div class="text-right">
<span class="font-headline-sm text-headline-sm text-primary">1 Adet</span>
</div>
</div>
</div>
</section>
<!-- Location Selection -->
<section class="space-y-sm">
<h2 class="font-headline-sm text-headline-sm text-on-surface">Teslimat Konumu</h2>
<div class="flex flex-wrap gap-sm" id="location-chips">
<button class="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-xl font-label-lg text-label-lg transition-all chip-active" onclick="selectLocation(this)">Ofis</button>
<button class="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-xl font-label-lg text-label-lg transition-all hover:bg-surface-container-low" onclick="selectLocation(this)">Toplantı Odası 1</button>
<button class="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-xl font-label-lg text-label-lg transition-all hover:bg-surface-container-low" onclick="selectLocation(this)">Toplantı Odası 2</button>
<button class="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-xl font-label-lg text-label-lg transition-all hover:bg-surface-container-low" onclick="selectLocation(this)">Yönetim Ofisi</button>
<button class="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-xl font-label-lg text-label-lg transition-all hover:bg-surface-container-low" onclick="selectLocation(this)">Diğer</button>
</div>
</section>
<!-- Notes Section -->
<section class="space-y-sm">
<label class="block font-headline-sm text-headline-sm text-on-surface" for="order-note">Özel İstek/Not</label>
<div class="relative">
<textarea class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-md font-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all" id="order-note" placeholder="Örn: Lütfen toplantı odasına bırakın" rows="3"></textarea>
<div class="absolute right-md bottom-md">
<span class="material-symbols-outlined text-outline-variant" style="font-variation-settings: 'FILL' 1;">edit_note</span>
</div>
</div>
</section>
<!-- Visual Context Card (Bento Style) -->
<div class="grid grid-cols-2 gap-sm">
<div class="bg-primary-container p-md rounded-xl text-on-primary-container flex flex-col justify-between h-32 relative overflow-hidden">
<div class="z-10">
<p class="font-label-lg text-label-lg opacity-80 uppercase tracking-widest">Tahmini Süre</p>
<p class="font-headline-lg text-headline-lg">8-12 Dk</p>
</div>
<span class="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-10">timer</span>
</div>
<div class="bg-secondary-container p-md rounded-xl text-on-secondary-container flex flex-col justify-between h-32 relative overflow-hidden">
<div class="z-10">
<p class="font-label-lg text-label-lg opacity-80 uppercase tracking-widest">Hazırlayan</p>
<p class="font-headline-lg text-headline-lg">Barista</p>
</div>
<span class="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-10">person</span>
</div>
</div>
</main>
<!-- Bottom Action Area -->
<div class="fixed bottom-0 left-0 right-0 p-md bg-surface border-t border-outline-variant shadow-[0px_-4px_12px_rgba(0,0,0,0.05)] z-50">
<div class="max-w-2xl mx-auto flex items-center gap-md">
<div class="flex-1">
<button class="w-full bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm py-md rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-sm group" onclick="submitOrder()">
<span>SİPARİŞİ GÖNDER</span>
<span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
</button>
</div>
</div>
</div>
<!-- Success Modal (Hidden by default) -->
<div class="fixed inset-0 bg-black/50 z-[100] hidden flex items-center justify-center p-md backdrop-blur-sm" id="success-modal">
<div class="bg-surface-container-lowest rounded-2xl p-xl max-w-sm w-full text-center space-y-md shadow-2xl scale-95 transition-transform duration-300 ease-out" id="modal-content">
<div class="w-20 h-20 bg-secondary-container text-secondary mx-auto rounded-full flex items-center justify-center">
<span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'wght' 700;">check_circle</span>
</div>
<div class="space-y-xs">
<h3 class="font-headline-lg text-headline-lg text-on-surface">Sipariş Alındı!</h3>
<p class="text-body-md text-on-surface-variant">Kahveniz hazırlanmaya başladı. En kısa sürede teslim edilecektir.</p>
</div>
<button class="w-full py-md bg-surface-container-high hover:bg-surface-container-highest rounded-xl font-headline-sm text-headline-sm transition-colors" onclick="closeModal()">Anasayfaya Dön</button>
</div>
</div>
<script>
        function selectLocation(btn) {
            const container = document.getElementById('location-chips');
            const buttons = container.getElementsByTagName('button');
            
            for (let b of buttons) {
                b.classList.remove('chip-active', 'bg-primary', 'text-on-primary');
                b.classList.add('bg-surface-container-lowest', 'text-on-surface-variant');
            }
            
            btn.classList.add('chip-active');
            btn.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant');
        }

        function submitOrder() {
            const modal = document.getElementById('success-modal');
            const content = document.getElementById('modal-content');
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // Trigger animation
            setTimeout(() => {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }, 10);
        }

        function closeModal() {
            const modal = document.getElementById('success-modal');
            const content = document.getElementById('modal-content');
            
            content.classList.add('scale-95');
            content.classList.remove('scale-100');
            
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 200);
        }

        // Ripple Effect on Main Button
        const orderBtn = document.querySelector('button[onclick="submitOrder()"]');
        orderBtn.addEventListener('mousedown', function(e) {
            let ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            let d = Math.max(this.clientWidth, this.clientHeight);
            ripple.style.width = ripple.style.height = d + 'px';
            ripple.style.left = e.clientX - this.getBoundingClientRect().left - d/2 + 'px';
            ripple.style.top = e.clientY - this.getBoundingClientRect().top - d/2 + 'px';
            setTimeout(() => ripple.remove(), 600);
        });
    </script>
<style>
        .ripple {
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }

        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    </style>
</body></html>