// context/CustomerContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useToast } from "@/components/ui/use-toast";
import supabase from "@/lib/supabase";

// Customer type
export type Customer = {
  id: number;
  name: string;
  email: string;
  orders: number;
  spent: number;
  lastOrder: string;
};

// Context type
type CustomerContextType = {
  customers: Customer[];
  isLoading: boolean;
  addCustomer: (customer: Omit<Customer, "id">) => Promise<void>;
  updateCustomer: (id: number, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  getCustomer: (id: number) => Customer | undefined;
};

const CustomerContext = createContext<CustomerContextType>({
  customers: [],
  isLoading: false,
  addCustomer: async () => {},
  updateCustomer: async () => {},
  deleteCustomer: async () => {},
  getCustomer: () => undefined,
});

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("lastOrder", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch customers",
        description: error.message,
      });
    } else {
      setCustomers(data as Customer[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const addCustomer = async (customerData: Omit<Customer, "id">) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .insert([{ ...customerData }])
        .select();

      if (error) throw error;
      if (data) setCustomers((prev) => [...prev, data[0]]);

      toast({
        title: "Customer added",
        description: `${customerData.name} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        variant: "destructive",
        title: "Failed to add customer",
        description: "An error occurred while adding the customer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomer = async (id: number, updates: Partial<Customer>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        setCustomers((prev) => prev.map((c) => (c.id === id ? data[0] : c)));
      }

      toast({
        title: "Customer updated",
        description: "The customer has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        variant: "destructive",
        title: "Failed to update customer",
        description: "An error occurred while updating the customer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCustomer = async (id: number) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) throw error;

      const deleted = customers.find((c) => c.id === id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));

      toast({
        title: "Customer deleted",
        description: deleted
          ? `${deleted.name} has been deleted.`
          : "Customer deleted.",
      });
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete customer",
        description: "An error occurred while deleting the customer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomer = (id: number) => {
    return customers.find((customer) => customer.id === id);
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        isLoading,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

// Custom hook
export const useCustomers = () => useContext(CustomerContext);
