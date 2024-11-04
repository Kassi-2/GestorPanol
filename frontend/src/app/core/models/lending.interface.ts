export interface Lending {
  id: number;
  date: Date;
  finalizeDate: Date;
  eliminateDate: Date;
  state: string;
  comments?: string;
  borrowerId: number;
  borrower: Borrower;
  teacher: Teacher;
  teacherId?: number;
  lendingProducts: LendingProduct[];
}

export interface Borrower{
  name: string;
}

export interface Teacher{
  BorrowerId: Borrower;
}

export interface LendingProduct{
  amount: number;
  product: product;
}

export interface product{
  id: number;
  name: string;
  stock: number;
}

export interface newLending {
  comments?: string;
  BorrowerId: number;
  teacherId: number | null;
  products: contains[];
}

export interface contains {
  productId: number;
  amount: number;
}
