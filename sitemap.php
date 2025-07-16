<?php
/**
 * Genera sitemap.xml escludendo alcune cartelle specifiche.
 * Carica questo file (ad es. sitemap.php) nella root del tuo Aruba,
 * poi visitalo via browser per rigenerare sitemap.xml.
 */

$baseUrl   = 'https://www.artigea.it';  // sostituisci con il tuo dominio
$rootDir   = __DIR__;                   // radice del sito
$outputXml = 'sitemap.xml';

// Cartelle da escludere (case-insensitive)
$excludes = ['TestOre', 'BigliettoDaVisita', 'Documenti', 'Gradimento'];

$urls = [];

$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($rootDir));
foreach ($iterator as $fileInfo) {
    if (!$fileInfo->isFile() || strtolower($fileInfo->getExtension()) !== 'html') {
        continue;
    }

    // Percorso relativo alla root
    $relative = str_replace($rootDir, '', $fileInfo->getPathname());

    // Filtra le cartelle da escludere
    $skip = false;
    foreach ($excludes as $exc) {
        if (stripos($relative, DIRECTORY_SEPARATOR . $exc . DIRECTORY_SEPARATOR) !== false) {
            $skip = true;
            break;
        }
    }
    if ($skip) {
        continue;
    }

    // Costruisci l'URL
    $loc = rtrim($baseUrl, '/') . str_replace(DIRECTORY_SEPARATOR, '/', $relative);

    // Data di ultima modifica in formato ISO 8601
    $lastmod = date('c', $fileInfo->getMTime());

    $urls[] = [
        'loc'        => $loc,
        'lastmod'    => $lastmod,
        'changefreq' => 'monthly',
        'priority'   => '0.7'
    ];
}

// Inizio scrittura XML
$xml = new XMLWriter();
$xml->openURI($outputXml);
$xml->startDocument('1.0', 'UTF-8');
$xml->startElement('urlset');
$xml->writeAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

foreach ($urls as $u) {
    $xml->startElement('url');
      $xml->writeElement('loc',        $u['loc']);
      $xml->writeElement('lastmod',    $u['lastmod']);
      $xml->writeElement('changefreq', $u['changefreq']);
      $xml->writeElement('priority',   $u['priority']);
    $xml->endElement(); // url
}

$xml->endElement(); // urlset
$xml->endDocument();

echo 'Sitemap rigenerata correttamente: ' . $outputXml;
