import { DiscoveryProducts } from "@/components/website/DiscoveryProducts";
import { CheckmarkIcon, ChevronRightIcon, TrashIcon } from "@/icons";
import {
  getCart,
  getDiscoveryProducts,
  getProducts,
  getProductsByIds,
} from "@/lib/getData";
import { formatThousands } from "@/lib/utils";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineDelete } from "react-icons/ai";
import { HiMiniChevronRight } from "react-icons/hi2";
import { PiShieldCheckBold } from "react-icons/pi";
import { TbLock, TbTruck } from "react-icons/tb";

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
    products: {
      id: string;
      name: string;
      slug: string;
      mainImage: string;
      basePrice: number;
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
    }[];
  };
};

type CartType = {
  id: string;
  device_identifier: string;
  products: Array<{
    baseProductId: string;
    variantId: string;
    size: string;
    color: string;
  }>;
};

export default async function Cart() {
  const cookieStore = cookies();
  const deviceIdentifier = cookieStore.get("device_identifier")?.value;
  const cart = await getCart(deviceIdentifier);
  const discoveryProducts = await getDiscoveryProducts({ limit: 10 });

  const productIds = cart
    ? cart.products.map((product) => product.baseProductId)
    : [];

  const baseProducts = (await getProductsByIds({
    ids: productIds,
    fields: ["id", "name", "slug", "pricing", "images", "options"],
    visibility: "PUBLISHED",
  })) as ProductType[];

  const cartProducts = cart?.products
    .map((cartProduct) => {
      const baseProduct = baseProducts.find(
        (product) => product.id === cartProduct.baseProductId
      );

      const colorImage = baseProduct?.options?.colors.find(
        (colorOption) => colorOption.name === cartProduct.color
      )?.image;

      return baseProduct
        ? {
            baseProductId: baseProduct.id,
            name: baseProduct.name,
            slug: baseProduct.slug,
            pricing: baseProduct.pricing,
            mainImage: colorImage || baseProduct.images.main,
            variantId: cartProduct.variantId,
            size: cartProduct.size,
            color: cartProduct.color,
          }
        : null;
    })
    .filter((product) => product !== null);

  return (
    <div className="max-w-[968px] mx-auto mt-16 flex flex-col gap-10">
      <div className="w-[calc(100%-20px)] mx-auto">
        {/* <div className="flex flex-col gap-2 items-center pt-8 pb-12">
          <Image
            src="/icons/cart-thin.svg"
            alt="Cart"
            width={80}
            height={80}
            priority={true}
          />
          <p className="font-medium">Your Cart is Empty</p>
        </div> */}
        <div className="relative flex flex-row gap-10">
          <div className="w-[580px] h-max pt-8">
            <div className="flex flex-col gap-5">
              <div className="flex gap-5">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                    <CheckmarkIcon className="fill-white" size={16} />
                  </div>
                </div>
                <span className="font-semibold">Select all (3)</span>
              </div>
              <div className="flex flex-col gap-2">
                {(cartProducts || []).map(
                  ({
                    baseProductId,
                    variantId,
                    name,
                    slug,
                    pricing,
                    mainImage,
                    color,
                    size,
                  }) => (
                    <div key={variantId} className="flex gap-5">
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                          <CheckmarkIcon className="fill-white" size={16} />
                        </div>
                      </div>
                      <div className="min-w-32 max-w-32 min-h-32 max-h-32 overflow-hidden flex items-center justify-center">
                        <Image
                          src={mainImage}
                          alt={name}
                          width={128}
                          height={128}
                          priority
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="h-5 flex items-center gap-3">
                          <Link
                            href={`${slug}-${baseProductId}`}
                            className="text-sm line-clamp-1"
                          >
                            {name}
                          </Link>
                          <button className="min-w-8 max-w-8 min-h-8 max-h-8 rounded-full flex items-center justify-center ease-in-out duration-300 transition hover:bg-lightgray">
                            <TrashIcon size={18} className="fill-gray" />
                          </button>
                        </div>
                        <button className="w-max h-6 px-3 rounded-full text-sm flex items-center transition duration-200 ease-in-out border hover:border-[#8b95a6]">
                          {color} / {size}
                          <ChevronRightIcon size={18} className="-mr-[7px]" />
                        </button>
                        <div className="w-max flex items-center justify-center">
                          {Number(pricing.salePrice) ? (
                            <div className="flex items-center gap-[6px]">
                              <span className="font-medium">
                                ${formatThousands(Number(pricing.salePrice))}
                              </span>
                              <span className="text-xs text-gray line-through mt-[2px]">
                                ${formatThousands(Number(pricing.basePrice))}
                              </span>
                              <span className="border border-black rounded-[3px] font-medium h-5 text-xs leading-[10px] px-[5px] flex items-center justify-center">
                                -{pricing.discountPercentage}%
                              </span>
                            </div>
                          ) : (
                            <p className="font-medium">
                              ${formatThousands(Number(pricing.basePrice))}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="w-[340px] min-w-[340px]S sticky top-16 pt-8 h-max flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-[6px] items-center">
                <TbLock className="stroke-green-600 -ml-[1px]" size={20} />
                <span className="text-sm text-gray">
                  Secure Checkout with SSL Encryption
                </span>
              </div>
              <div className="flex gap-[6px] items-center">
                <PiShieldCheckBold className="fill-green-600" size={18} />
                <span className="text-sm text-gray ml-[1px]">
                  Safe and Trusted Payment Methods
                </span>
              </div>
              <div className="flex gap-[6px] items-center">
                <TbTruck className="stroke-green-600" size={20} />
                <span className="text-sm text-gray">
                  Free Shipping Just for You
                </span>
              </div>
            </div>
            <div className="mb-2 flex items-center gap-1">
              <span className="font-medium">Total (5 Items):</span>
              <span className="font-bold text-xl">$108.99</span>
            </div>
            <div className="flex items-center mb-2">
              <div className="h-[20px] rounded-[3px] flex items-center justify-center">
                <Image
                  src="/images/payment-methods/visa.svg"
                  alt="Visa"
                  width={34}
                  height={34}
                  priority={true}
                />
              </div>
              <div className="ml-[10px] h-[18px] w-[36px] rounded-[3px] flex items-center justify-center">
                <Image
                  className="-ml-[4px]"
                  src="/images/payment-methods/mastercard.svg"
                  alt="Mastercard"
                  width={38}
                  height={38}
                  priority={true}
                />
              </div>
              <div className="ml-[5px] h-[20px] overflow-hidden rounded-[3px] flex items-center justify-center">
                <Image
                  src="/images/payment-methods/american-express.png"
                  alt="American Express"
                  width={60}
                  height={20}
                  priority={true}
                />
              </div>
              <div className="ml-[10px] h-[20px] rounded-[3px] flex items-center justify-center">
                <Image
                  src="/images/payment-methods/discover.svg"
                  alt="Discover"
                  width={64}
                  height={14}
                  priority={true}
                />
              </div>
              <div className="ml-[10px] h-[20px] rounded-[3px] flex items-center justify-center">
                <Image
                  src="/images/payment-methods/diners-club-international.svg"
                  alt="Diners Club International"
                  width={68}
                  height={10}
                  priority={true}
                />
              </div>
            </div>
            <button className="w-full h-12 italic font-extrabold text-xl bg-sky-700 text-white rounded-full flex items-center justify-center">
              PayPal
            </button>
          </div>
        </div>
      </div>
      <DiscoveryProducts
        heading="Add These to Your Cart"
        products={discoveryProducts as ProductWithUpsellType[]}
        cart={cart as CartType}
      />
    </div>
  );
}
