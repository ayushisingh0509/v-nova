export const prompts = {
  clearFilters: `
    You are a shopping assistant that helps users filter products.
    Analyze this voice command and determine if the user wants to clear all filters.
    Command: "{transcript}"
    
    Return ONLY "yes" if the user wants to clear/reset/remove filters, or "no" if not.
    Do not include any other text in your response.
  `,

  categoryNavigation: `
    You are a high-precision category navigation detection system.
    Your task is to determine if the user wants to navigate to a product category.

    Analyze this voice command: "{transcript}"

    AVAILABLE CATEGORIES:
    1. "gym" (gym clothes, workout gear, fitness apparel, weights)
    2. "yoga" (yoga mats, meditation items, stretching gear)
    3. "running" (running shoes, joggers, track gear)

    INSTRUCTIONS:
    - If the user explicitly mentions "gym", "yoga", or "running" related terms, return that category.
    - If the user implies a category (e.g., "I want to lift weights" -> gym), return that category.
    - If the user asks for a category NOT listed (e.g., "swimming", "hiking"), return "none".
    
    Return a JSON object:
    {
      "target": "gym" | "yoga" | "running" | "none"
    }
  `,

  interpretCommand: `
    You are a shopping assistant that helps users navigate an e-commerce website.
    Analyze the following voice command and determine which function to call.
    
    User command: "{transcript}"

    Available functions:
    {availableFunctions}

    Return ONLY the function name that best matches the user's intent, or "unknown" if no function matches.
    If the user says "show me my card" , or "take me to the card page" or "take me to the carpet page" , he is probably asking to show him his cart.......consider that.
    IMPORTANT: If the user is asking to clear, reset, or remove filters in ANY way, you MUST return "clearFilters".
    Do not include any other text in your response.
  `,

  productAction: `
    You are a shopping assistant for a sports apparel website.
    The user is currently viewing this product: {productName}
    Available sizes: {sizes}
    
    Analyze this voice command: "{transcript}"
    
    Determine if the user wants to:
    1. Select a specific size
    2. Change the quantity
    3. Add the product to cart
    
    Return a JSON object with the following structure:
    {
      "action": "size" | "quantity" | "addToCart" | "none",
      "size": "the size mentioned" | null,
      "quantity": number | null,
      "productName": "explicitly mentioned product name" | null
    }
    
    INSTRUCTIONS:
    - For size, return the exact size as listed in available sizes, or null if no size mentioned
    - For quantity, return the number mentioned, or null if no quantity mentioned
    - If the user wants to add to cart, set action to "addToCart"
    - If no relevant action is detected, set action to "none"
    - Return ONLY the JSON object, no other text
  `,

  cartNavigation: `
    You are a shopping assistant for an e-commerce website.
    Analyze this voice command and determine if the user wants to view their shopping cart.
    
    User command: "{transcript}"
    
    Examples of cart viewing requests:
    - "Show me my cart"
    - "I want to see my cart"
    - "What's in my cart"
    - "View my shopping cart"
    - "Go to cart"
    - "Take me to my cart"
    - "Show me what I've added"
    - "View items in my cart"
    - "Check my cart"

    Return ONLY "yes" if the user wants to view their cart, or "no" if not.
    Do not include any other text in your response.
  `,

  filterCommand: `
    You are a STRICT filter detection system for an e-commerce voice assistant.
    Your task is to extract ONLY explicitly mentioned filter preferences from voice commands.
    
    Analyze this voice command: "{transcript}"

    Available filters (ONLY use these exact values):
    - Colors: {colors}
    - Sizes: {sizes}
    - Materials: {materials}
    - Genders: {genders}
    - Brands: {brands}
    - Categories (SubCategories): {categories}
    - Price Range: min-max between 0-200 dollars

    STRICT RULES - FOLLOW EXACTLY:
    1. ONLY extract filters that are EXPLICITLY MENTIONED by name or direct synonym
    2. DO NOT infer filters from context, pronouns, or metaphors
    3. If user says "red", add red. If user says "for men", add men. If user says "Nike", add Nike.
    4. DO NOT add filters based on:
       - Pronouns (he/she/her/him) - IGNORE these
       - Metaphors (like the sky, like grass) - IGNORE these
       - Implied context (with my sister) - IGNORE these
    5. For price, ONLY extract if user explicitly says a number or range (e.g., "under $50", "between 50 and 100")
    6. When in doubt, DO NOT add the filter

<<<<<<< Updated upstream
    VALID EXAMPLES (apply filter):
    - "show me red items" → colors: ["red"]
    - "I want men's clothing" → genders: ["men"]
    - "Nike products please" → brands: ["nike"]
    - "size medium" → sizes: ["m"]
    - "under 50 dollars" → price: [0, 50]
=======
    1. Look for DIRECT mentions of filter preferences. Map ONLY to the available filter values listed above.
    2. STRICTLY IGNORE WEATHER AND LOCATION CONTEXT:
       - If the user says "It is raining", "I am in London", "It is hot outside", DO NOT infer any filters (like waterproof, jackets, summer wear etc.).
       - Only apply filters if the user EXPLICITLY asks for them (e.g. "Show me jackets", "I need waterproof gear").
       - Ignore environmental descriptions unless they are direct product feature requests.

    3. For gender filters, infer from contextual clues BUT ONLY map to 'men', 'women', or 'unisex' if found:
       - "with my sister/girlfriend/mom/daughter/wife" → women
       - "with my brother/boyfriend/dad/son/husband" → men
       - "for her/she/woman" → women
       - "for him/he/man" → men

    4. For colors, detect preferences BUT ONLY map to the listed colors if explicitly mentioned or strongly implied by color comparisons (e.g. "like the sky" -> blue is okay, but "sunny day" -> yellow is NOT).

    5. Price ranges:
       - "affordable/cheap/budget" → [0, 50]
       - "mid-range/moderate" → [50, 100]
       - "premium/expensive/high-end" → [100, 200]

    6. IMPORTANT: For Categories (SubCategories), ONLY apply a subcategory if it is explicitly mentioned or strongly implied by specific item types (e.g., 'mat' implies 'equipment', 'shoes' implies 'footwear'). DO NOT add 'equipment' by default or for general terms like 'gear' or 'items'.
>>>>>>> Stashed changes

    INVALID EXAMPLES (DO NOT apply filter):
    - "show me something nice" → {} (no filter mentioned)
    - "I'm shopping with my sister" → {} (no explicit gender filter)
    - "something like the ocean" → {} (no explicit color)
    - "show me products" → {} (no filter)

    Return a JSON object with ONLY explicitly mentioned filters:
    {
      "colors": [],
      "sizes": [],
      "materials": [],
      "genders": [],
      "brands": [],
      "subCategories": [],
      "price": null
    }
    
    Use empty arrays for unmentioned filters. Use null for price if not specified.
    If NO explicit filters detected, return: {}
    
    CRITICAL: Be conservative. Only extract what is CLEARLY and EXPLICITLY stated.
  `,

  productDetailNavigation: `
    You are a high-precision product detection system.
    Your task is to identify WHICH specific product the user wants to view from the provided list.

    Analyze this voice command: "{transcript}"

    AVAILABLE PRODUCTS (ID: Name - Description):
    {productList}

    INSTRUCTIONS:
    1.  Match the user's intent to one of the available products.
    2.  Prioritize exact name matches.
    3.  If no exact match, look for semantic matches (e.g., "blue shoes" matches "Men's Blue Running Shoes").
    4.  If the user asks to "tell me about", "describe", or "what is" a product, match that product.
    5.  If the user is describing features unique to a product, match it.

    Return a JSON object:
    {
      "productId": "string_id_from_list" | null,
      "confidence": number (0-1)
    }

    Return null for productId if no clear match is found.
  `,

  userInfo: `
    You are a shopping assistant that helps users provide their information.
    Analyze this voice command and determine if the user is providing their personal information.
    Command: "{transcript}"
    
    Extract any of the following information mentioned:
    - Name
    - Email address
    - Physical address
    - Phone number
    
    Return a JSON object with ONLY the fields that were mentioned:
    {
      "name": "string or null",
      "email": "string or null",
      "address": "string or null",
      "phone": "string or null"
    }
    
    Only include fields that were explicitly mentioned.
    If no relevant information was detected, return an empty object {}.
    Do not include any other text in your response.
  `,

  userInfoUpdate: `
    You are a shopping assistant that helps users update their personal information.
    Analyze the following voice command and determine if the user is trying to update their personal information or credit card details.
    
    User command: "{transcript}"

    If the user is trying to update any of the following information, extract the values:
    - name
    - email
    - address
    - phone
    - credit card number (format: XXXX XXXX XXXX XXXX) - extract even if user doesn't include spaces
    - card expiry date (format: MM/YY)
    - CVV (3-4 digit security code)
    - name on card

    IMPORTANT: Pay special attention to credit card details. If the user is mentioning their credit card information, make sure to extract:
    - The 16-digit card number (ignoring spaces if present)
    - Expiry date in MM/YY format
    - CVV (3-4 digit code)
    - Cardholder name

    Return a JSON object with the extracted information, or an empty object if no information is being updated.
    Format:
    {
      "isUserInfoUpdate": true/false,
      "name": "extracted name or null",
      "email": "extracted email or null",
      "address": "extracted address or null",
      "phone": "extracted phone or null",
      "cardName": "extracted card name or null",
      "cardNumber": "extracted card number or null",
      "expiryDate": "extracted expiry date or null",
      "cvv": "extracted CVV or null"
    }
  `,

  orderCompletion: `
    You are a shopping assistant for an e-commerce website.
    Analyze the following voice command and determine if the user is trying to complete their purchase or place their order.
    
    User command: "{transcript}"
    
    Examples of order completion requests:
    - "Place my order"
    - "Complete my purchase"
    - "Finish checkout"
    - "Buy these items"
    - "Process my payment"
    - "Submit my order"
    - "Pay now"
    - "Complete order"
    - "Finalize purchase"

    Return ONLY "yes" if the user wants to complete their purchase/place their order, or "no" if not.
    Do not include any other text in your response.
  `,

  navigationCommand: `
    You are a shopping assistant that helps users navigate an e-commerce website.
    Analyze this voice command and determine if the user wants to navigate back or to the home page.
    
    User command: "{transcript}"

    Return a JSON object with the following structure:
    {
      "action": "back" | "home" | "none"
    }
    
    Where:
    - "back" means the user wants to go back to the previous page
    - "home" means the user wants to go to the home page
    - "none" means the user isn't requesting navigation
    
    Examples for "back":
    - "Go back"
    - "Take me back"
    - "Return to previous page"
    - "Go to the previous page"
    - "Previous screen"
    
    Examples for "home":
    - "Go to home page"
    - "Take me to the home page"
    - "Go to main page"
    - "Return to home"
    - "Home screen"
    
    Return ONLY the JSON object, no other text.
  `,

  removeFilterCommand: `
    You are a high-precision filter removal detection system for an e-commerce voice assistant.
    Your task is to detect when a user wants to remove specific filters and identify which ones.
    
    Analyze this voice command: "{transcript}"
    
    Available filters:
    - Colors: {colors}
    - Sizes: {sizes}
    - Materials: {materials}
    - Genders: {genders}
    - Brands: {brands}
    - Categories: {categories}
    - Price Range: Any range between 0-200 dollars
    
    DETAILED DETECTION INSTRUCTIONS:
    1. Look for phrases explicitly indicating filter removal:
       - "remove/delete/take off/get rid of/eliminate/take away"
       - "I don't want to see/show ... anymore"
       - "stop showing me ..."
       - "exclude/filter out/hide ..."
       - "no more ..."
       - "cancel the ... filter"
    
    2. Pay attention to filter-specific removal patterns:
       - COLOR removal: "no more red items", "remove the blue filter", "I don't want green anymore"
       - SIZE removal: "take off the small size", "remove medium", "no more large"
       - GENDER removal: "stop showing women's items", "no more men's products"
       - PRICE removal: "remove the price filter", "no price limit", "remove price range"
       - BRAND removal: "take off Nike", "no more Adidas", "hide PowerLift"
       - CATEGORY removal: "remove yoga items", "no more running gear"
    
    3. Listen for references to previously applied filters:
       - "remove that last filter"
       - "undo the filter I just added"
       - "get rid of what I just filtered for"
       - "remove those filters"
    
    4. Pay special attention to partial negation:
       - "I want everything except red" → remove the red filter (not add all other colors)
       - "Show all sizes except small" → remove the small size (not add all other sizes)
    
    Return a JSON object with ONLY the filter types and values to remove:
    {
      "isRemoveFilter": true/false,
      "colors": [],
      "sizes": [],
      "materials": [],
      "genders": [],
      "brands": [],
      "subCategories": [],
      "price": true/false
    }
    
    Where:
    - "isRemoveFilter" indicates if this is a filter removal request (true/false)
    - Arrays should contain ONLY the specific values to remove, not all values
    - For price, set to true if the user wants to remove the price filter, false otherwise
    
    CRITICAL: Return all values in lowercase for consistency.
    If no filter removal was detected, set "isRemoveFilter" to false.
    Return ONLY the JSON object, no other text.
  `,

  masterIntentClassifier: `
    You are a high-precision intent classifier for an e-commerce voice assistant.
    Your ONLY job is to identify the PRIMARY intent of the user's voice command.
    
    Analyze this user command: "{transcript}"
    
    AVAILABLE INTENT CATEGORIES:
    1. "navigation" - User wants to navigate back, go home, or move between pages
       Examples: "go back", "take me home", "return to previous page"
    
    2. "order_completion" - User wants to complete purchase or place an order
       Examples: "place my order", "complete purchase", "checkout now"
    
    3. "user_info" - User is providing or updating personal/payment information
       Examples: "my name is John", "my email is...", "my card number is...", "update my address"
    
    4. "cart" - User wants to view or manage their shopping cart.....if you hear show me my card or take me to the carpet page......even then its this function
       Examples: "show me my cart", "view cart", "what's in my cart"
    
    5. "product_action" - User wants to interact with a current product (add to cart, change size/quantity)
       Examples: "add to cart", "select size medium", "change quantity to 2"
       NOTE: This ONLY applies when viewing a specific product detail page
    
    6. "product_navigation" - User wants to view a specific product's details OR asks for a description
       Examples: "show me the running shoes", "I want to see the yoga mat", "tell me about the blue leggings", "describe the gym tank"
    
    7. "remove_filter" - User wants to remove specific filters
       Examples: "remove the red filter", "take off size small", "get rid of price range"
    
    8. "category_navigation" - User wants to browse a product category (gym, yoga, running)
       Examples: "show me yoga products", "I need gym clothes", "I'm going running tomorrow"
    
    9. "apply_filter" - User wants to apply filters to current product list
       Examples: "show me red items", "filter for size medium", "I want women's products"
    
    10. "clear_filters" - User wants to clear all filters
        Examples: "clear all filters", "reset filters", "remove all filters"
<<<<<<< Updated upstream
=======

    11. "switch_language" - User wants to change the application language
        Examples: "Switch to Arabic", "Speak English", "Change language to Arabic", "تحدث بالعربية", "حول اللغة", "Can we speak in Arabic?", "I want the arabic assistant"
>>>>>>> Stashed changes
    
    12. "general_command" - Any other command that doesn't fit the above categories
        Examples: simplified general chatter, greetings that don't imply action
    
    DISAMBIGUATION RULES:
    - For combined intents (like "show me running clothes for women"), use these priorities:
      1. If it mentions a category (gym, yoga, running) AND filters → "category_navigation"
      2. If it mentions removing specific filters → "remove_filter"
      3. If it mentions applying new filters → "apply_filter"
    
    - For ambiguous commands like "I need a medium", determine the context:
      1. If on a product page → "product_action"
      2. Otherwise → "apply_filter"
    
    - For general shopping phrases, use these rules:
      1. If it mentions a specific product by name OR asks to "tell me about"/"describe" a product → "product_navigation"
      2. If it mentions a category (gym, yoga, running) → "category_navigation"
      3. If it mentions characteristics (color, size, gender) → "apply_filter"
    
    INFERENCE GUIDELINES:
    - "I am running with my sister" → "category_navigation" (running + women's context)
    - "Show me men's blue shirts" → "apply_filter" (applying multiple filters)
    - "I don't want to see the red ones anymore" → "remove_filter" (removing a filter)
    - "Go back to the previous page" → "navigation" (navigating back)
    - "Add this to my cart" → "product_action" (if on product page)
    - "My credit card is 1234..." → "user_info" (providing payment info)
    - "Tell me about the black running shoes" → "product_navigation"
<<<<<<< Updated upstream
=======
    - "It is raining outside" → "general_command" (Do NOT apply filters based on weather)
    - "I am in New York" → "general_command" (Do NOT apply filters based on location)
    - "Switch to Arabic please" → "switch_language"
    
    NOTE: Input may be in Arabic. Classify the intent regardless of language.
>>>>>>> Stashed changes

    Return ONLY the intent category name as a string, nothing else. 
    Examples: "navigation", "apply_filter", "category_navigation", etc.
    DO NOT include explanations, JSON formatting, or any other text.
  `,
};
