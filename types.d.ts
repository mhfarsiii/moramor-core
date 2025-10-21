/**
 * Moramor Core API Types
 * Comprehensive TypeScript definitions for all API responses
 * Generated from NestJS backend with Prisma ORM
 */

// =============================================================================
// ENUMS
// =============================================================================

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethod {
  ZARINPAL = 'ZARINPAL',
  NEXTPAY = 'NEXTPAY',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

// =============================================================================
// COMMON TYPES
// =============================================================================

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// =============================================================================
// USER TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  addresses?: Address[];
  orders?: Order[];
  wishlist?: WishlistItem[];
  reviews?: Review[];
}

export interface UserListResponse extends PaginatedResponse<User> {}

export interface UserProfileResponse extends UserProfile {}

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface GoogleAuthResponse extends AuthResponse {}

// =============================================================================
// CATEGORY TYPES
// =============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryResponse extends Category {}

export type CategoryListResponse = Category[];

// =============================================================================
// PRODUCT TYPES
// =============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discount: number;
  categoryId: string;
  category: Category;
  materials: string[];
  images: string[];
  stock: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithReviews extends Product {
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  price: number;
  discount?: number;
  categoryId: string;
  materials?: string[];
  images?: string[];
  stock: number;
  sku?: string;
  weight?: number;
  dimensions?: any;
  isFeatured?: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'oldest' | 'popular';
  featured?: boolean;
}

export interface ProductResponse extends Product {}

export interface ProductListResponse extends PaginatedResponse<Product> {}

export interface ProductWithReviewsResponse extends ProductWithReviews {}

// =============================================================================
// CART TYPES
// =============================================================================

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse extends Cart {}

export interface AddToCartResponse extends CartItem {}

export interface UpdateCartItemResponse extends CartItem {}

export interface RemoveFromCartResponse {
  message: string;
}

export interface ClearCartResponse {
  message: string;
}

// =============================================================================
// ADDRESS TYPES
// =============================================================================

export interface Address {
  id: string;
  userId: string;
  title: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  title: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export interface AddressResponse extends Address {}

export type AddressListResponse = Address[];

// =============================================================================
// ORDER TYPES
// =============================================================================

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
  quantity: number;
  price: number;
  discount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: Address;
  trackingCode?: string;
  shippedAt?: string;
  deliveredAt?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paidAt?: string;
  customerNote?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  trackingCode?: string;
  adminNote?: string;
}

export interface OrderResponse extends Order {}

export interface OrderListResponse extends PaginatedResponse<Order> {}

export interface UpdateOrderStatusResponse extends Order {}

export interface CancelOrderResponse {
  message: string;
}

// =============================================================================
// WISHLIST TYPES
// =============================================================================

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface AddToWishlistRequest {
  productId: string;
}

export type WishlistResponse = WishlistItem[];

export interface AddToWishlistResponse extends WishlistItem {}

export interface RemoveFromWishlistResponse {
  message: string;
}

export interface CheckWishlistResponse {
  isInWishlist: boolean;
}

// =============================================================================
// REVIEW TYPES
// =============================================================================

export interface Review {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  productId: string;
  product?: Product;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment?: string;
}

export interface ReviewResponse extends Review {}

export interface ReviewListResponse extends PaginatedResponse<Review> {}

export type ProductReviewsResponse = Review[];

export interface ApproveReviewResponse extends Review {}

export interface RemoveReviewResponse {
  message: string;
}

// =============================================================================
// CHECKOUT TYPES
// =============================================================================

export interface CheckoutItem {
  productId: string;
  quantity: number;
}

export interface CreateCheckoutRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
  customerNote?: string;
  items?: CheckoutItem[];
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  paymentUrl?: string;
  authority?: string;
  totalPrice: number;
}

export interface PaymentVerifyResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  refId?: string;
  message?: string;
}

// =============================================================================
// UPLOAD TYPES
// =============================================================================

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
}

export interface UploadImageResponse extends UploadResult {}

export type UploadImagesResponse = UploadResult[];

// =============================================================================
// PAYMENT TYPES
// =============================================================================

