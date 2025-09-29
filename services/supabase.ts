import { createClient } from '@supabase/supabase-js';
import { clear } from 'console';

// As variáveis de ambiente para o Supabase são prefixadas com "VITE_".
// Esta alteração lê corretamente `process.env.VITE_SUPABASE_URL` e `process.env.VITE_SUPABASE_ANON_KEY`.
// CORREÇÃO: Remove espaços em branco e quaisquer ponto e vírgulas no final da URL para evitar erros de DNS.
const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim().replace(/;+$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as credenciais foram carregadas corretamente
if (!supabaseUrl || !supabaseAnonKey) {
  // Mensagem de erro atualizada para refletir os nomes corretos das variáveis, ajudando na depuração.
  throw new Error('Credenciais do Supabase não encontradas. Verifique se as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas corretamente.');
}

// Cria e exporta o cliente Supabase para ser usado em outras partes da aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey);