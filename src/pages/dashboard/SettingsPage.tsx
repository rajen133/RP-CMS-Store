import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, BellRing, Shield, CreditCard } from "lucide-react";
import supabase from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

export interface StoreSettings {
  user_id: string;
  storeName: string;
  email: string;
  storePhone: string;
  storeAddress: string;
  currencySymbol: string;
  notify_on_new_orders?: boolean;
  notify_on_low_stock?: boolean;
  enableGuestCheckout?: boolean;
  enableReviews?: boolean;
}

// validation schema for store settings
export const storeSettingsSchema = yup.object().shape({
  storeName: yup
    .string()
    .required("Store name is required")
    .max(100, "Store name must be at most 100 characters"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Store email is required"),
  storePhone: yup
    .string()
    .required("Phone number is required")
    .matches(/^\(?\+?[0-9\s\-()]{7,20}$/, "Invalid phone number format"),
  storeAddress: yup
    .string()
    .required("Store address is required")
    .max(200, "Address must be at most 200 characters"),
  currencySymbol: yup
    .string()
    .required("Currency symbol is required")
    .max(3, "Use only 1–3 characters for currency symbol"),
  enableGuestCheckout: yup.boolean(),
  enableReviews: yup.boolean(),
  notify_on_new_orders: yup.boolean(),
  notify_on_low_stock: yup.boolean(),
});

const SettingsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [storeSettings, setStoreSettings] = useState({
    storeName: "RP-CMS Store",
    email: "rajendrapanjiyar101@gmail.com",
    storePhone: "(+977) 9766340362",
    storeAddress: "Dhobighat, Lalitpur, Nepal",
    currencySymbol: "$",
    notify_on_new_orders: true,
    notify_on_low_stock: true,
    enableGuestCheckout: false,
    enableReviews: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(storeSettingsSchema),
    defaultValues: storeSettings, // from your state
  });

  // Fetch store settings data
  useEffect(() => {
    const fetchStoreSettings = async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .eq("user_id", user?.id)
        .limit(1);

      if (data?.length) {
        const settings = data[0];
        setStoreSettings(settings);
        Object.keys(settings).forEach((key) => {
          setValue(key as any, settings[key]);
        });
        if (error) {
          toast({
            title: "Error",
            description: `Error fetching store settings: ${error.message}`,
            variant: "destructive",
          });
        }
      }
    };

    if (user) {
      fetchStoreSettings();
    }
  }, [user]);

  const handleStoreSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setStoreSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save or update store settings to the database
  const saveOrUpdateStoreSettings = async (formData: StoreSettings) => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Check if settings already exist
      const { data: existingSettings, error: fetchError } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = no rows found, which is acceptable
        throw fetchError;
      }

      // If exists, update
      if (existingSettings) {
        const { data, error } = await supabase
          .from("store_settings")
          .update(formData)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;

        setStoreSettings(data);
        toast({
          title: "Settings Updated",
          description: "Store settings has been updated successfully.",
        });
      } else {
        // If not exists, insert
        const { data, error } = await supabase
          .from("store_settings")
          .insert({ user_id: user.id, ...formData })
          .select()
          .single();

        if (error) throw error;

        setStoreSettings(data);
        toast({
          title: "Settings Saved",
          description: "Store settings has been saved successfully.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email,
        data: { name },
      });
      if (error) {
        throw new Error(error.message);
      }
      console.log("Clicked");
    } catch (error: any) {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message,
      });
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({
        title: "Password Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500">Manage your store and account settings</p>
      </div>

      <Tabs defaultValue="store">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="store">
            <Settings className="h-4 w-4 mr-2" />
            Store
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellRing className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* --- Store Settings Tab --- */}
        <TabsContent value="store" className="space-y-4">
          <form
            onSubmit={handleSubmit(saveOrUpdateStoreSettings)}
            className="space-y-4"
          >
            {/* Store Information */}
            <Card>
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
                <CardDescription>
                  Configure your store's basic information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input id="storeName" {...register("storeName")} />
                    {errors.storeName && (
                      <p className="text-sm text-red-500">
                        {errors.storeName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Store Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && (
                      <p className="text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">Store Phone Number</Label>
                    <Input id="storePhone" {...register("storePhone")} />
                    {errors.storePhone && (
                      <p className="text-sm text-red-500">
                        {errors.storePhone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currencySymbol">Currency Symbol</Label>
                    <Input
                      id="currencySymbol"
                      maxLength={3}
                      {...register("currencySymbol")}
                    />
                    {errors.currencySymbol && (
                      <p className="text-sm text-red-500">
                        {errors.currencySymbol.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Store Address</Label>
                  <Input id="storeAddress" {...register("storeAddress")} />
                  {errors.storeAddress && (
                    <p className="text-sm text-red-500">
                      {errors.storeAddress.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Store Settings</Button>
              </CardFooter>
            </Card>

            {/* Store Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Store Preferences</CardTitle>
                <CardDescription>
                  Customize how your store operates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableGuestCheckout" className="flex-1">
                    Enable Guest Checkout
                    <span className="block text-sm text-gray-500">
                      Allow customers to checkout without creating an account
                    </span>
                  </Label>
                  <Switch
                    id="enableGuestCheckout"
                    checked={watch("enableGuestCheckout")}
                    onCheckedChange={(checked) =>
                      setValue("enableGuestCheckout", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableReviews" className="flex-1">
                    Enable Product Reviews
                    <span className="block text-sm text-gray-500">
                      Allow customers to leave reviews on products
                    </span>
                  </Label>
                  <Switch
                    id="enableReviews"
                    checked={watch("enableReviews")}
                    onCheckedChange={(checked) =>
                      setValue("enableReviews", checked)
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Preferences</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* --- Account Tab --- */}
        <TabsContent value="account" className="space-y-4">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your personal account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountRole">Role</Label>
                <Input id="accountRole" defaultValue="Administrator" disabled />
                <p className="text-xs text-gray-500">
                  Your user role defines your permissions in the system.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>Save Account Information</Button>
            </CardFooter>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleChangePassword}>Change Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- Notifications Tab --- */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Decide which notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notify_on_new_orders" className="flex-1">
                  New Orders
                  <span className="block text-sm text-gray-500">
                    Get notified when a new order is placed
                  </span>
                </Label>
                <Switch
                  id="notify_on_new_orders"
                  name="notify_on_new_orders"
                  checked={!!watch("notify_on_new_orders")}
                  onCheckedChange={(checked) =>
                    setValue("notify_on_new_orders", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify_on_low_stock" className="flex-1">
                  Low Stock Alerts
                  <span className="block text-sm text-gray-500">
                    Get notified when product inventory is running low
                  </span>
                </Label>
                <Switch
                  id="notify_on_low_stock"
                  name="notify_on_low_stock"
                  checked={!!watch("notify_on_low_stock")}
                  onCheckedChange={(checked) =>
                    setValue("notify_on_low_stock", checked)
                  }
                />
              </div>
            </CardContent>
            <form onSubmit={handleSubmit(saveOrUpdateStoreSettings)}>
              <CardFooter>
                <Button type="submit">Save Notification Settings</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* --- Security Tab --- */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactorAuth" className="flex-1">
                  Two-factor Authentication
                  <span className="block text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </span>
                </Label>
                <Switch id="twoFactorAuth" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sessionTimeout" className="flex-1">
                  Session Timeout
                  <span className="block text-sm text-gray-500">
                    Automatically log out after 30 minutes of inactivity
                  </span>
                </Label>
                <Switch id="sessionTimeout" defaultChecked />
              </div>
              <div className="pt-4">
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Audit Log
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Security</CardTitle>
              <CardDescription>
                Configure payment security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Payment Methods</h4>
                  <p className="text-sm text-gray-500">
                    Manage your store's payment providers
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </div>
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500">
                  Your store's payment processing is secured with
                  industry-standard encryption.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
