# Sito Web Artigea s.r.l.

Sito web statico per Artigea s.r.l., azienda specializzata in servizi di pulizia professionale a Pisa e provincia.

## 🚀 Caratteristiche

- **Design moderno e responsive** con tema scuro professionale
- **SEO ottimizzato** per "pulizie Pisa" e keywords correlate
- **Performance elevate** con lazy loading e ottimizzazioni CSS/JS
- **GDPR compliance** con cookie consent e privacy policy
- **Accessibilità** seguendo le linee guida WCAG
- **Sistema di blog** integrato per content marketing

## 🎨 Design System

### Colori
- **Primario**: #a14e97 (Viola aziendale)
- **Secondario**: #2596be (Blu complementare)
- **Accent**: #f97316 (Arancione per CTA)
- **Sfondo**: #1a1a1a (Nero professionale)
- **Testo**: #f0f0f0 (Bianco per contrasto)

### Typography
- **Font famiglia**: Inter, system-ui, sans-serif
- **Line height**: 150% per il corpo, 120% per i titoli
- **Pesi**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spaziatura
Sistema a 8px con variabili CSS personalizzate per consistenza.

## 📁 Struttura del Progetto

```
/
├── index.html              # Homepage principale
├── ./blog/
│   ├── template.html       # Template per articoli blog
│   └── index.html          # Pagina indice blog (da creare)
├── css/
│   ├── main.css           # Stili principali e variabili
│   ├── components.css     # Componenti riutilizzabili
│   └── blog.css          # Stili specifici per il blog
├── js/
│   ├── main.js           # Funzionalità principali
│   └── cookie-consent.js # Gestione cookie e GDPR
├── assets/
│   ├── logo-artigea.svg         # Logo aziendale
│   ├── favicon-*.png            # Favicon varie dimensioni
│   ├── hero-cleaning.jpg        # Immagine hero
│   ├── team-placeholder.jpg     # Foto team
│   ├── servizi/                 # Immagini servizi
│   ├── ./blog/                    # Immagini articoli blog
│   ├── icons/                   # Icone servizi
│   └── before-after/            # Foto prima/dopo
├── privacy-policy.html     # Privacy policy GDPR
├── cookie-policy.html      # Cookie policy
├── note-legali.html       # Note legali
├── robots.txt             # Direttive per crawler
├── sitemap.xml           # Mappa del sito
└── README.md             # Questo file
```

## 🔧 Come Aggiungere Contenuti

### Nuovo Articolo Blog

1. **Usa il template esistente**:
   - Copia `./blog/template.html` e rinominalo con il nome dell'articolo
   - Esempio: `./blog/come-pulire-vetri-senza-aloni.html`

2. **Personalizza i metadati**:
   - Aggiorna title, description, keywords nel `<head>`
   - Modifica il JSON-LD schema con i dati dell'articolo
   - Aggiorna breadcrumb e meta dell'articolo

3. **Scrivi il contenuto**:
   - Sostituisci il contenuto nella sezione `.article-body`
   - Usa la struttura HTML esistente come guida
   - Mantieni la formattazione con h2, h3, p, ul, blockquote

4. **Aggiorna i link**:
   - Aggiungi il link nell'indice del blog (`./blog/index.html`)
   - Aggiorna la homepage se necessario
   - Aggiorna `sitemap.xml`


### Aggiornare Servizi

Modifica la sezione servizi in `index.html`:
- Aggiorna testi e descrizioni
- Sostituisci immagini in `assets/servizi/`
- Aggiorna icone in `assets/icons/`

### Modificare Contatti

Aggiorna le informazioni aziendali in:
- `index.html` (sezione contatti)
- `privacy-policy.html`
- `cookie-policy.html`
- `note-legali.html`
- JSON-LD schema nella homepage

## 🚀 Deploy e Manutenzione

### Performance
- **Comprimi immagini** in formato WebP quando possibile
- **Minimizza CSS/JS** prima del deploy in produzione
- **Testa velocità** con Google PageSpeed Insights

### SEO
- **Aggiorna sitemap.xml** dopo ogni modifica
- **Verifica meta tags** per ogni pagina
- **Controlla structured data** con Google Rich Results Test
- **Monitora posizionamento** per "pulizie Pisa" e varianti

### Analytics
- **Configura Google Analytics 4** sostituendo `GA_MEASUREMENT_ID`
- **Imposta Google Search Console** per monitoraggio SEO
- **Configura Google My Business** per SEO locale

### GDPR Compliance
- **Rivedi privacy policy** annualmente
- **Aggiorna cookie policy** se aggiungi nuovi servizi
- **Testa cookie consent** su tutti i dispositivi

## 🔒 Sicurezza

- **HTTPS obbligatorio** per tutti gli ambienti
- **Headers di sicurezza** configurati nel server web
- **Form validation** lato client e server
- **Sanitizzazione input** per prevenire XSS

## 🎯 SEO Local

### Keywords Target
- **Primaria**: "pulizie Pisa"
- **Secondarie**: "pulizie professionali Pisa", "sanificazioni Pisa", "pulizie industriali Pisa"
- **Long-tail**: "servizi pulizie casa Pisa", "impresa pulizie uffici Pisa"

### Google My Business
- **Mantieni aggiornate** le informazioni aziendali
- **Raccogli recensioni** dai clienti soddisfatti
- **Pubblica foto** dei lavori svolti (con permesso clienti)
- **Rispondi** a tutte le recensioni

## 📊 Monitoraggio

### Metriche da Monitorare
- **Posizionamento organico** per keywords target
- **Traffico qualificato** da ricerca locale
- **Conversioni** (richieste preventivo, chiamate)
- **Core Web Vitals** per performance tecnica

### Strumenti Consigliati
- Google Analytics 4
- Google Search Console
- Google My Business Insights
- Schema.org Validator
- W3C Markup Validator

## 📞 Supporto

Per assistenza tecnica o modifiche al sito:

**Artigea s.r.l.**  
📧 info@artigea.it  
📞 +39 346 231 9824  
📍 Pisa (PI), Toscana

---

**Versione**: 1.0  
**Ultimo aggiornamento**: Marzo 2024  
**Compatibilità browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+