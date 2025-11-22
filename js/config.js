// Configuración de Supabase
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1qfeM7S7wffWb3q0VcH7RTVg5H6VnL_2QcTj7E';

// Esperar a que Supabase esté disponible
let supabase;

function initializeSupabase() {
    try {
        // Verificar si Supabase está disponible globalmente
        if (typeof window.supabase !== 'undefined' && window.supabase.from) {
            console.log('✅ Supabase ya está inicializado');
            return window.supabase;
        }
        
        // Verificar si la librería Supabase está cargada
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.supabase = client;
            console.log('✅ Supabase inicializado correctamente');
            return client;
        } else {
            throw new Error('Librería Supabase no cargada');
        }
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        
        // Crear un mock para evitar errores
        const mockSupabase = {
            from: () => ({
                select: () => Promise.resolve({ data: [], error: new Error('Supabase no disponible') }),
                insert: () => Promise.resolve({ data: null, error: new Error('Supabase no disponible') }),
                delete: () => Promise.resolve({ error: new Error('Supabase no disponible') }),
                update: () => Promise.resolve({ data: null, error: new Error('Supabase no disponible') })
            }),
            auth: {
                signIn: () => Promise.resolve({ error: new Error('Auth no disponible') }),
                signOut: () => Promise.resolve({ error: new Error('Auth no disponible') })
            }
        };
        
        window.supabase = mockSupabase;
        console.warn('⚠️ Usando Supabase mock');
        return mockSupabase;
    }
}

// Inicializar inmediatamente
supabase = initializeSupabase();

// También exportar la función para re-inicializar si es necesario
window.initializeSupabase = initializeSupabase;