import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { buscarPokemon, listarPokemons, ErroDaApi } from './pokeApi.js';

const PORTA = Number(process.env.PORT ?? 3000);
const app = express();

app.use(express.static(path.join(import.meta.dirname, '..', 'public')));

// A rota de lista vem antes da rota com parâmetro.
app.get('/api/pokemons', async (req: Request, res: Response) => {
  const pagina = Number(req.query.pagina ?? 1);
  const resultado = await listarPokemons(pagina);
  res.status(200).json(resultado);
});

app.get('/api/pokemons/:termo', async (req: Request<{ termo: string }>, res: Response) => {
  const pokemon = await buscarPokemon(req.params.termo);
  res.status(200).json(pokemon);
});

app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use((erro: unknown, req: Request, res: Response, next: NextFunction) => {
  if (erro instanceof ErroDaApi) {
    res.status(erro.status).json({ erro: erro.message });
    return;
  }

  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

app.listen(PORTA, () => {
  console.log(`Pokédex em http://localhost:${PORTA}`);
});
