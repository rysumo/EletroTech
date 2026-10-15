# ANIMACOES.md — Especificação de Animações e Micro-interações (Eletrotech)

> Documento exportado do que **está implementado** no código (não é wishlist).
> Pode ser entregue a outro modelo como referência/spec para reproduzir ou comparar.
> Referências de inspiração: Quadrangular (Ano do Crescimento 2027) e Admove.ai.

## 0. Regras de Ouro (restrições do projeto)

- **NÃO alterar o design**: cores, tipografia, grid, seções e copy permanecem idênticos. Só movimento.
- Paleta: Navy `#071a38` / `#10326f`, Dourado `#c9a84c`. Fontes: Bebas Neue (títulos) + Inter (corpo).
- Stack: HTML/CSS/JS puros (sem framework, sem libs de animação). Apenas `transform`, `opacity` e `filter` (GPU).
- Sempre respeitar `prefers-reduced-motion: reduce`.
- Backend Express serve `public/`; em dev usa headers `no-cache` e `?v=2.2` nos assets.

## 1. Tokens de Movimento (`public/css/variables.css`)

| Token | Valor |
|---|---|
| `--transition-fast` | `180ms cubic-bezier(0.16, 1, 0.3, 1)` |
| `--transition-base` | `300ms cubic-bezier(0.16, 1, 0.3, 1)` |
| `--transition-slow` | `600ms cubic-bezier(0.16, 1, 0.3, 1)` |
| `--transition-spring` | `500ms cubic-bezier(0.34, 1.56, 0.64, 1)` |

- **Ease principal** `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out expo): entradas e hovers.
- **Ease spring** `cubic-bezier(0.34, 1.56, 0.64, 1)` (overshoot): ícones, setas de accordion, botões de tab.
- **Ease de saída** `cubic-bezier(0.4, 0, 0.2, 1)`: somente na saída do filtro de produtos.

## 2. Scroll Reveal com "foco óptico" (`base.css` + `animations.js`)

Classes: `.reveal`, `.reveal-left`, `.reveal-right`, `.reveal-scale`. Ao ganhar `.visible` o elemento resolve o blur.

| Classe | Estado inicial | Estado final |
|---|---|---|
| `.reveal` | `opacity:0; translateY(+); scale(.98); blur(5px)` | `opacity:1; translateY(0) scale(1); blur(0)` |
| `.reveal-left` | `opacity:0; translateX(-32px) scale(.98); blur(5px)` | idem final |
| `.reveal-right` | `opacity:0; translateX(32px) scale(.98); blur(5px)` | idem final |
| `.reveal-scale` | `opacity:0; scale(.94) translateY(18px); blur(5px)` | idem final |

- Transição: `opacity/transform/filter 0.75s cubic-bezier(0.16,1,0.3,1)`; `will-change: opacity, transform, filter`.
- `IntersectionObserver`: `threshold: 0.05`, `rootMargin: 0px 0px -20px 0px`; dispara uma vez (`unobserve`).
- **Stagger automático** por posição entre irmãos: `min(index * 60ms, 320ms)` (só se houver mais de 1 irmão).
- Cards de serviços/estatísticas são renderizados via JS (`app.js`) com `.reveal-scale` e chamam `Animations.initRevealAnimations()` após renderizar.
- Reduced motion: tudo vira `opacity:1; transform:none; filter:none; transition:none`.

## 3. Hero

### 3.1 Aura ambiente (`.hero-glow-aura`)
- 550×550px, `border-radius:50%`, `radial-gradient(rgba(16,50,111,.5) → rgba(201,168,76,.22) 35% → transparent 70%)`, `filter: blur(60px)`.
- `@keyframes aura-pulse` 8s `ease-in-out infinite alternate`:
  `scale(.9) opacity .5` → `scale(1.15) translate3d(-30px,25px,0) opacity .85`.

### 3.2 Halo da sonda (`.hero-image::after`)
- `radial-gradient(rgba(201,168,76,.28) → transparent 68%)`, `blur(25px)`, `inset:-15px`.
- `@keyframes probe-halo` 4s `ease-in-out infinite alternate`: `opacity .45 / scale .96` → `opacity .9 / scale 1.06`.
- Mesmo halo/aura aplicado ao produto em destaque (OXILIFE FISH, seção `#featured`).

### 3.3 Bolhas de O₂ (`initBubbles`, `#bubbles`)
- 28 bolhas geradas por JS; tamanho 8–34px; `left` 3–97%.
- Variáveis por bolha: `--drift` (±12 a ±40px), `animation-duration` 6.5–11.5s, `animation-delay` 0–7s, `opacity` 0.45–0.9.
- `@keyframes bubble-rise` (linear, infinite): sobe de `0` até `-118vh` com **oscilação lateral senoidal** em 7 keyframes
  (`±drift × 0.75 / -0.9 / 1.15 / -0.85 / 0.6 / -0.3`) e escala `0.35 → 1.05 → 0.85`; fade-in até 14% e fade-out no fim.
- Visual: gradiente radial branco/ciano com `border: 1px solid rgba(255,255,255,.45)` e glow ciano.
- Desativado com reduced motion.

## 4. Tilt 3D com inércia LERP (`initTiltParallax`)

Aplicado em: Hero (`.hero-image img`, container `#hero`) e Destaque (`.featured-image img`, container `#featured`).

| Alvo | maxDeg | maxTranslate |
|---|---|---|
| Hero | 10° | 18px |
| Featured | 9° | 16px |

