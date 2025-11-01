import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';
import { GroceryItem } from '../types';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const categories = [
  { id: 'fruits', name: 'Fruits & Vegetables', icon: '🍎', color: colors.success },
  { id: 'dairy', name: 'Dairy', icon: '🥛', color: colors.info },
  { id: 'grains', name: 'Grains & Cereals', icon: '🌾', color: colors.primary },
  { id: 'protein', name: 'Meat & Protein', icon: '🍗', color: colors.accent1 },
  { id: 'spices', name: 'Spices & Condiments', icon: '🌶️', color: colors.warning },
  { id: 'snacks', name: 'Snacks & Beverages', icon: '🥤', color: colors.meals },
  { id: 'other', name: 'Other', icon: '📦', color: colors.gray600 },
];

export default function GroceryScreen() {
  const { user } = useAuth();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  useEffect(() => {
    loadGroceries();
  }, []);

  const loadGroceries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'groceries'),
        where('familyId', '==', user.familyId)
      );
      const querySnapshot = await getDocs(q);
      const items: GroceryItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as GroceryItem);
      });
      setGroceryItems(items);
    } catch (error) {
      console.error('Error loading groceries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGroceryItem = async () => {
    if (!itemName || !quantity || !user) return;

    try {
      const newItem: Omit<GroceryItem, 'id'> = {
        name: itemName,
        quantity: parseFloat(quantity),
        unit: unit || 'pcs',
        category: selectedCategory,
        addedBy: user.id,
        addedAt: new Date(),
        completed: false,
        priority: 'medium',
      };
      await addDoc(collection(db, 'groceries'), newItem);
      setModalVisible(false);
      setItemName('');
      setQuantity('');
      setUnit('');
      loadGroceries();
    } catch (error) {
      console.error('Error adding grocery item:', error);
    }
  };

  const toggleComplete = async (item: GroceryItem) => {
    try {
      await updateDoc(doc(db, 'groceries', item.id), {
        completed: !item.completed,
        completedAt: !item.completed ? new Date() : null,
        completedBy: !item.completed ? user?.id : null,
      });
      loadGroceries();
    } catch (error) {
      console.error('Error updating grocery item:', error);
    }
  };

  const filteredItems = filterCategory
    ? groceryItems.filter(item => item.category === filterCategory)
    : groceryItems;

  const pendingItems = filteredItems.filter(item => !item.completed);
  const completedItems = filteredItems.filter(item => item.completed);

  const renderItem = ({ item }: { item: GroceryItem }) => (
    <TouchableOpacity
      style={[styles.itemCard, item.completed && styles.itemCardCompleted]}
      onPress={() => toggleComplete(item)}
    >
      <View style={styles.itemLeft}>
        <View style={[
          styles.checkbox,
          item.completed && styles.checkboxChecked
        ]}>
          {item.completed && <Ionicons name="checkmark" size={16} color={colors.white} />}
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, item.completed && styles.itemNameCompleted]}>
            {item.name}
          </Text>
          <Text style={styles.itemDetails}>
            {item.quantity} {item.unit} • {categories.find(c => c.id === item.category)?.name}
          </Text>
        </View>
      </View>
      <View style={[
        styles.priorityBadge,
        { backgroundColor: item.priority === 'high' ? colors.error : 
                          item.priority === 'medium' ? colors.warning : 
                          colors.success } + '20'
      ]}>
        <Ionicons
          name={item.priority === 'high' ? 'alert-circle' : 'information-circle'}
          size={16}
          color={item.priority === 'high' ? colors.error : 
                 item.priority === 'medium' ? colors.warning : 
                 colors.success}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Grocery List</Text>
          <Text style={styles.subtitle}>{pendingItems.length} items pending</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
      >
        <TouchableOpacity
          style={[styles.categoryChip, !filterCategory && styles.categoryChipActive]}
          onPress={() => setFilterCategory(null)}
        >
          <Text style={[styles.categoryChipText, !filterCategory && styles.categoryChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              filterCategory === category.id && styles.categoryChipActive
            ]}
            onPress={() => setFilterCategory(category.id)}
          >
            <Text style={styles.categoryChipIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryChipText,
              filterCategory === category.id && styles.categoryChipTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grocery List */}
      <FlatList
        data={pendingItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={64} color={colors.gray400} />
            <Text style={styles.emptyText}>No groceries to buy</Text>
            <Text style={styles.emptySubtext}>Tap + to add items</Text>
          </View>
        }
      />

      {/* Completed Items Section */}
      {completedItems.length > 0 && (
        <View style={styles.completedSection}>
          <Text style={styles.completedTitle}>
            Completed ({completedItems.length})
          </Text>
          <FlatList
            data={completedItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Add Item Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Grocery Item</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Item name"
              value={itemName}
              onChangeText={setItemName}
              placeholderTextColor={colors.textLight}
            />

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Unit (e.g., kg, pcs)"
                value={unit}
                onChangeText={setUnit}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categorySelection}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category.id && styles.categoryOptionActive
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryOptionText,
                      selectedCategory === category.id && styles.categoryOptionTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={addGroceryItem}
            >
              <Text style={styles.saveButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.grocery,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.grocery,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryFilter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.grocery + '20',
  },
  categoryChipIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  categoryChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.grocery,
    fontWeight: '600',
  },
  list: {
    padding: spacing.lg,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  itemCardCompleted: {
    opacity: 0.6,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray400,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
  },
  itemDetails: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  priorityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  completedSection: {
    padding: spacing.lg,
    backgroundColor: colors.gray100,
  },
  completedTitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
  },
  label: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  categorySelection: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  categoryOption: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    minWidth: 100,
  },
  categoryOptionActive: {
    backgroundColor: colors.grocery + '20',
  },
  categoryOptionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  categoryOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryOptionTextActive: {
    color: colors.grocery,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.grocery,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

