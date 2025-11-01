import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';
import { Transaction, BudgetCategory } from '../types';

const { width } = Dimensions.get('window');

const expenseCategories = [
  { id: 'groceries', name: 'Groceries', icon: 'basket-outline', color: colors.success, amount: 0 },
  { id: 'utilities', name: 'Utilities', icon: 'flash-outline', color: colors.warning, amount: 0 },
  { id: 'education', name: 'Education', icon: 'school-outline', color: colors.info, amount: 0 },
  { id: 'healthcare', name: 'Healthcare', icon: 'medical-outline', color: colors.error, amount: 0 },
  { id: 'entertainment', name: 'Entertainment', icon: 'musical-notes-outline', color: colors.meals, amount: 0 },
  { id: 'transport', name: 'Transport', icon: 'car-outline', color: colors.primary, amount: 0 },
  { id: 'rituals', name: 'Rituals', icon: 'sparkles-outline', color: colors.rituals, amount: 0 },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', color: colors.gray600, amount: 0 },
];

export default function BudgetScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetAmount, setBudgetAmount] = useState(10000);
  const [spent, setSpent] = useState(0);

  const remaining = budgetAmount - spent;
  const spentPercentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

  const recentTransactions = transactions.slice(0, 10);

  const getCategoryInfo = (categoryId: string) => {
    return expenseCategories.find(c => c.id === categoryId) || expenseCategories[7];
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const category = getCategoryInfo(item.category);
    
    return (
      <TouchableOpacity style={styles.transactionCard}>
        <View style={[styles.transactionIcon, { backgroundColor: category.color + '20' }]}>
          <Ionicons name={category.icon as any} size={24} color={category.color} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionCategory}>{category.name}</Text>
        </View>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'income' ? colors.success : colors.error }
        ]}>
          {item.type === 'income' ? '+' : '-'}₹{item.amount.toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }: { item: typeof expenseCategories[0] }) => {
    const percentage = budgetAmount > 0 ? (item.amount / budgetAmount) * 100 : 0;
    
    return (
      <View style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon as any} size={20} color={item.color} />
          </View>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryAmount}>₹{item.amount}</Text>
        </View>
        <View style={styles.categoryBar}>
          <View style={[styles.categoryBarFill, { width: `${Math.min(100, percentage)}%`, backgroundColor: item.color }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Budget Tracker</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Budget Overview */}
        <View style={styles.budgetOverview}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetLabel}>Weekly Budget</Text>
            <Text style={styles.budgetAmount}>₹{budgetAmount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.budgetCircle}>
            <Text style={styles.budgetSpent}>₹{spent.toLocaleString()}</Text>
            <Text style={styles.budgetSpentLabel}>Spent</Text>
          </View>

          <View style={styles.budgetBarContainer}>
            <View style={styles.budgetBar}>
              <View style={[styles.budgetBarFill, { width: `${Math.min(100, spentPercentage)}%` }]} />
            </View>
          </View>

          <View style={styles.budgetFooter}>
            <View style={styles.budgetFooterItem}>
              <Text style={styles.budgetFooterLabel}>Remaining</Text>
              <Text style={[styles.budgetFooterValue, { color: remaining > 0 ? colors.success : colors.error }]}>
                ₹{remaining.toLocaleString()}
              </Text>
            </View>
            <View style={styles.budgetFooterItem}>
              <Text style={styles.budgetFooterLabel}>Used</Text>
              <Text style={[styles.budgetFooterValue, { color: spentPercentage > 80 ? colors.error : colors.text }]}>
                {spentPercentage.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Expenses by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expenses by Category</Text>
          <FlatList
            data={expenseCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={64} color={colors.gray400} />
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>Tap + to add a transaction</Text>
              </View>
            }
          />
        </View>

        {/* Empty space for bottom navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.white,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.budget,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.budget,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  budgetOverview: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: 24,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  budgetLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  budgetAmount: {
    ...typography.h2,
    color: colors.text,
  },
  budgetCircle: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  budgetSpent: {
    ...typography.h1,
    color: colors.budget,
  },
  budgetSpentLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  budgetBarContainer: {
    marginBottom: spacing.lg,
  },
  budgetBar: {
    height: 16,
    backgroundColor: colors.gray200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    backgroundColor: colors.budget,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetFooterItem: {
    alignItems: 'center',
  },
  budgetFooterLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  budgetFooterValue: {
    ...typography.h4,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.budget,
    fontWeight: '600',
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  categoryName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  categoryAmount: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  categoryBar: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  transactionCategory: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  transactionAmount: {
    ...typography.body,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
});

