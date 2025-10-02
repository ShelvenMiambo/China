import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Package,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  Download,
  LogOut,
  BarChart3,
  Users,
  Truck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Product, Order, InsertProduct } from "@shared/schema";
import { CATEGORIES } from "@/lib/constants";
import { formatMZN, formatUSD, convertMZNToUSD, convertUSDToMZN } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const productSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  category: z.string().min(1, "Categoria é obrigatória"),
  price_mzn: z.number().min(1, "Preço deve ser maior que 0"),
  price_usd: z.string(),
  stock: z.number().min(0, "Estoque não pode ser negativo"),
  images: z.array(z.string()).default([]),
  specifications: z.record(z.string()).default({}),
  status: z.string().default("active"),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const adminData = JSON.parse(localStorage.getItem('admin') || '{}');

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price_mzn: 0,
      price_usd: "0.00",
      stock: 0,
      images: [],
      specifications: {},
      status: "active",
    },
  });

  // Queries
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: salesReport } = useQuery({
    queryKey: ["/api/reports/sales"],
  });

  const { data: categoryReport } = useQuery({
    queryKey: ["/api/reports/categories"],
  });

  const { data: lowStockProducts } = useQuery<Product[]>({
    queryKey: ["/api/reports/low-stock"],
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (product: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddProductOpen(false);
      form.reset();
      toast({
        title: "Produto criado",
        description: "Produto adicionado com sucesso!",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product }: { id: string; product: Partial<InsertProduct> }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      form.reset();
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso!",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso!",
      });
    },
  });

  // Event handlers
  const handleLogout = () => {
    localStorage.removeItem('admin');
    setLocation("/admin/login");
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      category: product.category,
      price_mzn: product.price_mzn,
      price_usd: product.price_usd,
      stock: product.stock,
      images: product.images || [],
      specifications: product.specifications || {},
      status: product.status || "active",
    });
  };

  const onSubmitProduct = (data: ProductForm) => {
    const productData: InsertProduct = {
      ...data,
      price_usd: convertMZNToUSD(data.price_mzn).toString(),
    };

    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct.id,
        product: productData,
      });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleExportSales = async () => {
    try {
      const response = await fetch('/api/reports/export/sales');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'sales_report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Relatório exportado",
        description: "Relatório de vendas exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar relatório.",
        variant: "destructive",
      });
    }
  };

  // Filter products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const stats = {
    totalProducts: products?.length || 0,
    monthlySales: (salesReport as any)?.total_sales_mzn || 0,
    activeOrders: orders?.filter(o => o.status === 'pending').length || 0,
    lowStock: lowStockProducts?.length || 0,
  };

  return (
    <div className="py-8 bg-gray-100 min-h-screen">
      {/* Admin Header */}
      <div className="bg-white shadow-md mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-maputo-primary text-white rounded-lg p-2">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-maputo-primary" data-testid="admin-dashboard-title">
                  Painel Admin - Maputo Import Hub
                </h1>
                <p className="text-sm text-gray-600">Gerenciamento de Produtos e Vendas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 inline" />
                {adminData.name || 'Admin'}
              </span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-maputo-accent hover:text-maputo-accent-dark"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Produtos</p>
                  <p className="text-3xl font-bold text-maputo-primary" data-testid="stats-total-products">
                    {stats.totalProducts}
                  </p>
                </div>
                <Package className="w-8 h-8 text-maputo-primary opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Vendas (Mês)</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="stats-monthly-sales">
                    {formatMZN(stats.monthlySales)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pedidos Ativos</p>
                  <p className="text-3xl font-bold text-maputo-warning" data-testid="stats-active-orders">
                    {stats.activeOrders}
                  </p>
                </div>
                <ShoppingCart className="w-8 h-8 text-maputo-warning opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Estoque Baixo</p>
                  <p className="text-3xl font-bold text-maputo-accent" data-testid="stats-low-stock">
                    {stats.lowStock}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-maputo-accent opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" data-testid="products-tab">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="orders-tab">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="reports-tab">
              <BarChart3 className="w-4 h-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Gerenciar Produtos</h3>
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-maputo-primary hover:bg-maputo-primary-dark text-white"
                        data-testid="add-product-button"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Produto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={form.handleSubmit(onSubmitProduct)} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nome do Produto *</Label>
                            <Input
                              id="name"
                              {...form.register("name")}
                              data-testid="product-name-input"
                            />
                            {form.formState.errors.name && (
                              <p className="text-sm text-red-600 mt-1">
                                {form.formState.errors.name.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="category">Categoria *</Label>
                            <Select
                              value={form.watch("category")}
                              onValueChange={(value) => form.setValue("category", value)}
                            >
                              <SelectTrigger data-testid="product-category-select">
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {form.formState.errors.category && (
                              <p className="text-sm text-red-600 mt-1">
                                {form.formState.errors.category.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Descrição *</Label>
                          <Textarea
                            id="description"
                            {...form.register("description")}
                            rows={3}
                            data-testid="product-description-input"
                          />
                          {form.formState.errors.description && (
                            <p className="text-sm text-red-600 mt-1">
                              {form.formState.errors.description.message}
                            </p>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price_mzn">Preço (MZN) *</Label>
                            <Input
                              id="price_mzn"
                              type="number"
                              {...form.register("price_mzn", { valueAsNumber: true })}
                              data-testid="product-price-input"
                            />
                            {form.formState.errors.price_mzn && (
                              <p className="text-sm text-red-600 mt-1">
                                {form.formState.errors.price_mzn.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="stock">Estoque *</Label>
                            <Input
                              id="stock"
                              type="number"
                              {...form.register("stock", { valueAsNumber: true })}
                              data-testid="product-stock-input"
                            />
                            {form.formState.errors.stock && (
                              <p className="text-sm text-red-600 mt-1">
                                {form.formState.errors.stock.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAddProductOpen(false);
                              setEditingProduct(null);
                              form.reset();
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={createProductMutation.isPending || updateProductMutation.isPending}
                            className="bg-maputo-primary hover:bg-maputo-primary-dark text-white"
                            data-testid="save-product-button"
                          >
                            {editingProduct ? 'Atualizar' : 'Criar'} Produto
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search and Filter */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12"
                      data-testid="search-products-input"
                    />
                  </div>
                  <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                    <SelectTrigger data-testid="filter-products-select">
                      <SelectValue placeholder="Todas Categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Categorias</SelectItem>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Preço (MZN)</TableHead>
                        <TableHead>Preço (USD)</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-maputo-primary border-t-transparent mx-auto"></div>
                          </TableCell>
                        </TableRow>
                      ) : filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Nenhum produto encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <img
                                  src={product.images?.[0] || "https://via.placeholder.com/100x100?text=Sem+Imagem"}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium text-gray-900 line-clamp-1">
                                    {product.name}
                                  </p>
                                  <p className="text-sm text-gray-600">ID: #{product.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatMZN(product.price_mzn)}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatUSD(parseFloat(product.price_usd))}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`font-semibold ${
                                  product.stock > 100
                                    ? 'text-green-600'
                                    : product.stock > 10
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {product.stock.toLocaleString()}
                              </span>
                              <span className="text-gray-500 text-sm ml-1">un.</span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={product.status === 'active' ? 'default' : 'secondary'}
                                className={product.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {product.status === 'active' ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    handleEditProduct(product);
                                    setIsAddProductOpen(true);
                                  }}
                                  data-testid={`edit-product-${product.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    form.reset({
                                      name: `${product.name} (Cópia)`,
                                      description: product.description,
                                      category: product.category,
                                      price_mzn: product.price_mzn,
                                      price_usd: product.price_usd,
                                      stock: product.stock,
                                      images: product.images || [],
                                      specifications: product.specifications || {},
                                      status: product.status || "active",
                                    });
                                    setEditingProduct(null);
                                    setIsAddProductOpen(true);
                                  }}
                                  data-testid={`copy-product-${product.id}`}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Tem certeza que deseja excluir este produto?')) {
                                      deleteProductMutation.mutate(product.id);
                                    }
                                  }}
                                  className="text-maputo-accent hover:text-maputo-accent-dark"
                                  data-testid={`delete-product-${product.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Pedidos Recentes</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-maputo-primary border-t-transparent mx-auto"></div>
                          </TableCell>
                        </TableRow>
                      ) : !orders || orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            Nenhum pedido encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        orders.slice(0, 10).map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">
                              #{order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>{order.customer_name}</TableCell>
                            <TableCell>{order.customer_email}</TableCell>
                            <TableCell className="font-semibold">
                              {formatMZN(order.total_mzn)}
                            </TableCell>
                            <TableCell>
                              {new Date(order.created_at!).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={order.status === 'pending' ? 'default' : 'secondary'}
                                className={
                                  order.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : order.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }
                              >
                                {order.status === 'pending'
                                  ? 'Pendente'
                                  : order.status === 'completed'
                                  ? 'Concluído'
                                  : 'Cancelado'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sales Report */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Relatório Semanal</h3>
                    <Button
                      onClick={handleExportSales}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      data-testid="export-sales-button"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">Total Vendido</p>
                        <p className="text-sm text-gray-600">Este mês</p>
                      </div>
                      <p className="text-2xl font-bold text-maputo-primary">
                        {formatMZN((salesReport as any)?.total_sales_mzn || 0)}
                      </p>
                    </div>

                    {categoryReport && Array.isArray(categoryReport) && categoryReport.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-3">Vendas por Categoria</h4>
                        {(categoryReport as any[]).map((category: any) => (
                          <div key={category.category} className="flex items-center justify-between">
                            <span className="text-gray-700">{category.category}</span>
                            <span className="font-semibold">{formatMZN(category.sales_mzn)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alert */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-maputo-accent" />
                    Produtos com Estoque Baixo
                  </h3>

                  <div className="space-y-3">
                    {lowStockProducts && lowStockProducts.length > 0 ? (
                      lowStockProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-red-600">
                              {product.stock} unidades
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Todos os produtos têm estoque adequado
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}