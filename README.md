# EletroTech ⚡🐟

Site institucional, catálogo interativo e painel administrativo da **Eletrotech** — Soluções em automação elétrica, montagem de painéis industriais e monitoramento inteligente para piscicultura (destaque para a sonda **OXILIFE FISH**).

---

## 🌟 Destaques & Engenharia de Animações

O projeto incorpora uma camada de design e micro-interações de alto padrão (*agency-tier*), inspirada em referências visuais modernas como Admove.ai e Quadrangular, mantendo 100% de conformidade com performance na GPU e acessibilidade:

- **Física LERP e 3D Tilt**: Efeito de inclinação tridimensional no Hero e na Sonda OXILIFE FISH com interpolação suave via LERP (*Linear Interpolation*, fator `0.08`), perspectiva de `1200px` e flutuação senoidal contínua no eixo Y.
- **Spotlight de Luz Interativo**: Efeito radial de iluminação nos cards (`.card`, `.service-card`, `.stat-card`) que segue dinamicamente as coordenadas do cursor via CSS Variables (`--mouse-x`, `--mouse-y`) com delegação de eventos passiva.
- **Scroll Reveal com Foco Óptico**: Revelação de elementos na rolagem combinando desfoque progressivo (`blur(5px)` → `0`), micro-escala e cálculo automático de *stagger* temporal entre elementos irmãos (`min(idx * 60ms, 320ms)`).
- **Aura & Halos Luminosos**: Halo respiratório suave ao redor da sonda OXILIFE FISH e aura luminosa ambiente de 550px no Hero (`aura-pulse` e `probe-halo`).
- **Simulação Hidrodinâmica de Bolhas de O₂**: 28 partículas aquáticas geradas parametricamente com oscilação lateral senoidal em múltiplos keyframes e velocidades/opacidades orgânicas.
- **Filtro de Catálogo com Transição em 2 Tempos**: Alternância de abas de produtos com fade-slide de saída (`220ms`), troca de dados e reentrada suave (`350ms`) com *force reflow*.
- **Feedback Tátil**: Compressão tátil elástica em botões e abas (`scale(0.97)` no `:active`), além de *overshoot spring* nos ícones.
- **Acessibilidade Rigorosa (A11y)**: Suporte completo à media query `prefers-reduced-motion: reduce`, desativando animações e apresentando o conteúdo imediatamente para usuários sensíveis a movimento.

---

## 🚀 Tecnologias

- **Frontend**:
  - HTML5 Semântico e responsivo.
  - CSS3 Moderno (Design Tokens, Custom Properties, Grid, Flexbox, Keyframes, Glassmorphism).
  - JavaScript Modular Vanilla (ES6+, padrão IIFE, `IntersectionObserver`, `requestAnimationFrame`).
  - Suporte Multilíngue nativo (Português, Inglês e Espanhol).
- **Backend**:
  - Node.js & Express.
  - Segurança com Helmet e CORS configurados.
  - Upload de imagens via Multer.
  - Middlewares com controle estrito de cache em desenvolvimento (`Cache-Control: no-cache, no-store`).
- **Banco de Dados**:
  - SQLite persistente através do WebAssembly (`sql.js`).
- **Autenticação**:
  - JWT (JSON Web Tokens) e hash de senhas com Bcrypt.
- **Qualidade & Testes**:
  - Playwright E2E.

---

## 📁 Estrutura do Projeto

```text
├── public/                # Frontend da aplicação
│   ├── assets/            # Imagens e mídias otimizadas
│   ├── css/               # Folhas de estilo modulares
│   │   ├── variables.css  # Design tokens, paleta e curvas de transição
│   │   ├── base.css       # Reset, tipografia global e classes .reveal
│   │   ├── components.css # Navbar, cards com spotlight, botões táteis, modal
│   │   ├── sections.css   # Hero aura, halos, bolhas O₂ e seções
│   │   ├── responsive.css # Breakpoints e adaptações mobile/tablet
│   │   └── admin.css      # Estilização do painel administrativo
│   ├── js/                # Scripts modulares do cliente
│   │   ├── animations.js  # LERP tilt 3D, spotlight, reveals, bolhas e contadores
│   │   ├── products.js    # Catálogo dinâmico, filtros suaves e modal
│   │   ├── app.js         # Orquestrador principal da aplicação
│   │   ├── navigation.js  # Navbar fixa e menu mobile
│   │   ├── faq.js         # Accordion animado com curva spring
│   │   ├── i18n.js        # Motor de internacionalização (PT/EN/ES)
│   │   └── admin.js       # CRUD e gestão administrativa de produtos
│   ├── i18n/              # Dicionários de tradução JSON (pt-BR, en, es)
│   ├── index.html         # Página principal da Eletrotech
│   └── admin.html         # Painel administrativo
├── server/                # Backend da aplicação
│   ├── db/                # Banco SQLite (eletrotech.db) e seed inicial
│   ├── middleware/        # Middlewares de autenticação JWT
│   ├── routes/            # Rotas REST (/api/products, /api/auth, /api)
│   └── server.js          # Servidor principal Express
├── tests/                 # Testes automatizados (Playwright)
├── package.json           # Dependências e scripts
└── .gitignore             # Configuração de arquivos ignorados
```

---

## 🛠️ Como Executar

### 1. Pré-requisitos
- Node.js instalado (v18 ou superior recomendado).

### 2. Instalação das dependências
```bash
npm install
```

### 3. Popular o banco de dados (caso inicial ou para redefinição)
```bash
npm run seed
```

### 4. Iniciar o servidor
```bash
npm start
```
Ou em modo de desenvolvimento com recarregamento automático:
```bash
npm run dev
```

O servidor estará acessível em:
- **Site público**: [http://localhost:3000](http://localhost:3000)
- **Painel administrativo**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
- **API**: [http://localhost:3000/api](http://localhost:3000/api)

---

## 🧪 Testes

Para executar a suíte de testes ponta a ponta com Playwright:
```bash
npx playwright test
```

---

## 📄 Licença

Proprietário © Eletrotech. Todos os direitos reservados.