- `pointermove` normaliza posição (−0.5 a 0.5) dentro do container.
- Loop `requestAnimationFrame`: `current += (target - current) * 0.08` (LERP / spring).
- Flutuação ambiente contínua: `sin(t * 0.002) * 5px` no eixo Y.
- Transform: `translate3d(x, y, 0) rotateY() rotateX()`; `perspective:1200px` no pai, `transform-style: preserve-3d`, `will-change: transform` na imagem.
- `pointerleave` zera o alvo (retorno suave pelo próprio LERP).
- **Guard**: desativa se reduced motion, ou se `pointer: fine` falso **e** `innerWidth < 992`.

## 5. Spotlight nos cards (`initCardSpotlight` + `components.css`)

- Delegação de evento em `document` (`pointermove`) para `.card, .service-card, .stat-card` (funciona com cards renderizados dinamicamente).
- Grava `--mouse-x` / `--mouse-y` (px relativos ao card).
- `.card::before, .service-card::before`: `radial-gradient(380px circle at var(--mouse-x) var(--mouse-y), rgba(201,168,76,.12), transparent 65%)`, `opacity 0 → 1` no hover (0.3s), `z-index:3`, `pointer-events:none`.
- Hover do card: `translateY(-6px) scale(1.01)`, sombra `0 20px 40px -15px rgba(7,26,56,.22)` + borda dourada `0 0 0 1px rgba(201,168,76,.35)`; transição `0.45s cubic-bezier(0.16,1,0.3,1)`.

## 6. Botões e controles (`components.css`)

- `.btn`: `transition transform/box-shadow 0.25s cubic-bezier(0.16,1,0.3,1)`, cor/borda 0.2s ease.
- `.btn:active`: `transform: scale(0.97)` (compressão tátil). `.filter-tab:active` idem.
- `.btn:hover .btn-icon`: `scale(1.15) translateY(-1px)` com spring (0.25s `cubic-bezier(0.34,1.56,0.64,1)`).
- `.filter-tab`: transição de transform/cor/sombra 0.25s; estado ativo suave.
- Accordion (FAQ): `max-height 0.4s cubic-bezier(0.16,1,0.3,1)`; ícone rotaciona com spring `0.35s cubic-bezier(0.34,1.56,0.64,1)`.
- Navbar: ao rolar, altura/`background`/`box-shadow` transicionam 0.4s (`.scrolled`, `backdrop-filter: blur(20px)`); sublinhado dourado dos links cresce `width 0 → 100%`.
- Ícones de card/serviço: elevação com spring (`0.35s`, mesma curva spring).
- Pulsos contínuos já existentes: `pulse-badge` (badge de desconto, 2s), `whatsapp-pulse` (botão flutuante, 2s), `skeleton-wave` (loading, 1.5s).

## 7. Contadores de estatísticas (`animateCounter`)

- Dispara por `IntersectionObserver` (`threshold: 0.25`) em `.stat-value`.
- Duração 1800ms, **easeOutExpo**: `1 - 2^(-10x)`; inteiro por frame via `requestAnimationFrame`; sufixo (`+`, `%`…) vindo de `data-suffix`.
- Reduced motion: mostra valor final direto.

## 8. Transição de filtro do catálogo (`products.js`)

Ao trocar de aba de categoria (ignora clique na aba já ativa):
1. **Saída** (220ms, `cubic-bezier(0.4,0,0.2,1)`): `#products-grid` → `opacity:0; translateY(12px) scale(.99)`.
2. Após 220ms: `renderProducts(true)` troca o conteúdo.
3. **Entrada** (350ms, `cubic-bezier(0.16,1,0.3,1)`): `opacity:1; translateY(0) scale(1)`.

## 9. Acessibilidade e Performance

- `prefers-reduced-motion`: reveals instantâneos, bolhas e tilt desligados, spotlight desligado, contadores sem animação.
- Somente propriedades compostas pela GPU (`transform`, `opacity`, `filter`); `pointer-events:none` em todas as camadas decorativas.
- Listeners de pointer com `{ passive: true }`.

## 10. Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `public/css/variables.css` | Tokens de easing/duração |
| `public/css/base.css` | Classes `.reveal*` |
| `public/css/components.css` | Botões, cards, spotlight, tabs, accordion, navbar, pulsos |
| `public/css/sections.css` | Aura, halo, bolhas, perspectiva 3D |
| `public/js/animations.js` | Reveal/stagger, bolhas, contadores, tilt LERP, spotlight |
| `public/js/products.js` | Transição de filtro do catálogo |
| `public/js/app.js` | Render dinâmico de serviços/stats + reinit dos reveals |
| `server/server.js` | Headers `no-cache` para dev |

## 11. Checklist de aceite (para comparar implementações)

- [ ] Elementos entram com blur 5px → 0 + leve escala, com stagger de 60ms entre irmãos.
- [ ] Imagem do Hero e da sonda inclinam em 3D seguindo o mouse com inércia (sem "snap").
- [ ] Aura/halo dourado "respira" em loop sem causar jank.
- [ ] 28 bolhas sobem com deriva lateral orgânica e tamanhos variados.
- [ ] Luz dourada circular de 380px segue o cursor dentro dos cards.
- [ ] Botões comprimem a `0.97` ao clicar; ícones fazem overshoot spring.
- [ ] Trocar aba do catálogo = fade-slide (220ms saída / 350ms entrada), sem corte seco.
- [ ] Contadores com desaceleração expo ao entrar na viewport.
- [ ] Com reduced motion ativado, nada se move.
- [ ] Layout, cores e textos idênticos ao original.
