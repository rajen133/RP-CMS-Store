import { useState } from "react";
import { useProducts, Product } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ChevronDown, Edit, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import supabase from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Validation schema
const productSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  price: Yup.number().required("Price is required"),
  stock: Yup.number().required("Stock is required"),
  category: Yup.string().required("Category is required"),
  imageFile: Yup.mixed().required("Image is required"),
  featured: Yup.boolean().required("Featured status is required"),
});

const defaultValues = {
  name: "",
  price: 0,
  stock: 0,
  category: "",
  imageFile: "",
  description: "",
  featured: false,
};

const ProductsPage = () => {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } =
    useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProducts = products.filter(
    (product: any) =>
      (product.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (product.category?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (product.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddProduct = async () => {
    const data = watch();
    const file = data.imageFile?.[0];

    let imageUrl = "";

    if (file) {
      const filePath = `products/${Date.now()}_${file.name}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("electronics")
        .upload(filePath, file);

      if (uploadError) {
        toast({
          variant: "destructive",
          title: "Image Upload Failed",
          description: uploadError.message,
        });
        return;
      }

      // Get public URL (no error is returned here!)
      const { publicUrl } = supabase.storage
        .from("electronics")
        .getPublicUrl(filePath).data;

      if (!publicUrl) {
        toast({
          variant: "destructive",
          title: "Image URL Error",
          description:
            "Failed to generate a public URL for the uploaded image.",
        });
        return;
      }

      imageUrl = publicUrl;
    }

    // Save product with the public image URL
    const productToSave = {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      category: data.category,
      imageFile: imageUrl,
      featured: data.featured || false,
    };

    try {
      await addProduct(productToSave);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Product Creation Failed",
        description: error.message || "An unknown error occurred.",
      });
      return;
    }

    toast({
      title: "Product Added",
      description: `${data.name} has been successfully added.`,
    });

    resetFormAndClose();
  };

  const handleEditProduct = async () => {
    if (!currentProduct) return;
    const data = watch();
    const updatedData = {
      ...data,
      imageFile: data.imageFile?.[0]
        ? data.imageFile[0].name
        : currentProduct?.imageFile,
    };
    await updateProduct(currentProduct.id, updatedData);
    resetFormAndClose();
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    await deleteProduct(currentProduct.id);
    setIsDeleteDialogOpen(false);
  };

  const openAddDialog = () => {
    reset(defaultValues);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    reset({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price ?? 0,
      stock: product.stock ?? 0,
      category: product.category ?? "",
      imageFile: product.imageFile ?? "",
      featured: product.featured ?? false,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const resetFormAndClose = () => {
    reset(defaultValues);
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setCurrentProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage your product inventory</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            You have {products.length} products in your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  Filter
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSearchTerm("")}>
                  All Products
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchTerm("electronics")}>
                  Electronics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchTerm("clothing")}>
                  Clothing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchTerm("home")}>
                  Home & Kitchen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchTerm("stationery")}>
                  Stationery
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableCaption>A list of your products.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-gray-500"
                    >
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={product.imageFile || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/placeholder.svg";
                              }}
                              loading="lazy"
                            />
                          </div>
                          <span className="truncate max-w-[200px]">
                            {product.name}
                          </span>
                          {product.featured && (
                            <Badge
                              variant="secondary"
                              className="hidden sm:inline-flex"
                            >
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {product.category}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.stock <= 10 ? (
                          <span className="text-red-500">
                            {product.stock} (Low)
                          </span>
                        ) : (
                          product.stock
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => openDeleteDialog(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit(handleAddProduct)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your inventory. Click save when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="name" className="text-right mt-2">
                  Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    type="text"
                    {...register("name")}
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="price" className="text-right mt-2">
                  Price
                </Label>
                <div className="col-span-3">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    {...register("price")}
                    className="w-full"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="stock" className="text-right mt-2">
                  Stock
                </Label>
                <div className="col-span-3">
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    {...register("stock")}
                    className="w-full"
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-category" className="text-right mt-2">
                  Category
                </Label>
                <div className="col-span-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left hover:bg-transparent hover:text-inherit hover:shadow-none"
                      >
                        {watch("category") || (
                          <span className="text-muted-foreground">
                            Select category
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {[
                        "Electronics",
                        "Clothing",
                        "Home & Kitchen",
                        "Stationery",
                      ].map((cat) => (
                        <DropdownMenuItem
                          key={cat}
                          onSelect={() =>
                            setValue("category", cat, {
                              shouldValidate: true,
                            })
                          }
                        >
                          {cat}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="imageFile" className="text-right mt-2">
                  Image
                </Label>
                <div className="col-span-3">
                  <Input
                    id="imageFile"
                    name="ImageFile"
                    type="file"
                    accept="image/*"
                    {...register("imageFile")}
                    className="w-full hover:cursor-pointer"
                  />
                  {errors.imageFile && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.imageFile.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right mt-2">
                  Description
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="description"
                    name="description"
                    {...register("description")}
                    className="w-full"
                  />
                  {errors.description && (
                    <span className="text-sm text-red-500 mt-1">
                      {errors.description.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured" className="text-right">
                  Featured
                </Label>
                <div className="col-span-3">
                  <input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    {...register("featured")}
                    checked={watch("featured")}
                    className="mr-2"
                  />
                  <Label htmlFor="featured" className="text-sm text-gray-500">
                    Highlight as featured product
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="reset"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(handleAddProduct)}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <form
            onSubmit={handleSubmit(handleEditProduct)}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product information. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-name" className="text-right mt-2">
                  Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-name"
                    {...register("name")}
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-price" className="text-right mt-2">
                  Price
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-price"
                    type="number"
                    {...register("price")}
                    className="w-full"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-stock" className="text-right mt-2">
                  Stock
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-stock"
                    type="number"
                    {...register("stock")}
                    className="w-full"
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-category" className="text-right mt-2">
                  Category
                </Label>
                <div className="col-span-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full text-left">
                        {watch("category") || "Select category"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {[
                        "Electronics",
                        "Clothing",
                        "Home & Kitchen",
                        "Stationery",
                      ].map((cat) => (
                        <DropdownMenuItem
                          key={cat}
                          onSelect={() =>
                            setValue("category", cat, {
                              shouldValidate: true,
                            })
                          }
                        >
                          {cat}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="imageFile" className="text-right mt-2">
                  Image
                </Label>
                <div className="col-span-3 flex items-center gap-4">
                  {/* File Input */}
                  <div className="flex-1">
                    <Input
                      id="imageFile"
                      name="imageFile"
                      type="file"
                      accept="image/*"
                      {...register("imageFile")}
                      className="w-full hover:cursor-pointer"
                    />
                    {errors.imageFile && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.imageFile.message}
                      </p>
                    )}
                  </div>

                  {/* Current Image Preview */}
                  {currentProduct?.imageFile && (
                    <img
                      src={currentProduct.imageFile}
                      alt="Current Product"
                      className="h-10 w-10 object-cover rounded border"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right mt-2">
                  Description
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="edit-description"
                    {...register("description")}
                    className="w-full"
                  />
                  {errors.description && (
                    <span className="text-sm text-red-500 mt-1">
                      {errors.description.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-featured" className="text-right">
                  Featured
                </Label>
                <div className="col-span-3">
                  <input
                    id="edit-featured"
                    type="checkbox"
                    {...register("featured")}
                    checked={watch("featured")}
                    className="mr-2"
                  />
                  <Label
                    htmlFor="edit-featured"
                    className="text-sm text-gray-500"
                  >
                    Highlight as featured product
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(handleEditProduct)}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{currentProduct?.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              Category: {currentProduct?.category}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
function toast(arg0: { variant: string; title: string; description: string }) {
  throw new Error("Function not implemented.");
}
