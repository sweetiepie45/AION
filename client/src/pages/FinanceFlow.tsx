import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  DollarSign, 
  PiggyBank, 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  CreditCard, 
  Home, 
  ShoppingBag, 
  Utensils, 
  Car, 
  Smartphone, 
  Palette, 
  Briefcase, 
  Plus, 
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon
} from "lucide-react";

export default function FinanceFlow() {
  const { 
    user, 
    transactions, 
    fetchTransactions
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expensesTotal, setExpensesTotal] = useState(0);
  const [selectedView, setSelectedView] = useState<"month" | "week" | "year">("month");
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<any[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    type: 'expense'
  });
  
  const { toast } = useToast();

  // Transaction categories
  const categories = {
    expense: [
      { value: "housing", label: "Housing", icon: <Home className="h-4 w-4" /> },
      { value: "food", label: "Food & Dining", icon: <Utensils className="h-4 w-4" /> },
      { value: "transportation", label: "Transportation", icon: <Car className="h-4 w-4" /> },
      { value: "shopping", label: "Shopping", icon: <ShoppingBag className="h-4 w-4" /> },
      { value: "utilities", label: "Utilities", icon: <Smartphone className="h-4 w-4" /> },
      { value: "entertainment", label: "Entertainment", icon: <Palette className="h-4 w-4" /> },
      { value: "health", label: "Health", icon: <CreditCard className="h-4 w-4" /> },
      { value: "other", label: "Other", icon: <CreditCard className="h-4 w-4" /> },
    ],
    income: [
      { value: "salary", label: "Salary", icon: <Briefcase className="h-4 w-4" /> },
      { value: "freelance", label: "Freelance", icon: <Briefcase className="h-4 w-4" /> },
      { value: "investment", label: "Investment", icon: <TrendingUp className="h-4 w-4" /> },
      { value: "gift", label: "Gift", icon: <DollarSign className="h-4 w-4" /> },
      { value: "other", label: "Other", icon: <DollarSign className="h-4 w-4" /> },
    ]
  };

  // Category colors for charts
  const categoryColors = {
    housing: "#4F46E5",    // primary
    food: "#10B981",       // green
    transportation: "#F59E0B", // amber
    shopping: "#EC4899",   // pink
    utilities: "#6366F1",  // indigo
    entertainment: "#8B5CF6", // purple
    health: "#14B8A6",     // teal
    other: "#9CA3AF",      // neutral
    salary: "#059669",     // green-600
    freelance: "#0D9488", // teal-600
    investment: "#0369A1", // blue-600
    gift: "#7C3AED",       // purple-600
  };

  // Load transactions
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Get transactions for the current month
          const start = startOfMonth(selectedMonth);
          const end = endOfMonth(selectedMonth);
          
          await fetchTransactions(start, end);
        }
      } catch (error) {
        console.error("Error loading finance data:", error);
        toast({
          title: "Error",
          description: "Failed to load financial data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, selectedMonth, fetchTransactions, toast]);

  // Process transactions
  useEffect(() => {
    if (transactions) {
      // Filter transactions for selected month
      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === selectedMonth.getMonth() &&
          transactionDate.getFullYear() === selectedMonth.getFullYear()
        );
      });
      
      setFilteredTransactions(monthTransactions);
      
      // Calculate totals
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setIncomeTotal(income);
      setExpensesTotal(expenses);
      
      // Calculate category totals for expenses
      const categories: { [key: string]: number } = {};
      
      monthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          categories[t.category] = (categories[t.category] || 0) + t.amount;
        });
      
      const categoriesArray = Object.entries(categories).map(([category, amount]) => ({
        name: getCategoryLabel(category),
        value: amount,
        color: getCategoryColor(category)
      }));
      
      setCategoryTotals(categoriesArray);
    }
  }, [transactions, selectedMonth]);

  const handlePrevMonth = () => {
    setSelectedMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Don't allow selecting future months
    if (nextMonth <= new Date()) {
      setSelectedMonth(nextMonth);
    }
  };

  const handleAddTransaction = async () => {
    if (!user) return;
    
    // Validate form
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate amount
    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // In a real app, we would send this to the API
      // For now, just show a toast
      toast({
        title: "Transaction Added",
        description: `${newTransaction.type === 'income' ? 'Income' : 'Expense'} of $${amount.toFixed(2)} has been recorded.`,
      });
      
      setTransactionDialogOpen(false);
      
      // Reset form
      setNewTransaction({
        amount: '',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        type: 'expense'
      });
      
      // We would refresh transactions here in a real app
      
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Error",
        description: "Failed to add the transaction.",
        variant: "destructive"
      });
    }
  };

  // Helper functions
  function getCategoryLabel(categoryValue: string): string {
    const allCategories = [...categories.expense, ...categories.income];
    const category = allCategories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  }

  function getCategoryColor(categoryValue: string): string {
    return categoryColors[categoryValue as keyof typeof categoryColors] || "#9CA3AF";
  }

  function getCategoryIcon(categoryValue: string, type: string): JSX.Element {
    const categoryList = type === 'income' ? categories.income : categories.expense;
    const category = categoryList.find(c => c.value === categoryValue);
    return category ? category.icon : <CreditCard className="h-4 w-4" />;
  }

  // Sample data for charts
  const monthlyData = [
    { name: 'Jan', income: 4500, expenses: 3700 },
    { name: 'Feb', income: 4200, expenses: 3900 },
    { name: 'Mar', income: 4800, expenses: 3800 },
    { name: 'Apr', income: 4700, expenses: 4100 },
    { name: 'May', income: 5100, expenses: 4000 },
    { name: 'Jun', income: 5400, expenses: 4200 },
    { name: 'Jul', income: 5200, expenses: 4300 },
    { name: 'Aug', income: 5300, expenses: 4400 },
    { name: 'Sep', income: 5600, expenses: 4600 },
    { name: 'Oct', income: 5400, expenses: 4700 },
    { name: 'Nov', income: 5800, expenses: 4800 },
    { name: 'Dec', income: 6000, expenses: 5100 },
  ];

  const weeklyData = [
    { name: 'Mon', income: 1200, expenses: 900 },
    { name: 'Tue', income: 1000, expenses: 1100 },
    { name: 'Wed', income: 1300, expenses: 800 },
    { name: 'Thu', income: 900, expenses: 1200 },
    { name: 'Fri', income: 1100, expenses: 1000 },
    { name: 'Sat', income: 600, expenses: 800 },
    { name: 'Sun', income: 500, expenses: 700 },
  ];

  const savingsData = [
    { name: 'Jan', savings: 800 },
    { name: 'Feb', savings: 300 },
    { name: 'Mar', savings: 1000 },
    { name: 'Apr', savings: 600 },
    { name: 'May', savings: 1100 },
    { name: 'Jun', savings: 1200 },
    { name: 'Jul', savings: 900 },
    { name: 'Aug', savings: 800 },
    { name: 'Sep', savings: 1000 },
    { name: 'Oct', savings: 700 },
    { name: 'Nov', savings: 1000 },
    { name: 'Dec', savings: 900 },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Finance Flow</h2>
          <p className="text-neutral-500 mt-1">Track, analyze, and optimize your finances</p>
        </div>
        <div className="flex items-center mt-3 sm:mt-0 space-x-2">
          <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Record a new income or expense transaction.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="transactionType">Type</Label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value) => setNewTransaction({...newTransaction, type: value, category: ''})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input 
                      id="amount" 
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTransaction.category}
                    onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {newTransaction.type === 'income' ? (
                        categories.income.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center">
                              {category.icon}
                              <span className="ml-2">{category.label}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        categories.expense.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center">
                              {category.icon}
                              <span className="ml-2">{category.label}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    placeholder="Description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setTransactionDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTransaction}>Save Transaction</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Month Selector and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="col-span-1 md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                Previous
              </Button>
              <h3 className="text-lg font-semibold text-center">
                {format(selectedMonth, 'MMMM yyyy')}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextMonth}
                disabled={selectedMonth.getMonth() === new Date().getMonth() && 
                         selectedMonth.getFullYear() === new Date().getFullYear()}
              >
                Next
              </Button>
            </div>
            <div className="flex justify-end">
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedView === "week" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setSelectedView("week")}
                >
                  Week
                </Button>
                <Button
                  variant={selectedView === "month" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setSelectedView("month")}
                >
                  Month
                </Button>
                <Button
                  variant={selectedView === "year" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setSelectedView("year")}
                >
                  Year
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary/10 mr-4">
                <ArrowUpRight className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Income</p>
                <h3 className="text-2xl font-semibold">${incomeTotal.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-500/10 mr-4">
                <ArrowDownRight className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Expenses</p>
                <h3 className="text-2xl font-semibold">${expensesTotal.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="savings" className="flex items-center">
            <PiggyBank className="mr-2 h-4 w-4" />
            Savings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Income vs. Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selectedView === "week" ? weeklyData : monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`$${value}`, '']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="income" 
                      name="Income" 
                      fill="#4F46E5" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="expenses" 
                      name="Expenses" 
                      fill="#EF4444" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Month's Balance</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <p className="text-sm text-neutral-500 mb-1">Net Savings</p>
                    <h3 className={`text-3xl font-bold ${incomeTotal - expensesTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${(incomeTotal - expensesTotal).toLocaleString()}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-2">
                      {incomeTotal - expensesTotal >= 0 
                        ? `That's ${Math.round((incomeTotal - expensesTotal) / incomeTotal * 100)}% of your income saved!` 
                        : `You're overspending by ${Math.abs(Math.round((incomeTotal - expensesTotal) / incomeTotal * 100))}% of your income.`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Expense Categories</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {categoryTotals.length > 0 ? (
                  <div className="space-y-3 mt-2">
                    {categoryTotals
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 3)
                      .map((category, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                            {getCategoryIcon(
                              Object.keys(categoryColors).find(key => 
                                categoryColors[key as keyof typeof categoryColors] === category.color
                              ) || 'other',
                              'expense'
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-neutral-700">{category.name}</span>
                              <span className="text-sm font-medium text-neutral-800">
                                ${category.value.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1">
                              <div 
                                className="h-full rounded-full" 
                                style={{ 
                                  width: `${Math.min(100, (category.value / expensesTotal) * 100)}%`,
                                  backgroundColor: category.color
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-neutral-500">No expense data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <div className="space-y-4">
                  {filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction, index) => (
                      <div key={index} className="flex items-center p-3 rounded-lg border border-neutral-200">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' 
                            ? <ArrowUpRight className="h-5 w-5 text-green-500" />
                            : <ArrowDownRight className="h-5 w-5 text-red-500" />
                          }
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-neutral-800">
                                {getCategoryLabel(transaction.category)}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {transaction.description || 'No description'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {format(new Date(transaction.date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium text-neutral-600 mb-4">No transactions found</h3>
                  <Button 
                    onClick={() => setTransactionDialogOpen(true)}
                    className="flex mx-auto items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transaction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryTotals.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryTotals}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryTotals.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm text-neutral-500">No expense data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Details</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryTotals.length > 0 ? (
                  <div className="space-y-3">
                    {categoryTotals
                      .sort((a, b) => b.value - a.value)
                      .map((category, index) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-sm mr-2"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-neutral-700">{category.name}</span>
                              <span className="text-sm font-medium text-neutral-800">
                                ${category.value.toLocaleString()} 
                                <span className="text-xs text-neutral-500 ml-1">
                                  ({Math.round((category.value / expensesTotal) * 100)}%)
                                </span>
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1">
                              <div 
                                className="h-full rounded-full" 
                                style={{ 
                                  width: `${Math.min(100, (category.value / expensesTotal) * 100)}%`,
                                  backgroundColor: category.color
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm text-neutral-500">No category data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Category Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      name="Total Expenses" 
                      stroke="#EF4444" 
                      activeDot={{ r: 8 }} 
                    />
                    {/* In a real app, you would have additional lines for each major category */}
                    <Line 
                      type="monotone" 
                      dataKey="housing" 
                      name="Housing" 
                      stroke="#4F46E5" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="food" 
                      name="Food" 
                      stroke="#10B981" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transportation" 
                      name="Transportation" 
                      stroke="#F59E0B" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Savings Tab */}
        <TabsContent value="savings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Savings History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={savingsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Savings']} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="savings" 
                      name="Monthly Savings" 
                      stroke="#4F46E5"
                      fill="#4F46E5"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Savings Rate</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center justify-center p-6">
                  <div 
                    className="w-32 h-32 rounded-full border-8 flex items-center justify-center mb-4"
                    style={{ 
                      borderColor: incomeTotal > 0 
                        ? ((incomeTotal - expensesTotal) / incomeTotal) > 0.2
                          ? "#10B981" // green for good saving rate
                          : ((incomeTotal - expensesTotal) / incomeTotal) > 0
                            ? "#F59E0B" // amber for moderate saving rate
                            : "#EF4444" // red for negative saving rate
                        : "#9CA3AF", // gray for no income
                    }}
                  >
                    <span className="text-2xl font-bold">
                      {incomeTotal > 0 
                        ? `${Math.round(((incomeTotal - expensesTotal) / incomeTotal) * 100)}%`
                        : "0%"
                      }
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 text-center">
                    {incomeTotal > 0
                      ? ((incomeTotal - expensesTotal) / incomeTotal) > 0.2
                        ? "Great! You're saving more than 20% of your income."
                        : ((incomeTotal - expensesTotal) / incomeTotal) > 0
                          ? "You're saving, but try to reach at least 20% for financial security."
                          : "You're spending more than you earn. Review your expenses."
                      : "No income data available for the selected period."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Goal</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center justify-center p-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-neutral-500">Target Monthly Savings</p>
                    <p className="text-2xl font-bold text-primary">$1,000</p>
                  </div>
                  
                  <div className="w-full bg-neutral-100 rounded-full h-4 mb-4">
                    <div 
                      className="bg-primary h-4 rounded-full"
                      style={{ width: `${Math.min(100, ((incomeTotal - expensesTotal) / 1000) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-neutral-500 text-center">
                    {incomeTotal - expensesTotal >= 1000
                      ? "Congratulations! You've reached your monthly savings goal."
                      : `You're ${Math.round(((incomeTotal - expensesTotal) / 1000) * 100)}% of the way to your monthly goal.`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Savings Tips</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="p-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                        <PiggyBank className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">Save at least 20% of your monthly income</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                        <PiggyBank className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">Review and cut unnecessary subscriptions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                        <PiggyBank className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">Plan meals to reduce food expenses</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                        <PiggyBank className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">Use the 24-hour rule for non-essential purchases</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                        <PiggyBank className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">Automate transfers to your savings account</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