export interface PaymentRequest {
  amount: number;
  userEmail: string;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  message?: string;
}

export interface PaymentVerifyRequest {
  authority: string;
  amount: number;
}

export interface PaymentVerifyResponse {
  success: boolean;
  refId?: string;
  message?: string;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

export interface ValidationError {
  statusCode: number;
  message: string[];
  error: string;
  timestamp: string;
  path: string;
}

// =============================================================================
// HEALTH CHECK TYPES
// =============================================================================

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  info?: {
    database: {
      status: 'up' | 'down';
    };
  };
  error?: {
    database: {
      status: 'up' | 'down';
    };
  };
  details?: {
    database: {
      status: 'up' | 'down';
    };
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type SortOrder = 'asc' | 'desc';

export type ProductSortOptions = 'price-asc' | 'price-desc' | 'newest' | 'oldest' | 'popular';

export type DateString = string; // ISO 8601 date string

export type CuidString = string; // CUID format string

export type EmailString = string; // Valid email format

export type PhoneString = string; // Iranian phone number format

export type PostalCodeString = string; // Iranian postal code format

// =============================================================================
// API ENDPOINT TYPES
// =============================================================================

// Auth endpoints
export type AuthRegisterEndpoint = '/auth/register';
export type AuthLoginEndpoint = '/auth/login';
export type AuthRefreshEndpoint = '/auth/refresh';
export type AuthLogoutEndpoint = '/auth/logout';
export type AuthMeEndpoint = '/auth/me';
export type AuthGoogleEndpoint = '/auth/google';
export type AuthGoogleCallbackEndpoint = '/auth/google/callback';
export type AuthForgotPasswordEndpoint = '/auth/forgot-password';
export type AuthResetPasswordEndpoint = '/auth/reset-password';
export type AuthVerifyEmailEndpoint = '/auth/verify-email';

// User endpoints
export type UserProfileEndpoint = '/users/profile';
export type UserUpdateProfileEndpoint = '/users/profile';
export type UserListEndpoint = '/users';
export type UserByIdEndpoint = '/users/:id';

// Product endpoints
export type ProductCreateEndpoint = '/products';
export type ProductListEndpoint = '/products';
export type ProductBySlugEndpoint = '/products/slug/:slug';
export type ProductByIdEndpoint = '/products/:id';
export type ProductUpdateEndpoint = '/products/:id';
export type ProductDeleteEndpoint = '/products/:id';

// Category endpoints
export type CategoryCreateEndpoint = '/categories';
export type CategoryListEndpoint = '/categories';
export type CategoryBySlugEndpoint = '/categories/slug/:slug';
export type CategoryByIdEndpoint = '/categories/:id';
export type CategoryUpdateEndpoint = '/categories/:id';
export type CategoryDeleteEndpoint = '/categories/:id';

// Cart endpoints
export type CartGetEndpoint = '/cart';
export type CartAddEndpoint = '/cart';
export type CartUpdateEndpoint = '/cart/:itemId';
export type CartRemoveEndpoint = '/cart/:itemId';
export type CartClearEndpoint = '/cart';

// Order endpoints
export type OrderListEndpoint = '/orders';
export type OrderListAdminEndpoint = '/orders/admin';
export type OrderByIdEndpoint = '/orders/:id';
export type OrderUpdateStatusEndpoint = '/orders/:id/status';
export type OrderCancelEndpoint = '/orders/:id';

// Address endpoints
export type AddressCreateEndpoint = '/addresses';
export type AddressListEndpoint = '/addresses';
export type AddressByIdEndpoint = '/addresses/:id';
export type AddressUpdateEndpoint = '/addresses/:id';
export type AddressDeleteEndpoint = '/addresses/:id';

// Wishlist endpoints
export type WishlistListEndpoint = '/wishlist';
export type WishlistAddEndpoint = '/wishlist';
export type WishlistRemoveEndpoint = '/wishlist/:productId';
export type WishlistCheckEndpoint = '/wishlist/check/:productId';

// Review endpoints
export type ReviewCreateEndpoint = '/reviews';
export type ReviewByProductEndpoint = '/reviews/product/:productId';
export type ReviewListEndpoint = '/reviews';
export type ReviewApproveEndpoint = '/reviews/:id/approve';
export type ReviewDeleteEndpoint = '/reviews/:id';

// Checkout endpoints
export type CheckoutCreateEndpoint = '/checkout';
export type CheckoutVerifyEndpoint = '/checkout/verify';

// Upload endpoints
export type UploadImageEndpoint = '/upload/image';
export type UploadImagesEndpoint = '/upload/images';

// Health check endpoint
export type HealthCheckEndpoint = '/health';

// =============================================================================
// REQUEST/RESPONSE MAPPING TYPES
// =============================================================================

export interface ApiEndpoints {
  // Auth
  'POST /auth/register': {
    body: RegisterRequest;
    response: RegisterResponse;
  };
  'POST /auth/login': {
    body: LoginRequest;
    response: AuthResponse;
  };
  'POST /auth/refresh': {
    body: RefreshTokenRequest;
    response: AuthTokens;
  };
  'POST /auth/logout': {
    body: RefreshTokenRequest;
    response: LogoutResponse;
  };
  'GET /auth/me': {
    response: User;
  };
  'GET /auth/google': {
    response: void;
  };
  'GET /auth/google/callback': {
    response: GoogleAuthResponse;
  };
  'POST /auth/forgot-password': {
    body: ForgotPasswordRequest;
    response: ForgotPasswordResponse;
  };
  'POST /auth/reset-password': {
    body: ResetPasswordRequest;
    response: ResetPasswordResponse;
  };
  'POST /auth/verify-email': {
    body: VerifyEmailRequest;
    response: VerifyEmailResponse;
  };

  // Users
  'GET /users/profile': {
    response: UserProfileResponse;
  };
  'PUT /users/profile': {
    body: Partial<User>;
    response: UserProfileResponse;
  };
  'GET /users': {
    query: { page?: number; limit?: number };
    response: UserListResponse;
  };
  'GET /users/:id': {
    params: { id: string };
    response: UserProfileResponse;
  };

  // Products
  'POST /products': {
    body: CreateProductRequest;
    response: ProductResponse;
  };
  'GET /products': {
    query: ProductQueryParams;
    response: ProductListResponse;
  };
  'GET /products/slug/:slug': {
    params: { slug: string };
    response: ProductWithReviewsResponse;
  };
  'GET /products/:id': {
    params: { id: string };
    response: ProductWithReviewsResponse;
  };
  'PATCH /products/:id': {
    params: { id: string };
    body: UpdateProductRequest;
    response: ProductResponse;
  };
  'DELETE /products/:id': {
    params: { id: string };
    response: { message: string };
  };

  // Categories
  'POST /categories': {
    body: CreateCategoryRequest;
    response: CategoryResponse;
  };
  'GET /categories': {
    query: { includeInactive?: boolean };
    response: CategoryListResponse;
  };
  'GET /categories/slug/:slug': {
    params: { slug: string };
    response: CategoryResponse;
  };
  'GET /categories/:id': {
    params: { id: string };
    response: CategoryResponse;
  };
  'PATCH /categories/:id': {
    params: { id: string };
    body: UpdateCategoryRequest;
    response: CategoryResponse;
  };
  'DELETE /categories/:id': {
    params: { id: string };
    response: { message: string };
  };

  // Cart
  'GET /cart': {
    response: CartResponse;
  };
  'POST /cart': {
    body: AddToCartRequest;
    response: AddToCartResponse;
  };
  'PUT /cart/:itemId': {
    params: { itemId: string };
    body: UpdateCartItemRequest;
    response: UpdateCartItemResponse;
  };
  'DELETE /cart/:itemId': {
    params: { itemId: string };
    response: RemoveFromCartResponse;
  };
  'DELETE /cart': {
    response: ClearCartResponse;
  };

  // Orders
  'GET /orders': {
    query: OrderQueryParams;
    response: OrderListResponse;
  };
  'GET /orders/admin': {
    query: OrderQueryParams;
    response: OrderListResponse;
  };
  'GET /orders/:id': {
    params: { id: string };
    response: OrderResponse;
  };
  'PATCH /orders/:id/status': {
    params: { id: string };
    body: UpdateOrderStatusRequest;
    response: UpdateOrderStatusResponse;
  };
  'DELETE /orders/:id': {
    params: { id: string };
    response: CancelOrderResponse;
  };

  // Addresses
  'POST /addresses': {
    body: CreateAddressRequest;
    response: AddressResponse;
  };
  'GET /addresses': {
    response: AddressListResponse;
  };
  'GET /addresses/:id': {
    params: { id: string };
    response: AddressResponse;
  };
  'PATCH /addresses/:id': {
    params: { id: string };
    body: UpdateAddressRequest;
    response: AddressResponse;
  };
  'DELETE /addresses/:id': {
    params: { id: string };
    response: { message: string };
  };

  // Wishlist
  'GET /wishlist': {
    response: WishlistResponse;
  };
  'POST /wishlist': {
    body: AddToWishlistRequest;
    response: AddToWishlistResponse;
  };
  'DELETE /wishlist/:productId': {
    params: { productId: string };
    response: RemoveFromWishlistResponse;
  };
  'GET /wishlist/check/:productId': {
    params: { productId: string };
    response: CheckWishlistResponse;
  };

  // Reviews
  'POST /reviews': {
    body: CreateReviewRequest;
    response: ReviewResponse;
  };
  'GET /reviews/product/:productId': {
    params: { productId: string };
    response: ProductReviewsResponse;
  };
  'GET /reviews': {
    query: { page?: number; limit?: number; approved?: boolean };
    response: ReviewListResponse;
  };
  'PATCH /reviews/:id/approve': {
    params: { id: string };
    response: ApproveReviewResponse;
  };
  'DELETE /reviews/:id': {
    params: { id: string };
    response: RemoveReviewResponse;
  };

  // Checkout
  'POST /checkout': {
    body: CreateCheckoutRequest;
    response: CheckoutResponse;
  };
  'GET /checkout/verify': {
    query: { Authority: string; Status: string };
    response: string; // HTML response
  };

  // Upload
  'POST /upload/image': {
    body: FormData;
    response: UploadImageResponse;
  };
  'POST /upload/images': {
    body: FormData;
    response: UploadImagesResponse;
  };

  // Health
  'GET /health': {
    response: HealthCheckResponse;
  };
}

// =============================================================================
// UTILITY TYPE HELPERS
// =============================================================================

export type ApiEndpoint = keyof ApiEndpoints;

export type ApiRequest<T extends ApiEndpoint> = ApiEndpoints[T] extends {
  body: infer B;
}
  ? B
  : never;

export type ApiResponse<T extends ApiEndpoint> = ApiEndpoints[T] extends {
  response: infer R;
}
  ? R
  : never;

export type ApiQuery<T extends ApiEndpoint> = ApiEndpoints[T] extends {
  query: infer Q;
}
  ? Q
  : never;

export type ApiParams<T extends ApiEndpoint> = ApiEndpoints[T] extends {
  params: infer P;
}
  ? P
  : never;

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // Re-export all types for easy importing
  User,
  UserProfile,
  UserListResponse,
  UserProfileResponse,
  AuthResponse,
  RegisterResponse,
  AuthTokens,
  VerifyEmailRequest,
  VerifyEmailResponse,
  Category,
  CategoryResponse,
  CategoryListResponse,
  Product,
  ProductWithReviews,
  ProductResponse,
  ProductListResponse,
  ProductWithReviewsResponse,
  Cart,
  CartItem,
  CartResponse,
  Address,
  AddressResponse,
  AddressListResponse,
  Order,
  OrderItem,
  OrderResponse,
  OrderListResponse,
  WishlistItem,
  WishlistResponse,
  Review,
  ReviewResponse,
  ReviewListResponse,
  CheckoutResponse,
  UploadResult,
  UploadImageResponse,
  UploadImagesResponse,
  PaymentResponse,
  HealthCheckResponse,
  ApiError,
  ValidationError,
  PaginatedResponse,
  PaginationMeta,
  ApiResponse as ApiResponseType,
};
