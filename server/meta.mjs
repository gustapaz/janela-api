export const meta = {
  repo: "janela-api",
  title: "Janela API",
  engine: "assemblyscript-wasm",
  accent: "#7b4b20",
  headline: "O próximo horário precisa caber para todos.",
  description:
    "Cruze agendas sintéticas no servidor, aplique buffers e encontre intervalos livres para todos os participantes. O cálculo roda em WebAssembly compilado de AssemblyScript.",
  behavior:
    "Intervalos são minutos inteiros e semiabertos. A união de todos os bloqueios forma o tempo ocupado; seu complemento produz janelas comuns. Horários candidatos seguem uma grade ancorada no início da jornada. Buffer amplia cada bloqueio, sem alterar a jornada.",
  limits:
    "Uma jornada de até 1440 minutos, 1–10 participantes e até 200 bloqueios. Duração 5–480, passo 5–120 e buffer 0–120 minutos. Sem datas, fusos, reservas ou armazenamento; o serviço calcula disponibilidade, não impede uma reserva concorrente.",
  primary: "/api/v1/availability",
  secondary: "/api/v1/windows",
  primaryLabel: "Encontrar horários →",
  secondaryLabel: "Somente janelas livres",
  examples: [
    {
      name: "Duas agendas",
      input: {
        start: 540,
        end: 1020,
        duration: 30,
        step: 30,
        buffer: 0,
        participants: [
          { id: "ana", busy: [{ start: 600, end: 660 }] },
          {
            id: "rui",
            busy: [
              { start: 630, end: 720 },
              { start: 900, end: 960 },
            ],
          },
        ],
      },
      expected: { free_minutes: 300, slot_count: 10 },
    },
    {
      name: "Com buffer",
      input: {
        start: 540,
        end: 720,
        duration: 30,
        step: 15,
        buffer: 15,
        participants: [{ id: "ana", busy: [{ start: 600, end: 630 }] }],
      },
      expected: { free_minutes: 120, slot_count: 6 },
    },
    {
      name: "Sem espaço",
      input: {
        start: 540,
        end: 600,
        duration: 30,
        step: 5,
        participants: [{ id: "ana", busy: [{ start: 540, end: 600 }] }],
      },
      expected: { free_minutes: 0, slot_count: 0 },
    },
  ],
  secondaryExpected: { free_minutes: 300 },
};
