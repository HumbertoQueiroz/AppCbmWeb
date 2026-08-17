# App193 — Painel Web

Painel utilizado pela guarnição do **Corpo de Bombeiros Militar de Campo Verde
(MT)** para atender e despachar as ocorrências registradas pelos cidadãos no
aplicativo mobile.

Trabalho de conclusão do curso de Análise e Desenvolvimento de Sistemas —
IFMT Câmpus Campo Verde. Trabalho reconhecido com **Troféu de Mérito
Estudantil** na 1ª Jornada de Ensino, Pesquisa e Extensão do câmpus, em 2025.

🔗 **Demo:** https://app-cbm-web.vercel.app

> O acesso é autenticado. A API que atendia esta instância está fora do ar, de
> modo que o login não conclui — para ver o painel funcionando, suba a
> [API](https://github.com/HumbertoQueiroz/APPCBM-BackEnd) localmente conforme
> as instruções abaixo.

## Funcionalidades

- **Autenticação** do militar, com sessão mantida em contexto
- **Listagem de ocorrências** recebidas do aplicativo
- **Detalhe da ocorrência** — natureza, endereço, coordenadas, vítimas e
  histórico de atendimento
- **Despacho de viatura** para a ocorrência
- **Acompanhamento do atendimento**, com registro das mudanças de status
- **Cadastro de usuários** militares, com preenchimento automático de endereço
  por CEP via [ViaCEP](https://viacep.com.br)
- **Cadastro e listagem da frota** de viaturas
- **Relatório de ocorrências**
- **Instalável como PWA**, com service worker registrado

## Stack

React 19 · Create React App · React Native Web · React Native Paper · PWA ·
Deploy na Vercel

## Rodando localmente

Requisitos: Node.js 20+.

```bash
git clone https://github.com/HumbertoQueiroz/AppCbmWeb
cd AppCbmWeb
npm install
npm start                     # http://localhost:3000
```

O painel depende da [API](https://github.com/HumbertoQueiroz/APPCBM-BackEnd),
que precisa estar em execução.

### Apontando para outra API

O endereço da API está fixo no código, repetido em cada tela de `src/screens/`:

```js
const resp = await fetch('https://cbm-app-6qeks.ondigitalocean.app/create-vehicle', { ... })
```

Para usar uma instância local, substitua todas as ocorrências desse host por
`http://localhost:8080`.

> **Melhoria conhecida:** essa URL deveria estar em uma variável de ambiente
> (`REACT_APP_API_URL`) ou em um módulo único de configuração, em vez de
> repetida em cada arquivo. Trocar de ambiente hoje exige editar várias telas,
> o que é frágil e fácil de errar pela metade.

## Estrutura

```
src/
  App.js                      Rotas e layout
  contexts/AuthContext.js     Sessão do usuário autenticado
  components/                 Header, Sidebar e componentes de apoio
  screens/
    Login.js                  Autenticação
    Home.js                   Listagem de ocorrências
    DetalheOcorrencia.js      Detalhe e atendimento da ocorrência
    DespachoViatura.js        Empenho de viatura
    IncidentResponses.js      Histórico de atendimentos
    CadastroOcorrencia.js     Registro manual de ocorrência
    CadastroUsuario.js        Cadastro de militares
    CadastroViaturas.js       Cadastro da frota
    RelatorioOcorrencias.js   Relatórios
  service-worker.js           PWA
```

## Projeto completo

| Camada | Repositório |
|---|---|
| App mobile | [APP-CBM-CAMPO-VERDE](https://github.com/HumbertoQueiroz/APP-CBM-CAMPO-VERDE) |
| API | [APPCBM-BackEnd](https://github.com/HumbertoQueiroz/APPCBM-BackEnd) |
| Painel web | este repositório |
