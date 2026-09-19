# Bug Fixes Summary - Deploy Unificado Backend + Frontend

**Data:** 2026-09-19  
**Status:** ✅ TODOS OS BUGS CORRIGIDOS - TESTES PASSANDO

---

## Problema Inicial

Acessar `http://localhost:3000` (raiz) retornava:
```json
{"error":"Token não fornecido"}
```

**Causa Raiz:** `authMiddleware` estava sendo aplicado globalmente com `app.use(authMiddleware)` ANTES de `express.static()`, interceptando até requisições para HTML/CSS/JS estáticos do Angular.

---

## TAREFA 1: Corrigir Escopo do authMiddleware

### 🔴 ANTES (Incorreto)
```typescript
// src/server.ts
app.use(cors());
app.use(express.json());
app.get("/api/status", ...);
app.use("/api/auth", authRoutes);

app.use(authMiddleware);  // ❌ GLOBAL - intercepta TUDO depois disso
app.use("/api/courses", courseRoutes);
app.use("/api/courses/:courseId/lessons", lessonRoutes);
// ... outras rotas ...

app.use(express.static(path.join(__dirname, "../public")));  // ❌ Já passa por authMiddleware!
app.get("*", (req, res) => res.sendFile(...));  // ❌ Já passa por authMiddleware!
```

**Problema:** Qualquer requisição para `/`, `/index.html`, `/main.js`, etc. era interceptada por `authMiddleware` e bloqueada.

### ✅ DEPOIS (Correto)
```typescript
// src/server.ts
app.use(cors());
app.use(express.json());

// Rotas públicas (sem autenticação)
app.get("/api/status", ...);
app.use("/api/auth", authRoutes);

// Rotas protegidas (authMiddleware INLINE, não global)
app.use("/api/courses", authMiddleware, courseRoutes);
app.use("/api/courses/:courseId/lessons", authMiddleware, lessonRoutes);
app.use("/api/courses/:courseId/videos", authMiddleware, videoRoutes);
app.use("/api/courses/:courseId/quiz", authMiddleware, quizRoutes);
app.use("/api/me", authMiddleware, meRoutes);

// Serve Angular frontend build (SEM authMiddleware)
app.use(express.static(path.join(__dirname, "../public")));

// Catch-all para Angular Router (SEM authMiddleware)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});
```

**Solução:** 
- Remover linha `app.use(authMiddleware);` global
- Aplicar middleware inline: `app.use("/path", authMiddleware, router)`
- Garantir que `express.static()` e rota catch-all vêm DEPOIS, sem middleware

---

## TAREFA 2: Corrigir Caminho de Build do Angular

### 🔴 ANTES (Erro)
```javascript
// build-frontend.js (linha 10)
const sourceDir = path.join(__dirname, 'dist', 'frontend', 'browser');
// Procurava em: C:\suinocultura\farm-tech_suinocultura\dist\frontend\browser
// ❌ Não existe!
```

### ✅ DEPOIS (Correto)
```javascript
// build-frontend.js (linha 10)
const sourceDir = path.join(__dirname, 'frontend', 'dist', 'frontend', 'browser');
// Procura em: C:\suinocultura\farm-tech_suinocultura\frontend\dist\frontend\browser
// ✅ Correct!
```

**Explicação:** Angular 22 + nova build system coloca output em:
```
frontend/dist/frontend/browser/
├── index.html
├── main-XXXXX.js
├── styles-XXXXX.css
└── favicon.ico
```

---

## TAREFA 3: Compatibilidade com Express 5.x

### 🔴 ANTES (Erro)
```typescript
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});
```

**Erro:**
```
PathError [TypeError]: Missing parameter name at index 1: *
```

Express 5.x não permite `"*"` como path em `app.get()`. O path é interpretado como path-to-regexp pattern.

### ✅ DEPOIS (Correto)
```typescript
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});
```

**Solução:** Usar `app.use()` sem path específico para catch-all.

---

## Testes - Resultados Finais ✅

### Test 1: GET `/` → Deve retornar HTML do Angular
```
Status: 200
Content-Type: text/html
Response: <!doctype html><html lang="en"...
✅ PASSOU
```

### Test 2: GET `/api/status` → Deve retornar JSON (público)
```
Status: 200
Response: {"message":"LMS Suinocultura API rodando ??"}
✅ PASSOU
```

### Test 3: POST `/api/auth/login` → Login sem exigir token
```
Status: 200
Response: {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "user":{...}}
✅ PASSOU
```

### Test 4: GET `/api/courses` SEM token → Deve retornar 401
```
Status: 401
Response: {"error":"Token não fornecido"}
✅ PASSOU (comportamento correto: rota protegida)
```

### Test 5: GET `/api/courses` COM token válido → Deve retornar lista
```
Status: 200
Response: [
  {
    "id": "b1111111-1111-4111-8111-111111111101",
    "title": "Manejo de Maternidade e Cuidados com Leitões...",
    "category": "Maternidade",
    ...
  },
  ... (7 courses total)
]
✅ PASSOU
```

---

## Critérios de Aceite - Status Final

| Critério | Status |
|----------|--------|
| npm run build compila Angular + TypeScript | ✅ PASSOU |
| Backend serve build do Angular em localhost:3000 | ✅ PASSOU |
| Todas as chamadas de API funcionam | ✅ PASSOU |
| Rotas diretas não dão 404 | ✅ PASSOU |
| Autenticação funciona (públicas vs protegidas) | ✅ PASSOU |

---

## Arquivos Modificados

```
✅ src/server.ts
   - Removido app.use(authMiddleware) global
   - Aplicado middleware inline nas rotas protegidas
   - Rota catch-all compatível com Express 5.x

✅ build-frontend.js
   - Corrigido caminho: frontend/dist/frontend/browser

✅ dist/server.js
   - Recompilado com correções
```

---

## Como Usar Agora

### Build Unificado
```bash
npm run build
```
Isso vai:
1. Compilar TypeScript do backend → `dist/`
2. Compilar Angular → `frontend/dist/frontend/browser/`
3. Copiar output para `public/`

### Rodar Localmente
```bash
npm start
```
Acesse `http://localhost:3000` → Verá o Angular completo!

### Deploy no Render
- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Port:** `3000` (automático via `process.env.PORT || 3000`)

---

## Próximo Passo: PWA

Templates já preparados em:
- `ngsw-config.json.template` - Configuração de cache com strategy "freshness"
- `manifest.webmanifest.template` - Manifest com tema verde #2d5a3d

Para ativar:
```bash
cd frontend
ng add @angular/pwa
```

Depois copiar conteúdo dos templates para os arquivos gerados.

---

**Data de Resolução:** 2026-09-19  
**Commits:** 
- `819eebb` - Unificar deploy + PWA
- `b02375e` - Fix authMiddleware + build path + tests
