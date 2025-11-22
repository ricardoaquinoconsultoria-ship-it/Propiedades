// Configuración de Supabase - VERSIÓN SIMPLIFICADA
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1qfeM7S7wffWb3q0VcH7RTVg5H6VnL_2QcTj7E';

// Función para inicializar Supabase
function initializeSupabase() {
    console.log('🔧 Inicializando Supabase...');
    
    try {
        // Verificar si la librería de Supabase está cargada
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            console.log('✅ Usando librería Supabase real');
            const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.supabase = client;
            return client;
        } else {
            console.log('⚠️ Librería Supabase no encontrada, usando modo local');
            return createLocalSupabase();
        }
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        return createLocalSupabase();
    }
}

// Crear Supabase local para modo offline
function createLocalSupabase() {
    console.log('🏠 Creando Supabase local (modo demo)');
    
    const localSupabase = {
        _isLocal: true,
        from: (table) => ({
            select: (columns = '*') => {
                const query = {
                    eq: (column, value) => {
                        console.log(`📝 Local: SELECT FROM ${table} WHERE ${column} = ${value}`);
                        const data = getLocalData(table).filter(item => item[column] === value);
                        return Promise.resolve({ data, error: null });
                    },
                    order: (column, options = { ascending: false }) => {
                        console.log(`📝 Local: SELECT FROM ${table} ORDER BY ${column}`);
                        let data = getLocalData(table);
                        data.sort((a, b) => {
                            if (options.ascending) {
                                return a[column] > b[column] ? 1 : -1;
                            } else {
                                return a[column] < b[column] ? 1 : -1;
                            }
                        });
                        return Promise.resolve({ data, error: null });
                    },
                    then: (resolve) => {
                        console.log(`📝 Local: SELECT FROM ${table}`);
                        const data = getLocalData(table);
                        resolve({ data, error: null });
                    }
                };
                return query;
            },
            insert: (data) => ({
                select: (columns = '*') => {
                    console.log('📝 Local: INSERT', data);
                    const newData = Array.isArray(data) ? data : [data];
                    newData.forEach(item => {
                        item.id = item.id || Date.now();
                        item.created_at = item.created_at || new Date().toISOString();
                        item.status = item.status || 'disponible';
                        addLocalData('properties', item);
                    });
                    return Promise.resolve({ data: newData, error: null });
                }
            }),
            delete: () => ({
                eq: (column, value) => {
                    console.log(`📝 Local: DELETE FROM properties WHERE ${column} = ${value}`);
                    removeLocalData('properties', column, value);
                    return Promise.resolve({ error: null });
                }
            }),
            update: (data) => ({
                eq: (column, value) => {
                    console.log(`📝 Local: UPDATE properties SET`, data, `WHERE ${column} = ${value}`);
                    return Promise.resolve({ data: null, error: null });
                }
            })
        })
    };
    
    return localSupabase;
}

// Almacenamiento local
function getLocalData(table) {
    const key = `supabase_local_${table}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function addLocalData(table, item) {
    const key = `supabase_local_${table}`;
    const currentData = getLocalData(table);
    currentData.push(item);
    localStorage.setItem(key, JSON.stringify(currentData));
}

function removeLocalData(table, column, value) {
    const key = `supabase_local_${table}`;
    const currentData = getLocalData(table);
    const newData = currentData.filter(item => item[column] !== value);
    localStorage.setItem(key, JSON.stringify(newData));
}

// Inicializar inmediatamente
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

console.log('✅ Configuración cargada - Modo:', window.supabase._isLocal ? 'LOCAL' : 'SUPABASE REAL');