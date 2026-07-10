import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { router } from "expo-router";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { TechColors, TechRadius, TechSpacing, TechStyles } from '../src/components/theme';
import { TechButton, TechCard, TechPageHeader } from '../src/components/ui';
import { useTechAuth } from '../src/context/TechAuthContext';
import { onsiteApi } from '../src/services/api';
import { OnsiteStatus, TechRootStackParamList } from '../src/types';

type Props = {
  navigation: NativeStackNavigationProp<TechRootStackParamList, 'OnsiteProgress'>;
  route: RouteProp<TechRootStackParamList, 'OnsiteProgress'>;
};

const STATUS_OPTIONS: OnsiteStatus[] = [
  'Diagnosing issue',
  'Waiting for Material',
  'Work in Progress',
  'Complete',
];

const STATUS_META: Record<OnsiteStatus, { icon: string; color: string }> = {
  'Diagnosing issue':    { icon: '🔍', color: TechColors.amber },
  'Waiting for Material': { icon: '📦', color: TechColors.accent },
  'Work in Progress':    { icon: '🔧', color: TechColors.brand },
  'Complete':            { icon: '✅', color: TechColors.green },
};

export default function OnsiteProgressScreen() {
  const { jobId } = route.params;
  const { technician } = useTechAuth();

  const [status, setStatus] = useState<OnsiteStatus>('Diagnosing issue');
  const [note, setNote] = useState('');
  const [needAssistance, setNeedAssistance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  // Load the latest onsite progress if it exists
  useEffect(() => {
    onsiteApi.getProgress(jobId).then((entries) => {
      if (entries.length > 0) {
        const latest = entries[entries.length - 1];
        setStatus(latest.current_job_status);
        setNote(latest.technician_note ?? '');
        setNeedAssistance(latest.need_assistance ?? false);
      }
    }).catch(() => {});
  }, [jobId]);

  const handleSave = async () => {
    if (!note.trim()) {
      Alert.alert('Note required', 'Please add a technician note before saving.');
      return;
    }
    setLoading(true);
    try {
      await onsiteApi.saveProgress({
        service_id: jobId,
        technician_id: technician?.id ?? 0,
        current_job_status: status,
        technician_note: note,
        need_assistance: needAssistance,
      });
      Alert.alert('✅ Saved', 'Progress updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={TechStyles.screen}>
      {/* PageHeader */}
      <TechPageHeader title="Onsite Progress" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Job Status */}
        <TechCard label="Current job status">
          {STATUS_OPTIONS.map((opt) => {
            const meta = STATUS_META[opt];
            const selected = status === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.statusOption, selected && { borderColor: meta.color, backgroundColor: `${meta.color}14` }]}
                onPress={() => setStatus(opt)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 22 }}>{meta.icon}</Text>
                <Text style={[styles.statusLabel, selected && { color: meta.color }]}>{opt}</Text>
                <View style={[styles.radioOuter, selected && { borderColor: meta.color }]}>
                  {selected && <View style={[styles.radioInner, { backgroundColor: meta.color }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </TechCard>

        {/* Technician Note */}
        <TechCard label="Technician note">
          <Text style={{ fontSize: 12, color: TechColors.text3, marginBottom: 10 }}>
            Describe the current situation, work done, or issues found.
          </Text>
          <TextInput
            style={[
              TechStyles.input,
              { height: 120, textAlignVertical: 'top', paddingTop: 10 },
              focused && { borderColor: TechColors.brand },
            ]}
            placeholder="e.g. Found crack in the main pipe junction. Replacing fittings now..."
            value={note}
            onChangeText={setNote}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            multiline
            placeholderTextColor={TechColors.text3}
          />
        </TechCard>

        {/* Need Assistance */}
        <TechCard label="Need assistance?">
          <Text style={{ fontSize: 13, color: TechColors.text2, marginBottom: 12 }}>
            Flag this job if you need an additional technician or admin support.
          </Text>
          <View style={styles.assistanceRow}>
            {[false, true].map((val) => (
              <TouchableOpacity
                key={String(val)}
                style={[
                  styles.assistBtn,
                  needAssistance === val && {
                    borderColor: val ? TechColors.red : TechColors.green,
                    backgroundColor: val ? TechColors.redBg : TechColors.greenBg,
                  },
                ]}
                onPress={() => setNeedAssistance(val)}
              >
                <Text style={{ fontSize: 22 }}>{val ? '🆘' : '👍'}</Text>
                <Text style={[
                  styles.assistBtnText,
                  needAssistance === val && { color: val ? TechColors.red : TechColors.green },
                ]}>
                  {val ? 'Yes, need help' : 'No, I\'m good'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {needAssistance && (
            <View style={styles.assistWarning}>
              <Text style={{ fontSize: 14 }}>⚠️</Text>
              <Text style={{ fontSize: 12, color: TechColors.amber, flex: 1 }}>
                Admin will be notified immediately that this job needs additional support.
              </Text>
            </View>
          )}
        </TechCard>

        <TechButton label="Save progress" onPress={handleSave} loading={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: TechSpacing.lg, paddingBottom: 40, gap: 12 },
  statusOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: TechColors.borderMd,
    borderRadius: TechRadius.lg, padding: 12, marginBottom: 8,
  },
  statusLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: TechColors.text },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: TechColors.borderMd,
    alignItems: 'center', justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  assistanceRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  assistBtn: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14,
    borderWidth: 1.5, borderColor: TechColors.borderMd,
    borderRadius: TechRadius.lg, backgroundColor: TechColors.pageBg,
  },
  assistBtnText: { fontSize: 13, fontWeight: '600', color: TechColors.text2 },
  assistWarning: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: TechColors.amberBg, borderRadius: TechRadius.md,
    padding: 10,
  },
});
