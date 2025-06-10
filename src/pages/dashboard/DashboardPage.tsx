import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { useOrderContext } from "@/context/OrderContext";
import { useCustomers } from "@/context/CustomerContext";
import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format } from "date-fns";

const DashboardPage = () => {
  const { user } = useAuth();
  const { products } = useProducts();
  const { orders } = useOrderContext();
  const { customers } = useCustomers();

  // Sales data for the line chart
  const getSalesData = () => {
    const monthlySales: Record<string, number> = {};

    orders.forEach((order) => {
      const month = format(new Date(order.created_at), "MMM");
      monthlySales[month] = (monthlySales[month] || 0) + order.total;
    });

    return Object.entries(monthlySales).map(([name, sales]) => ({
      name,
      sales,
    }));
  };
  const salesData = getSalesData();

  // Product categories data for the bar chart
  const getProductCategoryData = () => {
    const categoryCount: Record<string, number> = {};

    products.forEach((product) => {
      const category = product.category || "Other";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
    }));
  };
  const productCategoryData = getProductCategoryData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || "Admin"}
        </h1>
        <p className="text-gray-500">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card bg-indigo-50">
          <div className="flex justify-between">
            <div>
              <p className="text-indigo-700 font-medium">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.length}
              </p>
            </div>
            <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs text-indigo-700">+5% from last month</p>
        </Card>

        <Card className="stat-card bg-blue-50">
          <div className="flex justify-between">
            <div>
              <p className="text-blue-700 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.length}
              </p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-700">+12% from last month</p>
        </Card>

        <Card className="stat-card bg-green-50">
          <div className="flex justify-between">
            <div>
              <p className="text-green-700 font-medium">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {" "}
                $
                {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-700">+18% from last month</p>
        </Card>

        <Card className="stat-card bg-amber-50">
          <div className="flex justify-between">
            <div>
              <p className="text-amber-700 font-medium">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.length}
              </p>
            </div>
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-amber-700">+8% from last month</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Sales Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Product Categories
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productCategoryData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
