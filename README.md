# EletroTech ⚡🐟
### Tecnologia Inteligente em Automação Elétrica & Piscicultura de Alta Precisão

[![Website](https://img.shields.io/badge/Status-Em_Produção-10b981?style=for-the-badge&logo=vercel)](http://localhost:3000)
[![Tech](https://img.shields.io/badge/Stack-Node.js_•_Express_•_Supabase_•_Vanilla_ES6+-10326f?style=for-the-badge)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/Playwright_E2E-11%2F11_Passando-10b981?style=for-the-badge&logo=playwright)](https://playwright.dev)
[![Location](https://img.shields.io/badge/Origem-Oeste_do_Paraná_•_Desde_2018-c9a84c?style=for-the-badge)](#sobre-a-empresa)

---

## 🌊 Visão Geral do Projeto

A **Eletrotech** é uma empresa de engenharia e soluções técnicas em automação elétrica, montagem de painéis industriais e tecnologia agroindustrial, sediada no **Oeste do Paraná** — o maior polo de produção de tilápias e piscicultura de precisão do Brasil.

Esta plataforma digital foi concebida para unir **presença de marca de alto impacto visual (*agency-tier*)**, **apresentação do ecossistema de soluções técnicas** e uma **arquitetura de software resiliente e segura**:

1. **Presença Institucional de Excelência**: Direção de arte cinematográfica, micro-interações táteis, ícones vetoriais sob medida e física de movimento fluida.
2. **Apresentação Técnica da Sonda OXILIFE FISH**: Destaque zootécnico e financeiro do produto carro-chefe da empresa, demonstrando os benefícios de oxigenação sob demanda e economia energética.
3. **Catálogo Reativo de Equipamentos & Serviços**: Vitrine dinâmica por categorias com busca instantânea, detalhes em modal e conversão direta via WhatsApp.
4. **Painel de Gestão Administrativa Enterprise**: Sistema autenticado com rotas canônicas limpas (`/admin`), controle de acesso por JWT, hash Bcrypt e proteção por Rate Limiting.
5. **Infraestrutura Híbrida e Resiliente**: Pronta para operação serverless na **Vercel** com banco **Supabase** (PostgreSQL) na nuvem e contingência automática para **SQLite local** caso o servidor opere offline.

---

## 🎯 O Desafio da Piscicultura & A Solução OXILIFE FISH

Na piscicultura intensiva (tanques e açudes de tilápia), o **Oxigênio Dissolvido (O₂)** é a variável zootécnica de maior risco:

- **O Problema**: A taxa de oxigênio cai drasticamente durante as madrugadas devido ao consumo biológico e ausência de fotossíntese. Uma queda brusca causa a perda súbita de toneladas de peixes em poucos minutos. Por receio, piscicultores costumam manter todos os aeradores ligados a noite toda, gerando **desperdício de milhares de reais em contas de energia elétrica** e desgastando os motores prematuramente.
- **A Solução OXILIFE FISH**: Um sistema inteligente composto por sonda de oxigênio de imersão de alta durabilidade aliada a um painel de automação industrial microprocessado que controla o acionamento em quatro estágios independentes.

```
                  ┌─────────────────────────────────────────┐
                  │          SONDA OXILIFE FISH             │
                  │   (Leitura contínua de O₂ e Temp.)      │
                  └────────────────────┬────────────────────┘
                                       │ Telemetria em Tempo Real
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       PAINEL INDUSTRIAL ELETROTECH      │
                  │  • Microprocessador de alta precisão    │
                  │  • Alarmes sonoros & notificações WiFi  │
                  └──────┬──────────┬──────────┬──────────┬─┘
                         │          │          │          │
                 Grupo 1 │  Grupo 2 │  Grupo 3 │  Grupo 4 │
                         ▼          ▼          ▼          ▼
                  [Aerador 1] [Aerador 2] [Aerador 3] [Aerador 4]
                     (Ligam e desligam somente sob demanda real)
```

### 🏆 Principais Diferenciais da OXILIFE FISH:

- **⚡ Economia de até 40% em Energia Elétrica**: Os aeradores só entram em operação de maneira escalonada conforme a real necessidade do tanque, evitando o consumo desnecessário da tarifa de ponta.
- **🛡️ Segurança Absoluta com Alarmes 24h**: Sirene local de alta intensidade e notificações imediatas via aplicativo no celular para níveis críticos de O₂ ou desvios térmicos.
- **📱 Monitoramento & Controle Remoto**: Acompanhamento dos parâmetros dos açudes em tempo real pelo smartphone via conexão WiFi.
- **🌡️ Manejo Zootécnico Integrado**: Monitoramento constante de temperatura para auxílio no ajuste fino do arraçoamento e melhor conversão alimentar.
- **💾 Histórico da Lagoa em Pendrive**: Exportação USB dos registros contínuos de oxigênio e acionamentos para auditoria de ciclo e relatórios zootécnicos.
- **🏭 Robustez Industrial Customizável**: Montagem em gabinetes de alta durabilidade com componentes industriais de ponta, permitindo controlar até **3 sondas independentes no mesmo painel**.

---

## 📦 Linhas de Produtos & Serviços Eletrotech

A plataforma atende desde pequenos e médios piscicultores até grandes complexos agroindustriais:

| Categoria | Descrição | Principais Itens |
|---|---|---|
| **Monitoramento & Piscicultura** | Controle de qualidade de água e segurança dos viveiros | Sondas OXILIFE FISH, Oxímetros Manuais Portáteis, Alarmes Sonoros sem fio |
| **Painéis & Automação** | Projetos elétricos industriais e agropecuários | Quadros de comando, Soft-Starters, Inversores de Frequência, Automação CLP |
| **Motores & Bombas** | Fornecimento, manutenção e recondicionamento | Motores elétricos Hércules (alta eficiência), rebobinamento técnico e bombas d'água |
| **Materiais Elétricos** | Linha completa de insumos de instalação industrial | Contatoras, relés térmicos, disjuntores motor, caixas de passagem e automação |
| **Linha Residencial** | Conforto, economia e pressurização predial | Linha completa de duchas e torneiras elétricas inteligentes Zagonel |

---

## ✨ A Experiência Digital: Engenharia de Animações & UI/UX

A interface foi projetada com engenharia de micro-interações inspirada em referências visuais de ponta (*agency-tier*), garantindo fidelidade técnica, fluidez a 60fps e acessibilidade universal:

- **LERP Spring Parallax (3D Tilt)**: O card da Sonda OXILIFE FISH e o elemento Hero reagem ao cursor do mouse com inclinação tridimensional calculada via algoritmo de interpolação linear contínua (LERP com fator `0.08`), complementada por flutuação senoidal contínua no eixo Y.
- **Spotlight Dinâmico de Luz**: Iluminação radial dourada que segue as coordenadas exatas do cursor sobre os cards (`--mouse-x` e `--mouse-y`), destacando detalhes de acabamento e profundidade com delegação de eventos passiva na GPU.
- **Scroll Reveal com Foco Óptico**: Transição cinematográfica de revelação na rolagem combinando desfoque progressivo (`blur(5px)` → `0`), micro-escala e escalonamento temporal inteligente (*stagger*) entre itens vizinhos.
- **Atmosfera Aquática Orgânica**: Simulação generativa de 28 bolhas de O₂ com profundidade, opacidades calibradas e oscilação lateral senoidal em múltiplos keyframes.
- **Design System Vetorial**: Substituição completa de emojis nativos por ícones SVG geométricos de alta precisão técnica integrados via módulo `Icons`.
- **Transição de Catálogo Fluida**: Alternância entre categorias com transição de duas fases (fade-slide de saída em `220ms` e reentrada em `350ms`) com *force reflow* para estabilidade visual.
- **Acessibilidade Universal**: Respeito estrito à preferência do sistema `prefers-reduced-motion: reduce`, desativando animações e exibindo o conteúdo imediatamente para usuários sensíveis.
- **Multilíngue Nativo**: Suporte em tempo real para **Português, Inglês e Espanhol** via dicionários JSON assíncronos.

---

## 🏛️ Arquitetura do Software & Segurança Enterprise

O sistema adota uma estrutura em camadas, projetada para alta disponibilidade, segurança defensiva e transição suave entre desenvolvimento local e produção serverless:

```
[ Cliente Web (Vanilla ES6+ Modular) ]
   ├── Design Tokens & CSS Glassmorphism
   ├── Animações Físicas (LERP, RAF, IntersectionObserver)
   ├── Design System SVG & Dicionários I18n (PT / EN / ES)
   └── SEO Técnico, OpenGraph & Schema Markup (JSON-LD)
            │
            │ REST API (JSON)
            ▼
[ Backend Express / Node.js ]
   ├── Rota Canônica Limpa (/admin) com Redirecionamento 301 de /admin.html
   ├── Camada de Segurança: Helmet, CORS restritivo e Rate Limiting
   ├── Autenticação Segura: JWT (HttpOnly/Bearer) + Hash de Senhas com Bcrypt
   ├── Upload e Otimização de Mídias via Multer
   └── Adaptador Serverless para Deploy Vercel (api/index.js)
            │
            ├── Em Produção (Nuvem):
            │   └── Supabase (PostgreSQL Gerenciado + Storage)
            │
            └── Em Desenvolvimento / Fallback Local:
                └── SQLite Persistente via WebAssembly (sql.js)
```

### Robustez & Qualidade de Código:
- **11 Testes Automatizados E2E (Playwright)**: Cobertura total de navegação, alternância de idiomas, filtros do catálogo, modais, FAQ dinâmico, meta tags SEO, JSON-LD, `robots.txt`, `sitemap.xml` e rotas administrativas.
- **URL Canônica `/admin`**: Acesso simplificado e profissional ao painel, com redirecionamento automático permanente (HTTP 301) para manter retrocompatibilidade com links antigos.
- **Rate Limiting Ativo**: Proteção contra ataques de força bruta no endpoint de login e mitigação de abuso nas requisições da API.

---

## 🏢 Sobre a Empresa

- **Fundação**: Agosto de 2018 (8 anos de sólida atuação regional).
- **Sedes**: Marechal Cândido Rondon e Toledo — Oeste do Paraná.
- **Diferencial Exclusivo**: Atendimento e plantão técnico de emergência **24 horas por dia (inclusive madrugadas, finais de semana e feriados)** para socorro imediato a viveiros de piscicultura e paradas de linha industrial.
- **Compromisso**: Confiabilidade extrema, respeito absoluto aos prazos acordados e suporte próximo ao produtor rural e à indústria.

---

## 🛠️ Guia Rápido de Execução & Testes

### Pré-requisitos
- **Node.js** (v18 ou superior recomendado).

### Instalação & Execução
```bash
# 1. Instalar dependências
npm install

# 2. Inicializar banco de dados local (SQLite)
npm run seed

# 3. Iniciar o servidor em modo desenvolvimento
npm run dev
```

Acesse:
- **Site Público**: [http://localhost:3000](http://localhost:3000)
- **Painel Administrativo**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Documentação da API**: [http://localhost:3000/api](http://localhost:3000/api)

### Execução dos Testes Automatizados
```bash
# Executar a bateria completa de 11 testes Playwright
npx playwright test
```

---

## 📄 Licença & Direitos

© **Eletrotech** — Soluções em Automação Elétrica & Piscicultura de Alta Precisão. Todos os direitos reservados.  
Desenvolvido com excelência técnica para o fortalecimento do agronegócio e da indústria nacional.