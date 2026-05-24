export const quickFilters = ['Cerca de mi', 'Nuevos', 'Entrega', 'Verificados']

export const navigationLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Publicar', to: '/publicar' },
]

export const marketplaceMenu = [
  { label: 'Inicio', to: '/' },
  { label: 'Publicar', to: '/publicar' },
  { label: 'Categorias', to: '/' },
  { label: 'Favoritos', to: '/' },
  { label: 'Mensajes', to: '/' },
]

export const listings = [
  {
    id: 'smartwatch-senda',
    title: 'Smartwatch Senda',
    summary: 'Accesorios incluidos y entrega local.',
    description: 'Accesorios incluidos y entrega local.',
    price: '$1,450 MXN',
    category: 'Tecnologia',
    location: 'Centro',
    condition: 'Como nuevo',
    details: [
      'Entrega local',
      'Estado: Como nuevo',
      'Categoria: Tecnologia',
      'Ubicacion: Centro',
      'Vendedor verificado',
    ],
    tags: ['Bluetooth', 'Correa extra', '32h de bateria'],
  },
  {
    id: 'sillas-minimal',
    title: 'Sillas minimal',
    summary: 'Set de 4 piezas, madera natural.',
    description: 'Set de 4 piezas, madera natural.',
    price: '$2,900 MXN',
    category: 'Hogar',
    location: 'Norte',
    condition: 'Excelente',
    details: [
      'Set de 4 piezas',
      'Estado: Excelente',
      'Categoria: Hogar',
      'Ubicacion: Norte',
      'Entrega el mismo dia',
    ],
    tags: ['Madera natural', 'Uso interior', 'Set completo'],
  },
  {
    id: 'chaqueta-urbana',
    title: 'Chaqueta urbana',
    summary: 'Talla M y L, poco uso.',
    description: 'Talla M y L, poco uso.',
    price: '$980 MXN',
    category: 'Moda',
    location: 'Sur',
    condition: 'Poco uso',
    details: [
      'Tallas M y L',
      'Estado: Poco uso',
      'Categoria: Moda',
      'Ubicacion: Sur',
      'Listo para entrega',
    ],
    tags: ['Ligera', 'Temporada media', 'Estilo urbano'],
  },
  {
    id: 'batidora-viento',
    title: 'Batidora Viento',
    summary: 'Potente y lista para reposteria.',
    description: 'Potente y lista para reposteria.',
    price: '$1,250 MXN',
    category: 'Hogar',
    location: 'Poniente',
    condition: 'Funcionando',
    details: [
      'Incluye accesorios',
      'Estado: Funcionando',
      'Categoria: Hogar',
      'Ubicacion: Poniente',
      'Ideal para reposteria',
    ],
    tags: ['Reposteria', 'Motor potente', 'Baja vibracion'],
  },
  {
    id: 'teclado-neo',
    title: 'Teclado Neo',
    summary: 'Mecanico, retroiluminado y en caja.',
    description: 'Mecanico, retroiluminado y en caja.',
    price: '$1,800 MXN',
    category: 'Tecnologia',
    location: 'Centro',
    condition: 'En caja',
    details: [
      'Teclas mecanicas',
      'Estado: En caja',
      'Categoria: Tecnologia',
      'Ubicacion: Centro',
      'Retroiluminado',
    ],
    tags: ['RGB', 'Hot swap', 'Gaming'],
  },
  {
    id: 'audifonos-lumen',
    title: 'Audifonos Lumen',
    summary: 'Cancelacion de ruido, bateria 32h.',
    description: 'Cancelacion de ruido, bateria 32h.',
    price: '$2,350 MXN',
    category: 'Tecnologia',
    location: 'Este',
    condition: 'Excelente',
    details: [
      '32 horas de bateria',
      'Estado: Excelente',
      'Categoria: Tecnologia',
      'Ubicacion: Este',
      'Cancelacion de ruido',
    ],
    tags: ['ANC', 'Bluetooth 5.3', 'Carga rapida'],
  },
]

export function getListingById(listingId) {
  return listings.find((listing) => listing.id === listingId) ?? listings[0]
}