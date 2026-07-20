-- A migration anterior (20260719183828_politicas_desconto_por_faixa.sql) criou as
-- tabelas e as RLS policies, mas esqueceu do GRANT basico que o Supabase costuma
-- aplicar automaticamente quando a tabela e criada pelo painel. Sem isso, o Postgres
-- barra o acesso antes mesmo de avaliar as RLS policies ("permission denied for table").

grant select on public.politicas_desconto to anon, authenticated;
grant insert, update, delete on public.politicas_desconto to authenticated;

grant select on public.politicas_desconto_faixas to anon, authenticated;
grant insert, update, delete on public.politicas_desconto_faixas to authenticated;
