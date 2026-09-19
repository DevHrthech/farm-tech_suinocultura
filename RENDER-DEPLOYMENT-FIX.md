# Fix: Render Deployment - "ng: not found" Error

**Data:** 2026-09-19  
**Status:** ✅ CORRIGIDO E TESTADO LOCALMENTE

---

## Problema Original

Ao fazer deploy no Render, o build falhava com:
```
sh: 1: ng: not found
```

### Causa Raiz

1. Render executa `npm install` **apenas na raiz do projeto** (backend)
2. A pasta `frontend/node_modules` **nunca é instalada**
3. O script `build-frontend.js` tenta executar `ng build` (Angular CLI)
4. Mas `ng` não está disponível porque não foi instalado

### Por que isso acontecia

```
Render Build Process:
┌─ npm install        (instala node_modules na raiz)
├─ npm run build      (executa backend build)
│  └─ tsc && npm run build:frontend
│     └─ node build-frontend.js
│        └─ cd frontend && npm run build  ❌ FALHA: ng não existe
│           └─ ng build
└─ npm start
```

---

## Solução Aplicada

Modificado `build-frontend.js` para instalar dependências do frontend **antes** de fazer o build:

### ANTES (Incorreto)
```javascript
// Linha 7
execSync('cd frontend && npm run build', { stdio: 'inherit' });
```

### DEPOIS (Correto)
```javascript
// Linha 7
execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
```

### Fluxo Corrigido
```
Render Build Process:
┌─ npm install        (instala node_modules na raiz)
├─ npm run build      (executa backend build)
│  └─ tsc && npm run build:frontend
│     └─ node build-frontend.js
│        └─ cd frontend && npm install && npm run build  ✅ SUCESSO
│           ├─ npm install (instala Angular, CLI, etc)
│           └─ ng build    (agora ng existe!)
└─ npm start
```

---

## Validação Local

Teste executado para confirmar que o build funciona em ambiente limpo (como no Render):

### Comando de Teste
```powershell
Remove-Item -Recurse -Force frontend\node_modules
npm run build
```

### Resultado ✅ PASSOU
```
1. ✅ frontend/node_modules foi recriado
2. ✅ public/index.html gerado
3. ✅ dist/server.js compilado
```

**Conclusão:** Script agora funciona mesmo quando `frontend/node_modules` não existe (ambiente limpo).

---

## Arquivos Modificados

```
✅ build-frontend.js
   Linha 7: Adicionado 'npm install &&' antes de 'npm run build'
```

---

## Impacto

### Local (Development)
- ❌ Mais lento (instala dependências toda vez que npm run build é executado)
- ✅ Garante consistência

### Render (Production)
- ✅ **CORRIGE O ERRO** - Agora as dependências são instaladas automaticamente
- ✅ Build completa com sucesso

### Otimização Futura (Opcional)
Se o tempo de build se tornar um problema, Render pode ser configurado com:
- Cache de `node_modules` entre builds
- Ou usar `npm ci` em vez de `npm install` (mais rápido)

Mas por enquanto, a prioridade é que o build funcione.

---

## Próximos Passos

1. **Testar no Render:**
   - Fazer um novo deploy no Render
   - Verificar se o build completa sem erro "ng: not found"
   - Confirmar que a aplicação está disponível

2. **Monitorar:**
   - Tempo de build (deve ser similar, talvez um pouco mais longo)
   - Se houver timeouts, considerar otimizações

3. **Opcional - Otimizar:**
   - Configurar cache de node_modules no Render
   - Usar `npm ci` ao invés de `npm install`

---

## Referências

- Build output no Render antes: "sh: 1: ng: not found"
- Build output esperado agora: "Frontend build completed successfully!"

**Commit:** `7c0bb5d` - Fix: Include npm install in frontend build for Render deployment
