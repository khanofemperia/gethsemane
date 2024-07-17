// Basic types
type VisibilityType = "DRAFT" | "PUBLISHED" | "HIDDEN";

// Reusable types
type ColorType = {
  name: string;
  image: string;
};

type MeasurementType = {
  in: string;
  cm: string;
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

type HighlightsType = {
  headline: string;
  keyPoints: string[];
} | null;

// Specific types
type CategoryType = {
  id: string;
  index: number;
  name: string;
  image: string;
  visibility: VisibilityType;
};

type SizeChartColumnType = {
  index: number;
  name: string;
};

type SizeType = {
  size: string;
  measurements: Record<string, MeasurementType>;
};

type SizeChartType = {
  columns: SizeChartColumnType[];
  entryLabels: SizeChartColumnType[];
  sizes: SizeType[];
};

type UpsellType = {
  id: string;
  price: string;
  salePrice: string;
  mainImage: string;
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
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
  products: ProductType[];
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
};

type SettingsType = {
  categorySection: {
    visibility: string;
  };
  [key: string]: any;
};

type PageHeroType = {
  id: string;
  images: {
    desktop: string;
    mobile: string;
  };
  title: string;
  destinationUrl: string;
  visibility: VisibilityType;
};

/***************************************************************/
type ProductType = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  highlights: {
    headline: string;
    keyPoints: string[];
  };
  pricing: {
    basePrice: number;
    salePrice?: number;
    discountPercentage?: number;
  };
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
      columns: Array<{
        index: number;
        name: string;
      }>;
      values: Array<{
        name: string;
        measurements: Record<
          string,
          {
            inches: string;
            centimeters: string;
          }
        >;
      }>;
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
    url: string;
    storeId: string;
    storeName: string;
    storeUrl: string;
  };
};
