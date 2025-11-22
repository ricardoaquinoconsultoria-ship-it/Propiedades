// Configuración mínima de Supabase
console.log('🔧 Cargando config.js...');

const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1GXQm6L0Om6AZReeTK0e3Q81k-UQSVJAu3xMNQ';

// Cliente simple
window.supabase = {
    from: () => ({
        select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
            order: () => Promise.resolve({ data: [], error: null }),
            then: (resolve) => resolve({ data: [], error: null })
        }),
        insert: () => ({
            select: () => Promise.resolve({ data: [], error: null })
        })
    })
};

console.log('✅ config.js cargado');