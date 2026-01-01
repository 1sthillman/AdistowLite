import { MenuData } from '@/types/menu';

export const mockMenuData: MenuData = {
  restaurant: {
    id: 'demo-restaurant',
    name: 'Demo Restoran',
    slug: 'demo-restaurant',
    logo: '',
    themeColors: {
      primary: '#10b981',
      secondary: '#f59e0b'
    },
    theme: 'luxury'
  },
  categories: [
    {
      id: 'appetizers',
      name: 'Aperatifler',
      sortOrder: 1,
      items: [
        {
          id: 'item-1',
          name: 'Humus Tabagi',
          description: 'Közlenmiş biber, zeytinyağı ve tahin ile servis edilir',
          basePrice: 45,
          imageUrl: '',
          isAvailable: true,
          allergens: ['tahin'],
          ingredients: [
            { id: 'ing-1', name: 'Nohut', iconEmoji: '🫘', isDefault: true, isRemovable: false },
            { id: 'ing-2', name: 'Tahin', iconEmoji: '🥄', isDefault: true, isRemovable: false },
            { id: 'ing-3', name: 'Sarımsak', iconEmoji: '🧄', isDefault: true, isRemovable: true },
            { id: 'ing-4', name: 'Zeytinyağı', iconEmoji: '🫒', isDefault: true, isRemovable: false }
          ],
          extras: [
            { id: 'ext-1', name: 'Ekstra zeytinyağı', price: 5 },
            { id: 'ext-2', name: 'Acı biber', price: 3 }
          ]
        },
        {
          id: 'item-2',
          name: 'Sigara Böreği',
          description: 'Çıtır çıtır hazırlanmış peynirli sigara böreği (6 adet)',
          basePrice: 38,
          imageUrl: '',
          isAvailable: true,
          allergens: ['gluten', 'süt'],
          ingredients: [
            { id: 'ing-5', name: 'Yufka', iconEmoji: '🌾', isDefault: true, isRemovable: false },
            { id: 'ing-6', name: 'Beyaz peynir', iconEmoji: '🧀', isDefault: true, isRemovable: false },
            { id: 'ing-7', name: 'Maydanoz', iconEmoji: '🌿', isDefault: true, isRemovable: true }
          ],
          extras: [
            { id: 'ext-3', name: 'Ekstra peynir', price: 8 }
          ]
        }
      ]
    },
    {
      id: 'main-courses',
      name: 'Ana Yemekler',
      sortOrder: 2,
      items: [
        {
          id: 'item-3',
          name: 'Adana Kebap',
          description: 'Özel baharatlarla hazırlanmış kıyma kebabı, közlenmiş domates ve biber ile',
          basePrice: 95,
          imageUrl: '',
          isAvailable: true,
          allergens: [],
          ingredients: [
            { id: 'ing-8', name: 'Kıyma', iconEmoji: '🥩', isDefault: true, isRemovable: false },
            { id: 'ing-9', name: 'Soğan', iconEmoji: '🧅', isDefault: true, isRemovable: true },
            { id: 'ing-10', name: 'Baharatlar', iconEmoji: '🌶️', isDefault: true, isRemovable: true }
          ],
          extras: [
            { id: 'ext-4', name: 'Ekstra et', price: 25 },
            { id: 'ext-5', name: 'Yoğurt', price: 8 },
            { id: 'ext-6', name: 'Sumak soğanı', price: 5 }
          ]
        },
        {
          id: 'item-4',
          name: 'Tavuk Şiş',
          description: 'Izgara tavuk şiş, sebzeler ve pilav ile servis edilir',
          basePrice: 85,
          imageUrl: '',
          isAvailable: true,
          allergens: [],
          ingredients: [
            { id: 'ing-11', name: 'Tavuk göğsü', iconEmoji: '🐔', isDefault: true, isRemovable: false },
            { id: 'ing-12', name: 'Sebzeler', iconEmoji: '🥬', isDefault: true, isRemovable: true },
            { id: 'ing-13', name: 'Pilav', iconEmoji: '🍚', isDefault: true, isRemovable: true }
          ],
          extras: [
            { id: 'ext-7', name: 'Ekstra tavuk', price: 20 },
            { id: 'ext-8', name: 'Mantar sosu', price: 10 }
          ]
        },
        {
          id: 'item-5',
          name: 'Sebzeli Makarna',
          description: 'Taze sebzelerle hazırlanmış penne makarna',
          basePrice: 65,
          imageUrl: '',
          isAvailable: true,
          allergens: ['gluten'],
          ingredients: [
            { id: 'ing-14', name: 'Penne makarna', iconEmoji: '🍝', isDefault: true, isRemovable: false },
            { id: 'ing-15', name: 'Domates sos', iconEmoji: '🍅', isDefault: true, isRemovable: true },
            { id: 'ing-16', name: 'Sebzeler', iconEmoji: '🥕', isDefault: true, isRemovable: true },
            { id: 'ing-17', name: 'Parmesan', iconEmoji: '🧀', isDefault: true, isRemovable: true }
          ],
          extras: [
            { id: 'ext-9', name: 'Tavuk ekle', price: 18 },
            { id: 'ext-10', name: 'Ekstra peynir', price: 8 }
          ]
        }
      ]
    },
    {
      id: 'desserts',
      name: 'Tatlılar',
      sortOrder: 3,
      items: [
        {
          id: 'item-6',
          name: 'Baklava',
          description: 'Özel şerbetli baklava (4 adet)',
          basePrice: 35,
          imageUrl: '',
          isAvailable: true,
          allergens: ['gluten', 'süt', 'kuruyemiş'],
          ingredients: [
            { id: 'ing-18', name: 'Yufka', iconEmoji: '🌾', isDefault: true, isRemovable: false },
            { id: 'ing-19', name: 'Ceviz', iconEmoji: '🥜', isDefault: true, isRemovable: false },
            { id: 'ing-20', name: 'Şerbet', iconEmoji: '🍯', isDefault: true, isRemovable: false }
          ],
          extras: [
            { id: 'ext-11', name: 'Dondurma', price: 12 },
            { id: 'ext-12', name: 'Ekstra baklava', price: 8 }
          ]
        },
        {
          id: 'item-7',
          name: 'Künefe',
          description: 'Sıcak künefe, kaymak ile servis edilir',
          basePrice: 40,
          imageUrl: '',
          isAvailable: true,
          allergens: ['gluten', 'süt'],
          ingredients: [
            { id: 'ing-21', name: 'Kadayıf', iconEmoji: '🍯', isDefault: true, isRemovable: false },
            { id: 'ing-22', name: 'Peynir', iconEmoji: '🧀', isDefault: true, isRemovable: false },
            { id: 'ing-23', name: 'Şerbet', iconEmoji: '🍯', isDefault: true, isRemovable: false }
          ],
          extras: [
            { id: 'ext-13', name: 'Kaymak', price: 8 },
            { id: 'ext-14', name: 'Dondurma', price: 10 }
          ]
        }
      ]
    },
    {
      id: 'beverages',
      name: 'İçecekler',
      sortOrder: 4,
      items: [
        {
          id: 'item-8',
          name: 'Ayran',
          description: 'Taze yoğurt ayranı',
          basePrice: 12,
          imageUrl: '',
          isAvailable: true,
          allergens: ['süt'],
          ingredients: [],
          extras: []
        },
        {
          id: 'item-9',
          name: 'Kola',
          description: 'Soğuk kola (330ml)',
          basePrice: 18,
          imageUrl: '',
          isAvailable: true,
          allergens: [],
          ingredients: [],
          extras: []
        },
        {
          id: 'item-10',
          name: 'Su',
          description: 'Damacana su (0.5L)',
          basePrice: 8,
          imageUrl: '',
          isAvailable: true,
          allergens: [],
          ingredients: [],
          extras: []
        }
      ]
    }
  ]
};