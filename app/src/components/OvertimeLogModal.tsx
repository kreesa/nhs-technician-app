import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addOvertimeLog } from '../services/api';
import { formatTime12h, formatDateKey, getDefaultOvertimeStart } from '../utils/time';

interface Props {
  visible: boolean;
  jobId: string | number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OvertimeLogModal({ visible, jobId, onClose, onSuccess }: Props) {
  const [startTime, setStartTime] = useState<Date>(getDefaultOvertimeStart());
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleTimeChange = (event: any, selected?: Date) => {
    setShowPicker(false);
    if (selected) setStartTime(selected);
  };

  const handleSubmit = async () => {
    const endTime = new Date(); // captured at submission

    if (endTime <= startTime) {
      Alert.alert('Invalid time', 'End time must be after start time.');
      return;
    }

    setSubmitting(true);
    try {
      const dateKey = formatDateKey(new Date());
      await addOvertimeLog(jobId, dateKey, [
        {
          start_time: formatTime12h(startTime),
          end_time: formatTime12h(endTime),
        },
      ]);
      Alert.alert('Success', 'Overtime log added.');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to add overtime log.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Add Overtime Log</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity style={styles.timeBox} onPress={() => setShowPicker(true)}>
              <Text style={styles.timeText}>{formatTime12h(startTime)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>End Time</Text>
            <Text style={styles.timeTextStatic}>{formatTime12h(new Date())} (now)</Text>
          </View>

          {showPicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  label: { fontSize: 15, color: '#333' },
  timeBox: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#f0f0f0', borderRadius: 8 },
  timeText: { fontSize: 15, fontWeight: '500' },
  timeTextStatic: { fontSize: 15, color: '#666' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { color: '#666' },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  submitText: { color: '#fff', fontWeight: '600' },
});