// CONFIGURACIÓN SUPABASE ÚNICA - SOLO SUPABASE
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1GXQm6L0Om6AZReeTK0e3Q81k-UQSVJAu3xMNQ';

// Inicializar Supabase REAL
console.log('🚀 Inicializando Supabase REAL...');
try {
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado correctamente');
        
        // Verificar conexión
        window.supabase.from('properties').select('count', { count: 'exact', head: true })
            .then(({ count, error }) => {
                if (error) {
                    console.error('❌ Error conectando a Supabase:', error);
                } else {
                    console.log('✅ Conexión a Supabase exitosa. Tabla properties disponible');
                }
            });
    } else {
        throw new Error('Librería Supabase no cargada correctamente');
    }
} catch (error) {
    console.error('❌ Error crítico inicializando Supabase:', error);
    alert('❌ Error: No se pudo conectar a la base de datos. Recarga la página.');
}