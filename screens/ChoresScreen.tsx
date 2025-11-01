import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';
import { Chore } from '../types';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const choreCategories = [
  { id: 'cleaning', name: 'Cleaning', icon: 'broom-outline', color: colors.info },
  { id: 'cooking', name: 'Cooking', icon: 'restaurant-outline', color: colors.meals },
  { id: 'laundry', name: 'Laundry', icon: 'shirt-outline', color: colors.primary },
  { id: 'shopping', name: 'Shopping', icon: 'cart-outline', color: colors.grocery },
  { id: 'maintenance', name: 'Maintenance', icon: 'build-outline', color: colors.warning },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', color: colors.gray600 },
];

export default function ChoresScreen() {
  const { user } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [choreName, setChoreName] = useState('');
  const [choreDescription, setChoreDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(choreCategories[0].id);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    loadChores();
  }, []);

  const loadChores = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'chores'),
        where('familyId', '==', user.familyId)
      );
      const querySnapshot = await getDocs(q);
      const items: Chore[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Chore);
      });
      setChores(items);
    } catch (error) {
      console.error('Error loading chores:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (chore: Chore) => {
    try {
      await updateDoc(doc(db, 'chores', chore.id), {
        completed: !chore.completed,
        completedAt: !chore.completed ? new Date() : null,
      });
      loadChores();
    } catch (error) {
      console.error('Error updating chore:', error);
    }
  };

  const addChore = async () => {
    if (!choreName || !user) {
      return;
    }

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Default due in 7 days

      const newChore: Omit<Chore, 'id'> = {
        name: choreName,
        description: choreDescription || undefined,
        assignedTo: user.id,
        assignedBy: user.id,
        dueDate,
        completed: false,
        familyId: user.familyId,
        frequency: 'once',
        priority,
        category: selectedCategory,
      };
      await addDoc(collection(db, 'chores'), newChore);
      setModalVisible(false);
      setChoreName('');
      setChoreDescription('');
      setSelectedCategory(choreCategories[0].id);
      setPriority('medium');
      loadChores();
    } catch (error) {
      console.error('Error adding chore:', error);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return choreCategories.find(c => c.id === categoryId) || choreCategories[5];
  };

  const pendingChores = chores.filter(chore => !chore.completed);
  const completedChores = chores.filter(chore => chore.completed);

  const renderChoreItem = ({ item }: { item: Chore }) => {
    const category = getCategoryInfo(item.category);
    
    return (
      <TouchableOpacity
        style={[styles.choreCard, item.completed && styles.choreCardCompleted]}
        onPress={() => toggleComplete(item)}
      >
        <View style={styles.choreLeft}>
          <View style={[
            styles.checkbox,
            item.completed && styles.checkboxChecked
          ]}>
            {item.completed && <Ionicons name="checkmark" size={16} color={colors.white} />}
          </View>
          <View style={styles.choreInfo}>
            <Text style={[styles.choreName, item.completed && styles.choreNameCompleted]}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={styles.choreDescription} numberOfLines={1}>
                {item.description}
              </Text>
            )}
            <View style={styles.choreMeta}>
              <View style={styles.choreMetaItem}>
                <Ionicons name={category.icon as any} size={14} color={colors.textSecondary} />
                <Text style={styles.choreMetaText}>{category.name}</Text>
              </View>
              <Text style={styles.choreMetaText}>•</Text>
              <Text style={styles.choreMetaText}>
                Due: {new Date(item.dueDate).toLocaleDateString()}
              </Text>
            </View>
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
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Household Chores</Text>
          <Text style={styles.subtitle}>{pendingChores.length} tasks pending</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Pending Chores */}
      <FlatList
        data={pendingChores}
        renderItem={renderChoreItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkbox-outline" size={64} color={colors.gray400} />
            <Text style={styles.emptyText}>No chores pending</Text>
            <Text style={styles.emptySubtext}>Tap + to add a chore</Text>
          </View>
        }
      />

      {/* Completed Chores */}
      {completedChores.length > 0 && (
        <View style={styles.completedSection}>
          <Text style={styles.completedTitle}>
            Completed ({completedChores.length})
          </Text>
          <FlatList
            data={completedChores}
            renderItem={renderChoreItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Add Chore Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Chore</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Chore name"
              value={choreName}
              onChangeText={setChoreName}
              placeholderTextColor={colors.textLight}
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={choreDescription}
              onChangeText={setChoreDescription}
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categorySelection}>
                {choreCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category.id && styles.categoryOptionActive
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Ionicons name={category.icon as any} size={24} color={category.color} />
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

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    priority === p && styles.priorityOptionActive
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[
                    styles.priorityText,
                    priority === p && styles.priorityTextActive
                  ]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={addChore}
            >
              <Text style={styles.saveButtonText}>Add Chore</Text>
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
    backgroundColor: colors.chores,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.chores,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  list: {
    padding: spacing.lg,
  },
  choreCard: {
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
  choreCardCompleted: {
    opacity: 0.6,
  },
  choreLeft: {
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
  choreInfo: {
    flex: 1,
  },
  choreName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  choreNameCompleted: {
    textDecorationLine: 'line-through',
  },
  choreDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  choreMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  choreMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choreMetaText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
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
    backgroundColor: colors.chores + '20',
  },
  categoryOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  categoryOptionTextActive: {
    color: colors.chores,
    fontWeight: '600',
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
  priorityRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  priorityOptionActive: {
    backgroundColor: colors.chores + '20',
  },
  priorityText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  priorityTextActive: {
    color: colors.chores,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.chores,
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

