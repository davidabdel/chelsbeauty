
export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  durationMins?: number | null;
  sortOrder: number;
  isActive: boolean;
  // Added category to support flat service lists used in constants
  category?: string;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  services: Service[];
}

export interface PricingData {
  updatedAt: string;
  currencySymbol: string;
  location: string;
  phone: string;
  note: string;
  categories: Category[];
}

export interface Testimonial {
  id: string;
  author: string;
  initials: string;
  text: string;
  rating: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  category: 'Lashes' | 'Brows' | 'Studio' | 'Treatments' | 'All';
  alt: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}