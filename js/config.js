// Configuración de Supabase - TABLA CREADA
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1GXQm6L0Om6AZReeTK0e3Q81k-UQSVJAu3xMNQ';

// Inicializar Supabase REAL
function initializeSupabase() {
    console.log('🚀 Inicializando Supabase REAL - Tabla properties CREADA');
    
    try {
        if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            console.log('✅ Creando cliente Supabase REAL');
            const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return client;
        } else {
            throw new Error('Librería Supabase no cargada');
        }
    } catch (error) {
        console.error('❌ Error con Supabase REAL:', error);
        return createLocalClient();
    }
}

// Cliente local de respaldo
function createLocalClient() {
    console.log('🏠 Usando almacenamiento LOCAL');
    return {
        _isLocal: true,
        from: (table) => ({
            select: (columns = '*') => ({
                eq: (column, value) => Promise.resolve({ 
                    data: getLocalData(table).filter(item => item[column] === value), 
                    error: null 
                }),
                order: (column, options = { ascending: false }) => {
                    let data = getLocalData(table);
                    data.sort((a, b) => options.ascending ? 
                        new Date(a[column]) - new Date(b[column]) : 
                        new Date(b[column]) - new Date(a[column]));
                    return Promise.resolve({ data, error: null });
                },
                then: (resolve) => resolve({ data: getLocalData(table), error: null })
            }),
            insert: (data) => ({
                select: (columns = '*') => {
                    const newData = Array.isArray(data) ? data : [data];
                    newData.forEach(item => {
                        const newItem = {
                            id: item.id || Date.now(),
                            title: item.title || '',
                            type: item.type || 'casa',
                            price: item.price || 0,
                            description: item.description || '',
                            location: item.location || { address: '', lat: 0, lng: 0 },
                            characteristics: item.characteristics || { bedrooms: 0, bathrooms: 0, area: 0 },
                            images: item.images || [],
                            status: item.status || 'disponible',
                            created_at: item.created_at || new Date().toISOString()
                        };
                        saveLocalData('properties', newItem);
                    });
                    return Promise.resolve({ data: newData, error: null });
                }
            }),
            delete: () => ({
                eq: (column, value) => {
                    removeLocalData('properties', column, value);
                    return Promise.resolve({ error: null });
                }
            })
        })
    };
}

// Funciones localStorage
function getLocalData(table) {
    const data = localStorage.getItem(`inmobiliaria_${table}`);
    return data ? JSON.parse(data) : [];
}

function saveLocalData(table, item) {
    const currentData = getLocalData(table);
    const filteredData = currentData.filter(existing => existing.id !== item.id);
    filteredData.push(item);
    localStorage.setItem(`inmobiliaria_${table}`, JSON.stringify(filteredData));
}

function removeLocalData(table, column, value) {
    const currentData = getLocalData(table);
    const newData = currentData.filter(item => item[column] !== value);
    localStorage.setItem(`inmobiliaria_${table}`, JSON.stringify(newData));
}

// Inicializar
window.supabase = initializeSupabase();
window.initializeSupabase = initializeSupabase;

console.log('✅ Configuración cargada - Supabase REAL con tabla properties CREADA');