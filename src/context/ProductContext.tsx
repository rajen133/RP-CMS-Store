import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useToast } from "@/components/ui/use-toast";
import supabase from "@/lib/supabase";

// Product type
export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageFile: string;
  featured: boolean;
  created_at: string;
};

// Context type
type ProductContextType = {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, "id" | "created_at">) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProduct: (id: number) => Product | undefined;
};

const ProductContext = createContext<ProductContextType>({
  products: [],
  isLoading: false,
  addProduct: async () => {},
  updateProduct: async () => {},
  deleteProduct: async () => {},
  getProduct: () => undefined,
});

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch products from Supabase (mocked here)
  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch products",
        description: error.message,
      });
    } else {
      setProducts(data as Product[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add a new product
  const addProduct = async (
    productData: Omit<Product, "id" | "created_at">
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            ...productData,
            featured: productData.featured ?? false,
            created_at: new Date().toISOString(),
          },
        ])
        .select();
      if (error) throw error;
      if (data) setProducts((prevProducts) => [...prevProducts, data[0]]);
      toast({
        title: "Product added",
        description: `${productData.name} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        variant: "destructive",
        title: "Failed to add product",
        description: "An error while adding the product.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing product
  const updateProduct = async (id: number, updates: Partial<Product>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select();
      if (error) throw error;
      if (data && data.length > 0) {
        setProducts((prevProducts) =>
          prevProducts.map((product) => (product.id === id ? data[0] : product))
        );
      }
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: "Failed to update product",
        description: "An error ocurred while updating the product.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a product
  const deleteProduct = async (id: number) => {
    setIsLoading(true);
    console.log("Trying to delete product with ID:", id, typeof id);

    try {
      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", Number(id));
      if (error) throw error;

      const deleted = products.find((p) => p.id === id);
      setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));

      toast({
        title: "Product deleted",
        description: deleted
          ? `${deleted.name} has been deleted.`
          : "Product deleted",
      });
      console.log("Deleted product:", data);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete product",
        description: "An error ocurred while deleting the product",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get a single product by ID
  const getProduct = (id: number) => {
    return products.find((product) => product.id === id);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

//Custom hook
export const useProducts = () => useContext(ProductContext);
