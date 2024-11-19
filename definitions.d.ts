// Basic types
type VisibilityType = "DRAFT" | "PUBLISHED" | "HIDDEN";

// Reusable types
type ColorType = {
  name: string;
  image: string;
};

type DateRangeType = {
  startDate: string;
  endDate: string;
};

type HighlightPointsType = {
  headline: string;
  keyPoints: string[];
};

type DiscountType = {
  percentage: number;
  savings: number;
};

type UpsellItemType = {
  id: string;
  name: string;
  salePrice: number;
  price: number;
};

type ImageType = {
  name: string;
  image: string;
};

/***************************************************************/
type CollectionProductType = {
  index: number;
  id: string;
};

type CollectionType = {
  id: string;
  index: number;
  title: string;
  slug: string;
  campaignDuration: DateRangeType;
  collectionType: string;
  bannerImages?: {
    desktopImage: string;
    mobileImage: string;
  };
  products: CollectionProductType[];
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
};

/***************************************************************/
type SettingsType = {
  categorySection: {
    visibility: string;
  };
  [key: string]: any;
};

/***************************************************************/

/***************************************************************/
type PricingType = {
  basePrice: number;
  salePrice: number;
  discountPercentage: number;
};

type SizeChartType = {
  inches: {
    columns: Array<{ label: string; order: number }>;
    rows: Array<{ [key: string]: string }>;
  };
  centimeters: {
    columns: Array<{ label: string; order: number }>;
    rows: Array<{ [key: string]: string }>;
  };
};

type UpsellType = {
  id: string;
  mainImage: string;
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
  pricing: PricingType;
  products: Array<{
    index: number;
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    images: {
      main: string;
      gallery: string[];
    };
    options: {
      colors: Array<{
        name: string;
        image: string;
      }>;
      sizes: {
        inches: {
          columns: Array<{ label: string; order: number }>;
          rows: Array<{ [key: string]: string }>;
        };
        centimeters: {
          columns: Array<{ label: string; order: number }>;
          rows: Array<{ [key: string]: string }>;
        };
      };
    };
  }>;
};

type ProductWithUpsellType = Omit<ProductType, "upsell"> & {
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      salePrice: number;
      basePrice: number;
      discountPercentage: number;
    };
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
    createdAt: string;
    updatedAt: string;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      images: {
        main: string;
        gallery: string[];
      };
      options: {
        colors: Array<{
          name: string;
          image: string;
        }>;
        sizes: {
          inches: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
          centimeters: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
        };
      };
    }>;
  };
};

type UpsellReviewProductType = {
  id: string;
  upsell: {
    id: string;
    mainImage: string;
    pricing: {
      salePrice: number;
      basePrice: number;
      discountPercentage: number;
    };
    visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
    createdAt: string;
    updatedAt: string;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      images: {
        main: string;
        gallery: string[];
      };
      options: {
        colors: Array<{
          name: string;
          image: string;
        }>;
        sizes: {
          inches: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
          centimeters: {
            columns: Array<{ label: string; order: number }>;
            rows: Array<{ [key: string]: string }>;
          };
        };
      };
    }>;
  };
};

/***************************************************************/

type KeyPointsType = { index: number; text: string };

type averageOrderValueBoosterType = {
  name: string;
  promotionalMessage: string;
  quantityBreaks?: Array<{
    quantity: number;
    discount: number;
    pricePerItem: number;
    totalPrice: number;
  }>;
};

type ProductType = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  highlights: {
    headline: string;
    keyPoints: KeyPointsType[];
  };
  pricing: PricingType;
  images: {
    main: string;
    gallery: string[];
  };
  options: {
    colors: Array<{
      name: string;
      image: string;
    }>;
    sizes: {
      inches: {
        columns: Array<{ label: string; order: number }>;
        rows: Array<{ [key: string]: string }>;
      };
      centimeters: {
        columns: Array<{ label: string; order: number }>;
        rows: Array<{ [key: string]: string }>;
      };
    };
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  visibility: "DRAFT" | "PUBLISHED" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
  sourceInfo: {
    platform: string;
    platformUrl: string;
    store: string;
    storeId: string;
    storeUrl: string;
    productUrl: string;
  };
  upsell: string;
  averageOrderValueBooster?: averageOrderValueBoosterType;
  frequentlyBoughtTogether?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
};

/////////////////////////////////////////////////////
type CartProductItemType = {
  index: number;
  baseProductId: string;
  variantId: string;
  color: string;
  size: string;
  type: "product";
};

type CartUpsellItemType = {
  index: number;
  baseUpsellId: string;
  variantId: string;
  type: "upsell";
  products: Array<{
    id: string;
    color: string;
    size: string;
  }>;
};

type CartType = {
  id: string;
  device_identifier: string;
  items: Array<CartProductItemType | CartUpsellItemType>;
};

//
type OrderType = {
  id: string;
  status: string;
  payer: {
    email: string;
    payerId: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
  amount: {
    value: string;
    currency: string;
  };
  shipping: {
    name: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  transactionId: string;
  timestamp: string;
};
