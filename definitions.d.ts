// Basic types
type VisibilityType = "draft" | "published" | "hidden";

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

type ProductType = {
  id: string;
  category: string;
  name: string;
  slug: string;
  price: string;
  mainImage: string;
  images: string[] | null;
  colors: ColorType[] | null;
  sizes: SizeChartType | null;
  upsell: UpsellType;
  description: string | null;
  highlights: HighlightPointsType | null;
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
