import { Category, Product } from '@/types';

export const categories: Category[] = [
  { id: 1, name: 'Mujer', description: 'Moda femenina y accesorios' },
  { id: 2, name: 'Hombre', description: 'Moda masculina y accesorios' },
  { id: 3, name: 'Calzado', description: 'Zapatos, sneakers y botas' },
  { id: 4, name: 'Accesorios', description: 'Bolsos, cinturones y joyería' },
  { id: 5, name: 'Niños', description: 'Moda infantil para todas las edades' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Vestido Elegante Noir',
    price: 189.99,
    created_at: new Date().toISOString(),
    stock: 45,
    id_vendor: 1,
    features: 'Tela premium, Corte ajustado, Ideal para eventos',
    id_category: 1,
    category: categories[0],
    multimedia: [
      { id: '1', alt: 'Vestido Elegante Noir', src: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', id_product: '1' }
    ]
  },
  {
    id: '2',
    name: 'Blazer Clásico Premium',
    price: 259.99,
    created_at: new Date().toISOString(),
    stock: 30,
    id_vendor: 1,
    features: 'Lana italiana, Forro de seda, Corte slim fit',
    id_category: 2,
    category: categories[1],
    multimedia: [
      { id: '2', alt: 'Blazer Clásico Premium', src: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', id_product: '2' }
    ]
  },
  {
    id: '3',
    name: 'Sneakers Urban Elite',
    price: 179.99,
    created_at: new Date().toISOString(),
    stock: 80,
    id_vendor: 2,
    features: 'Suela de goma premium, Diseño exclusivo, Máximo confort',
    id_category: 3,
    category: categories[2],
    multimedia: [
      { id: '3', alt: 'Sneakers Urban Elite', src: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', id_product: '3' }
    ]
  },
  {
    id: '4',
    name: 'Bolso Tote Signature',
    price: 299.99,
    created_at: new Date().toISOString(),
    stock: 25,
    id_vendor: 3,
    features: 'Cuero genuino, Herrajes dorados, Compartimentos múltiples',
    id_category: 4,
    category: categories[3],
    multimedia: [
      { id: '4', alt: 'Bolso Tote Signature', src: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', id_product: '4' }
    ]
  },
  {
    id: '5',
    name: 'Camisa Lino Premium',
    price: 129.99,
    created_at: new Date().toISOString(),
    stock: 60,
    id_vendor: 1,
    features: '100% lino, Transpirable, Corte regular',
    id_category: 2,
    category: categories[1],
    multimedia: [
      { id: '5', alt: 'Camisa Lino Premium', src: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800', id_product: '5' }
    ]
  },
  {
    id: '6',
    name: 'Falda Midi Plisada',
    price: 149.99,
    created_at: new Date().toISOString(),
    stock: 40,
    id_vendor: 2,
    features: 'Diseño plisado, Cintura alta, Versátil',
    id_category: 1,
    category: categories[0],
    multimedia: [
      { id: '6', alt: 'Falda Midi Plisada', src: 'https://images.unsplash.com/photo-1583496661160-fb5886a0uj51?w=800', id_product: '6' }
    ]
  },
  {
    id: '7',
    name: 'Botas Chelsea Noir',
    price: 219.99,
    created_at: new Date().toISOString(),
    stock: 35,
    id_vendor: 3,
    features: 'Cuero italiano, Suela antideslizante, Diseño atemporal',
    id_category: 3,
    category: categories[2],
    multimedia: [
      { id: '7', alt: 'Botas Chelsea Noir', src: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800', id_product: '7' }
    ]
  },
  {
    id: '8',
    name: 'Conjunto Infantil Sport',
    price: 89.99,
    created_at: new Date().toISOString(),
    stock: 50,
    id_vendor: 1,
    features: 'Algodón orgánico, Colores vibrantes, Cómodo',
    id_category: 5,
    category: categories[4],
    multimedia: [
      { id: '8', alt: 'Conjunto Infantil Sport', src: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800', id_product: '8' }
    ]
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (categoryId: number): Product[] => {
  return products.filter(product => product.id_category === categoryId);
};

export const getFeaturedProducts = (): Product[] => {
  return products.slice(0, 4);
};
