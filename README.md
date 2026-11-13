# Pokédex UC33

Projeto acadêmico desenvolvido com Node.js, TypeScript, Express 5 e JavaScript puro. O servidor consome a PokéAPI e entrega à página somente os dados necessários.

## Funcionalidades

- Busca de Pokémon por nome ou número.
- API própria: `GET /api/pokemons/:termo`.
- Listagem paginada: `GET /api/pokemons?pagina=1` (20 por página).
- Cache em memória para buscas e páginas repetidas.
- Validação de entrada e timeout de 5 segundos.
- Respostas de erro em JSON com status HTTP adequados.
- Interface responsiva, histórico dos últimos 5 Pokémon e botão aleatório.
- Tipos em português, cores para os 18 tipos, altura e peso.

## Requisitos

- Node.js 22 ou superior.
- npm.
- VS Code (recomendado).

Confira as versões:

```bash
node -v
npm -v
```

## Instalação

Na pasta do projeto, execute:

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000.

## Compilar e executar a versão compilada

```bash
npm run build
npm start
```

## Rotas da API

### Buscar um Pokémon

`GET /api/pokemons/pikachu`

Exemplo de resposta:

```json
{
  "numero": 25,
  "nome": "pikachu",
  "tipos": ["electric"],
  "imagem": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  "altura": 0.4,
  "peso": 6
}
```

### Listar Pokémon

`GET /api/pokemons?pagina=1`

Retorna a página solicitada, com até 20 resultados:

```json
{
  "pagina": 1,
  "total": 1302,
  "pokemons": [
    { "nome": "bulbasaur", "numero": 1 },
    { "nome": "ivysaur", "numero": 2 }
  ]
}
```

O total e os resultados dependem dos dados atuais da PokéAPI.

## Tratamento de erros

- `400`: termo ou número de página inválido.
- `404`: Pokémon ou rota não encontrado.
- `503`: PokéAPI indisponível, falha de rede ou timeout.
- `500`: erro inesperado no servidor.

Todas as respostas de erro seguem o formato `{ "erro": "mensagem" }`.

## Desafios implementados

1. Tipos traduzidos para português.
2. Cores para os 18 tipos de Pokémon.
3. Histórico clicável dos últimos 5 Pokémon.
4. Botão para carregar um Pokémon aleatório entre 1 e 151.
5. Visual próprio e responsivo.
6. Altura e peso convertidos para metros e quilogramas.
7. Rota de lista com paginação de 20 Pokémon, cache e timeout.

## Segurança e boas práticas

- A página chama somente a API local; a URL da PokéAPI fica em `src/pokeApi.ts`.
- A entrada é validada no servidor.
- O front-end usa `textContent` e `createElement`, evitando inserir dados da API com `innerHTML`.
- O cache reduz chamadas repetidas à PokéAPI.
- `node_modules/` e `dist/` ficam fora do Git.

## Estrutura

```text
POKEDEX/
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── src/
│   ├── pokeApi.ts
│   └── server.ts
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

## Testes manuais

1. Abra a página e confira o Bulbasaur (#001).
2. Clique em Próximo e confira Ivysaur (#002).
3. Pesquise `Pikachu` e confira o número 25.
4. Pesquise `naoexiste` e confira o aviso 404.
5. Pesquise `pika chu` e confira a validação 400.
6. Clique em Aleatório e confira outro Pokémon.
7. Navegue pelo histórico e pela lista paginada.
8. Teste `npm run build` antes de enviar o projeto.

## Apresentação

Nossa Pokédex é diferente da versão simples do vídeo porque o navegador não consulta a PokéAPI diretamente. Ele chama o nosso servidor Express, que valida os dados, consulta a API externa, mantém cache e devolve um contrato pequeno. Isso centraliza a integração, evita chamadas repetidas e permite tratar erros de maneira organizada. A página também oferece recursos extras de navegação e acessibilidade visual.
