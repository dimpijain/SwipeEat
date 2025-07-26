// src/mockRestaurants.js

 const mockRestaurants = [
  {
    id: 'mock-1',
    name: 'The Flavor Fusion Bistro',
    rating: 4.5,
    address: '123 Foodie St, Guwahati',
    photo: 'https://images.unsplash.com/photo-1517248135467-4c7ed45e55cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwyfHxyZXN0YXVyYW50fGVufDB8fHx8MTcwMTg4OTAwMnww&ixlib=rb-4.0.3&q=80&w=400', // Example Unsplash URL, replace with actual photo reference if using Google Place Photos
    priceLevel: 2, // 1-4
    types: ['indian', 'thai', 'asian', 'bistro'],
    // Full details for detailed view (mocking Google Place Details API response)
    details: {
      formatted_address: '123 Foodie Street, Fancy Town, Guwahati, Assam',
      formatted_phone_number: '+91 98765 43210',
      website: 'https://www.flavorfusionbistro.com',
      opening_hours: {
        weekday_text: [
          'Monday: 11:00 AM – 10:00 PM',
          'Tuesday: 11:00 AM – 10:00 PM',
          'Wednesday: 11:00 AM – 10:00 PM',
          'Thursday: 11:00 AM – 10:00 PM',
          'Friday: 11:00 AM – 11:00 PM',
          'Saturday: 12:00 PM – 11:00 PM',
          'Sunday: Closed'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-1' }], // Will use the same URL for now
      price_level: 2,
      rating: 4.5
    }
  },
  {
    id: 'mock-2',
    name: 'Pizza Palace',
    rating: 4.0,
    address: '456 Dough Ln, Guwahati',
    photo: 'https://images.unsplash.com/photo-1593560704721-db9b09a341e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHw0fHxpbmRpYW4lMjBmb29kfGVufDB8fHx8MTcwMTg4OTAzM3ww&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 1,
    types: ['pizza', 'italian', 'fast_food'],
    details: {
      formatted_address: '456 Dough Lane, Pizza Town, Guwahati, Assam',
      formatted_phone_number: '+91 78901 23456',
      website: 'https://www.pizzapalace.in',
      opening_hours: {
        weekday_text: [
          'Monday: 10:00 AM – 11:00 PM',
          'Tuesday: 10:00 AM – 11:00 PM',
          'Wednesday: 10:00 AM – 11:00 PM',
          'Thursday: 10:00 AM – 11:00 PM',
          'Friday: 10:00 AM – 12:00 AM',
          'Saturday: 10:00 AM – 12:00 AM',
          'Sunday: 10:00 AM – 11:00 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-2' }],
      price_level: 1,
      rating: 4.0
    }
  },
  {
    id: 'mock-3',
    name: 'Spice Route Indian Kitchen',
    rating: 4.7,
    address: '789 Curry St, Guwahati',
    photo: 'https://images.unsplash.com/photo-1563227814-fd555353163e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHw1fHxpbmRpYW4lMjByZXN0YXVyYW50fGVufDB8fHx8MTcwMTg4OTQyOHww&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 3,
    types: ['indian', 'curry', 'north_indian', 'dine_in'],
    details: {
      formatted_address: '789 Curry Street, Spice City, Guwahati, Assam',
      formatted_phone_number: '+91 99887 76655',
      website: 'https://www.spiceroute.in',
      opening_hours: {
        weekday_text: [
          'Monday: 12:00 PM – 3:00 PM, 7:00 PM – 10:30 PM',
          'Tuesday: 12:00 PM – 3:00 PM, 7:00 PM – 10:30 PM',
          'Wednesday: 12:00 PM – 3:00 PM, 7:00 PM – 10:30 PM',
          'Thursday: 12:00 PM – 3:00 PM, 7:00 PM – 10:30 PM',
          'Friday: 12:00 PM – 3:00 PM, 7:00 PM – 11:00 PM',
          'Saturday: 12:00 PM – 3:00 PM, 7:00 PM – 11:00 PM',
          'Sunday: 12:00 PM – 3:00 PM, 7:00 PM – 10:30 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-3' }],
      price_level: 3,
      rating: 4.7
    }
  },
  {
    id: 'mock-4',
    name: 'Sushi Zen',
    rating: 4.3,
    address: '101 Ocean Ave, Guwahati',
    photo: 'https://images.unsplash.com/photo-1579584425338-76572e7751c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxzdXNoaXxlbnwwfHx8fDE3MDE4ODk1Mjl8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 3,
    types: ['sushi', 'japanese', 'asian'],
    details: {
      formatted_address: '101 Ocean Avenue, Fish Market, Guwahati, Assam',
      formatted_phone_number: '+91 87654 32109',
      website: 'https://www.sushizen.com',
      opening_hours: {
        weekday_text: [
          'Monday: 12:00 PM – 2:30 PM, 6:00 PM – 10:00 PM',
          'Tuesday: 12:00 PM – 2:30 PM, 6:00 PM – 10:00 PM',
          'Wednesday: Closed',
          'Thursday: 12:00 PM – 2:30 PM, 6:00 PM – 10:00 PM',
          'Friday: 12:00 PM – 2:30 PM, 6:00 PM – 10:30 PM',
          'Saturday: 12:00 PM – 2:30 PM, 6:00 PM – 10:30 PM',
          'Sunday: 12:00 PM – 2:30 PM, 6:00 PM – 9:30 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-4' }],
      price_level: 3,
      rating: 4.3
    }
  },
  {
    id: 'mock-5',
    name: 'Mexican Fiesta',
    rating: 4.2,
    address: '222 Taco Rd, Guwahati',
    photo: 'https://images.unsplash.com/photo-1511210173204-e3dc1648a733?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwZm9vZHxlbnwwfHx8fDE3MDE4ODk1NDV8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 2,
    types: ['mexican', 'tacos', 'burritos', 'fast_food'],
    details: {
      formatted_address: '222 Taco Road, Cantina Corner, Guwahati, Assam',
      formatted_phone_number: '+91 90000 11111',
      website: 'https://www.mexicanfiesta.com',
      opening_hours: {
        weekday_text: [
          'Monday: 11:30 AM – 9:30 PM',
          'Tuesday: 11:30 AM – 9:30 PM',
          'Wednesday: 11:30 AM – 9:30 PM',
          'Thursday: 11:30 AM – 9:30 PM',
          'Friday: 11:30 AM – 10:30 PM',
          'Saturday: 12:00 PM – 10:30 PM',
          'Sunday: 12:00 PM – 9:00 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-5' }],
      price_level: 2,
      rating: 4.2
    }
  },
  {
    id: 'mock-6',
    name: 'Cafe Delight',
    rating: 4.0,
    address: '333 Coffee St, Guwahati',
    photo: 'https://images.unsplash.com/photo-1497215729111-ad75005b6302?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxjYWZlJTIwaW5kaWF8ZW58MHx8fHwxNzA3OTI2NTk3fDA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 1,
    types: ['cafe', 'bakery', 'coffee_shop'],
    details: {
      formatted_address: '333 Coffee Street, Cafe Zone, Guwahati, Assam',
      formatted_phone_number: '+91 89000 99887',
      website: 'https://www.cafedelight.com',
      opening_hours: {
        weekday_text: [
          'Monday: 7:00 AM – 9:00 PM',
          'Tuesday: 7:00 AM – 9:00 PM',
          'Wednesday: 7:00 AM – 9:00 PM',
          'Thursday: 7:00 AM – 9:00 PM',
          'Friday: 7:00 AM – 10:00 PM',
          'Saturday: 8:00 AM – 10:00 PM',
          'Sunday: 8:00 AM – 9:00 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-6' }],
      price_level: 1,
      rating: 4.0
    }
  },
  {
    id: 'mock-7',
    name: 'Grill House',
    rating: 4.6,
    address: '444 Steakhouse Ln, Guwahati',
    photo: 'https://images.unsplash.com/photo-1600891965581-ef9480ba03ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxncmlsbCUyMGhvdXNlfGVufDB8fHx8MTcwNzkyNjY0MHww&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 4,
    types: ['steak_house', 'barbecue', 'american', 'grill'],
    details: {
      formatted_address: '444 Steakhouse Lane, Meat Town, Guwahati, Assam',
      formatted_phone_number: '+91 77766 55443',
      website: 'https://www.grillhouse.com',
      opening_hours: {
        weekday_text: [
          'Monday: 5:00 PM – 11:00 PM',
          'Tuesday: 5:00 PM – 11:00 PM',
          'Wednesday: 5:00 PM – 11:00 PM',
          'Thursday: 5:00 PM – 11:00 PM',
          'Friday: 5:00 PM – 12:00 AM',
          'Saturday: 4:00 PM – 12:00 AM',
          'Sunday: Closed'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-7' }],
      price_level: 4,
      rating: 4.6
    }
  },
  {
    id: 'mock-8',
    name: 'Vegan Haven',
    rating: 4.8,
    address: '555 Green St, Guwahati',
    photo: 'https://images.unsplash.com/photo-1601007823521-2a9f7d45e9a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHx2ZWdhbiUyMHJlc3RhdXJhbnR8ZW58MHx8fHwxNzA3OTI2Njk5fDA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 2,
    types: ['vegan', 'healthy', 'vegetarian', 'organic'],
    details: {
      formatted_address: '555 Green Street, Eco Village, Guwahati, Assam',
      formatted_phone_number: '+91 65432 10987',
      website: 'https://www.veganhaven.org',
      opening_hours: {
        weekday_text: [
          'Monday: 9:00 AM – 9:00 PM',
          'Tuesday: 9:00 AM – 9:00 PM',
          'Wednesday: 9:00 AM – 9:00 PM',
          'Thursday: 9:00 AM – 9:00 PM',
          'Friday: 9:00 AM – 10:00 PM',
          'Saturday: 9:00 AM – 10:00 PM',
          'Sunday: 10:00 AM – 8:00 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-8' }],
      price_level: 2,
      rating: 4.8
    }
  },
  {
    id: 'mock-9',
    name: 'French Kiss Bakery',
    rating: 4.1,
    address: '666 Croissant Lane, Guwahati',
    photo: 'https://images.unsplash.com/photo-1543782245-5d51d331940b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBiYWtlcnl8ZW58MHx8fHwxNzA3OTI2NzM1fDA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 2,
    types: ['bakery', 'french', 'dessert', 'cafe'],
    details: {
      formatted_address: '666 Croissant Lane, Paris Corner, Guwahati, Assam',
      formatted_phone_number: '+91 91234 56789',
      website: 'https://www.frenchkissbakery.com',
      opening_hours: {
        weekday_text: [
          'Monday: 8:00 AM – 6:00 PM',
          'Tuesday: 8:00 AM – 6:00 PM',
          'Wednesday: 8:00 AM – 6:00 PM',
          'Thursday: 8:00 AM – 6:00 PM',
          'Friday: 8:00 AM – 7:00 PM',
          'Saturday: 9:00 AM – 7:00 PM',
          'Sunday: Closed'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-9' }],
      price_level: 2,
      rating: 4.1
    }
  },
  {
    id: 'mock-10',
    name: 'Mediterranean Delight',
    rating: 4.4,
    address: '777 Olive St, Guwahati',
    photo: 'https://images.unsplash.com/photo-1555939594-58d7c482092c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwZm9vZHxlbnwwfHx8fDE3MDc5MjY3NzV8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 2,
    types: ['mediterranean', 'greek', 'middle_eastern'],
    details: {
      formatted_address: '777 Olive Street, Azure Plaza, Guwahati, Assam',
      formatted_phone_number: '+91 88776 65544',
      website: 'https://www.mediterraneandelight.com',
      opening_hours: {
        weekday_text: [
          'Monday: 11:00 AM – 10:00 PM',
          'Tuesday: 11:00 AM – 10:00 PM',
          'Wednesday: 11:00 AM – 10:00 PM',
          'Thursday: 11:00 AM – 10:00 PM',
          'Friday: 11:00 AM – 11:00 PM',
          'Saturday: 12:00 PM – 11:00 PM',
          'Sunday: Closed'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-10' }],
      price_level: 2,
      rating: 4.4
    }
  },
  {
    id: 'mock-11',
    name: 'Taste of Thailand',
    rating: 4.6,
    address: '888 Tuk Tuk St, Guwahati',
    photo: 'https://images.unsplash.com/photo-1563729780009-41e7f3a8b4b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHx0aGFpJTIwZm9vZHxlbnwwfHx8fDE3MDc5MjY4Mzh8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 3,
    types: ['thai', 'asian', 'spicy', 'curry'],
    details: {
      formatted_address: '888 Tuk Tuk Street, Bangkok Alley, Guwahati, Assam',
      formatted_phone_number: '+91 99000 11223',
      website: 'https://www.tasteofthailand.com',
      opening_hours: {
        weekday_text: [
          'Monday: 12:00 PM – 3:00 PM, 6:30 PM – 10:00 PM',
          'Tuesday: 12:00 PM – 3:00 PM, 6:30 PM – 10:00 PM',
          'Wednesday: Closed',
          'Thursday: 12:00 PM – 3:00 PM, 6:30 PM – 10:00 PM',
          'Friday: 12:00 PM – 3:00 PM, 6:30 PM – 10:30 PM',
          'Saturday: 12:00 PM – 3:00 PM, 6:30 PM – 10:30 PM',
          'Sunday: 12:00 PM – 3:00 PM, 6:30 PM – 10:00 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-11' }],
      price_level: 3,
      rating: 4.6
    }
  },
  {
    id: 'mock-12',
    name: 'Burger Joint',
    rating: 3.9,
    address: '999 Patty Place, Guwahati',
    photo: 'https://images.unsplash.com/photo-1571091709794-cf298dddbdf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxiaXJkZCUyMGJ1cmdlcnxlbnwwfHx8fDE3MDc5MjY4NjF8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 1,
    types: ['burger', 'fast_food', 'american'],
    details: {
      formatted_address: '999 Patty Place, Burger Boulevard, Guwahati, Assam',
      formatted_phone_number: '+91 88990 01122',
      website: 'https://www.burgerjoint.com',
      opening_hours: {
        weekday_text: [
          'Monday: 11:00 AM – 10:00 PM',
          'Tuesday: 11:00 AM – 10:00 PM',
          'Wednesday: 11:00 AM – 10:00 PM',
          'Thursday: 11:00 AM – 10:00 PM',
          'Friday: 11:00 AM – 11:00 PM',
          'Saturday: 11:00 AM – 11:00 PM',
          'Sunday: 12:00 PM – 9:00 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-12' }],
      price_level: 1,
      rating: 3.9
    }
  },
  {
    id: 'mock-13',
    name: 'Ocean Fresh Seafood',
    rating: 4.7,
    address: '111 Fishmonger Rd, Guwahati',
    photo: 'https://images.unsplash.com/photo-1512621776951-a5796a2fceb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxzZWFmb29kJTIwZGlzaHxlbnwwfHx8fDE3MDc5MjY4ODN8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 4,
    types: ['seafood', 'fine_dining', 'coastal'],
    details: {
      formatted_address: '111 Fishmonger Road, Marina View, Guwahati, Assam',
      formatted_phone_number: '+91 97654 32100',
      website: 'https://www.oceanfreshseafood.com',
      opening_hours: {
        weekday_text: [
          'Monday: Closed',
          'Tuesday: 6:00 PM – 11:00 PM',
          'Wednesday: 6:00 PM – 11:00 PM',
          'Thursday: 6:00 PM – 11:00 PM',
          'Friday: 6:00 PM – 12:00 AM',
          'Saturday: 6:00 PM – 12:00 AM',
          'Sunday: 5:00 PM – 10:00 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-13' }],
      price_level: 4,
      rating: 4.7
    }
  },
  {
    id: 'mock-14',
    name: 'Grand Chinese Wok',
    rating: 4.3,
    address: '222 Dragon Lane, Guwahati',
    photo: 'https://images.unsplash.com/photo-1555244162-803834f70034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwZm9vZHxlbnwwfHx8fDE3MDc5MjY5MDZ8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 2,
    types: ['chinese', 'asian', 'noodles', 'dim_sum'],
    details: {
      formatted_address: '222 Dragon Lane, Chinatown, Guwahati, Assam',
      formatted_phone_number: '+91 98700 65432',
      website: 'https://www.grandchinesewok.com',
      opening_hours: {
        weekday_text: [
          'Monday: 11:30 AM – 10:30 PM',
          'Tuesday: 11:30 AM – 10:30 PM',
          'Wednesday: 11:30 AM – 10:30 PM',
          'Thursday: 11:30 AM – 10:30 PM',
          'Friday: 11:30 AM – 11:30 PM',
          'Saturday: 11:30 AM – 11:30 PM',
          'Sunday: 11:30 AM – 10:30 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-14' }],
      price_level: 2,
      rating: 4.3
    }
  },
  {
    id: 'mock-15',
    name: 'Indian Kebab House',
    rating: 4.1,
    address: '333 Tandoor Rd, Guwahati',
    photo: 'https://images.unsplash.com/photo-1626027376711-667793b8e8f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxrZWJhYnxlbnwwfHx8fDE3MDc5MjY5Mjl8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 2,
    types: ['indian', 'kebab', 'tandoori'],
    details: {
      formatted_address: '333 Tandoor Road, Grill Town, Guwahati, Assam',
      formatted_phone_number: '+91 91122 33445',
      website: 'https://www.indiankebabhouse.com',
      opening_hours: {
        weekday_text: [
          'Monday: 12:00 PM – 10:00 PM',
          'Tuesday: 12:00 PM – 10:00 PM',
          'Wednesday: 12:00 PM – 10:00 PM',
          'Thursday: 12:00 PM – 10:00 PM',
          'Friday: 12:00 PM – 11:00 PM',
          'Saturday: 12:00 PM – 11:00 PM',
          'Sunday: 1:00 PM – 9:00 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-15' }],
      price_level: 2,
      rating: 4.1
    }
  },
  {
    id: 'mock-16',
    name: 'Thai Spice',
    rating: 4.5,
    address: '444 Pad Thai Blvd, Guwahati',
    photo: 'https://images.unsplash.com/photo-1549488344-f8b17a10a300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwyfHx0aGFpJTIwZm9vZHxlbnwwfHx8fDE3MDc5MjcwMTd8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 3,
    types: ['thai', 'curry', 'noodles'],
    details: {
      formatted_address: '444 Pad Thai Boulevard, Spicy Alley, Guwahati, Assam',
      formatted_phone_number: '+91 90909 09090',
      website: 'https://www.thaispice.net',
      opening_hours: {
        weekday_text: [
          'Monday: 11:30 AM – 2:30 PM, 6:00 PM – 10:00 PM',
          'Tuesday: 11:30 AM – 2:30 PM, 6:00 PM – 10:00 PM',
          'Wednesday: 11:30 AM – 2:30 PM, 6:00 PM – 10:00 PM',
          'Thursday: 11:30 AM – 2:30 PM, 6:00 PM – 10:00 PM',
          'Friday: 11:30 AM – 2:30 PM, 6:00 PM – 11:00 PM',
          'Saturday: 12:00 PM – 11:00 PM',
          'Sunday: 12:00 PM – 10:00 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-16' }],
      price_level: 3,
      rating: 4.5
    }
  },
  {
    id: 'mock-17',
    name: 'The Italian Bistro',
    rating: 4.4,
    address: '555 Pasta Lane, Guwahati',
    photo: 'https://images.unsplash.com/photo-1579738002013-094030626379?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcmVzdGF1cmFudHxlbnwwfHx8fDE3MDc5MjcwNDN8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 3,
    types: ['italian', 'pasta', 'pizza', 'fine_dining'],
    details: {
      formatted_address: '555 Pasta Lane, Rome Quarter, Guwahati, Assam',
      formatted_phone_number: '+91 98765 12345',
      website: 'https://www.italianbistro.com',
      opening_hours: {
        weekday_text: [
          'Monday: 12:00 PM – 2:30 PM, 7:00 PM – 10:30 PM',
          'Tuesday: 12:00 PM – 2:30 PM, 7:00 PM – 10:30 PM',
          'Wednesday: 12:00 PM – 2:30 PM, 7:00 PM – 10:30 PM',
          'Thursday: 12:00 PM – 2:30 PM, 7:00 PM – 10:30 PM',
          'Friday: 12:00 PM – 2:30 PM, 7:00 PM – 11:30 PM',
          'Saturday: 12:00 PM – 2:30 PM, 7:00 PM – 11:30 PM',
          'Sunday: Closed'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-17' }],
      price_level: 3,
      rating: 4.4
    }
  },
  {
    id: 'mock-18',
    name: 'Healthy Bowl',
    rating: 4.0,
    address: '666 Salad St, Guwahati',
    photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZHxlbnwwfHx8fDE3MDc5MjcwODF8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 1,
    types: ['healthy', 'salad', 'juice_bar', 'vegetarian'],
    details: {
      formatted_address: '666 Salad Street, Wellness Hub, Guwahati, Assam',
      formatted_phone_number: '+91 99887 76655',
      website: 'https://www.healthybowl.com',
      opening_hours: {
        weekday_text: [
          'Monday: 9:00 AM – 8:00 PM',
          'Tuesday: 9:00 AM – 8:00 PM',
          'Wednesday: 9:00 AM – 8:00 PM',
          'Thursday: 9:00 AM – 8:00 PM',
          'Friday: 9:00 AM – 9:00 PM',
          'Saturday: 10:00 AM – 8:00 PM',
          'Sunday: Closed'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-18' }],
      price_level: 1,
      rating: 4.0
    }
  },
  {
    id: 'mock-19',
    name: 'Ramen Ichiraku',
    rating: 4.6,
    address: '777 Noodle Alley, Guwahati',
    photo: 'https://images.unsplash.com/photo-1612984102293-8b7c2b62c4a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxyYW1lbnxlbnwwfHx8fDE3MDc5MjcxNDh8MA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 2,
    types: ['ramen', 'japanese', 'noodles', 'asian'],
    details: {
      formatted_address: '777 Noodle Alley, Anime District, Guwahati, Assam',
      formatted_phone_number: '+91 91212 12121',
      website: 'https://www.ramenichiraku.jp',
      opening_hours: {
        weekday_text: [
          'Monday: 11:00 AM – 3:00 PM, 5:00 PM – 10:00 PM',
          'Tuesday: 11:00 AM – 3:00 PM, 5:00 PM – 10:00 PM',
          'Wednesday: 11:00 AM – 3:00 PM, 5:00 PM – 10:00 PM',
          'Thursday: 11:00 AM – 3:00 PM, 5:00 PM – 10:00 PM',
          'Friday: 11:00 AM – 3:00 PM, 5:00 PM – 11:00 PM',
          'Saturday: 12:00 PM – 11:00 PM',
          'Sunday: 12:00 PM – 10:00 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-19' }],
      price_level: 2,
      rating: 4.6
    }
  },
  {
    id: 'mock-20',
    name: 'Street Food Junction',
    rating: 4.2,
    address: '888 Food Cart Rd, Guwahati',
    photo: 'https://images.unsplash.com/photo-1544520935-ee1686c5f78a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDc3MzF8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2R8ZW58MHx8fHwxNzA3OTI3MTc3fDA&ixlib=rb-4.0.3&q=80&w=400',
    priceLevel: 1,
    types: ['street_food', 'indian', 'fast_food', 'local'],
    details: {
      formatted_address: '888 Food Cart Road, Bazar Lane, Guwahati, Assam',
      formatted_phone_number: '+91 90000 88888',
      website: null, // No website for street food
      opening_hours: {
        weekday_text: [
          'Monday: 10:00 AM – 10:00 PM',
          'Tuesday: 10:00 AM – 10:00 PM',
          'Wednesday: 10:00 AM – 10:00 PM',
          'Thursday: 10:00 AM – 10:00 PM',
          'Friday: 10:00 AM – 11:00 PM',
          'Saturday: 10:00 AM – 11:00 PM',
          'Sunday: 10:00 AM – 10:00 PM'
        ]
      },
      photos: [{ photo_reference: 'mock-photo-ref-20' }],
      price_level: 1,
      rating: 4.2
    }
  }
];

//export default mockRestaurants;