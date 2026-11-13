// Único arquivo que conhece o endereço da PokéAPI.
const URL_BASE = 'https://pokeapi.co/api/v2';
const TEMPO_LIMITE_MS = 5000;
const NOME_VALIDO = /^[a-z0-9-]{1,40}$/;

export interface Pokemon {
  numero: number;
  nome: string;
  tipos: string[];
  imagem: string | null;
  altura: number;
  peso: number;
}

interface RespostaPokeApi {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  sprites: { front_default: string | null };
  height: number;
  weight: number;
}

interface RespostaListaPokeApi {
  count: number;
  results: { name: string; url: string }[];
}

export interface PokemonLista {
  nome: string;
  numero: number;
}

export interface PaginaPokemons {
  pagina: number;
  total: number;
  pokemons: PokemonLista[];
}

const cache = new Map<string, Pokemon>();
const cacheListas = new Map<number, PaginaPokemons>();

export class ErroDaApi extends Error {
  constructor(public readonly status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroDaApi';
  }
}

function normalizar(termo: string): string {
  const nome = termo.trim().toLowerCase();
  if (!NOME_VALIDO.test(nome)) {
    throw new ErroDaApi(
      400,
      `Pokémon "${termo}" inválido: use o nome (ex.: pikachu) ou o número (ex.: 25)`
    );
  }
  return nome;
}

function resumir(dados: RespostaPokeApi): Pokemon {
  return {
    numero: dados.id,
    nome: dados.name,
    tipos: dados.types.map((t) => t.type.name),
    imagem: dados.sprites.front_default,
    altura: dados.height / 10,
    peso: dados.weight / 10
  };
}

async function buscarJson<T>(url: string): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(url, {
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS)
    });
  } catch {
    throw new ErroDaApi(503, 'A PokéAPI não respondeu. Tente novamente em instantes.');
  }

  if (resposta.status === 404) {
    throw new ErroDaApi(404, 'Pokémon não encontrado.');
  }
  if (!resposta.ok) {
    throw new ErroDaApi(503, 'A PokéAPI está com problemas. Tente novamente em instantes.');
  }
  return (await resposta.json()) as T;
}

export async function buscarPokemon(termo: string): Promise<Pokemon> {
  const nome = normalizar(termo);
  const guardado = cache.get(nome);
  if (guardado) return guardado;

  const dados = await buscarJson<RespostaPokeApi>(`${URL_BASE}/pokemon/${nome}`);
  const pokemon = resumir(dados);

  cache.set(nome, pokemon);
  cache.set(String(pokemon.numero), pokemon);
  return pokemon;
}

export async function listarPokemons(pagina: number): Promise<PaginaPokemons> {
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > 1000) {
    throw new ErroDaApi(400, 'Página inválida. Informe um número entre 1 e 1000.');
  }

  const guardada = cacheListas.get(pagina);
  if (guardada) return guardada;

  const limite = 20;
  const offset = (pagina - 1) * limite;
  const dados = await buscarJson<RespostaListaPokeApi>(
    `${URL_BASE}/pokemon?limit=${limite}&offset=${offset}`
  );

  const pokemons = dados.results.map((item) => {
    const numero = Number(item.url.split('/').filter(Boolean).at(-1));
    return { nome: item.name, numero };
  });

  const resultado: PaginaPokemons = {
    pagina,
    total: dados.count,
    pokemons
  };

  cacheListas.set(pagina, resultado);
  return resultado;
}
