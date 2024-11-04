export interface Product {
    id: number;
    name: string;
    description: string;
    stock: number;
    criticalStock: number ;
    state: boolean;
    fungible: boolean;
}

export interface NewProduct {
    name: string;
    description: string;
    stock: number;
    criticalStock: number| null ;
    fungible: boolean;
}