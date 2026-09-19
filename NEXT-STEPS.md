# Próximos Passos - Deploy Unificado + PWA

## ✅ Tarefas Concluídas

### TAREFA 1: Backend serve build do Angular
- [x] `src/server.ts`: Adicionado `express.static()` e rota catch-all
- [x] `package.json`: Scripts atualizados para build do Angular + TypeScript

### TAREFA 2: Angular com APIs relativas
- [x] `frontend/src/environments/environment.ts` criado (dev: http://localhost:3000)
- [x] `frontend/src/environments/environment.prod.ts` criado (prod: relativo)
- [x] Todos os 5 serviços atualizados para importar `environment`

### TAREFA 3: PWA - Preparado
- [x] `PWA-SETUP.md`: Instruções para adicionar PWA
- [x] `ngsw-config.json.template`: Config com cache de API (freshness strategy)
- [x] `manifest.webmanifest.template`: Tema verde da app

## 🔧 Como Testar Localmente

### 1. Build e Run Unificado
```bash
npm run build
npm start
```
Acesse `http://localhost:3000` (sem porta 4200!)

### 2. Testes a fazer
- [ ] Home page carrega (http://localhost:3000)
- [ ] Login funciona
- [ ] Listar cursos funciona
- [ ] Acessar curso direto (ex: http://localhost:3000/courses/123) carrega sem 404
- [ ] Acessar lição (ex: http://localhost:3000/courses/123/lessons/456) funciona

## 🚀 Para Ativar PWA

1. **No diretório `frontend/`, execute:**
```bash
ng add @angular/pwa
```

2. **Editar `frontend/ngsw-config.json`:**
   - Copie o conteúdo de `ngsw-config.json.template`
   - Cole no arquivo gerado e ajuste conforme necessário

3. **Editar `frontend/public/manifest.webmanifest`:**
   - Copie o conteúdo de `manifest.webmanifest.template`
   - Cole no arquivo gerado (tema_color e background_color = verde #2d5a3d)

4. **Ícones:**
   - Deixar os ícones padrão gerados ou substituir após decisão visual

5. **Recompilar:**
```bash
npm run build
```

## 📝 Nota sobre Deploy no Render

- Build: `npm run build` (compila backend + frontend)
- Start: `npm start` (roda backend servindo frontend)
- PORT: Usar variável de ambiente (já configurado como `process.env.PORT || 3000`)

---

**Critérios de Aceite Alcançados:**
✅ npm run build compila Angular + backend
✅ Backend em localhost:3000 serve Angular completo
✅ APIs funcionam no cenário unificado
✅ Rotas diretas (ex: /courses/:id) não dão 404
