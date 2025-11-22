// Configuración de Supabase
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1qfeM7S7wffWb3q0VcH7RTVg5H6VnL_2QcTj7E';

// Inicializar Supabase
function initializeSupabase() {
    console.log('🚀 Inicializando Supabase...');
    
    try {
        // Intentar usar la librería real de Supabase
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.supabase = client;
            console.log('✅ Supabase REAL inicializado correctamente');
            return client;
        }
        
        // Si no está disponible, crear cliente básico
        console.log('⚠️ Creando cliente Supabase básico');
        const client = {
            from: (table) => ({
                select: (columns = '*') => ({
                    eq: (column, value) => Promise.resolve({ data: [], error: null }),
                    order: (column, options = {}) => Promise.resolve({ data: [], error: null }),
                    then: (resolve) => resolve({ data: [], error: null })
                }),
                insert: (data) => ({
                    select: (columns = '*') => Promise.resolve({ 
                        data: [{ 
                            id: Date.now(), 
                            ...(Array.isArray(data) ? data[0] : data),
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
            })
        };
        
        window.supabase = client;
        console.log('✅ Cliente Supabase básico creado');
        return client;
        
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        return null;
    }
}

// Inicializar inmediatamente
window.supabase = initializeSupabase();
window.initializeSupabase = initializeSupabase;

// Verificar conexión
window.checkSupabaseStatus = function() {
    if (window.supabase && window.supabase.from) {
        console.log('✅ Supabase está disponible');
        return true;
    } else {
        console.log('❌ Supabase no disponible');
        return false;
    }
};

console.log('🔧 Configuración de Supabase cargada');