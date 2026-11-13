const $ = (id) => document.getElementById(id);
let numeroAtual = 0;
let paginaAtual = 1;
let historico = [];
let buscando = false;

const nomesTipos = {
  normal: 'normal', fire: 'fogo', water: 'água', electric: 'elétrico',
  grass: 'grama', ice: 'gelo', fighting: 'lutador', poison: 'veneno',
  ground: 'terra', flying: 'voador', psychic: 'psíquico', bug: 'inseto',
  rock: 'pedra', ghost: 'fantasma', dragon: 'dragão', dark: 'sombrio',
  steel: 'aço', fairy: 'fada'
};

async function pedirJson(url) {
  let resposta;
  try {
    resposta = await fetch(url);
  } catch {
    throw new Error('Sem conexão com o servidor. Ele está rodando?');
  }
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(corpo.erro ?? `Erro ${resposta.status}`);
  return corpo;
}

async function pedirPokemon(termo) {
  return pedirJson(`/api/pokemons/${encodeURIComponent(termo)}`);
}

function mostrarAviso(texto, tipo = 'erro') {
  $('aviso').textContent = texto;
  $('aviso').className = `aviso ${tipo}`;
  $('aviso').hidden = false;
}

function esconderAviso() {
  $('aviso').hidden = true;
}

function traduzirTipo(tipo) {
  return nomesTipos[tipo] ?? tipo;
}

function mostrarPokemon(p) {
  numeroAtual = p.numero;
  esconderAviso();
  $('numero').textContent = `#${String(p.numero).padStart(3, '0')}`;
  $('nome').textContent = p.nome;
  $('altura').textContent = `${p.altura.toFixed(1)} m`;
  $('peso').textContent = `${p.peso.toFixed(1)} kg`;

  $('tipos').replaceChildren(...p.tipos.map((tipo) => {
    const li = document.createElement('li');
    li.textContent = traduzirTipo(tipo);
    li.className = `tipo tipo-${tipo}`;
    return li;
  }));

  const img = $('imagem');
  img.hidden = !p.imagem;
  $('placeholder').hidden = Boolean(p.imagem);
  if (p.imagem) {
    img.src = p.imagem;
    img.alt = p.nome;
  } else {
    img.removeAttribute('src');
    img.alt = '';
  }

  adicionarHistorico(p);
  $('anterior').disabled = p.numero <= 1;
}

function adicionarHistorico(p) {
  historico = [p, ...historico.filter((item) => item.numero !== p.numero)].slice(0, 5);
  $('contador-historico').textContent = `${historico.length}/5`;
  $('historico').replaceChildren(...historico.map((item) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'historico-item';
    const img = document.createElement('img');
    img.src = item.imagem ?? '';
    img.alt = '';
    const nome = document.createElement('span');
    nome.textContent = item.nome;
    const numero = document.createElement('small');
    numero.textContent = `#${String(item.numero).padStart(3, '0')}`;
    button.append(img, nome, numero);
    button.addEventListener('click', () => buscar(String(item.numero)));
    li.append(button);
    return li;
  }));
}

function travarBotoes(travar) {
  buscando = travar;
  document.querySelectorAll('button').forEach((botao) => {
    if (botao.id !== 'pagina-anterior' && botao.id !== 'pagina-proxima') {
      botao.disabled = travar;
    }
  });
  if (!travar) {
    $('anterior').disabled = numeroAtual <= 1;
  }
}

async function buscar(termo) {
  if (buscando || !termo) return;
  mostrarAviso('Buscando Pokémon...', 'info');
  travarBotoes(true);
  try {
    const pokemon = await pedirPokemon(termo);
    mostrarPokemon(pokemon);
  } catch (erro) {
    mostrarAviso(erro instanceof Error ? erro.message : 'Ocorreu um erro inesperado.');
  } finally {
    travarBotoes(false);
  }
}

async function carregarLista(pagina) {
  $('lista-pokemons').textContent = 'Carregando lista...';
  $('pagina-atual').textContent = `Página ${pagina}`;
  try {
    const dados = await pedirJson(`/api/pokemons?pagina=${pagina}`);
    $('lista-pokemons').replaceChildren(...dados.pokemons.map((p) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'item-lista';
      const numero = document.createElement('small');
      numero.textContent = `#${String(p.numero).padStart(3, '0')}`;
      const nome = document.createElement('span');
      nome.textContent = p.nome;
      button.append(numero, nome);
      button.addEventListener('click', () => buscar(String(p.numero)));
      return button;
    }));
    $('pagina-anterior').disabled = pagina <= 1;
    $('pagina-proxima').disabled = pagina * 20 >= dados.total;
  } catch (erro) {
    $('lista-pokemons').textContent = erro instanceof Error ? erro.message : 'Erro ao carregar lista.';
  }
}

$('imagem').addEventListener('error', () => {
  $('imagem').hidden = true;
  $('placeholder').hidden = false;
});

$('busca').addEventListener('submit', (evento) => {
  evento.preventDefault();
  buscar($('termo').value.trim());
});

$('anterior').addEventListener('click', () => {
  if (numeroAtual > 1) buscar(String(numeroAtual - 1));
});
$('proximo').addEventListener('click', () => buscar(String(numeroAtual + 1)));
$('aleatorio').addEventListener('click', () => buscar(String(Math.floor(Math.random() * 151) + 1)));

$('pagina-anterior').addEventListener('click', () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    carregarLista(paginaAtual);
  }
});
$('pagina-proxima').addEventListener('click', () => {
  paginaAtual++;
  carregarLista(paginaAtual);
});

carregarLista(paginaAtual);
buscar('1');
