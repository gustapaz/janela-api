# Janela API

Interseção de agendas, buffers e horários em grade.

**Stack:** AssemblyScript + WebAssembly. Backend real. Vinext/React fornecem transporte e laboratório técnico, sem substituir as regras do servidor.

- [Demo](https://janela-api-gustapaz.starrylinen.chatgpt.site)
- [Documentação](https://janela-api-gustapaz.starrylinen.chatgpt.site/docs.html)
- [Arquitetura](docs/architecture.md) · [Segurança](docs/security.md)

## Executar localmente

Node.js 24 e npm; nenhuma conta, cartão ou segredo para execução local.

```sh
npm ci
npm run build:engine
npm test
npm run build
npm start -- --port 5231
```

Em outro terminal:

```sh
npm run smoke -- http://127.0.0.1:5231
```

O smoke usa apenas dados sintéticos. Não grava dados nem chama serviços externos. Veja examples/request.json para a entrada inicial.

## Contrato e arquitetura

POST /api/v1/availability; POST /api/v1/windows; GET /api/health; GET /api/v1/examples; GET /api/openapi.json.

O núcleo AssemblyScript calcula o complemento da união dos bloqueios em minutos inteiros. Uma instância WASM nova por requisição impede vazamento entre agendas. Intervalos [start,end); grade ancorada no início da jornada. JavaScript valida e traduz entradas e saídas.

## Testes e CI

11 testes, incluindo 300 cenários gerados contra oráculo independente de minutos e testes HTTP reais. A CI executa instalação limpa, testes, tipos, formatação e build. Use também npm run check e npm run typecheck.

## Hospedagem e limites

1–10 participantes, 200 bloqueios, jornada 0–1440 minutos, duração 5–480, passo 5–120, buffer 0–120. Até 288 slots. Sem datas, fusos, reservas ou armazenamento. JSON até 32 KiB.

Sem estado: entradas não são armazenadas.

Demo gratuita no Sites/Cloudflare Workers, sem cartão, trial ou faturamento ativado. A disponibilidade e as cotas dependem da hospedagem; não há SLA nem promessa de gratuidade permanente.

Dados da demonstração são sintéticos. Regras internas são reais. Não há efeitos externos mockados apresentados como processamento real.

## Licença

MIT — Gustavo Paz. Arquivos e dependências de terceiros preservam suas próprias licenças e avisos.
