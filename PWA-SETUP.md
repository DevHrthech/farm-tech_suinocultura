# Configuração PWA - LMS Suinocultura

## Passo 1: Adicionar @angular/pwa

Execute o comando abaixo no diretório `frontend/`:

```bash
cd frontend
ng add @angular/pwa
```

Este comando vai:
- Instalar `@angular/service-worker`
- Gerar `ngsw-config.json`
- Criar `manifest.webmanifest`
- Gerar ícones padrão em `public/icons/`
- Criar `apple-touch-icon.png`

## Passo 2: Editar ngsw-config.json

Após o ng add, editar `frontend/ngsw-config.json` para incluir cache de API.

Ver arquivo: `ngsw-config.json` neste diretório.

## Passo 3: Editar manifest.webmanifest

Editar `frontend/public/manifest.webmanifest` com dados da aplicação.

Ver arquivo: `manifest.webmanifest` neste diretório.

## Passo 4: Substituir ícones

Substituir os ícones padrão gerados em `frontend/public/icons/` por ícones definitivos.

## Resultado

- App funciona offline com cache de courses/lessons
- Estratégia "freshness": tenta rede primeiro, cai para cache se offline ou timeout
- Installable como PWA em navegadores modernos
