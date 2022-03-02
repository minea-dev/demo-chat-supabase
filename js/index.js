import { createApp } from './vue.esm-browser.js'

const supabaseUrl = 'https://gipktveldlohfosrbqjm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcGt0dmVsZGxvaGZvc3JicWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDYxNzE2OTUsImV4cCI6MTk2MTc0NzY5NX0.4T-DZUymImCk50XCSexIbLNB1QrwirED9awxeT0FA4g'

const cli = supabase.createClient(supabaseUrl, supabaseKey)

createApp({
    data() {
        return {
            mensajes: [],
            nombre: '',
            nuevoMensaje: ''
        }
    },
    methods: {
        cargarMensajes: async function() {
            let { data: data, error } = await cli
                .from('Mensajes')
                .select('*')
                .order('created_at', { ascending: true })
                // Ordenar
            this.mensajes = data;
        },
        enviarMensaje: async function() {
            const { data, error } = await cli.from('Mensajes').insert([{ nombre: this.nombre, texto: this.nuevoMensaje }])
                // Limpiamos el mensaje
            this.nuevoMensaje = '';
        },
        escucharNuevosMensajes: function() {
            // Esta función actualiza directamente la parte del chat
            cli
                .from('Mensajes')
                .on('INSERT', payload => {
                    // Añado mensaje nuevo
                    this.mensajes.push(payload.new);
                })
                .subscribe()
        }
    },
    mounted() {
        this.cargarMensajes();
        this.escucharNuevosMensajes();
        if (localStorage.nombre) {
            this.nombre = localStorage.nombre;
        }
    },
    watch: {
        mensajes: {
            handler(newValue, oldValue) {
                // Desciendo el scroll
                this.$nextTick(() => {
                    const elemento = this.$refs.mensajesContenedor;
                    elemento.scrollTo(0, elemento.scrollHeight);
                })
            },
            deep: true
        },
        nombre(nuevoNombre) {
            localStorage.nombre = nuevoNombre;
        }
    }
}).mount('#app')