import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '../theme';
import { VoiceInputService, speak, stopSpeaking } from '../utils/voiceInput';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
}

export default function VoiceInputButton({ onTranscript, onError }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const voiceService = new VoiceInputService();

  const startListening = async () => {
    try {
      setModalVisible(true);
      setIsListening(true);
      
      voiceService.setOnSpeechStart(() => {
        console.log('Speech started');
        scale.value = withRepeat(
          withTiming(1.3, { duration: 1000 }),
          -1,
          true
        );
      });

      voiceService.setOnSpeechEnd(() => {
        console.log('Speech ended');
        scale.value = withTiming(1);
        stopListening();
      });

      voiceService.setOnSpeechResults((results) => {
        if (results && results.length > 0) {
          const text = results[0];
          setTranscript(text);
        }
      });

      voiceService.setOnSpeechError((error) => {
        console.error('Speech error:', error);
        onError?.('Voice recognition error. Please try again.');
        stopListening();
      });

      await voiceService.startListening();
    } catch (error: any) {
      console.error('Error starting voice input:', error);
      onError?.('Could not start voice input. Please check permissions.');
      setIsListening(false);
      setModalVisible(false);
    }
  };

  const stopListening = async () => {
    try {
      await voiceService.stopListening();
      setIsListening(false);
      setIsProcessing(true);
      
      // Process transcript after a short delay
      setTimeout(() => {
        if (transcript) {
          onTranscript(transcript);
          speak('Done');
        }
        setIsProcessing(false);
        setModalVisible(false);
        setTranscript('');
      }, 1000);
    } catch (error) {
      console.error('Error stopping voice input:', error);
      setIsListening(false);
      setIsProcessing(false);
      setModalVisible(false);
    }
  };

  const cancelListening = async () => {
    try {
      await voiceService.cancel();
      setIsListening(false);
      setIsProcessing(false);
      setModalVisible(false);
      setTranscript('');
      scale.value = withTiming(1);
    } catch (error) {
      console.error('Error canceling voice input:', error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={startListening}
      >
        <Ionicons name="mic" size={24} color={colors.white} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={cancelListening}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            ) : (
              <>
                <Animated.View style={[styles.voiceIndicator, animatedStyle]}>
                  <Ionicons name="mic" size={64} color={colors.white} />
                </Animated.View>
                <Text style={styles.listeningText}>
                  {isListening ? 'Listening...' : 'Processing...'}
                </Text>
                {transcript && (
                  <Text style={styles.transcriptText} numberOfLines={3}>
                    {transcript}
                  </Text>
                )}
              </>
            )}
            
            {!isProcessing && (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={cancelListening}
              >
                <Text style={styles.stopButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 300,
  },
  voiceIndicator: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  listeningText: {
    ...typography.bodyLarge,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  transcriptText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    minHeight: 60,
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.md,
  },
  stopButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  stopButtonText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
});

