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

// TODO(petpark): shop čeka žive shop tablice (vidi ADDITIVE-MIGRATION-READINESS).

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(amount);
}

export async function getProducts(): Promise<Product[]> {
  // TODO(petpark): čeka žive shop tablice (vidi ADDITIVE-MIGRATION-READINESS).
  return [];
}

export async function getProductBySlug(_slug: string): Promise<Product | null> {
  // TODO(petpark): čeka žive shop tablice (vidi ADDITIVE-MIGRATION-READINESS).
  return null;
}

export async function getProductReviews(_productId: string): Promise<ProductReview[]> {
  // TODO(petpark): čeka žive shop tablice (vidi ADDITIVE-MIGRATION-READINESS).
  return [];
}

export async function getRelatedProducts(_productId: string, _limit = 4): Promise<Product[]> {
  // TODO(petpark): čeka žive shop tablice (vidi ADDITIVE-MIGRATION-READINESS).
  return [];
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
