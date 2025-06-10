import { useState } from "react";
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

const SettingsPage = () => {
  const { toast } = useToast();
  const [storeSettings, setStoreSettings] = useState({
    storeName: "RP-CMS Store",
    storeEmail: "rajendrapanjiyar101@gmail.com",
    storePhone: "(+977) 9766340362",
    storeAddress: "Dhobighat, Lalitpur, Nepal",
    currencySymbol: "$",
    notifyOnNewOrders: true,
    notifyOnLowStock: true,
    enableGuestCheckout: false,
    enableReviews: true,
  });

  const handleStoreSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setStoreSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveStoreSettings = () => {
    toast({
      title: "Settings Updated",
      description: "Your store settings have been saved successfully.",
    });
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

        <TabsContent value="store" className="space-y-4">
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
                  <Input
                    id="storeName"
                    name="storeName"
                    value={storeSettings.storeName}
                    onChange={handleStoreSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    name="storeEmail"
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={handleStoreSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Store Phone Number</Label>
                  <Input
                    id="storePhone"
                    name="storePhone"
                    value={storeSettings.storePhone}
                    onChange={handleStoreSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    name="currencySymbol"
                    value={storeSettings.currencySymbol}
                    onChange={handleStoreSettingsChange}
                    maxLength={3}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Input
                  id="storeAddress"
                  name="storeAddress"
                  value={storeSettings.storeAddress}
                  onChange={handleStoreSettingsChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveStoreSettings}>
                Save Store Settings
              </Button>
            </CardFooter>
          </Card>

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
                  name="enableGuestCheckout"
                  checked={storeSettings.enableGuestCheckout}
                  onCheckedChange={(checked) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      enableGuestCheckout: checked,
                    }))
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
                  name="enableReviews"
                  checked={storeSettings.enableReviews}
                  onCheckedChange={(checked) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      enableReviews: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveStoreSettings}>
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
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
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue="Rajendra Panjiyar" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="rajendrapanjiyar101@gmail.com"
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
              <Button>Save Account Information</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Change Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

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
                <Label htmlFor="notifyOnNewOrders" className="flex-1">
                  New Orders
                  <span className="block text-sm text-gray-500">
                    Get notified when a new order is placed
                  </span>
                </Label>
                <Switch
                  id="notifyOnNewOrders"
                  name="notifyOnNewOrders"
                  checked={storeSettings.notifyOnNewOrders}
                  onCheckedChange={(checked) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      notifyOnNewOrders: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyOnLowStock" className="flex-1">
                  Low Stock Alerts
                  <span className="block text-sm text-gray-500">
                    Get notified when product inventory is running low
                  </span>
                </Label>
                <Switch
                  id="notifyOnLowStock"
                  name="notifyOnLowStock"
                  checked={storeSettings.notifyOnLowStock}
                  onCheckedChange={(checked) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      notifyOnLowStock: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveStoreSettings}>
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

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
                  industry-standard encryption. All customer payment data is
                  handled according to PCI DSS guidelines.
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
