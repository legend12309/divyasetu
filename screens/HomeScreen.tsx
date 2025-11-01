import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';
import { GroceryItem, Chore, Ritual, Transaction } from '../types';

const { width } = Dimensions.get('window');

interface QuickStats {
  pendingGroceries: number;
  pendingChores: number;
  todayRituals: number;
  weeklySpending: number;
  budgetRemaining: number;
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState<QuickStats>({
    pendingGroceries: 0,
    pendingChores: 0,
    todayRituals: 0,
    weeklySpending: 0,
    budgetRemaining: 0,
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    { 
      id: 'grocery', 
      title: 'Grocery', 
      icon: 'basket-outline', 
      color: colors.grocery,
      navigate: 'GroceryTab'
    },
    { 
      id: 'meals', 
      title: 'Meals', 
      icon: 'restaurant-outline', 
      color: colors.meals,
      navigate: 'MealsTab'
    },
    { 
      id: 'chores', 
      title: 'Chores', 
      icon: 'checkbox-outline', 
      color: colors.chores,
      navigate: 'ChoresTab'
    },
    { 
      id: 'budget', 
      title: 'Budget', 
      icon: 'wallet-outline', 
      color: colors.budget,
      navigate: 'BudgetTab'
    },
  ];

  const features = [
    { id: 'rituals', title: 'Ritual Reminders', icon: 'sparkles-outline', color: colors.rituals },
    { id: 'voice', title: 'Voice Input', icon: 'mic-outline', color: colors.accent1 },
    { id: 'family', title: 'Family Members', icon: 'people-outline', color: colors.primary },
    { id: 'settings', title: 'Settings', icon: 'settings-outline', color: colors.gray600 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'Family Member'}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            {user?.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.white} />
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="basket-outline" size={24} color={colors.grocery} />
            <Text style={styles.statNumber}>{stats.pendingGroceries}</Text>
            <Text style={styles.statLabel}>Groceries</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkbox-outline" size={24} color={colors.chores} />
            <Text style={styles.statNumber}>{stats.pendingChores}</Text>
            <Text style={styles.statLabel}>Chores</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="sparkles-outline" size={24} color={colors.rituals} />
            <Text style={styles.statNumber}>{stats.todayRituals}</Text>
            <Text style={styles.statLabel}>Rituals</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => navigation.navigate(action.navigate)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Budget Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Overview</Text>
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetLabel}>Weekly Budget</Text>
              <Text style={styles.budgetAmount}>₹{stats.budgetRemaining}</Text>
            </View>
            <View style={styles.budgetBarContainer}>
              <View style={styles.budgetBar}>
                <View 
                  style={[
                    styles.budgetBarFill, 
                    { width: `${Math.max(0, Math.min(100, (1 - stats.budgetRemaining / 10000) * 100))}%` }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.budgetSpent}>Spent: ₹{stats.weeklySpending}</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCard}
              >
                <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                <Text style={styles.featureLabel}>{feature.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xs,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  adminBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  budgetCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
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
    marginBottom: spacing.md,
  },
  budgetLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  budgetAmount: {
    ...typography.h3,
    color: colors.budget,
  },
  budgetBarContainer: {
    marginBottom: spacing.sm,
  },
  budgetBar: {
    height: 12,
    backgroundColor: colors.gray200,
    borderRadius: 6,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    backgroundColor: colors.budget,
  },
  budgetSpent: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureLabel: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

