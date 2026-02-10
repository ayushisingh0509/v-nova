export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  gender: "men" | "women" | "unisex";
  colors: string[];
  sizes: string[];
  materials: string[];
  rating: number;
  reviews: number;
  brand: string;
  subCategory: string;
  isNew?: boolean;
  isBestSeller?: boolean;
};

export const products: Product[] = [
  {
    id: "yoga-mat-premium",
    name: "Premium Yoga Mat",
    description:
      "The **Premium Yoga Mat** by **ZenFlow** is designed for serious yogis seeking the ultimate in comfort and support. Featuring high-density cushioning, this mat protects your joints during challenging poses while providing superior grip on various surfaces, from hardwood to carpet. Available in captivating colors such as **purple**, **blue**, **black**, and **teal**, this unisex mat is perfect for everyone. Customers rave about its durability and eco-friendliness, with many noting, 'It's the best mat I've ever used for my daily practice!' With a stellar rating of 4.8, it’s no wonder it’s a bestseller.",
    price: 69.99,
    image:
      "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    category: "yoga",
    gender: "unisex",
    colors: ["purple", "blue", "black", "teal"],
    sizes: ["standard"],
    materials: ["TPE", "eco-friendly"],
    rating: 4.8,
    reviews: 342,
    brand: "ZenFlow",
    subCategory: "equipment",
    isBestSeller: true,

  },
  {
    id: "yoga-leggings-flow",
    name: "Flow Yoga Leggings",
    description:
      "Unlock your full potential with the **Flow Yoga Leggings** from **Luluma**. Designed with four-way stretch fabric, these leggings ensure maximum mobility, allowing you to seamlessly transition from downward dog to the most complex poses. Available in stylish hues like **black**, **navy**, **maroon**, and **olive**, these leggings cater to all body types, with sizes ranging from **XS** to **XL**. Users highlight their comfort, stating, 'These leggings move with me and don’t ride up, making my practice so much better!' With a 4.7-star rating, they’re a must-have for any yoga enthusiast.",
    price: 54.99,
    image:
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    category: "yoga",
    gender: "women",
    colors: ["black", "navy", "maroon", "olive"],
    sizes: ["XS", "S", "M", "L", "XL"],
    materials: ["nylon", "spandex"],
    rating: 4.7,
    reviews: 289,
    brand: "Luluma",
    subCategory: "bottoms",
    isNew: true,

  },
  {
    id: "yoga-top-breeze",
    name: "Breeze Yoga Top",
    description:
      "Embrace comfort and style with the **Breeze Yoga Top** from **Luluma**. This lightweight, breathable top features a relaxed fit, ensuring unrestricted movement during even the most intense sessions. Available in soothing colors like **white**, **light blue**, **blush**, and **sage**, it’s perfect for layering or wearing alone. Users praise it for its soft fabric and flattering cut, often saying, 'I can’t believe how breathable this top is; it keeps me cool and confident throughout my practice.' With a commendable rating of 4.5 stars, it’s a top choice for yoga enthusiasts.",
    price: 39.99,
    image: "https://m.media-amazon.com/images/I/71wUJjfuzpL._SY879_.jpg",
    category: "yoga",
    gender: "women",
    colors: ["white", "light blue", "blush", "sage"],
    sizes: ["XS", "S", "M", "L", "XL"],
    materials: ["modal", "cotton"],
    rating: 4.5,
    reviews: 210,
    brand: "Luluma",
    subCategory: "tops",

  },
  {
    id: "running-shoes-cloud",
    name: "Cloud Runner Shoes",
    description:
      "Experience unmatched comfort with the **Cloud Runner Shoes** from **SprintForce**. Engineered with responsive cushioning and support, these shoes are designed for long-distance runners who demand performance and durability. Available in striking combinations like **black/white**, **gray/blue**, **all black**, and **navy/orange**, they fit perfectly for any style. Runners rave about their comfort, claiming, ‘These are the most supportive shoes I’ve ever worn. I can run for miles without discomfort!’ With a phenomenal rating of 4.9 stars and over 520 reviews, they are the top choice for athletes.",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    category: "jogging",
    gender: "unisex",
    colors: ["black/white", "gray/blue", "all black", "navy/orange"],
    sizes: ["7", "8", "9", "10", "11", "12", "13"],
    materials: ["mesh", "rubber"],
    rating: 4.9,
    reviews: 520,
    brand: "SprintForce",
    subCategory: "footwear",
    isBestSeller: true,

  },
  {
    id: "running-shorts-swift",
    name: "Swift Running Shorts",
    description:
      "Run with confidence in the **Swift Running Shorts** by **SprintForce**. These lightweight and quick-drying shorts come with a built-in liner, ensuring comfort and ease during any workout. Designed with a focus on practicality, they are available in classic colors like **black**, **gray**, **navy**, and **olive**, catering to both style and functionality. Users appreciate how they stay cool and fit perfectly, often saying, 'These shorts are incredibly comfortable; I forget I’m even wearing them!' With a solid rating of 4.6 stars, they are a favorite among runners.",
    price: 44.99,
    image:
      "data:image/jpeg;base64,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",
    category: "jogging",
    gender: "men",
    colors: ["black", "gray", "navy", "olive"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    materials: ["polyester", "spandex"],
    rating: 4.6,
    reviews: 190,
    brand: "SprintForce",
    subCategory: "bottoms",

  },
  {
    id: "running-jacket-breeze",
    name: "Breeze Running Jacket",
    description:
      "The **Breeze Running Jacket** by **SprintForce** is the perfect companion for unpredictable weather. Crafted from lightweight, water-resistant materials, this jacket offers comfort and protection from rain and wind, making it ideal for outdoor runs and workouts. With its sleek design available in timeless colors like **black**, **teal**, **pink**, **silver**, and **grey**, it is as stylish as it is functional. Users rave about its breathability and fit, often stating, 'This jacket keeps me dry without overheating; it's a game-changer for my morning runs.' With a 4.7-star rating, it’s a must-have for serious runners.",
    price: 89.99,
    image:
      "https://i.pinimg.com/736x/ea/a2/40/eaa240987a69df0f8920f387f22331ce.jpg",
    category: "jogging",
    gender: "women",
    colors: ["black", "teal", "pink", "silver", "grey"],
    sizes: ["XS", "S", "M", "L", "XL"],
    materials: ["nylon", "polyester"],
    rating: 4.7,
    reviews: 156,
    brand: "SprintForce",
    subCategory: "outerwear",
    isNew: true,

  },
  {
    id: "running-tights-thermal",
    name: "Thermal Running Tights",
    description:
      "Warm, moisture-wicking tights for cold-weather running with reflective details.",
    price: 64.99,
    image:
      "https://montane.com/cdn/shop/files/MSTHR_BLA_A_3_2f33f424-5e96-4987-8320-edaacb15238a_640x.jpg?v=1721311065",
    category: "jogging",
    gender: "men",
    colors: ["black", "navy", "olive"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    materials: ["polyester", "elastane"],
    rating: 4.8,
    reviews: 230,
    brand: "SprintForce",
    subCategory: "bottoms",

  },
  {
    id: "gym-tank-power",
    name: "Power Gym Tank",
    description:
      "Moisture-wicking tank with racerback design for maximum mobility during workouts.",
    price: 34.99,
    image:
      "data:image/jpeg;base64,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",
    category: "gym",
    gender: "women",
    colors: ["black", "white", "red", "blue"],
    sizes: ["XS", "S", "M", "L", "XL"],
    materials: ["polyester", "spandex"],
    rating: 4.6,
    reviews: 178,
    brand: "PowerLift",
    subCategory: "tops",

  },
  {
    id: "gym-shorts-flex",
    name: "Flex Training Shorts",
    description:
      "Stretchy, durable shorts with moisture management for intense gym sessions.",
    price: 49.99,
    image:
      "https://assets.myntassets.com/w_412,q_60,dpr_2,fl_progressive/assets/images/18658160/2022/6/8/565b1047-8181-4348-88e5-56761f0b32621654663057599VanHeusenFlexMenBlackSportsShorts1.jpg",
    category: "gym",
    gender: "men",
    colors: ["black", "gray", "navy", "red"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    materials: ["polyester", "elastane"],
    rating: 4.7,
    reviews: 245,
    brand: "PowerLift",
    subCategory: "bottoms",
    isBestSeller: true,

  },
  {
    id: "gym-hoodie-element",
    name: "Element Gym Hoodie",
    description:
      "Soft, breathable hoodie with performance fabric for pre and post-workout comfort.",
    price: 69.99,
    image:
      "https://images.napali.app/global/element-products/all/default/medium-large/u3fla4elf0_element,f_3918_frt1.jpg",
    category: "gym",
    gender: "unisex",
    colors: ["black", "gray", "navy", "burgundy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    materials: ["cotton", "polyester"],
    rating: 4.8,
    reviews: 310,
    brand: "PowerLift",
    subCategory: "outerwear",

  },
  {
    id: "gym-gloves-grip",
    name: "Grip Pro Gym Gloves",
    description:
      "Anti-slip palm grips with wrist support for weightlifting and training.",
    price: 29.99,
    image:
      "https://m.media-amazon.com/images/I/81kl3er+WUL._AC_UF894,1000_QL80_.jpg",
    category: "gym",
    gender: "unisex",
    colors: ["black", "black/red", "black/blue"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["leather", "neoprene"],
    rating: 4.5,
    reviews: 185,
    brand: "PowerLift",
    subCategory: "accessories",
    isNew: true,

  },
  {
    id: "yoga-block-cork",
    name: "Cork Yoga Block",
    description:
      "Sustainable cork yoga block providing stable support for various yoga poses.",
    price: 19.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYVzFsGaqUHdV-YT_Mx6UsaIY9mm2Q2TXPPA&s",
    category: "yoga",
    gender: "unisex",
    colors: ["natural cork"],
    sizes: ["standard"],
    materials: ["cork"],
    rating: 4.9,
    reviews: 120,
    brand: "ZenFlow",
    subCategory: "equipment",

  },
  {
    id: "yoga-leggings-comfort",
    name: "Comfort Yoga Leggings",
    description: "Soft touch leggings designed for comfort and flexibility.",
    price: 49.99,
    image: "https://m.media-amazon.com/images/I/91kSTTC4OVL._AC_UY1100_.jpg",
    category: "yoga",
    gender: "women",
    colors: ["black", "dark green", "maroon"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "spandex"],
    rating: 4.6,
    reviews: 210,
    brand: "YogaCo",
    subCategory: "bottoms",

  },
  {
    id: "yoga-bra-supportive",
    name: "Supportive Yoga Bra",
    description: "Medium support bra for all styles of active yoga.",
    price: 29.99,
    image: "https://m.media-amazon.com/images/I/51kGkhdJZrL._AC_UY1100_.jpg",
    category: "yoga",
    gender: "women",
    colors: ["black", "sage", "light pink"],
    sizes: ["XS", "S", "M", "L"],
    materials: ["nylon", "spandex"],
    rating: 4.7,
    reviews: 145,
    brand: "Breathe",
    subCategory: "tops",

  },
  {
    id: "yoga-tank-escape",
    name: "Escape Yoga Tank",
    description: "Loose tank top for ultimate comfort during yoga sessions.",
    price: 34.99,
    image: "https://m.media-amazon.com/images/I/71dCiG5LnPL._AC_UY1100_.jpg",
    category: "yoga",
    gender: "women",
    colors: ["white", "blush", "light grey"],
    sizes: ["XS", "S", "M", "L", "XL"],
    materials: ["modal", "cotton"],
    rating: 4.5,
    reviews: 190,
    brand: "FlowWear",
    subCategory: "tops",

  },

  // New apparel items (Jogging/Running)
  {
    id: "running-tank-light",
    name: "Lightweight Running Tank",
    description: "Breathable tank top designed for warm weather running.",
    price: 29.99,
    image: "https://m.media-amazon.com/images/I/71UMWjRhi3L._AC_UY1100_.jpg",
    category: "jogging",
    gender: "men",
    colors: ["red", "gray", "blue"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["polyester", "spandex"],
    rating: 4.4,
    reviews: 120,
    brand: "RunFast",
    subCategory: "tops",

  },
  {
    id: "running-capris-light",
    name: "Light Capris for Running",
    description: "Ideal capri pants for a comfortable run.",
    price: 39.99,
    image: "https://m.media-amazon.com/images/I/31gCpr2OxSL._AC_UY1100_.jpg",
    category: "jogging",
    gender: "women",
    colors: ["black", "teal", "pink"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["polyester", "nylon"],
    rating: 4.5,
    reviews: 156,
    brand: "JoggingQueen",
    subCategory: "bottoms",

  },
  {
    id: "running-jackets-flex",
    name: "Flex Running Jacket",
    description:
      "Flexible jacket designed for mobility and comfort during runs.",
    price: 79.99,
    image:
      "https://assets.myntassets.com/w_412,q_60,dpr_2,fl_progressive/assets/images/21189580/2022/12/14/cb0ae05b-5314-4311-a8a6-ed8531d4f2ab1671009626683VanHeusenNavyJacket1.jpg",
    category: "jogging",
    gender: "unisex",
    colors: ["grey", "black"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["stretch fabric", "nylon"],
    rating: 4.7,
    reviews: 210,
    brand: "TrailBlazer",
    subCategory: "outerwear",

  },

  // New apparel items (Gym)
  {
    id: "gym-tank-training",
    name: "Training Gym Tank",
    description: "Lightweight tank for high-intensity workouts.",
    price: 26.99,
    image: "https://m.media-amazon.com/images/I/613oAGgTkiL._AC_UY1100_.jpg",
    category: "gym",
    gender: "men",
    colors: ["black", "green", "blue"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "elastane"],
    rating: 4.5,
    reviews: 210,
    brand: "LiftStrong",
    subCategory: "tops",

  },
  {
    id: "gym-leggings-elite",
    name: "Elite Gym Leggings",
    description: "Compression fabric leggings for optimal performance.",
    price: 59.99,
    image:
      "https://eliteelevensporting.com/cdn/shop/files/JAN25BELLACJ63409.jpg?v=1739149226",
    category: "gym",
    gender: "women",
    colors: ["black", "gray", "navy"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["compression fabric", "spandex"],
    rating: 4.9,
    reviews: 300,
    brand: "EliteGym",
    subCategory: "bottoms",

  },
  {
    id: "gym-hoodie-stretch",
    name: "Stretch Hoodie",
    description: "Fit hoodie for warmth and comfort during workouts.",
    price: 49.99,
    image:
      "https://image.uniqlo.com/UQ/ST3/in/imagesgoods/465203/item/ingoods_08_465203_3x4.jpg?width=494",
    category: "gym",
    gender: "unisex",
    colors: ["black", "olive", "teal"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "polyester"],
    rating: 4.8,
    reviews: 220,
    brand: "FitnessWear",
    subCategory: "outerwear",

  },

  // Additional new apparel items (Yoga)
  {
    id: "yoga-capris-flow",
    name: "Flow Yoga Capris",
    description: "Breathable capris for ultimate comfort during yoga.",
    price: 42.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpQQm_T8ChuZPMAIW-mlvGJp1Q7Ad8Ol-VQQ&s",
    category: "yoga",
    gender: "women",
    colors: ["black", "blue", "purple"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["nylon", "spandex"],
    rating: 4.6,
    reviews: 180,
    brand: "ZenFlow",
    subCategory: "bottoms",

  },
  {
    id: "yoga-wrap-light",
    name: "Light Yoga Wrap",
    description: "A light wrap for added coverage and style.",
    price: 39.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxDqMFghsP6QQho839SxR-bdOCK_kTfzDAsg&s",
    category: "yoga",
    gender: "women",
    colors: ["white", "pink"],
    sizes: ["S", "M", "L"],
    materials: ["cotton", "modal"],
    rating: 4.7,
    reviews: 145,
    brand: "BreatheEasy",
    subCategory: "outerwear",

  },

  // Additional product examples (Jogging/Running)
  {
    id: "running-jacket-light",
    name: "Light Running Jacket",
    description:
      "Lightweight jacket designed for running with wind resistance.",
    price: 69.99,
    image:
      "data:image/jpeg;base64,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",
    category: "jogging",
    gender: "women",
    colors: ["red", "black"],
    sizes: ["XS", "S", "M", "L"],
    materials: ["nylon"],
    rating: 4.4,
    reviews: 175,
    brand: "JoggerPro",
    subCategory: "outerwear",

  },
  {
    id: "running-shorts-elite",
    name: "Elite Running Shorts",
    description: "Specialized shorts for high performance during running.",
    price: 39.99,
    image:
      "data:image/jpeg;base64,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",
    category: "jogging",
    gender: "men",
    colors: ["black", "blue", "green"],
    sizes: ["S", "M", "L"],
    materials: ["breathable polyester"],
    rating: 4.5,
    reviews: 130,
    brand: "SwiftRun",
    subCategory: "bottoms",

  },

  // Additional product examples (Gym)
  {
    id: "gym-vest-quick",
    name: "Quick Dry Gym Vest",
    description: "Quick-dry vest ideal for intensive workouts.",
    price: 33.99,
    image:
      "https://aestheticnation.co.in/cdn/shop/products/MaroonSleevelessPerformanceVest.jpg?v=1625478466&width=1080",
    category: "gym",
    gender: "men",
    colors: ["black", "grey"],
    sizes: ["S", "M", "L"],
    materials: ["polyester"],
    rating: 4.6,
    reviews: 210,
    brand: "LiftMax",
    subCategory: "tops",

  },
  {
    id: "gym-sweats-comfy",
    name: "Comfy Sweatpants",
    description: "Soft and warm sweatpants perfect for cool days.",
    price: 45.99,
    image:
      "https://moderncrew.in/wp-content/uploads/2023/10/MBlue_SP_Front-600x600.webp",
    category: "gym",
    gender: "unisex",
    colors: ["black", "maroon", "navy"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "polyester"],
    rating: 4.9,
    reviews: 200,
    brand: "CasualFit",
    subCategory: "bottoms",

  },
  // Existing products...

  // New apparel items (Yoga)
  {
    id: "yoga-tights-flow",
    name: "Flow Yoga Tights",
    description: "Soft, stretchy tights allowing complete freedom of movement.",
    price: 49.99,
    image:
      "data:image/jpeg;base64,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",
    category: "yoga",
    gender: "women",
    colors: ["black", "teal", "pink"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["nylon", "spandex"],
    rating: 4.6,
    reviews: 130,
    brand: "ZenFlow",
    subCategory: "bottoms",

  },
  {
    id: "yoga-bra-long-line",
    name: "Long Line Yoga Bra",
    description:
      "Stylish bra offering extended support for various yoga practices.",
    price: 34.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVWb4JvLRUKtb7iXGDudh1Bpy5PA0eICGrrg&s",
    category: "yoga",
    gender: "women",
    colors: ["black", "grey"],
    sizes: ["XS", "S", "M", "L"],
    materials: ["cotton", "spandex"],
    rating: 4.5,
    reviews: 120,
    brand: "CalmSpirit",
    subCategory: "tops",

  },
  {
    id: "yoga-jacket-light",
    name: "Lightweight Yoga Jacket",
    description: "Breathable and stylish jacket for a warm-up during yoga.",
    price: 69.99,
    image: "https://m.media-amazon.com/images/I/61pon1AIlNL._AC_UY1100_.jpg",
    category: "yoga",
    gender: "women",
    colors: ["light grey", "purple"],
    sizes: ["S", "M", "L"],
    materials: ["polyester", "cotton"],
    rating: 4.8,
    reviews: 145,
    brand: "FlowWear",
    subCategory: "outerwear",

  },
  {
    id: "yoga-tank-eco",
    name: "Eco-Friendly Yoga Tank",
    description:
      "Sustainable tank made from recycled materials for yoga enthusiasts.",
    price: 29.99,
    image:
      "https://img.tatacliq.com/images/i18//437Wx649H/MP000000022372274_437Wx649H_202405250001301.jpeg",
    category: "yoga",
    gender: "women",
    colors: ["peach", "green"],
    sizes: ["XS", "S", "M", "L"],
    materials: ["recycled polyester"],
    rating: 4.7,
    reviews: 150,
    brand: "GreenFit",
    subCategory: "tops",

  },
  {
    id: "yoga-skirt-length",
    name: "Long Yoga Skirt",
    description:
      "Flowy long skirt that allows movement while keeping you stylish.",
    price: 45.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVvjeJ-4_oxhvJRXR6qm7WUWKr-GZJoomimw&s",
    category: "yoga",
    gender: "women",
    colors: ["blue", "black"],
    sizes: ["S", "M", "L"],
    materials: ["cotton", "jersey"],
    rating: 4.5,
    reviews: 90,
    brand: "YogaSpirit",
    subCategory: "bottoms",

  },
  {
    id: "yoga-sweatshirt",
    name: "Yoga Sweatshirt",
    description:
      "Cozy sweatshirt designed for comfort and warmth before and after yoga.",
    price: 39.99,
    image:
      "https://sistersandseekers.com/cdn/shop/files/Untitleddesign-13_5d6eab5f-c8a9-40c7-83ff-8af317becad6_600x.png?v=1726047366",
    category: "yoga",
    gender: "women",
    colors: ["gray", "navy"],
    sizes: ["S", "M", "L"],
    materials: ["fleece", "cotton"],
    rating: 4.6,
    reviews: 140,
    brand: "ComfortWear",
    subCategory: "outerwear",

  },
  {
    id: "yoga-ultimate-bra",
    name: "Ultimate Yoga Bra",
    description: "An essential for yoga, offering light support with comfort.",
    price: 27.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEowP50cDFo1_oyQwHRqD0j_pjMKpmmvi8-Q&s",
    category: "yoga",
    gender: "women",
    colors: ["white", "purple", "black"],
    sizes: ["XS", "S", "M"],
    materials: ["nylon", "spandex"],
    rating: 4.8,
    reviews: 210,
    brand: "CalmWear",
    subCategory: "tops",

  },

  // New apparel items (Jogging/Running)
  {
    id: "running-tank-advanced",
    name: "Advanced Running Tank",
    description: "Moisture-wicking tank top designed for ultimate comfort.",
    price: 34.99,
    image:
      "data:image/jpeg;base64,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",
    category: "jogging",
    gender: "men",
    colors: ["red", "black"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["polyester", "elastane"],
    rating: 4.4,
    reviews: 180,
    brand: "Sporty",
    subCategory: "tops",

  },
  {
    id: "running-sweatshirt",
    name: "Running Sweatshirt",
    description: "Warm sweatshirt ideal for pre-run warm-ups.",
    price: 49.99,
    image:
      "https://www.macron.com/cdn-cgi/image/quality=85/media/catalog/product/cache/7854776c5a059fa4314600f243e72018/8/6/86a9e66baf613aca04346a2649c22a0f38020215_99.jpg",
    category: "jogging",
    gender: "unisex",
    colors: ["black", "blue"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["fleece", "cotton"],
    rating: 4.7,
    reviews: 175,
    brand: "RunWear",
    subCategory: "outerwear",

  },
  {
    id: "running-3-in-1-shorts",
    name: "3-in-1 Running Shorts",
    description: "Versatile running shorts with inner brief for comfort.",
    price: 44.99,
    image: "https://m.media-amazon.com/images/I/61lqwH8CxbL._AC_UY1100_.jpg",
    category: "jogging",
    gender: "men",
    colors: ["black", "grey"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["polyester", "elastane"],
    rating: 4.8,
    reviews: 250,
    brand: "RunMax",
    subCategory: "bottoms",

  },
  {
    id: "running-upper-jacket",
    name: "Upper Body Running Jacket",
    description:
      "Lightweight jacket perfect for running with water-resistant features.",
    price: 85.99,
    image:
      "https://i.pinimg.com/564x/54/ec/a5/54eca57197a2d902256014e272b2160d.jpg",
    category: "jogging",
    gender: "women",
    colors: ["red", "white"],
    sizes: ["XS", "S", "M", "L"],
    materials: ["nylon", "polyester"],
    rating: 4.5,
    reviews: 160,
    brand: "WeatherRun",
    subCategory: "outerwear",

  },
  {
    id: "running-cycling-tights",
    name: "Cycling and Running Tights",
    description: "Multi-purpose tights suitable for running and cycling.",
    price: 62.99,
    image:
      "https://assets.myntassets.com/w_412,q_60,dpr_2,fl_progressive/assets/images/26486430/2023/12/16/41485fa0-66ba-4c67-9353-77680fe5cf191702734612584Leggings1.jpg",
    category: "jogging",
    gender: "men",
    colors: ["black", "red"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["polyester", "spandex"],
    rating: 4.6,
    reviews: 140,
    brand: "ActiveMotion",
    subCategory: "bottoms",

  },
  {
    id: "running-travel-jacket",
    name: "Travel Running Jacket",
    description: "Packable jacket for runners; portable and protective.",
    price: 72.99,
    image: "https://m.media-amazon.com/images/I/91RHrh7yfrL._AC_UY1100_.jpg",
    category: "jogging",
    gender: "unisex",
    colors: ["dark blue", "orange"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["water-resistant nylon"],
    rating: 4.8,
    reviews: 125,
    brand: "TravelRunners",
    subCategory: "outerwear",

  },

  // New apparel items (Gym)
  {
    id: "gym-fit-tee",
    name: "Fit Gym T-Shirt",
    description: "A versatile t-shirt perfect for workouts and casual wear.",
    price: 28.99,
    image:
      "https://www.technosport.in/cdn/shop/files/OR10-Black_1_6501e14d-b267-4278-becf-93dcd949df7c.webp?v=1738843050",
    category: "gym",
    gender: "men",
    colors: ["black", "blue", "green"],
    sizes: ["XS", "S", "M", "L"],
    materials: ["polyester", "cotton"],
    rating: 4.7,
    reviews: 220,
    brand: "FitFlex",
    subCategory: "tops",


  },
  {
    id: "gym-cargo-pants",
    name: "Cargo Gym Pants",
    description: "Functional cargo pants with pockets for all gym essentials.",
    price: 59.99,
    image:
      "https://aestheticnation.co.in/cdn/shop/files/FleecetechCargoOliveJoggers_2.jpg?v=1695314063",
    category: "gym",
    gender: "men",
    colors: ["black", "khaki"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "spandex"],
    rating: 4.5,
    reviews: 115,
    brand: "GymWear",
    subCategory: "bottoms",

  },
  {
    id: "gym-warm-up-jacket",
    name: "Warm-up Gym Jacket",
    description:
      "Perfect for warm-ups; stylish jacket for workouts and casual outings.",
    price: 69.99,
    image:
      "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_300,h_300/global/523155/34/mod01/fnd/IND/fmt/png/Run-Favorite-Men's-Woven-Running-Jacket",
    category: "gym",
    gender: "unisex",
    colors: ["dark grey", "dark green"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "polyester"],
    rating: 4.6,
    reviews: 200,
    brand: "WarmUp",
    subCategory: "outerwear",

  },
  {
    id: "gym-fitted-shorts",
    name: "Fitted Gym Shorts",
    description: "Breathable fitted shorts designed for maximum mobility.",
    price: 32.99,
    image: "https://bigmusculo.com/cdn/shop/products/gray1-5.jpg",
    category: "gym",
    gender: "men",
    colors: ["black", "red", "navy"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["spandex", "polyester"],
    rating: 4.4,
    reviews: 160,
    brand: "ActiveZone",
    subCategory: "bottoms",

  },
  {
    id: "gym-comfort-tank",
    name: "Comfort Gym Tank Top",
    description: "Soft, comfortable tank for those intense workout sessions.",
    price: 24.99,
    image: "https://m.media-amazon.com/images/I/61+3yRldSuL._AC_UY1100_.jpg",
    category: "gym",
    gender: "unisex",
    colors: ["grey", "black"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "polyester"],
    rating: 4.6,
    reviews: 195,
    brand: "ComfortWear",
    subCategory: "tops",

  },
  {
    id: "gym-yoga-fit-pants",
    name: "Yoga Fit Pants",
    description: "Lightweight pants designed for yoga and stretching.",
    price: 49.99,
    image:
      "data:image/jpeg;base64,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",
    category: "gym",
    gender: "unisex",
    colors: ["black", "navy", "charcoal"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "jersey"],
    rating: 4.5,
    reviews: 180,
    brand: "ZenFlex",
    subCategory: "bottoms",

  },
  {
    id: "gym-pants-thermal",
    name: "Thermal Tech Pants",
    description:
      "Thermal pants designed for colder workouts with moisture management.",
    price: 49.99,
    image:
      "data:image/jpeg;base64,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",
    category: "gym",
    gender: "men",
    colors: ["black", "grey"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["thermal polyester"],
    rating: 4.7,
    reviews: 175,
    brand: "ThermoFit",
    subCategory: "bottoms",

  },
  {
    id: "gym-sport-bra",
    name: "Sport Bra",
    description: "Comfortable and supportive sport bra for gym workouts.",
    price: 29.99,
    image:
      "data:image/jpeg;base64,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",
    category: "gym",
    gender: "women",
    colors: ["black", "green", "red"],
    sizes: ["S", "M", "L"],
    materials: ["nylon", "elastane"],
    rating: 4.5,
    reviews: 210,
    brand: "FitBra",
    subCategory: "tops",

  },
  {
    id: "gym-graphic-tank",
    name: "Graphic Workout Tank",
    description: "Graphic print tank top that combines fashion with function.",
    price: 34.99,
    image:
      "data:image/jpeg;base64,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",
    category: "gym",
    gender: "men",
    colors: ["white", "black"],
    sizes: ["S", "M", "L"],
    materials: ["cotton", "polyester"],
    rating: 4.6,
    reviews: 202,
    brand: "GraphicFit",
    subCategory: "tops",

  },
  // Existing products...

  // New apparel items (Yoga) - Continued
  {
    id: "yoga-crop-top-light",
    name: "Light Crop Yoga Top",
    description:
      "Comfortable crop top featuring lightweight fabric for your yoga sessions.",
    price: 37.99,
    image:
      "data:image/jpeg;base64,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",
    category: "yoga",
    gender: "women",
    colors: ["white", "lavender", "gray"],
    sizes: ["XS", "S", "M", "L"],
    materials: ["cotton", "spandex"],
    rating: 4.6,
    reviews: 110,
    brand: "YogaSoul",
    subCategory: "tops",

  },
  {
    id: "yoga-long-sleeve",
    name: "Long Sleeve Yoga Top",
    description: "Soft, long sleeve top perfect for layering during workouts.",
    price: 42.99,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo-j_XenPJeUAtxH46lp4uiGndKYgHJMHf8g&s",
    category: "yoga",
    gender: "women",
    colors: ["black", "forest green"],
    sizes: ["S", "M", "L"],
    materials: ["modal", "cotton"],
    rating: 4.7,
    reviews: 95,
    brand: "Zen Spirit",
    subCategory: "tops",

  },

  // More apparel items (Jogging/Running)
  {
    id: "running-tights-high-waist",
    name: "High Waist Running Tights",
    description:
      "Stylish high-waisted tights with pockets, perfect for running.",
    price: 59.99,
    image:
      "data:image/jpeg;base64,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",
    category: "jogging",
    gender: "women",
    colors: ["black", "purple", "navy"],
    sizes: ["XS", "S", "M", "L"],
    materials: ["nylon", "elastane"],
    rating: 4.8,
    reviews: 160,
    brand: "RunVibe",
    subCategory: "bottoms",

  },
  {
    id: "running-jacket-breathable",
    name: "Breathable Running Jacket",
    description: "Highly breathable jacket for warm-up or cool-down sessions.",
    price: 74.99,
    image:
      "https://images.ctfassets.net/hnk2vsx53n6l/2WRKnBxaUnsewpaiH85zz8/26c5cf9c7c9fbec92c4d3247b61dbbf1/a756cabeb89d9429f8eed4c2c934f05f6cb52439.jpg?fm=webp",
    category: "jogging",
    gender: "men",
    colors: ["black", "grey"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["mesh", "nylon"],
    rating: 4.5,
    reviews: 120,
    brand: "RunPro",
    subCategory: "outerwear",

  },
  {
    id: "running-shorts-comfort",
    name: "Comfort Running Shorts",
    description: "Men's running shorts designed for comfort and style.",
    price: 39.99,
    image:
      "data:image/jpeg;base64,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",
    category: "jogging",
    gender: "men",
    colors: ["black", "blue"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["polyester", "cotton"],
    rating: 4.4,
    reviews: 150,
    brand: "SprintRun",
    subCategory: "bottoms",

  },
  {
    id: "running-cold-weather-tights",
    name: "Cold Weather Running Tights",
    description:
      "Insulated tights designed for cold weather running with thermal protection.",
    price: 67.99,
    image:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxATEBUSEBASFRUVEhUVFhcQFQ8QFRAQFRUXFxcVFRUYHSggGBolGxcWITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQFSsdIB8rLS8tLS0rLS0tLS0tKystLS0tLTctLi0rLS0rKy0tLS0tKzctLS0tLS0rLzctKy0tK//AABEIAQMAwgMBIgACEQEDEQH/xAAcAAEAAQUBAQAAAAAAAAAAAAAABgIDBAUHAQj/xABIEAACAQIDAwgFCAcFCQAAAAAAAQIDEQQSIQUGMRMiQVFhcYGRB1KhscEjJGJygpKywhQyQmOi0dIzU3Oz8BY0Q0RUg5PD4f/EABkBAQEBAQEBAAAAAAAAAAAAAAAEAwIBBf/EACQRAQEAAgEDBAMBAQAAAAAAAAABAgMRITEyBBMiQRJRgWEj/9oADAMBAAIRAxEAPwDsoAAAAAc73jr/ADyqvpL2Rijohz/eqllxc3bioyXjFfFMx3+Kn03n/GumTPchR/Q42XGdS/bLO1fyS8iHTjp4Er3BqXwso+pWmvNRl8TPT5NfU9cWo3+p/OqL66TT+zK/5jAhHQ2+/FniKKvrGnJvulJW/CyN19sYSGkq8L/RvP8ADc42S3O8OtVk1zlmSRjVDAlvTg1+3KX1YT+KRi197sL0QrP7MP6jn2s/0793CfaQUloW6ho4750ErclW8qf9RZe+FH+7q+VP+o99rP8ATn3sP23GI4GJsfFKjjKVR6JVFf6j5svY2YX+1mGekoVY9rjB+6RS8XQq/wBlUUuzVS+69Tz8MsbzY6meGU4ldu2hK1Ko+qnN+UWcsoK0NDoFDGKps3lX04STl9aNNqXtTOeYRvIr9Rtu68MPTdOWp2xUuu1Hatl08tClHqpU15QSOM7RitV2M7XhlzI/Vj7ke6Ps9V9LgAKEYAAAAAAAAAABEN9aNqtOfXFx+67/AJiXmh3yoZqCmv2Jp/Zlzfe4nGyc41rpvGcROpwNl6OMXepiaXVyU1454y90TU16nN8DF3B2jGli8bUnwhhJVWvo0pJv3mOryU7/ABa30q7QlPaE6UZPLTp04ySfGbjn17sy067kLysy8dip1as6tRpzqSc5WVlmk7uy6EWGVycIuVhx7f8ASKMnaX2v9dhS2Hiykw4lxIpkBYmiy2+K81pZl+RZmwOy7l7Vc93cQ5STlRhioN9OsXUV10O1Q1WAqKVNPsNJuBtT5ntLBtf2mCr14v6VOm4yT704tfVfWX92cTeiu4m3RV6e91W0k5Syri9F3vQ7io206tDjuysNyuOow66sW/qxeaXsTOxDTOleepvWQABumAAAAAAAAAAALWMw6qU5U3wlFx7rriXQByrHRcVKL0cW4vsa0ZG9n4lU62KUnblMBiKav60srXuJ/vtg8lXOuFSN/tx0fsyvzOWbaj8t9l381oT4TjLhZnl+WHLDmUs9qPUokypG8ky3JiTKGwK7FMj2HApkBakWZF6RakBvNzKqjiZRd+fhMbDTq/RK09fumVunVahZ9Ro9nYl0qmdK7yVYeFWjOk35TZutgq0THd2UaO7o/o3wefEVKz4U4KK+vN/0xf3johHtw8HyeCg7a1HKo/F2j/DFeZIT3CcYs9uXOVAAdswAAAAAAAAAAAABot8sNnw1+mE0/B81+9HGN445aqXS4przep9BVaSnFxktJJp9z0PnnembeKqdUMsF9279rZx+Pz5azL/nZ/rU3PKjPUi3WZqyUTZaci5IsVJAXqUipmNQmXkwPJFmoXlwLNUCqlroSrZFF8nGyvdLhq23w0InQdpI6n6PcMnXw0Wk1GObxhTck/NJmO2c8KNF45v6dU2bQ5OjTp2tkpwj3OMUjIANE4AAAAAAAAAAAAAAAD1HzxvarY2vFfs1HHvcbJ+4+hj543vnfH4pr/qay8ptCTq956cNOi1WLzLMzp4t30LFVaMu3KKkG9Iq7eiS6ZPRLzAxMNPj2MzKfAkHpE2BRwWNhQowypYShKWrk51XKpGc3fpbj3EfiuCAuLgWqiL7RZqAWkdf9FlNyrQbX6lCT8Xlj7pHIYn0P6OdlxpYKnUss1aEZt/Qa5qXhr3vsOM5zY0wykl/1KQAeswAAAAAAAAAAAAAAAHqPm7btTNiq8uvEVn4OrJn0bXrKEJTfCEXJ90Vd+4+ZJzb1lxer73qz2DxvQtMudBZTPRbkbrcXBqttTCU2rrluUfdRjKqr9l4JeJpahO/Qng8+0KlV8KWGku6dScUv4Yz8wLnpvXz+k7f8rHXr+Vq6eHxIDSXST/03P5/SXR+iRt/5atyBQ4CCosVTILFVagWbaPuv5H05unC2z8IurCUP8qJ8yr4M+mNz6mbZ2El14Sh/lRPKNuADwAAAAAAAAAAAAAAAAaHfyu4bMxUl/cyj4Tag/ZI+e+jU+kt4tnvEYSvQVk6lKcYt8FO3Nb7M1jjeM9H+NotOu6Cpt2TpTnUlmtfVOKton1jmSc17JzeETfAsSOgUNyaUo3dSd/AxcRuJHorS8Umc+7i79rJBajOoegXLmxmvOaw+n0Vy135tEf2fuRymJp0ZVmlOVm4x1UbXbV+xHVNz9x8Ns+U50qlac5xyt1ZRtlunZRikuKWru/adTKZTo5yxuPdBvTlTSxOEn61GtF90Jwf/sZzeDO9b+bkLaHJzVd0qlKMowvFTptSabzLR35q1T8Gc7o+j6UJOnXq2qRspKlzo3ausspJNqzXFIXKYzqY43LshqLUzoP+wtJf8Wp/D/IxMZuhSg1z5O/Wc+7i69rJBFxPo70ezvsrCdmHjDxheD9sTi+M3MxdWUY4Ck6jzLPdxjGnFp6ylJ2S9ujsdu3N2PUwmBpYerUjOUM7bgmo3nOU8sb6tLNa/TbguB1MpZy4ynF4boAB4AAAAAAAAAAAAAAAAGk3tjejD/FX4Jm7NJvTPmQXXJvyjb4nGzxrvX5RpsNS5iLdSmjLpfq+BjVGTVXFvdrDp49P1Kc5eNsv5idET3QhfEVpdUIx+9K/5SWFGrxT778wiO2I/O6naoP+CK+BLiLbaj86l2wh7rfAbexp8mLKJqdsQ4d5uUana/DuaJ28nVvdwIfJVZdLqpeEYJr8TJSRjcOXyVVfvb+cIr4EnKdfjEuzyoADtwAAAAAAAAAAAAAAAAEb3qfylNdUZPzav7kSQjO8jvXiuqmvbJ/yM9vi10+THUtDBqVLXMqT08DSYjEPXr4d5NVeKWbl0vkpz9eq/GMUl73IkJibJwvJUKdPpjFX+u9Ze1syyvGcThDnecrQje80LVYT9aDj4xd/zEkNRvRQvQzLjTkpfZej99/A82TnF1rvGUaOEtWa7acbxZk0J87vLO0ODJVn22fo9lza31qfumS4ivo/S5Ot18qvLKrfElRVr8Yj2+dAAdswAAAAAAAAAAAAAAAAhuOrZ8RUl1Syrujzfh7SYylZX6tfIgGClfV9Or7zDdekij0871mVHoa3ZdFSxlKL4cpm78qcvgbCq9DX7Pq5cXRf72K8JPL8TKd43vjXRgAWIAs42mpUpxfBwkvOLLxjbTqZaFSXVTlbvyu3tPL2ezug+C6O49xfBnmEPMSyF9D7Zm4WItWrU/Wiprvg7P8AEvImxzjdSpbaFP6SqL+CUvgjo5VpvxSb5xmAA1YgAAAAAAAAAAAAAAALONfyU/8ADn+FkAwbOhV4Zoyj1xa81Y5zh3wJ9/0q9P2rOqy0NZSdq1P/ABYfiRn1HoYezoZ8XSj+9i33J3fsTMse7a9JXS2AC188NZvJK2FqfZXnOKNma7eOF8LU7En92SfwOcu1dYeUQ3DvS5arsrovQs4rgRV9GPN2v9/o98/8uR0w51udSvjov1YTl/Dl/MdFKtPij9RfkAA1YAAAAAAAAAAAAAAAAPUc8nSyzqR9Wcl5No6EQja9PLi6q62pfeSb9tzHdOij0961jVOBc3Qo5sbf1ITl4u0fzMtVOBnbkR+cVX+7S85L+Rlr8o22X4VMwAVoQt4mlmhKPrRlHzTRcPUBzfDcC1jGXsOuPe0Y+K6+ohfTjdbg0Pla1TqjGHjJtv8ACiaEb3Do2w0pv9urJ+CSj70ySFeucYxBtvOdAAdswAAAAAAAAAAAAAAAAiW9cMuIhL1qdvGMn8GiWke3ypcynP1ZuPhJX/KcbJ8Wum/ONBW4Gy3Ejz677Ka/F/I1s1dG63FjzKz66qXlH/6YavJvt8EmABUjD1HgA581adRdU5rykzX496GzxitWrL97P2tmpx6crRXFtJd70RFZ1fQl6Og7sUcmDorrgpffbn8TZlNOmopRXBJJdyViosnSILebyAA9eAAAAAAAAAAAAAAAABrd5KWbC1OxKS+y037LmyMbaluQq34cnP8ACzy9nWN4sQem+aSDci3IVOvl5X+7CxHqej8DN3KxlsRUpdE1mXZKP80/YifX0yV7ZzgmoAKUQAY+0cTydKdT1Ytrtl0e2wEL2hNOtWa4crJeTt8DE2FQ5TG0lxUZOb7FBXT+9lLKqtUm3xu/Ftm03Iglipdf6PLw59Mlx65Ls+mH8TkAFSEAAAAAAAAAAAA8uB6Dy4zAeg8zHmYCo0O+e1adDDqM5JOtUjShd2vLWb9kX4tLpN1Wq5YuVm7RbtHjKyvZdrPmvfHevF7QlGrXhkpwco0oRjJQg5WcoubXPnaKv3cEeWcx7LxeU72pvHh6MlTc26trqEVJ/rcE5JWj4mw9HW1qFXGNKSz8nUWS/OTUle66rLicc2W3KvFu7d29eyL6Te+jfGultjDTfCdWdN9qqwnFfxSj5HM1yNMt1y6PpMFOdDOjtkqMLbiX6LWvwVKb16MsXL4GXnRFvSftGNHZWJb1dSHIpdbrPI/KLk/AEQbEbdoJ8lKa4rnOUMmbjbNfjY2WA23DC14VpSXJ/q1G/wBmjNpZk+x5Zd0X1nIWvm3/AHfyos1MfVlSjSlUk6ceEdLJLh3pdpn7XF5jf3rZZY+tgca9H3pSyKjg8bC8VkpQrxd3FaRgqsXxS0WdPvXFnZbmjAAuLgALi4AC4uAAAAAAeNFLiVgC24lLTLwsBjSuafG7Lp1YulXhCpTla8Zq6bTvez4Ndhv3Aszw0WrNfC3c+gCOUNytlx1jgqKfXld/N6mJS3O2fRxFOvSw0ITpu8XF1ElJpq+W+VvXpRJ3sun9PwqVl+Y9hs6CfBuzvzpTnr9psC0pMqVzL5IcmBi5zWbw7Jo4yg6FdSyOUZc15WpRd00/NdzZvHTLVXDX6Wu2NgIQ/Rds7Jk+WUW72VW+vXrE19P0Z7OpTzNVauv6tWacF3qMVm7ndHQXgqnRWn4qm/ylmWym/wBerUkurmRXsjf2gRKnuvhJVYzWDoKUZRacacIq8WmnZceHUycKqymlgIqyS0RlKigLSmypSZdVNFSiBaVypJlywAoSKrHoA8sD0AAAAAAAAAAAAAAAAALA8AAAAegAAAAAAAAAAAAP/9k=",
    category: "jogging",
    gender: "men",
    colors: ["black", "dark blue"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["thermal polyester"],
    rating: 4.9,
    reviews: 180,
    brand: "OutdoorGear",
    subCategory: "bottoms",

  },

  // More apparel items (Gym)
  {
    id: "gym-shorts-stripe",
    name: "Striped Gym Shorts",
    description: "Stylish gym shorts with a comfortable fit for all-day wear.",
    price: 44.99,
    image:
      "https://biggerbetter.in/cdn/shop/files/WhatsApp_Image_2024-07-15_at_16.18.17_1721041417547.jpg?v=1728465460",
    category: "gym",
    gender: "men",
    colors: ["black/blue", "grey/red"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["polyester", "elastane"],
    rating: 4.6,
    reviews: 150,
    brand: "FlexFit",
    subCategory: "bottoms",

  },
  {
    id: "gym-hoodie-zipper",
    name: "Zippered Gym Hoodie",
    description: "Zippered hoodie for warm-ups and cool-downs at the gym.",
    price: 59.99,
    image:
      "https://biggerbetter.in/cdn/shop/files/WhatsApp_Image_2024-07-15_at_16.18.17_1721041417547.jpg?v=1728465460",
    category: "gym",
    gender: "unisex",
    colors: ["grey", "black"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "polyester"],
    rating: 4.8,
    reviews: 210,
    brand: "PerformX",
    subCategory: "outerwear",

  },
  {
    id: "gym-sleeveless-tank",
    name: "Sleeveless Workout Tank",
    description: "Breathable sleeveless tank perfect for intense workouts.",
    price: 28.99,
    image:
      "https://hips.hearstapps.com/hmg-prod/images/best-tank-tops-66fbd6b334c46.png?crop=0.6666666666666666xw:1xh;center,top&resize=1200:*",
    category: "gym",
    gender: "men",
    colors: ["black", "green"],
    sizes: ["S", "M", "L"],
    materials: ["polyester", "cotton"],
    rating: 4.5,
    reviews: 165,
    brand: "StrengthWear",
    subCategory: "tops",

  },

  // Additional items continuing to fill the catalog...
  {
    id: "yoga-pants-flow",
    name: "Flow Yoga Pants",
    description: "Bell-bottom yoga pants allowing freedom of movement.",
    price: 55.99,
    image:
      "https://birdeyeindia.com/cdn/shop/files/birdeye_75.jpg?v=1723403216",
    category: "yoga",
    gender: "women",
    colors: ["black", "purple", "blue"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "spandex"],
    rating: 4.7,
    reviews: 200,
    brand: "YogaBliss",
    subCategory: "bottoms",

  },

  {
    id: "long-sleeve-t-shirt-gym",
    name: "Long Sleeve Gym T-Shirt",
    description: "Lightweight and breathable long sleeve t-shirt for workouts.",
    price: 36.99,
    image:
      "https://chkokko.com/cdn/shop/products/71gBuWQRDBL._UY741.jpg?v=1679377235",
    category: "gym",
    gender: "unisex",
    colors: ["grey", "black"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "polyester"],
    rating: 4.6,
    reviews: 190,
    brand: "ActiveFit",
    subCategory: "tops",

  },

  {
    id: "yoga-hoodie-french",
    name: "French Terry Yoga Hoodie",
    description:
      "Soft hoodie made with French terry fabric for comfort and warmth.",
    price: 49.99,
    image:
      "data:image/jpeg;base64,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",
    category: "yoga",
    gender: "women",
    colors: ["grey", "light pink", "blue"],
    sizes: ["XS", "S", "M", "L"],
    materials: ["cotton", "polyester"],
    rating: 4.7,
    reviews: 175,
    brand: "ZenLife",
    subCategory: "outerwear",

  },

  {
    id: "running-anti-chafing-shorts",
    name: "Anti-Chafing Running Shorts",
    description:
      "Special fabric shorts designed to prevent chafing during runs.",
    price: 39.99,
    image: "https://m.media-amazon.com/images/I/912ayL0iYoL._AC_UY1100_.jpg",
    category: "jogging",
    gender: "men",
    colors: ["orange", "black"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["nylon", "spandex"],
    rating: 4.5,
    reviews: 160,
    brand: "SmoothRun",
    subCategory: "bottoms",

  },

  // Continue adding to reach around 60 new products...
  {
    id: "yoga-comfort-bra",
    name: "Comfort Yoga Bra",
    description: "Flexible and supportive, perfect for hot yoga sessions.",
    price: 28.99,
    image:
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/0d5e3a19dd66462eb726ace7015b0849_9366/Stronger_For_It_Yoga_Bra_Black_GR8195_01_laydown.jpg",
    category: "yoga",
    gender: "women",
    colors: ["black", "light blue"],
    sizes: ["XS", "S", "M"],
    materials: ["spandex", "modal"],
    rating: 4.6,
    reviews: 140,
    brand: "FlowFlex",
    subCategory: "tops",

  },

  {
    id: "gym-casual-jacket",
    name: "Casual Gym Jacket",
    description: "A casual yet stylish jacket suitable for gym and lounge.",
    price: 59.99,
    image: "https://m.media-amazon.com/images/I/514oOfzpgUL._AC_UY1100_.jpg",
    category: "gym",
    gender: "unisex",
    colors: ["dark grey", "light grey"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["cotton", "polyester"],
    rating: 4.8,
    reviews: 200,
    brand: "WearComfort",
    subCategory: "outerwear",

  },

  {
    id: "running-max-length-shorts",
    name: "Max Length Running Shorts",
    description: "Running shorts designed for maximum coverage and comfort.",
    price: 38.99,
    image:
      "https://m.media-amazon.com/images/I/71qdldZgMHL._AC_UF894,1000_QL80_DpWeblab_.jpg",
    category: "jogging",
    gender: "men",
    colors: ["black", "light grey", "green"],
    sizes: ["S", "M", "L"],
    materials: ["polyester", "elastane"],
    rating: 4.5,
    reviews: 160,
    brand: "RunnerGear",
    subCategory: "bottoms",

  },
];

export const filterOptions = {
  colors: [
    "black",
    "white",
    "gray",
    "blue",
    "red",
    "navy",
    "purple",
    "teal",
    "olive",
    "pink",
    "burgundy",
    "green",
    "orange",
    "silver",
    "peach",
    "khaki",
    "natural cork",
    "dark green",
    "light pink",
    "light grey",
    "light blue",
    "dark blue",
    "dark grey",
  ],
  sizes: [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "standard",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
  ],
  materials: [
    "cotton",
    "polyester",
    "nylon",
    "spandex",
    "elastane",
    "TPE",
    "cork",
    "leather",
    "rubber",
    "mesh",
    "modal",
    "fleece",
    "jersey",
    "breathable polyester",
    "stretch fabric",
    "compression fabric",
    "recycled polyester",
    "water-resistant nylon",
    "thermal polyester",
  ],
  genders: ["men", "women", "unisex"],
  brands: ["ZenFlow", "Luluma", "SprintForce", "PowerLift"],
  categories: [
    { id: "yoga", name: "Yoga" },
    { id: "jogging", name: "Jogging/Running/Walking" },
    { id: "gym", name: "Gym" },
  ],
  subCategories: [
    "tops",
    "bottoms",
    "outerwear",
    "footwear",
    "equipment",
    "accessories",
  ],
};
