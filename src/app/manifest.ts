import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Contraloria Grupo Comidas - CGC',
    short_name: 'CGC',
    description: 'Sistema profesional de controles operativos y auditoría financiera.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0055ff',
    icons: [
      {
        src: 'https://placehold.co/192x192/ffffff/0055ff?text=CGC',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://placehold.co/192x192/ffffff/0055ff?text=CGC',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://placehold.co/512x512/ffffff/0055ff?text=CGC',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://placehold.co/512x512/ffffff/0055ff?text=CGC',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
