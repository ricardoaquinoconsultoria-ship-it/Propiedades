// Configuración de Supabase
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1qfeM7S7wffWb3q0VcH7RTVg5H6VnL_2QcTj7E';

// Inicializar Supabase de forma segura
let supabase;

try {
    supabase = window.supabase || supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = supabase;
    console.log('✅ Supabase configurado correctamente');
} catch (error) {
    console.error('❌ Error configurando Supabase:', error);
    // Crear un objeto mock para evitar errores
    supabase = {
        from: () => ({
            select: () => Promise.resolve({ data: null, error: new Error('Supabase no disponible') }),
            insert: () => Promise.resolve({ data: null, error: new Error('Supabase no disponible') }),
            delete: () => Promise.resolve({ error: new Error('Supabase no disponible') })
        })
    };
    window.supabase = supabase;
}