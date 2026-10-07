# Domínio do portfólio

Estado em 07/10/2026: concluído e testado.

| Host | Papel |
|---|---|
| `https://dan-figueiredo.com.br` | Endereço canônico. Abre o portfólio (HTTP 200). |
| `https://dan-figueiredo.dev.br` | Redirect **308** para `https://dan-figueiredo.com.br/`. |
| `https://www.dan-figueiredo.dev.br` | Redirect **308** para `https://dan-figueiredo.com.br/`. |

`metadataBase` em `app/layout.tsx` é `https://dan-figueiredo.com.br`. Não há `proxy.ts` neste setup: o redirect é do painel da Vercel.

DNS atual:

| Domínio | Nameserver | Registro que importa |
|---|---|---|
| `dan-figueiredo.com.br` | `a.auto.dns.br`, `b.auto.dns.br` (Registro.br) | **A** no ápice → IP da Vercel (hoje `216.198.79.1`) |
| `dan-figueiredo.dev.br` | `ns1.vercel-dns.com`, `ns2.vercel-dns.com` | Zona na Vercel; domínio ligado ao `project-hub` |

## Modelo mental (uma dúvida recorrente)

É **um** projeto Vercel (`project-hub`), **um** deploy. Não são dois servidores.

`dan-figueiredo.com.br`, `dan-figueiredo.dev.br` e `www.dan-figueiredo.dev.br` são **nomes** do mesmo app. O redirect só diz: “quem chegar pelo `.dev.br` vai para o `.com.br`”.

## Quem configura o quê

| Site | O que fazer | O que **não** fazer |
|---|---|---|
| **Registro.br** → domínio `dan-figueiredo.com.br` | Apontar o domínio para o IP da Vercel (registro A / “Endereço do site”). | Não colocar `ns1.vercel-dns.com` aqui. Não usar essa tela para redirect `.dev.br` → `.com.br`. |
| **Vercel** → projeto `project-hub` → **Settings → Domains** | Ligar os domínios; marcar redirect do `.dev.br` (e `www`) para o `.com.br` com **308**. | Não confundir com a página de Domains da **conta** (Connected Projects / DNS Records). |
| **Registro.br** → domínio `dan-figueiredo.dev.br` | Nada. DNS já é da Vercel. | Não mexer nos nameservers do `.dev.br`. |
| Subdomínio no `.dev.br` | Só na Vercel, no projeto certo. A zona é da Vercel e o registro nasce lá. | Não criar CNAME no Registro.br para esse nome. |
| Subdomínio no `.com.br` | 1) adicionar o host no projeto Vercel; 2) CNAME no Registro.br, no `.com.br`. | Não usar a tela **Endereço do site** (ela é o domínio principal). Não esperar um segundo campo na Vercel depois do CNAME. |

## Passo a passo que funcionou

### 1. Ligar o `.com.br` no projeto Vercel

No projeto **project-hub** → **Settings** → **Domains**, o domínio `dan-figueiredo.com.br` já entra como Production.

Se aparecer **Invalid Configuration**, abra **View DNS configuration**. A Vercel mostra um registro **A**, nome `@`, e um **IP**. Copie esse IP. Não invente outro.

Nesta entrega a Vercel **não** pediu nameserver da Vercel para o `.com.br`. Pediu só o A no provedor atual (Registro.br).

### 2. Apontar o `.com.br` no Registro.br

Abra o domínio **`dan-figueiredo.com.br`** (não o `.dev.br`).

Servidores DNS devem ficar:

- Servidor 1: `a.auto.dns.br`
- Servidor 2: `b.auto.dns.br`

**Não** troque por `ns1.vercel-dns.com` / `ns2.vercel-dns.com`. Nesses servidores a zona do `.com.br` responde **Query refused** (“Pesquisa recusada” no Registro.br). O `.dev.br` usa esse par e funciona; o `.com.br` não tem zona lá.

Interface do Registro.br neste domínio costuma mostrar Contatos, DNS (**Alterar servidores DNS**) e Provedor de serviços. Pode **não** aparecer **Configurar zona DNS** de cara.

Caminho que liberou o apontamento:

1. Em DNS, **Alterar servidores DNS** → **Utilizar DNS do Registro.br** (mesmo que já mostre `a.auto.dns.br`). Confirme.
2. Se aparecer “servidores DNS em transição” com contador (~2 h), espere e atualize a página. Nesse período a zona ainda não edita.
3. Quando abrir a tela de **Endereço do site** (ou zona / nova entrada):
   - Cole o **IPv4** copiado da Vercel.
   - Não cole URL (`https://...`) — isso seria redirect HTTP do Registro.br, não o apontamento para a Vercel.
   - Não use CNAME no ápice nessa tela.
   - Se for zona avançada: tipo **A**, nome **em branco** (no Registro.br, vazio = o domínio; o `@` da Vercel é esse campo vazio).
4. Em **Provedor de serviços**, deixe sem provedor. Isso não é DNS.

Pronto quando:

- `https://dan-figueiredo.com.br` abre o portfólio;
- na Vercel, `dan-figueiredo.com.br` fica **Valid Configuration**.

### 3. Redirect `.dev.br` → `.com.br` na Vercel

Faça no **projeto**, não na página do domínio na conta.

**Tela certa**

