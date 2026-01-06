const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// =======================
// CONFIG DE RARIDADE
// =======================
const raridades = [
  { nome: "Comum", chance: 0.60, mult: 1.0 },
  { nome: "Rara", chance: 0.30, mult: 1.3 },
  { nome: "Épica", chance: 0.09, mult: 1.6 },
  { nome: "Lendária", chance: 0.01, mult: 2.0 }
];

function rolarRaridade() {
  const r = Math.random();
  let acumulado = 0;
  for (const rar of raridades) {
    acumulado += rar.chance;
    if (r <= acumulado) return rar;
  }
  return raridades[0];
}

// =======================
// ARMAS BASE POR CLASSE
// =======================
const armasBase = {
  cavaleiro: [
    { nome: "Espada Enferrujada", ataque: 3 },
    { nome: "Espada Curta", ataque: 4 }
  ],
  mago: [
    { nome: "Cajado Gasto", ataque: 4 },
    { nome: "Cajado Arcano", ataque: 5 }
  ],
  arqueiro: [
    { nome: "Arco Simples", ataque: 3 },
    { nome: "Arco Reforçado", ataque: 4 }
  ]
};

// =======================
// ARMAS BOSS
// =======================
const armasBoss = {
  cavaleiro: [{ nome: "Espada do Dragão", ataque: 10 }],
  mago: [{ nome: "Cajado do Arcanista", ataque: 9 }],
  arqueiro: [{ nome: "Arco do Caçador", ataque: 9 }]
};

// =======================
// POÇÕES
// =======================
const pocoes = [
  { nome: "Poção de Vida", tipo: "consumível", cura: 20 }
];

function gerarArma(base) {
  const rar = rolarRaridade();
  return {
    nome: `${base.nome} (${rar.nome})`,
    tipo: "arma",
    raridade: rar.nome,
    ataque: Math.round(base.ataque * rar.mult)
  };
}

function classeValida(classe) {
  return ["cavaleiro", "mago", "arqueiro"].includes(classe);
}

app.get("/", (req, res) => {
  res.send("🐉 Elyndor está vivo!");
});

// =======================
// MISSÃO
// =======================
app.get("/mission/start", (req, res) => {
  const ataque = Number(req.query.ataque) || 5;
  const level = Number(req.query.level) || 1;
  const classe = req.query.classe;

  const dadoJogador = Math.floor(Math.random() * 20) + 1;
  const dadoInimigo = Math.floor(Math.random() * 20) + 1;

  const poderJogador = ataque + dadoJogador;
  const poderInimigo = 8 + level * 2 + dadoInimigo;

  const venceu = poderJogador >= poderInimigo;

  const dano = venceu
    ? Math.floor(poderInimigo / 3)
    : Math.floor(poderInimigo / 1.2);

  let loot = null;

  if (venceu && Math.random() < 0.4) {
    // 70% arma da classe | 30% poção
    if (classeValida(classe) && Math.random() < 0.7) {
      const pool = armasBase[classe];
      const base = pool[Math.floor(Math.random() * pool.length)];
      loot = gerarArma(base);
    } else {
      loot = pocoes[0];
    }
  }

  res.json({
    resultado: venceu ? "Vitória" : "Derrota",
    xp: venceu ? 30 : 10,
    dano,
    loot
  });
});

// =======================
// BOSS
// =======================
app.get("/boss/fight", (req, res) => {
  const ataque = Number(req.query.ataque) || 5;
  const level = Number(req.query.level) || 1;
  const classe = req.query.classe;

  const dadoJogador = Math.floor(Math.random() * 20) + 1;
  const dadoBoss = Math.floor(Math.random() * 20) + 1;

  const poderJogador = ataque + dadoJogador;
  const poderBoss = 10 + level * 3 + dadoBoss;

  const venceu = poderJogador >= poderBoss;

  const dano = venceu
    ? Math.floor(Math.random() * 10) + 5
    : Math.floor(Math.random() * 15) + 10;

  const xp = venceu ? 100 + level * 10 : 20;

  let loot = null;
  if (venceu && classeValida(classe)) {
    const base = armasBoss[classe][0];
    loot = gerarArma(base);
  }

  res.json({
    resultado: venceu ? "Vitória" : "Derrota",
    dano,
    xp,
    loot
  });
});

app.listen(3000, () => {
  console.log("Servidor Elyndor rodando em http://localhost:3000");
});
