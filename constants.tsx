
import { Service, Testimonial, GalleryItem, FAQItem } from './types';

export const SERVICES: Service[] = [
  // Added required sortOrder and isActive fields to match the Service interface definition
  { id: '1', name: 'Lift & Tint', price: 25, category: 'Brow & Lash Services', sortOrder: 1, isActive: true },
  { id: '2', name: 'Lift', price: 15, category: 'Brow & Lash Services', sortOrder: 2, isActive: true },
  { id: '3', name: 'Tint', price: 10, category: 'Brow & Lash Services', sortOrder: 3, isActive: true },
  { id: '4', name: 'Botox Treatment', price: 35, category: 'Treatments', description: 'Treatment details provided during consultation.', sortOrder: 1, isActive: true },
  { id: '5', name: 'Volume Lashes', price: 60, category: 'Eyelash Extensions', sortOrder: 1, isActive: true },
  { id: '6', name: 'Classic Lashes', price: 70, category: 'Eyelash Extensions', sortOrder: 2, isActive: true },
];

export const TESTIMONIALS: Testimonial[] = [
  { id: 't1', author: 'Sarah J.', initials: 'SJ', text: 'The most relaxing experience. My lashes have never looked better! Chels is a true artist.', rating: 5 },
  { id: 't2', author: 'Emily R.', initials: 'ER', text: 'I love my brow lift and tint. It saves me so much time in the morning. Highly recommend Kellyville residents to visit!', rating: 5 },
  { id: 't3', author: 'Mia W.', initials: 'MW', text: 'Professional, hygienic, and such a beautiful studio vibe. The Botox treatment was explained clearly and I am thrilled with the results.', rating: 5 },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: 'g1', url: '/brow-tinting.png', category: 'Brows', alt: 'Brow Tinting' },
  { id: 'g2', url: '/lash-extension.png', category: 'Lashes', alt: 'Eye lash Extension' },
  { id: 'g3', url: '/botox-treatment-1.png', category: 'Treatments', alt: 'Botox Treatment' },
  { id: 'g4', url: '/botox-treatment-2.png', category: 'Treatments', alt: 'Botox Treatment' },
];

export const FAQS: FAQItem[] = [
  { question: 'Do I need a patch test?', answer: 'Yes, we recommend a patch test at least 24 hours before your first lash or brow tinting service to ensure no sensitivities.' },
  { question: 'How long do eyelash extensions last?', answer: 'Typically 2-4 weeks depending on your natural lash cycle and aftercare. We recommend infills every 2-3 weeks.' },
  { question: 'Where are you located?', answer: 'We are located in Kellyville. The exact address is provided upon booking confirmation.' },
  { question: 'What is your cancellation policy?', answer: 'We kindly ask for at least 24 hours notice for any cancellations or rescheduling to avoid a cancellation fee.' },
];