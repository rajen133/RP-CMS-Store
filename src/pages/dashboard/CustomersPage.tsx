"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Search, Trash2, UserPlus, Edit } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useCustomers } from "@/context/CustomerContext";

const schema = yup.object().shape({
  name: yup.string().required("Name is required."),
  email: yup.string().email("Invalid email").required("Email is required."),
  orders: yup
    .number()
    .typeError("Orders must be a number")
    .required("Orders are required."),
  spent: yup
    .number()
    .typeError("Spent must be a number")
    .required("Amount spent is required."),
  lastOrder: yup.string().required("Last order date is required."),
});

export default function CustomersPage() {
  const { customers, isLoading, addCustomer, updateCustomer, deleteCustomer } =
    useCustomers();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<any | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const openEditDialog = (customer: any) => {
    setCurrentCustomer(customer);
    reset(customer);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (customer: any) => {
    setCurrentCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleAddCustomer = async (data: any) => {
    await addCustomer(data);
    setIsAddDialogOpen(false);
    reset();
  };

  const handleEditCustomer = async (data: any) => {
    if (!currentCustomer) return;
    await updateCustomer(currentCustomer.id, data);
    setIsEditDialogOpen(false);
    setCurrentCustomer(null);
    reset();
  };

  const handleDeleteCustomer = async () => {
    if (!currentCustomer) return;
    await deleteCustomer(currentCustomer.id);
    setIsDeleteDialogOpen(false);
    setCurrentCustomer(null);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCustomerCount = customers.filter((c) => c.orders > 0).length;
  const averageOrderValue =
    customers.length === 0
      ? 0
      : customers.reduce((acc, cur) => acc + cur.spent, 0) / customers.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-gray-500">
            Manage your customers and their information
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* Add/Edit Customer Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          if (!open) reset();
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <form
            onSubmit={handleSubmit(
              isEditDialogOpen ? handleEditCustomer : handleAddCustomer
            )}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>
                {isEditDialogOpen ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
              <DialogDescription>
                {isEditDialogOpen
                  ? "Update the customer details."
                  : "Add a new customer to your records."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {(["name", "email", "orders", "spent", "lastOrder"] as const).map(
                (field) => (
                  <div
                    key={field}
                    className="grid grid-cols-4 items-start gap-4"
                  >
                    <Label
                      htmlFor={field}
                      className="text-right mt-2 capitalize"
                    >
                      {field === "lastOrder" ? "Last Order" : field}
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id={field}
                        type={
                          ["orders", "spent"].includes(field)
                            ? "number"
                            : field === "lastOrder"
                            ? "date"
                            : "text"
                        }
                        {...register(field)}
                        className="w-full"
                      />
                      {errors[field] && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors[field]?.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEditDialogOpen
                  ? "Save Changes"
                  : "Save Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{currentCustomer?.name}</p>
            <p className="text-sm text-gray-500">
              Email: {currentCustomer?.email}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCustomer}>
              Delete Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">+100 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomerCount}</div>
            <p className="text-xs text-muted-foreground">
              {customers.length > 0
                ? `${((activeCustomerCount / customers.length) * 100).toFixed(
                    1
                  )}% of total`
                : "0.0% of total"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +$12.40 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>
            View and manage your customer database.
          </CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            />
            <Button type="submit" size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-right">Last Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.orders}</TableCell>
                    <TableCell className="text-right">
                      ${customer.spent.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.lastOrder}
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(customer)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === index + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(index + 1);
                      }}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
