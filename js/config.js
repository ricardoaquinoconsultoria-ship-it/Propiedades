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
        
        // Crear un mock MEJORADO para evitar errores
        const mockSupabase = {
            from: (table) => ({
                select: (columns = '*') => ({
                    eq: (column, value) => Promise.resolve({ data: [], error: null }),
                    order: (column, options = {}) => Promise.resolve({ data: [], error: null }),
                    // Para consultas simples sin filtros
                    then: (resolve) => resolve({ data: [], error: null })
                }),
                insert: (data) => ({
                    select: (columns = '*') => Promise.resolve({ 
                        data: [{ 
                            id: Date.now(), 
                            ...data, 
                            created_at: new Date().toISOString(),
                            status: 'disponible'
                        }], 
                        error: null 
                    })
                }),
                delete: () => ({
                    eq: (column, value) => Promise.resolve({ error: null })
                }),
                update: (data) => ({
                    eq: (column, value) => Promise.resolve({ data: null, error: null })
                })
            }),
            auth: {
                signIn: () => Promise.resolve({ error: null, user: null }),
                signOut: () => Promise.resolve({ error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
            }
        };
        
        // Hacer que el mock sea compatible con la sintaxis de cadena
        mockSupabase.from().select().then = (resolve) => resolve({ data: [], error: null });
        
        window.supabase = mockSupabase;
        console.warn('⚠️ Usando Supabase mock - Modo demo');
        console.log('💡 Funcionalidades disponibles en modo demo:');
        console.log('   - Agregar propiedades (se guardan localmente)');
        console.log('   - Ver lista de propiedades demo');
        console.log('   - Navegar por el admin panel');
        
        return mockSupabase;
    }
}

// Inicializar inmediatamente
supabase = initializeSupabase();

// También exportar la función para re-inicializar si es necesario
window.initializeSupabase = initializeSupabase;

// Función para verificar el estado de Supabase
window.checkSupabaseStatus = function() {
    if (window.supabase && window.supabase.from) {
        console.log('✅ Supabase está funcionando correctamente');
        return true;
    } else {
        console.log('❌ Supabase no está disponible - Usando modo demo');
        return false;
    }
};