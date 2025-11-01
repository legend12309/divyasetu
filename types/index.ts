// User roles
export type UserRole = 'admin' | 'member';

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  familyId: string;
  createdAt: Date;
  avatar?: string;
}

// Family type
export interface Family {
  id: string;
  name: string;
  members: string[]; // User IDs
  admins: string[]; // User IDs
  createdAt: Date;
}

// Grocery types
export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category: string;
  addedBy: string; // User ID
  addedAt: Date;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string; // User ID
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface GroceryCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Meal types
export interface Meal {
  id: string;
  name: string;
  description?: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  preparedBy?: string; // User ID
  familyId: string;
  imageUrl?: string;
  recipes?: Recipe[];
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: number; // in minutes
  cookTime?: number; // in minutes
  serves?: number;
  imageUrl?: string;
}

// Chore types
export interface Chore {
  id: string;
  name: string;
  description?: string;
  assignedTo: string; // User ID
  assignedBy: string; // User ID
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  familyId: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  category: string;
}

// Budget types
export interface Budget {
  id: string;
  familyId: string;
  name: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  addedBy: string; // User ID
  type: 'income' | 'expense';
}

// Ritual types
export interface Ritual {
  id: string;
  name: string;
  description?: string;
  date: Date;
  time?: string;
  type: 'puja' | 'fasting' | 'celebration' | 'remembrance' | 'other';
  familyId: string;
  createdBy: string; // User ID
  reminderBefore?: number; // minutes before
  completed: boolean;
  completedAt?: Date;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Home: undefined;
  Grocery: undefined;
  Meals: undefined;
  Chores: undefined;
  Budget: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  GroceryTab: undefined;
  MealsTab: undefined;
  ChoresTab: undefined;
  BudgetTab: undefined;
};

