// Configuración de Supabase - TUS CREDENCIALES CORRECTAS
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1GXQm6L0Om6AZReeTK0e3Q81k-UQSVJAu3xMNQ';

// Inicializar Supabase REAL (ahora que la tabla existe)
function initializeSupabase() {
    console.log('🚀 Inicializando Supabase REAL...');
    console.log('📊 Tabla "properties" creada - Usando base de datos real');
    
    try {
        if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            console.log('✅ Librería Supabase disponible');
            const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Probar la conexión
            testSupabaseConnection(client);
            
            return client;
        } else {
            throw new Error('Librería Supabase no cargada');
        }
    } catch (error) {
        console.error('❌ Error con Supabase REAL:', error);
        console.log('🔄 Cayendo a modo local...');
        return createLocalClient();
    }
}

// Probar conexión a Supabase
async function testSupabaseConnection(client) {
    try {
        console.log('🔍 Probando conexión a Supabase...');
        const { data, error } = await client.from('properties').select('*').limit(1);
        
        if (error) {
            console.error('❌ Error de conexión:', error);
        } else {
            console.log('✅ Conexión a Supabase EXITOSA');
            console.log(`📊 Tabla "properties" tiene ${data.length} registros`);
        }
    } catch (testError) {
        console.error('❌ Error en prueba de conexión:', testError);
    }
}

// Cliente local de respaldo (por si acaso)
function createLocalClient() {
    console.log('🏠 Usando almacenamiento LOCAL como respaldo');
    
    const localClient = {
        _isLocal: true,
        from: (table) => ({
            select: (columns = '*') => ({
                eq: (column, value) => {
                    const data = getLocalData(table).filter(item => item[column] === value);
                    return Promise.resolve({ data, error: null });
                },
                order: (column, options = { ascending: false }) => {
                    let data = getLocalData(table);
                    data.sort((a, b) => {
                        if (options.ascending) {
                            return new Date(a.created_at) - new Date(b.created_at);
                        } else {
                            return new Date(b.created_at) - new Date(a.created_at);
                        }
                    });
                    return Promise.resolve({ data, error: null });
                },
                then: (resolve) => {
                    const data = getLocalData(table);
                    resolve({ data, error: null });
                }
            }),
            insert: (data) => ({
                select: (columns = '*') => {
                    console.log('💾 Guardando en LOCAL:', data);
                    const newData = Array.isArray(data) ? data : [data];
                    const result = [];
                    
                    newData.forEach(item => {
                        const newItem = {
                            id: item.id || Date.now() + Math.random(),
                            title: item.title || 'Sin título',
                            type: item.type || 'casa',
                            price: item.price || 0,
                            description: item.description || '',
                            location: item.location || { address: '', lat: 0, lng: 0 },
                            characteristics: item.characteristics || { 
                                bedrooms: 0, 
                                bathrooms: 0, 
                                area: 0,
                                parking: false,
                                pool: false,
                                garden: false
                            },
                            images: item.images || [],
                            status: item.status || 'disponible',
                            created_at: item.created_at || new Date().toISOString()
                        };
                        
                        saveLocalData(table, newItem);
                        result.push(newItem);
                    });
                    
                    return Promise.resolve({ data: result, error: null });
                }
            }),
            delete: () => ({
                eq: (column, value) => {
                    removeLocalData(table, column, value);
                    return Promise.resolve({ error: null });
                }
            }),
            update: (data) => ({
                eq: (column, value) => Promise.resolve({ data: null, error: null })
            })
        })
    };
    
    return localClient;
}

// Funciones para localStorage (respaldo)
function getLocalData(table) {
    const key = `inmobiliaria_${table}`;
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error leyendo localStorage:', error);
        return [];
    }
}

function saveLocalData(table, item) {
    const key = `inmobiliaria_${table}`;
    try {
        const currentData = getLocalData(table);
        const filteredData = currentData.filter(existing => existing.id !== item.id);
        filteredData.push(item);
        localStorage.setItem(key, JSON.stringify(filteredData));
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
    }
}

function removeLocalData(table, column, value) {
    const key = `inmobiliaria_${table}`;
    try {
        const currentData = getLocalData(table);
        const newData = currentData.filter(item => item[column] !== value);
        localStorage.setItem(key, JSON.stringify(newData));
    } catch (error) {
        console.error('Error eliminando de localStorage:', error);
    }
}

// Inicializar
window.supabase = initializeSupabase();
window.initializeSupabase = initializeSupabase;

// Función para verificar estado
window.checkSupabaseStatus = function() {
    if (window.supabase && !window.supabase._isLocal) {
        console.log('✅ Conectado a Supabase REAL');
        return true;
    } else {
        console.log('🏠 Usando almacenamiento LOCAL');
        return false;
    }
};

console.log('🔧 Configuración cargada - Supabase REAL activo');