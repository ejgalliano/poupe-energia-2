/**
 * Busca TODAS as linhas de uma tabela Supabase sem limite.
 * O Supabase JS retorna no máximo 1000 linhas por request por padrão.
 * Esta função pagina automaticamente até esgotar todos os registros.
 *
 * Uso:
 *   const rows = await fetchAll(() =>
 *     supabase
 *       .from("notas_empresas")
 *       .select("empresa_id, nota_final")
 *       .eq("ativa", true)
 *   );
 *
 * A função recebe um builder sem .range() — o fetchAll adiciona o range a cada página.
 */
export async function fetchAll<T>(
  buildQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>,
  pageSize = 1000
): Promise<T[]> {
  const results: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await buildQuery(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    results.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return results;
}
