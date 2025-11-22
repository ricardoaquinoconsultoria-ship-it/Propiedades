// Configuración de Supabase
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI1MjgzNDEsImV4cCI6MjAxODEwNDM0MX0.82pW2xQwOJsU0OsUJN4y8JN0VxwV7v9v8Q5Qy9Z5J5k';

// Inicializar Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase inicializado correctamente');
