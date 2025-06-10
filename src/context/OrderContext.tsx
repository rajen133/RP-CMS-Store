// context/OrderContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface Order {
  id: number;
  customer_name: string;
  created_at: string;
  status: string;
  total: number;
}

interface OrderContextType {
  orders: Order[];
  selectedOrder: Order | null;
  totalOrders: number;
  currentPage: number;
  itemsPerPage: number;
  fetchOrders: (page?: number) => Promise<void>;
  setCurrentPage: (page: number) => void;
  openDeleteDialog: (order: Order) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  handleDeleteConfirm: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = async (page = 1) => {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error, count } = await supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders.",
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
      setTotalOrders(count || 0);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const openDeleteDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", selectedOrder.id);

      if (error) throw new Error(error.message);

      toast({
        title: "Success",
        description: "Order deleted successfully.",
      });
      console.log("Order deleted:", selectedOrder.id);

      fetchOrders(currentPage);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete order.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        selectedOrder,
        totalOrders,
        currentPage,
        itemsPerPage,
        fetchOrders,
        setCurrentPage,
        openDeleteDialog,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        handleDeleteConfirm,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
};
