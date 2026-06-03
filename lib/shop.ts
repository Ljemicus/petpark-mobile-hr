import { PAYMENT_DISABLED_MESSAGE, PAYMENT_DISABLED_TITLE, PAYMENTS_ENABLED } from './payments/config';

export type ProductCategory = 'hrana' | 'igracke' | 'povodci' | 'krevetici' | 'posude' | 'njega' | 'odjeca' | 'grickalice';

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  hrana: 'Hrana',
  igracke: 'Igračke',
  povodci: 'Povodci',
  krevetici: 'Krevetići',
  posude: 'Posude',
  njega: 'Njega',
  odjeca: 'Odjeća',
  grickalice: 'Grickalice',
};

export const PRODUCT_CATEGORY_EMOJI: Record<ProductCategory, string> = {
  hrana: '🍖',
  igracke: '🎾',
  povodci: '🦮',
  krevetici: '🛏️',
  posude: '🥣',
  njega: '🧴',
  odjeca: '👕',
  grickalice: '🦴',
};

export interface ProductVariant {
  label: string;
  value: string;
  priceModifier?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  description: string;
  emoji: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  variants: ProductVariant[];
  specs: Record<string, string>;
  images?: string[];
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  authorInitial: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-1', slug: 'premium-suha-hrana-piletina', name: 'Premium suha hrana piletina', category: 'hrana', price: 24.9, originalPrice: 29.9,
    description: 'Kompletna premium hrana za odrasle pse s visokim udjelom piletine i dodatkom omega masnih kiselina.', emoji: '🍗', brand: 'Purina Pro Plan', rating: 4.8, reviewCount: 124, inStock: true,
    variants: [{ label: 'Pakiranje', value: '2 kg' }, { label: 'Pakiranje', value: '7 kg', priceModifier: 18 }],
    specs: { Protein: '27%', Mast: '16%', Dob: 'Adult', Namjena: 'Sve pasmine' }, images: ['🍗', '🥣', '🐕']
  },
  {
    id: 'prod-2', slug: 'kong-classic', name: 'KONG Classic igračka', category: 'igracke', price: 13.5,
    description: 'Legendarna interaktivna igračka za žvakanje i mentalnu stimulaciju.', emoji: '🎾', brand: 'KONG', rating: 4.9, reviewCount: 201, inStock: true,
    variants: [{ label: 'Veličina', value: 'S' }, { label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L', priceModifier: 3 }],
    specs: { Materijal: 'Prirodna guma', Namjena: 'Žvakanje', Punjenje: 'Da', Perivo: 'Da' }, images: ['🎾', '🐶', '🦴']
  },
  {
    id: 'prod-3', slug: 'flexi-povodac-5m', name: 'Flexi povodac 5m', category: 'povodci', price: 25,
    description: 'Automatski povodac s ergonomskom ručkom i kočnicom za sigurnu šetnju.', emoji: '🦮', brand: 'Flexi', rating: 4.6, reviewCount: 156, inStock: true,
    variants: [{ label: 'Duljina', value: '3m', priceModifier: -4 }, { label: 'Duljina', value: '5m' }, { label: 'Duljina', value: '8m', priceModifier: 8 }],
    specs: { Duljina: '5m', Materijal: 'Najlon', Zaključavanje: 'Da', TežinaPsa: 'do 20 kg' }, images: ['🦮', '🌳', '🐕']
  },
  {
    id: 'prod-4', slug: 'ortopedski-krevet-l', name: 'Ortopedski krevet L', category: 'krevetici', price: 55,
    description: 'Memory foam krevet za udobniji odmor i rasterećenje zglobova.', emoji: '🛏️', brand: 'PetFusion', rating: 4.8, reviewCount: 67, inStock: true,
    variants: [{ label: 'Veličina', value: 'M', priceModifier: -12 }, { label: 'Veličina', value: 'L' }, { label: 'Veličina', value: 'XL', priceModifier: 20 }],
    specs: { Punjenje: 'Memory foam', Navlaka: 'Periva', Dno: 'Neklizajuće', Veličina: '90 x 70 cm' }, images: ['🛏️', '☁️', '🐾']
  },
  {
    id: 'prod-5', slug: 'automatski-dozator-hrane', name: 'Automatski dozator hrane', category: 'posude', price: 45,
    description: 'Pametni dozator za obroke s timerom i LCD zaslonom.', emoji: '🥣', brand: 'PetSafe', rating: 4.6, reviewCount: 58, inStock: true,
    variants: [], specs: { Kapacitet: '3L', Obroci: '4 dnevno', Napajanje: 'Adapter + baterije', Zaslon: 'LCD' }, images: ['🥣', '⏰', '🍖']
  },
  {
    id: 'prod-6', slug: 'sampon-za-pse-500ml', name: 'Šampon za pse 500 ml', category: 'njega', price: 12,
    description: 'Blagi šampon s aloe verom za osjetljivu kožu i sjajnu dlaku.', emoji: '🧴', brand: "Burt's Bees", rating: 4.6, reviewCount: 83, inStock: true,
    variants: [], specs: { Volumen: '500 ml', Sastojci: 'Aloe vera', pH: 'Za pse', Miris: 'Lavanda' }, images: ['🧴', '🫧', '🐩']
  },
  {
    id: 'prod-7', slug: 'zimska-jakna-psi', name: 'Zimska jakna za pse', category: 'odjeca', price: 28,
    description: 'Topla i vodootporna jakna s reflektirajućim detaljima za zimske šetnje.', emoji: '👕', brand: 'Hurtta', rating: 4.7, reviewCount: 55, inStock: true,
    variants: [{ label: 'Veličina', value: 'S' }, { label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L', priceModifier: 4 }],
    specs: { Materijal: 'Vodootporan', Podstava: 'Flis', Reflektirajuće: 'Da', Temperatura: 'do -15°C' }, images: ['👕', '❄️', '🐕']
  },
  {
    id: 'prod-8', slug: 'dentalne-kosti-10', name: 'Dentalne kosti (10 kom)', category: 'grickalice', price: 12,
    description: 'Prirodne dentalne grickalice koje čiste zube i osvježavaju dah.', emoji: '🦴', brand: 'Whimzees', rating: 4.5, reviewCount: 79, inStock: true,
    variants: [{ label: 'Veličina', value: 'S' }, { label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L', priceModifier: 3 }],
    specs: { Količina: '10 kom', Sastav: 'Prirodni', DentalnaNjega: 'Da', Vegetarijansko: 'Da' }, images: ['🦴', '🦷', '🐶']
  },
];

const FALLBACK_REVIEWS: ProductReview[] = [
  { id: 'r1', productId: 'prod-1', authorName: 'Marija Kovačević', authorInitial: 'M', rating: 5, comment: 'Pas je obožava, probava odlična.', createdAt: '2026-03-20' },
  { id: 'r2', productId: 'prod-2', authorName: 'Petra Novak', authorInitial: 'P', rating: 5, comment: 'Konačno igračka koju nije uništio.', createdAt: '2026-03-18' },
  { id: 'r3', productId: 'prod-3', authorName: 'Dario Šimić', authorInitial: 'D', rating: 5, comment: 'Odličan mehanizam i kontrola.', createdAt: '2026-03-22' },
  { id: 'r4', productId: 'prod-4', authorName: 'Jelena Tomić', authorInitial: 'J', rating: 5, comment: 'Stari pas napokon spava mirno.', createdAt: '2026-03-19' },
  { id: 'r5', productId: 'prod-8', authorName: 'Darko Filipović', authorInitial: 'D', rating: 4, comment: 'Super za zube i baš ih voli.', createdAt: '2026-03-16' },
];

function mapDbProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: row.category as ProductCategory,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    description: String(row.description ?? ''),
    emoji: String(row.emoji ?? '🐾'),
    brand: String(row.brand ?? ''),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    inStock: Boolean(row.in_stock ?? true),
    variants: Array.isArray(row.variants) ? (row.variants as ProductVariant[]) : [],
    specs: (row.specs as Record<string, string> | null) ?? {},
    images: Array.isArray(row.images) ? (row.images as string[]) : undefined,
  };
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(amount);
}

export async function getProducts() {
  return FALLBACK_PRODUCTS;
}

export async function getProductBySlug(slug: string) {
  return FALLBACK_PRODUCTS.find((product) => product.slug === slug) ?? null;
}

export async function getProductReviews(productId: string) {
  return FALLBACK_REVIEWS.filter((review) => review.productId === productId);
}

export async function getRelatedProducts(productId: string, limit = 4) {
  const products = await getProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) return [];
  return products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, limit);
}

export async function getShopCategories() {
  const products = await getProducts();
  return (Object.keys(PRODUCT_CATEGORY_LABELS) as ProductCategory[]).map((category) => ({
    slug: category,
    label: PRODUCT_CATEGORY_LABELS[category],
    emoji: PRODUCT_CATEGORY_EMOJI[category],
    count: products.filter((product) => product.category === category).length,
  }));
}

export async function syncCartToSupabase(_userId: string, _items: CartItem[]) {
  // Remote shop/cart tables are not part of the current mobile remote schema.
  // The in-memory shop context remains the source of truth for the MVP.
}

export async function loadCartFromSupabase(_userId: string): Promise<CartItem[]> {
  return [];
}

export async function createShopCheckout(items: CartItem[], authToken?: string | null) {
  if (!PAYMENTS_ENABLED) {
    return {
      disabled: true,
      title: PAYMENT_DISABLED_TITLE,
      message: PAYMENT_DISABLED_MESSAGE,
    } as const;
  }

  const response = await fetch('https://petpark.hr/api/payments/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({
      shop: true,
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        selectedVariant: item.selectedVariant ?? null,
      })),
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'Checkout nije uspio');
  }

  return response.json() as Promise<{ url?: string }>;
}
