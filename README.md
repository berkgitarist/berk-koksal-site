# Berk Köksal Official Site

The official website of Berk Köksal — composer, guitarist, music producer,
software engineer, founder of Neo-Sacred Zikr and creator of QURANIC CONCEPTS.

Production: https://berkkoksal.com

This repository contains the production source code for the official Berk Köksal
website. It has evolved beyond its original portfolio-template foundation and is
maintained as a dedicated artist, music, writing and career platform.

## Creative Universes

### Neo-Sacred Zikr

A contemporary sacred music universe centered on remembrance and the
glorification of the ONE GOD, expressed through different musical languages
including symphonic music, ambient, rock, choral music, rap, jazz and metal.

### QURANIC CONCEPTS

A separate concept-album framework in which specific Quranic subjects, scenes,
voices and realities determine the musical language, structure and visual world
of each project.

HELLL is the first major album world within QURANIC CONCEPTS.

## Main Sections

The website currently includes:

- Home and discography
- Official biography
- Full biography
- Neo-Sacred Zikr
- QURANIC CONCEPTS
- Album and project pages
- Quran-centered writings and reflections
- Poetry archive
- Why 19?
- Career profile
- Contact and external music platforms

The site is available in English and Turkish.

English content uses the main route structure, while Turkish pages are served
under `/tr/`.

## Writings

Articles are managed through Astro Content Collections.

The writing system supports:

- English and Turkish content
- Publish and updated dates
- Categories
- Tags
- Featured articles
- Draft filtering
- Article metadata
- SEO-ready static pages

Content is stored under:

`src/content/writings/`

## KuranTeyit

KuranTeyit is a separate Quran research web application developed by Berk Köksal.

The official Berk Köksal website links to KuranTeyit from relevant research,
biography and career contexts. KuranTeyit remains an independent software project
with its own repository and production site.

It should therefore be understood as a related research project rather than part
of this site's runtime architecture.

## Technology

- Astro 6
- TypeScript
- Tailwind CSS 4
- Astro Content Collections
- Iconify / astro-icon
- Static Site Generation
- Responsive mobile and desktop layouts
- English / Turkish localization
- Light and dark theme support
- Responsive navigation
- Open Graph and social metadata
- Canonical URL support
- Automatically generated XML sitemap
- robots.txt
- Structured content architecture

## Architecture

The website is generated as a static Astro site.

The production domain is configured in `astro.config.mjs` and the sitemap is
generated automatically with `@astrojs/sitemap`.

Main project areas:

```text
public/
  Static assets, artist images, album artwork, poems and robots.txt

src/
  components/
    Shared UI components and navigation

  content/
    writings/
      English and Turkish articles

  layouts/
    Shared page layout and SEO infrastructure

  pages/
    English site routes

    tr/
      Turkish site routes

  styles/
    Global design system and responsive styles

  utils/
    Localization and shared utilities