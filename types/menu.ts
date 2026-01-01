export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  themeColors?: {
    primary: string;
    secondary: string;
  };
  theme?: 'luxury' | 'coffee';
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  price: number;
  image?: string;
  isAvailable: boolean;
  allergens?: string[];
  category?: string;
  categoryId?: string;
  ingredients?: Ingredient[];
  extras?: Extra[];
}

export interface Ingredient {
  id: string;
  name: string;
  iconEmoji?: string;
  isDefault: boolean;
  isRemovable: boolean;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
  iconUrl?: string;
}

export interface MenuData {
  restaurant: Restaurant;
  categories: Category[];
}