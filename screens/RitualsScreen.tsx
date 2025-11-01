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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';
import { Ritual } from '../types';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const ritualTypes = [
  { id: 'puja', name: 'Puja', icon: '🔮', color: colors.rituals },
  { id: 'fasting', name: 'Fasting', icon: '🍽️', color: colors.warning },
  { id: 'celebration', name: 'Celebration', icon: '🎉', color: colors.success },
  { id: 'remembrance', name: 'Remembrance', icon: '🕯️', color: colors.info },
  { id: 'other', name: 'Other', icon: '⭐', color: colors.gray600 },
];

export default function RitualsScreen() {
  const { user } = useAuth();
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [ritualName, setRitualName] = useState('');
  const [ritualDescription, setRitualDescription] = useState('');
  const [selectedType, setSelectedType] = useState(ritualTypes[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    loadRituals();
  }, []);

  const loadRituals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'rituals'),
        where('familyId', '==', user.familyId)
      );
      const querySnapshot = await getDocs(q);
      const items: Ritual[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Ritual);
      });
      setRituals(items);
    } catch (error) {
      console.error('Error loading rituals:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (ritual: Ritual) => {
    try {
      await updateDoc(doc(db, 'rituals', ritual.id), {
        completed: !ritual.completed,
        completedAt: !ritual.completed ? new Date() : null,
      });
      loadRituals();
    } catch (error) {
      console.error('Error updating ritual:', error);
    }
  };

  const addRitual = async () => {
    if (!ritualName || !user) {
      return;
    }

    try {
      const newRitual: Omit<Ritual, 'id'> = {
        name: ritualName,
        description: ritualDescription || undefined,
        date: new Date(selectedDate),
        time: selectedTime || undefined,
        type: selectedType as any,
        familyId: user.familyId,
        createdBy: user.id,
        completed: false,
      };
      await addDoc(collection(db, 'rituals'), newRitual);
      setModalVisible(false);
      setRitualName('');
      setRitualDescription('');
      setSelectedType(ritualTypes[0].id);
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setSelectedTime('');
      loadRituals();
    } catch (error) {
      console.error('Error adding ritual:', error);
    }
  };

  const getRitualTypeInfo = (typeId: string) => {
    return ritualTypes.find(t => t.id === typeId) || ritualTypes[4];
  };

  const getUpcomingRituals = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return rituals
      .filter(ritual => !ritual.completed && new Date(ritual.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const renderRitualItem = ({ item }: { item: Ritual }) => {
    const type = getRitualTypeInfo(item.type);
    const ritualDate = new Date(item.date);
    const isToday = ritualDate.toDateString() === new Date().toDateString();
    const isTomorrow = ritualDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

    return (
      <TouchableOpacity
        style={[styles.ritualCard, isToday && styles.ritualCardToday]}
        onPress={() => toggleComplete(item)}
      >
        <View style={styles.ritualLeft}>
          <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
            {item.completed && <Ionicons name="checkmark" size={16} color={colors.white} />}
          </View>
          <View style={styles.ritualContent}>
            <View style={styles.ritualHeader}>
              <Text style={styles.ritualIcon}>{type.icon}</Text>
              <View style={styles.ritualInfo}>
                <Text style={[styles.ritualName, item.completed && styles.ritualNameCompleted]}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text style={styles.ritualDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.ritualMeta}>
              <Text style={styles.ritualMetaText}>
                {ritualDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              {item.time && (
                <>
                  <Text style={styles.ritualMetaText}>•</Text>
                  <Text style={styles.ritualMetaText}>{item.time}</Text>
                </>
              )}
            </View>
          </View>
        </View>
        {isToday && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>Today</Text>
          </View>
        )}
        {isTomorrow && !isToday && (
          <View style={styles.tomorrowBadge}>
            <Text style={styles.tomorrowBadgeText}>Tomorrow</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Ritual Reminders</Text>
          <Text style={styles.subtitle}>{getUpcomingRituals().length} upcoming</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Upcoming Rituals */}
      <FlatList
        data={getUpcomingRituals()}
        renderItem={renderRitualItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sparkles-outline" size={64} color={colors.gray400} />
            <Text style={styles.emptyText}>No upcoming rituals</Text>
            <Text style={styles.emptySubtext}>Tap + to add a ritual reminder</Text>
          </View>
        }
      />

      {/* Add Ritual Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Ritual</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Ritual name"
              value={ritualName}
              onChangeText={setRitualName}
              placeholderTextColor={colors.textLight}
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={ritualDescription}
              onChangeText={setRitualDescription}
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Ritual Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeSelection}>
                {ritualTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      selectedType === type.id && styles.typeOptionActive
                    ]}
                    onPress={() => setSelectedType(type.id)}
                  >
                    <Text style={styles.typeOptionIcon}>{type.icon}</Text>
                    <Text style={[
                      styles.typeOptionText,
                      selectedType === type.id && styles.typeOptionTextActive
                    ]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.label}>Time (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={selectedTime}
              onChangeText={setSelectedTime}
              placeholderTextColor={colors.textLight}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={addRitual}
            >
              <Text style={styles.saveButtonText}>Add Ritual</Text>
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
    backgroundColor: colors.rituals,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.rituals,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  list: {
    padding: spacing.lg,
  },
  ritualCard: {
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
  ritualCardToday: {
    borderWidth: 2,
    borderColor: colors.rituals,
  },
  ritualLeft: {
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
  ritualContent: {
    flex: 1,
  },
  ritualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ritualIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  ritualInfo: {
    flex: 1,
  },
  ritualName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  ritualNameCompleted: {
    textDecorationLine: 'line-through',
  },
  ritualDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ritualMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ritualMetaText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  todayBadge: {
    backgroundColor: colors.rituals,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  todayBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  tomorrowBadge: {
    backgroundColor: colors.rituals + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  tomorrowBadgeText: {
    ...typography.caption,
    color: colors.rituals,
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
    backgroundColor: colors.rituals + '20',
  },
  typeOptionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  typeOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  typeOptionTextActive: {
    color: colors.rituals,
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
    backgroundColor: colors.rituals,
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

