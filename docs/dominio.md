# Domínio do portfólio

Endereço canônico: `https://dan-figueiredo.com.br`.

O handle do Bluesky continua `dan-figueiredo.dev.br`. A rota `app/.well-known/atproto-did/route.ts` precisa responder **200** nesse host. Redirect de domínio no painel da Vercel manda o host inteiro embora e derruba a verificação. O redirect fica no código, com essa exceção.

`metadataBase` em `app/layout.tsx` já é `https://dan-figueiredo.com.br`. `lib/gravatar.ts` não muda nesta entrega (`GRAVATAR_PROFILE_SLUG` continua `danielfp`).

## O que ainda falta no DNS

Consulta em 05/10/2026:

| Domínio | Nameserver | No ar? |
|---|---|---|
| `dan-figueiredo.dev.br` | `ns1.vercel-dns.com`, `ns2.vercel-dns.com` | sim, na Vercel |
| `dan-figueiredo.com.br` | `a.auto.dns.br`, `b.auto.dns.br` | não: sem endereço A, `www` inexistente |

A zona do `.com.br` já foi criada no projeto Vercel. Ela só vale no mundo quando o nameserver no Registro.br for o da Vercel. Por isso `https://dan-figueiredo.com.br` não abre o portfólio, e o `proxy.ts` de redirect **não está** no repositório.

### Passo no Registro.br

1. Abra o domínio `dan-figueiredo.com.br`.
2. Em servidores DNS, troque `a.auto.dns.br` / `b.auto.dns.br` por `ns1.vercel-dns.com` e `ns2.vercel-dns.com` (o mesmo par do `.dev.br`).
3. No projeto Vercel `project-hub`, deixe `dan-figueiredo.com.br` como domínio primário.
4. Espere `https://dan-figueiredo.com.br` abrir o portfólio. Aí sim crie o redirect abaixo.

Mantenha o `.dev.br` nos nameservers da Vercel. Esse host continua servindo o DID do Bluesky.

## Redirect (só depois que o .com.br abrir)

Arquivo na raiz do `project-hub`: `proxy.ts`. Nesta versão do Next.js (16) o nome `middleware.ts` está obsoleto; a função se chama `proxy`.

Se o host for `dan-figueiredo.dev.br` ou `www.dan-figueiredo.dev.br` e o caminho **não** for `/.well-known/atproto-did`, responder **308** para o mesmo caminho e a mesma query em `https://dan-figueiredo.com.br`.

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const HOSTS_DEV = new Set([
  "dan-figueiredo.dev.br",
  "www.dan-figueiredo.dev.br",
]);

export function proxy(request: NextRequest) {
  const host = request.nextUrl.hostname;
  if (!HOSTS_DEV.has(host)) return NextResponse.next();
  if (request.nextUrl.pathname === "/.well-known/atproto-did") {
    return NextResponse.next();
  }

  const destino = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    "https://dan-figueiredo.com.br",
  );
  return NextResponse.redirect(destino, 308);
}
```

Conferir depois do deploy:

- `https://dan-figueiredo.dev.br/.well-known/atproto-did` → 200, com o DID em texto.
- Outra rota no `.dev.br` → 308 para o mesmo caminho em `https://dan-figueiredo.com.br`.

## Gravatar (task futura)

O perfil público passou a ser [gravatar.com/danzfigueiredo](https://gravatar.com/danzfigueiredo). A home ainda busca `api.gravatar.com/v3/profiles/danielfp` e, quando a API falha, cai no texto de `components/GravatarCard.tsx` (“Não foi possível carregar o perfil do Gravatar.”).

A correção desejada é o portfólio funcionar sem a API do Gravatar. Atualizar o slug para `danzfigueiredo` só restaura o cartão atual; essa troca não é a correção.
