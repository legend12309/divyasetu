import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';
import { Meal } from '../types';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const { width } = Dimensions.get('window');

const mealTypes = [
  { id: 'breakfast', name: 'Breakfast', icon: 'sunny-outline', time: '8:00 AM' },
  { id: 'lunch', name: 'Lunch', icon: 'partly-sunny-outline', time: '1:00 PM' },
  { id: 'dinner', name: 'Dinner', icon: 'moon-outline', time: '8:00 PM' },
  { id: 'snack', name: 'Snacks', icon: 'cafe-outline', time: '4:00 PM' },
];

export default function MealsScreen() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');

  const getWeekDates = () => {
    const dates = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getMealsForDate = (date: Date, mealType: string) => {
    const dateStr = date.toDateString();
    return meals.filter(
      meal => meal.date.toDateString() === dateStr && meal.mealType === mealType
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  const loadMeals = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'meals'),
        where('familyId', '==', user.familyId)
      );
      const querySnapshot = await getDocs(q);
      const items: Meal[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Meal);
      });
      setMeals(items);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  useEffect(() => {
    loadMeals();
  }, []);

  const addMeal = async () => {
    if (!mealName || !user) {
      Alert.alert('Error', 'Please enter meal name');
      return;
    }

    try {
      const newMeal: Omit<Meal, 'id'> = {
        name: mealName,
        description: mealDescription,
        date: selectedDate,
        mealType: selectedMealType as any,
        familyId: user.familyId,
      };
      await addDoc(collection(db, 'meals'), newMeal);
      setModalVisible(false);
      setMealName('');
      setMealDescription('');
      loadMeals();
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to add meal');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meal Planner</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Week View */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.weekSelector}
      >
        {getWeekDates().map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateCard,
              date.toDateString() === selectedDate.toDateString() && styles.dateCardActive
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={[
              styles.dateText,
              date.toDateString() === selectedDate.toDateString() && styles.dateTextActive
            ]}>
              {formatDate(date)}
            </Text>
            {date.toDateString() === new Date().toDateString() && (
              <View style={styles.todayIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Meals */}
      <FlatList
        data={mealTypes}
        renderItem={({ item }) => (
          <View style={styles.mealSection}>
            <View style={styles.mealHeader}>
              <View style={styles.mealHeaderLeft}>
                <Ionicons name={item.icon as any} size={24} color={colors.meals} />
                <View style={styles.mealHeaderText}>
                  <Text style={styles.mealType}>{item.name}</Text>
                  <Text style={styles.mealTime}>{item.time}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.addMealButton}
                onPress={() => {
                  setSelectedMealType(item.id);
                  setModalVisible(true);
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={colors.meals} />
              </TouchableOpacity>
            </View>

            {getMealsForDate(selectedDate, item.id).length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.mealsContainer}>
                  {getMealsForDate(selectedDate, item.id).map((meal) => (
                    <TouchableOpacity key={meal.id} style={styles.mealCard}>
                      <View style={styles.mealImagePlaceholder}>
                        <Ionicons name="restaurant" size={32} color={colors.white} />
                      </View>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      {meal.description && (
                        <Text style={styles.mealDescription} numberOfLines={1}>
                          {meal.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.emptyMeal}>
                <Ionicons name="fast-food-outline" size={32} color={colors.gray300} />
                <Text style={styles.emptyMealText}>No {item.name.toLowerCase()} planned</Text>
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Meal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Meal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Meal Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeSelection}>
                {mealTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      selectedMealType === type.id && styles.typeOptionActive
                    ]}
                    onPress={() => setSelectedMealType(type.id)}
                  >
                    <Ionicons name={type.icon as any} size={24} color={colors.meals} />
                    <Text style={[
                      styles.typeOptionText,
                      selectedMealType === type.id && styles.typeOptionTextActive
                    ]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Meal name"
              value={mealName}
              onChangeText={setMealName}
              placeholderTextColor={colors.textLight}
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={mealDescription}
              onChangeText={setMealDescription}
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={addMeal}
            >
              <Text style={styles.saveButtonText}>Add Meal</Text>
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
  title: {
    ...typography.h2,
    color: colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.meals,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.meals,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  weekSelector: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  dateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  dateCardActive: {
    backgroundColor: colors.meals + '20',
  },
  dateText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  dateTextActive: {
    color: colors.meals,
    fontWeight: '600',
  },
  todayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.meals,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  mealSection: {
    marginBottom: spacing.xl,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealHeaderText: {
    marginLeft: spacing.md,
  },
  mealType: {
    ...typography.h4,
    color: colors.text,
  },
  mealTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addMealButton: {
    padding: spacing.xs,
  },
  mealsContainer: {
    flexDirection: 'row',
  },
  mealCard: {
    width: 150,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginRight: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealImagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.meals + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mealName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  mealDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyMeal: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
  },
  emptyMealText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
  typeSelection: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  typeOption: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    minWidth: 100,
  },
  typeOptionActive: {
    backgroundColor: colors.meals + '20',
  },
  typeOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  typeOptionTextActive: {
    color: colors.meals,
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
  saveButton: {
    backgroundColor: colors.meals,
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

