# Comprehensive E-Commerce Project Structure
src/
├── domains/
│   ├── products/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── ProductListView.tsx
│   │   │   │   └── ProductDetailView.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProductManagement.ts
│   │   │   │   └── useProductAdminActions.ts
│   │   │   └── services/
│   │   │       └── adminProductService.ts
│   │   ├── website/
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductDetail.tsx
│   │   │   │   └── ProductGrid.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useProductListing.ts
│   │   │   └── services/
│   │   │       └── websiteProductService.ts
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   └── Product.ts
│   │   │   ├── repositories/
│   │   │   │   └── productRepository.ts
│   │   │   ├── types/
│   │   │   │   └── product.types.ts
│   │   │   └── validators/
│   │   │       └── productValidator.ts
│   │   └── mappers/
│   │       └── productMapper.ts
│   │
│   ├── orders/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── OrderManagement.tsx
│   │   │   │   └── OrderDetailView.tsx
│   │   │   └── services/
│   │   │       └── adminOrderService.ts
│   │   ├── website/
│   │   │   ├── components/
│   │   │   │   ├── OrderHistory.tsx
│   │   │   │   └── OrderTracking.tsx
│   │   │   └── services/
│   │   │       └── customerOrderService.ts
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   └── Order.ts
│   │   │   ├── repositories/
│   │   │   │   └── orderRepository.ts
│   │   │   ├── types/
│   │   │   │   └── order.types.ts
│   │   │   └── validators/
│   │   │       └── orderValidator.ts
│   │   └── mappers/
│   │       └── orderMapper.ts
│   │
│   ├── authentication/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   └── AdminLoginForm.tsx
│   │   │   └── services/
│   │   │       └── adminAuthService.ts
│   │   ├── website/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   └── services/
│   │   │       └── customerAuthService.ts
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   └── User.ts
│   │   │   ├── repositories/
│   │   │   │   └── userRepository.ts
│   │   │   └── types/
│   │   │       └── user.types.ts
│   │   └── providers/
│   │       └── AuthProvider.tsx
│   │
│   └── inventory/
│       ├── admin/
│       │   ├── components/
│       │   │   └── InventoryManagement.tsx
│       │   └── services/
│       │       └── inventoryService.ts
│       └── core/
│           ├── models/
│           │   └── InventoryItem.ts
│           └── types/
│               └── inventory.types.ts
│
├── shared/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── hooks/
│   │   └── useMediaQuery.ts
│   ├── utils/
│   │   ├── formatter.ts
│   │   └── validation.ts
│   └── styles/
│       └── global.css
│
└── app/
    ├── (admin)/
    │   ├── admin/
    │   │   ├── products/page.tsx
    │   │   ├── orders/page.tsx
    │   │   └── layout.tsx
    │   └── layout.tsx
    ├── (website)/
    │   ├── products/page.tsx
    │   ├── cart/page.tsx
    │   ├── checkout/page.tsx
    │   └── layout.tsx
    └── layout.tsx

# Example Core Product Model
# domains/products/core/models/Product.ts
export class ProductModel {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public description: string,
    public categoryId: string,
    public inventory: number,
    public imageUrls: string[]
  ) {}

  // Domain logic methods
  isInStock(): boolean {
    return this.inventory > 0;
  }

  applyDiscount(discountPercentage: number): number {
    return this.price * (1 - discountPercentage / 100);
  }

  // Validation logic
  validate(): boolean {
    return this.name.length > 0 && 
           this.price > 0 && 
           this.inventory >= 0;
  }
}

# Example Admin Product Service
# domains/products/admin/services/adminProductService.ts
import { ProductRepository } from '../../core/repositories/productRepository';
import { ProductModel } from '../../core/models/Product';
import { ProductCreateDto, ProductUpdateDto } from '../../core/types/product.types';

export class AdminProductService {
  constructor(private repository: ProductRepository) {}

  async createProduct(data: ProductCreateDto): Promise<ProductModel> {
    // Additional admin-specific validation
    const product = new ProductModel(
      data.id,
      data.name,
      data.price,
      data.description,
      data.categoryId,
      data.inventory,
      data.imageUrls
    );

    if (!product.validate()) {
      throw new Error('Invalid product data');
    }

    return this.repository.create(product);
  }

  async updateInventory(productId: string, quantity: number): Promise<ProductModel> {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    product.inventory = quantity;
    return this.repository.update(product);
  }
}

# Example Website Product Service
# domains/products/website/services/websiteProductService.ts
import { ProductRepository } from '../../core/repositories/productRepository';
import { ProductModel } from '../../core/models/Product';

export class WebsiteProductService {
  constructor(private repository: ProductRepository) {}

  async getAvailableProducts(): Promise<ProductModel[]> {
    const allProducts = await this.repository.findAll();
    return allProducts.filter(product => product.isInStock());
  }

  async getProductsByCategory(categoryId: string): Promise<ProductModel[]> {
    return this.repository.findByCategory(categoryId);
  }
}