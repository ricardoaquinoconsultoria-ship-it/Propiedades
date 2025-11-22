// Configuración de Supabase
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1qfeM7S7wffWb3q0VcH7RTVg5H6VnL_2QcTj7E';

// Inicializar Supabase de forma simple y directa
function initializeSupabase() {
    console.log('🔧 Inicializando Supabase...');
    
    try {
        // Verificar si la librería Supabase está disponible
        if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            console.log('✅ Librería Supabase disponible');
            
            // Crear cliente Supabase REAL
            const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Verificar conexión haciendo una prueba simple
            testSupabaseConnection(client);
            
            return client;
        } else {
            throw new Error('Librería Supabase no cargada correctamente');
        }
    } catch (error) {
        console.error('❌ Error inicializando Supabase REAL:', error);
        console.log('🔄 Creando cliente de respaldo...');
        return createBackupClient();
    }
}

// Función para probar la conexión a Supabase
async function testSupabaseConnection(client) {
    try {
        console.log('🔍 Probando conexión a Supabase...');
        const { data, error } = await client.from('properties').select('count').limit(1);
        
        if (error) {
            console.error('❌ Error de conexión a Supabase:', error);
            if (error.message.includes('JWT')) {
                console.error('🔑 Problema con la API Key - Verifica las credenciales');
            }
        } else {
            console.log('✅ Conexión a Supabase exitosa');
        }
    } catch (testError) {
        console.error('❌ Error en prueba de conexión:', testError);
    }
}

// Cliente de respaldo para cuando Supabase falle
function createBackupClient() {
    console.log('🏠 Creando cliente de respaldo (local storage)');
    
    const backupClient = {
        _isBackup: true,
        from: (table) => ({
            select: (columns = '*') => ({
                eq: (column, value) => {
                    const data = getFromLocalStorage(table).filter(item => item[column] === value);
                    return Promise.resolve({ data, error: null });
                },
                order: (column, options = { ascending: false }) => {
                    let data = getFromLocalStorage(table);
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
                    const data = getFromLocalStorage(table);
                    resolve({ data, error: null });
                }
            }),
            insert: (data) => ({
                select: (columns = '*') => {
                    const newData = Array.isArray(data) ? data : [data];
                    newData.forEach(item => {
                        item.id = item.id || Date.now();
                        item.created_at = item.created_at || new Date().toISOString();
                        item.status = item.status || 'disponible';
                        saveToLocalStorage('properties', item);
                    });
                    return Promise.resolve({ data: newData, error: null });
                }
            }),
            delete: () => ({
                eq: (column, value) => {
                    removeFromLocalStorage('properties', column, value);
                    return Promise.resolve({ error: null });
                }
            })
        })
    };
    
    return backupClient;
}

// Funciones para localStorage
function getFromLocalStorage(table) {
    const key = `inmobiliaria_${table}`;
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error leyendo localStorage:', error);
        return [];
    }
}

function saveToLocalStorage(table, item) {
    const key = `inmobiliaria_${table}`;
    try {
        const currentData = getFromLocalStorage(table);
        currentData.push(item);
        localStorage.setItem(key, JSON.stringify(currentData));
        console.log('💾 Guardado en localStorage:', item);
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
    }
}

function removeFromLocalStorage(table, column, value) {
    const key = `inmobiliaria_${table}`;
    try {
        const currentData = getFromLocalStorage(table);
        const newData = currentData.filter(item => item[column] !== value);
        localStorage.setItem(key, JSON.stringify(newData));
    } catch (error) {
        console.error('Error eliminando de localStorage:', error);
    }
}

// Inicializar y asignar globalmente
window.supabase = initializeSupabase();
window.initializeSupabase = initializeSupabase;

// Función para verificar estado
window.checkSupabaseStatus = function() {
    if (window.supabase && !window.supabase._isBackup) {
        console.log('✅ Conectado a Supabase REAL');
        return true;
    } else {
        console.log('🏠 Usando almacenamiento LOCAL (Supabase no disponible)');
        return false;
    }
};

console.log('🔧 Configuración cargada');
console.log('📊 Estado Supabase:', window.checkSupabaseStatus() ? 'REAL' : 'LOCAL');