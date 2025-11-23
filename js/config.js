// CONFIGURACIÓN SUPABASE ÚNICA
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1GXQm6L0Om6AZReeTK0e3Q81k-UQSVJAu3xMNQ';

// Inicializar Supabase
console.log('🚀 Inicializando Supabase...');
try {
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado correctamente');
    } else {
        throw new Error('Librería Supabase no disponible');
    }
} catch (error) {
    console.error('❌ Error inicializando Supabase:', error);
    // Cliente de respaldo
    window.supabase = {
        _isLocal: true,
        from: (table) => ({
            select: () => ({
                eq: (column, value) => ({
                    order: () => Promise.resolve({ 
                        data: getLocalData(table).filter(item => item[column] === value), 
                        error: null 
                    })
                }),
                order: () => Promise.resolve({ data: getLocalData(table), error: null })
            }),
            insert: (data) => ({
                select: () => {
                    const newData = Array.isArray(data) ? data : [data];
                    newData.forEach(item => saveLocalData(table, item));
                    return Promise.resolve({ data: newData, error: null });
                }
            }),
            update: (data) => ({
                eq: (column, value) => {
                    updateLocalData(table, column, value, data);
                    return Promise.resolve({ error: null });
                }
            }),
            delete: () => ({
                eq: (column, value) => {
                    removeLocalData(table, column, value);
                    return Promise.resolve({ error: null });
                }
            })
        })
    };
}

// Funciones localStorage
function getLocalData(table) {
    try {
        const data = localStorage.getItem(`inmobiliaria_${table}`);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting local data:', error);
        return [];
    }
}

function saveLocalData(table, item) {
    try {
        const currentData = getLocalData(table);
        const newItem = {
            id: item.id || Date.now(),
            title: item.title || '',
            type: item.type || 'casa',
            price: item.price || 0,
            description: item.description || '',
            location: item.location || { address: '', lat: 18.7357, lng: -70.1627 },
            characteristics: item.characteristics || { 
                bedrooms: 0, 
                bathrooms: 0, 
                area: 100,
                parking: false,
                pool: false,
                garden: false
            },
            images: item.images || [],
            status: item.status || 'disponible',
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString()
        };
        
        const existingIndex = currentData.findIndex(existing => existing.id === newItem.id);
        if (existingIndex >= 0) {
            currentData[existingIndex] = newItem;
        } else {
            currentData.push(newItem);
        }
        
        localStorage.setItem(`inmobiliaria_${table}`, JSON.stringify(currentData));
        console.log('💾 Datos guardados en localStorage:', newItem);
    } catch (error) {
        console.error('Error saving local data:', error);
    }
}

function updateLocalData(table, column, value, newData) {
    try {
        const currentData = getLocalData(table);
        const updatedData = currentData.map(item => {
            if (item[column] === value) {
                return { ...item, ...newData, updated_at: new Date().toISOString() };
            }
            return item;
        });
        localStorage.setItem(`inmobiliaria_${table}`, JSON.stringify(updatedData));
    } catch (error) {
        console.error('Error updating local data:', error);
    }
}

function removeLocalData(table, column, value) {
    try {
        const currentData = getLocalData(table);
        const newData = currentData.filter(item => item[column] !== value);
        localStorage.setItem(`inmobiliaria_${table}`, JSON.stringify(newData));
    } catch (error) {
        console.error('Error removing local data:', error);
    }
}