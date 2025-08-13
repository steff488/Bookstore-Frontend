export interface Book {
  id: number;
  title: string;
  authorId: number;
  categoryId: number;
  price: number;
  stock: number;
  rating: number;
  description: string;
  publicationDate: string;
  pageCount: number;
  coverImageUrl: string;
}
