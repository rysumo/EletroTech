# EletroTech ⚡🐟

Site institucional e catálogo da **Eletrotech** — Soluções em automação elétrica, montagem de painéis industriais e monitoramento para piscicultura (OXILIFE FISH).

---

## 🚀 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript modular (Vanilla ES6+), suporte multilíngue (Português, Inglês, Espanhol).
- **Backend**: Node.js com Express, Helmet, CORS e Multer.
- **Banco de Dados**: SQLite (via `sql.js` com persistência em arquivo).
- **Autenticação**: JWT (JSON Web Tokens) e Bcrypt.
- **Testes**: Playwright E2E.

---

## 📁 Estrutura do Projeto

```text
├── public/                # Frontend da aplicação
│   ├── assets/            # Imagens e mídias otimizadas
│   ├── css/               # Folhas de estilo (tema escuro/claro, responsivo)
│   ├── js/                # Scripts do cliente (catálogo, admin, filtros, i18n)
│   ├── i18n/              # Arquivos de tradução (pt, en, es)
│   ├── index.html         # Página principal da Eletrotech
│   └── admin.html         # Painel administrativo
├── server/                # Backend da aplicação
│   ├── db/                # Banco de dados SQLite e seed inicial
│   ├── middleware/        # Middlewares de autenticação JWT
│   ├── routes/            # Rotas da API (/api/products, /api/auth, /api)
│   └── server.js          # Servidor principal Express
├── tests/                 # Testes automatizados (Playwright)
├── package.json           # Dependências e scripts
└── .gitignore             # Configuração de arquivos ignorados no Git
```

---

## 🛠️ Como Executar

### 1. Pré-requisitos
- Node.js instalado (v18 ou superior recomendado).

### 2. Instalação das dependências
```bash
npm install
```

### 3. Popular o banco de dados (opcional, caso não exista `eletrotech.db`)
```bash
npm run seed
```

### 4. Iniciar o servidor
```bash
npm start
```
Ou em modo de desenvolvimento:
```bash
npm run dev
```

O servidor estará acessível em:
- **Site público**: [http://localhost:3000](http://localhost:3000)
- **Painel administrativo**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
- **API**: [http://localhost:3000/api](http://localhost:3000/api)

---

## 🧪 Testes

Para executar os testes end-to-end com Playwright:
```bash
npx playwright test
```

---

## 📄 Licença

Proprietário © Eletrotech. Todos os direitos reservados.