- Projeto **project-hub** → **Settings** → **Domains**
- URL no estilo: `…/project-hub/settings/domains`
- Lista com `dan-figueiredo.com.br`, `dan-figueiredo.dev.br`, `www…`, `*.vercel.app`

**Tela errada**

- Domains da conta / página do domínio `dan-figueiredo.dev.br` com **Connected Projects** e **DNS Records**
- Ali só vê projetos ligados e DNS. **Não** tem o redirect do site.

Em cada um de `dan-figueiredo.dev.br` e `www.dan-figueiredo.dev.br`:

1. Abra o menu do domínio (**Edit** / ⋯ / **Config**, conforme a UI).
2. **Redirect to** → `dan-figueiredo.com.br`.
3. Código: **308**.
4. Salve.

`dan-figueiredo.com.br` fica **sem** redirect (é o destino).

Código HTTP:

| Código | Use? |
|---|---|
| **308** | Sim — permanente e preserva o método HTTP. |
| 301 | Permanente, mas alguns clientes mudam POST → GET. |
| 307 / 302 | Temporários — não use para troca de domínio canônico. |

### 4. Conferência

- `https://dan-figueiredo.com.br` → 200, portfólio.
- `https://dan-figueiredo.dev.br` → 308 para `https://dan-figueiredo.com.br/`.
- `https://www.dan-figueiredo.dev.br` → 308 para `https://dan-figueiredo.com.br/`.

## Subdomínio (email-to-podcast)

`email-to-podcast.dan-figueiredo.dev.br` já está no projeto **email-to-podcast** (Production, **Valid Configuration**), junto com `email-to-podcast-gamma.vercel.app`. Os dois nomes são o mesmo deploy. O redirect de `dan-figueiredo.dev.br` → `.com.br` não afeta esse subdomínio.

### Por que o `.dev.br` se faz só na Vercel e o `.com.br` não

| Domínio | Quem guarda o DNS | O que acontece ao adicionar um nome no projeto |
|---|---|---|
| `.dev.br` | Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) | A Vercel cria o registro. Fica **Valid Configuration** sem CNAME manual. |
| `.com.br` | Registro.br (`a.auto.dns.br`, `b.auto.dns.br`) | A Vercel só anota o nome. O registro (A ou CNAME) é publicado no Registro.br. Enquanto isso, **Invalid Configuration**. |

O registro A do `dan-figueiredo.com.br` não vale para subdomínio. `email-to-podcast.dan-figueiredo.com.br` precisa de um CNAME próprio.

Não dá para repetir o fluxo do `.dev.br` no `.com.br` enquanto a zona do `.com.br` estiver no Registro.br. Apontar o `.com.br` para `ns1.vercel-dns.com` / `ns2.vercel-dns.com` foi recusado (“Pesquisa recusada”): esses servidores respondem **Query refused** para o `.com.br`.

### Ordem: Vercel primeiro, CNAME depois, Vercel não pede mais nada

1. Projeto **email-to-podcast** (não o `project-hub`) → **Settings** → **Domains**.
2. Adicione `email-to-podcast.dan-figueiredo.com.br`. Vai aparecer **Invalid Configuration**. Isso é esperado.
3. Abra **View DNS configuration** e copie o registro **CNAME** (nome e valor). O valor é um hostname, não um IP. Não reutilize o IP do portfólio.
4. No **Registro.br**, domínio **`dan-figueiredo.com.br`**:
   - **Configurar zona DNS** → **Nova entrada** → tipo **CNAME**.
   - Nome: `email-to-podcast` (só o prefixo).
   - Valor: o hostname copiado da Vercel.
   - **Adicionar** → **Salvar alterações**.
5. Se não houver **Configurar zona DNS**, abra **Configurar endereçamento** → **Modo avançado** → confirme. A mensagem “servidores DNS em transição” com contador (~2 h) é a espera. Não troque os servidores. Quando zerar, atualize a página e faça o passo 4.
6. A tela **Endereço do site** não é o lugar do CNAME de subdomínio. Ela configura só `dan-figueiredo.com.br`. “Nome alternativo (CNAME)” ali substitui o apontamento do domínio principal.

Depois que o CNAME estiver salvo no Registro.br, **não se adiciona outro campo na Vercel**. O host já foi incluído no passo 2. Atualize **Settings → Domains** do projeto **email-to-podcast** até `email-to-podcast.dan-figueiredo.com.br` passar para **Valid Configuration**. Aí `https://email-to-podcast.dan-figueiredo.com.br` abre o mesmo app.

## Bluesky e redirect no painel

O handle / DNS do `.dev.br` continua na Vercel. O redirect de domínio do painel manda **todas** as rotas do `.dev.br` para o `.com.br`, inclusive `/.well-known/atproto-did`.

Decisão desta entrega: redirect no painel (simples). Não há `proxy.ts`. Se no futuro a verificação do Bluesky no `.dev.br` precisar de **200** com o DID nesse host, aí o redirect sai do painel e volta para código (`proxy.ts`), com exceção dessa rota. A rota `app/.well-known/atproto-did/route.ts` já existe no repo.

## Gravatar (resolvido)

O perfil público é [gravatar.com/danzfigueiredo](https://gravatar.com/danzfigueiredo). A home busca a API (`api.gravatar.com/v3/profiles/danzfigueiredo`); se falhar, usa o snapshot local em `lib/gravatar.ts`. Atualizar o snapshot manualmente se o perfil no Gravatar mudar.
