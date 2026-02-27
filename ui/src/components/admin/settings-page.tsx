import { useEffect, useState } from "react";

import { AlertTriangle, Plus, Trash2 } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { trpc } from "@/lib/trpc";

interface OidcProvider {
  providerId: string;
  discoveryUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  pkce: boolean;
}

const emptyProvider: OidcProvider = {
  providerId: "",
  discoveryUrl: "",
  clientId: "",
  clientSecret: "",
  scopes: ["openid", "profile", "email"],
  pkce: true,
};

export function AdminSettingsPage() {
  const [providers, setProviders] = useState<OidcProvider[]>([]);
  const [restartBanner, setRestartBanner] = useState(false);

  const { data: savedProviders } = trpc.admin.settings.getOidc.useQuery();

  const saveMutation = trpc.admin.settings.setOidc.useMutation({
    onSuccess: (data) => {
      if (data.restartRequired) {
        setRestartBanner(true);
      }
    },
  });

  useEffect(() => {
    if (savedProviders) {
      setProviders(
        savedProviders.map((p) => ({
          ...p,
          clientSecret: "",
          scopes: p.scopes ?? ["openid", "profile", "email"],
          pkce: p.pkce ?? true,
        })),
      );
    }
  }, [savedProviders]);

  const updateProvider = (
    index: number,
    field: keyof OidcProvider,
    value: string | string[] | boolean,
  ) => {
    setProviders((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeProvider = (index: number) => {
    setProviders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const valid = providers.filter((p) => p.providerId && p.clientId);
    saveMutation.mutate({ providers: valid });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>

      {restartBanner && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            OIDC settings saved. A server restart is required for changes to
            take effect.
          </span>
        </div>
      )}

      <Tabs defaultValue="oidc">
        <TabsList>
          <TabsTrigger value="oidc">OIDC Providers</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="oidc" className="space-y-4">
          {providers.map((provider, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base">
                  {provider.providerId || `Provider ${index + 1}`}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProvider(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Provider ID</Label>
                    <Input
                      value={provider.providerId}
                      onChange={(e) =>
                        updateProvider(index, "providerId", e.target.value)
                      }
                      placeholder="my-idp"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Discovery URL</Label>
                    <Input
                      value={provider.discoveryUrl}
                      onChange={(e) =>
                        updateProvider(index, "discoveryUrl", e.target.value)
                      }
                      placeholder="https://idp.example.com/.well-known/openid-configuration"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Client ID</Label>
                    <Input
                      value={provider.clientId}
                      onChange={(e) =>
                        updateProvider(index, "clientId", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Client Secret</Label>
                    <Input
                      type="password"
                      value={provider.clientSecret}
                      onChange={(e) =>
                        updateProvider(index, "clientSecret", e.target.value)
                      }
                      placeholder={
                        savedProviders?.[index]
                          ? "Enter new secret or leave blank"
                          : ""
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Scopes (comma-separated)</Label>
                    <Input
                      value={provider.scopes.join(", ")}
                      onChange={(e) =>
                        updateProvider(
                          index,
                          "scopes",
                          e.target.value.split(",").map((s) => s.trim()),
                        )
                      }
                    />
                  </div>
                  <div className="flex items-end gap-2 pb-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={provider.pkce}
                        onChange={(e) =>
                          updateProvider(index, "pkce", e.target.checked)
                        }
                      />
                      Enable PKCE
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setProviders((prev) => [...prev, { ...emptyProvider }])
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Provider
            </Button>
            <Button disabled={saveMutation.isPending} onClick={handleSave}>
              {saveMutation.isPending ? "Saving..." : "Save OIDC Settings"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                No general settings available yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
