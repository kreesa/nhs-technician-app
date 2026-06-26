import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { router } from "expo-router";
import {
    Alert,
    GestureResponderEvent,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { TechColors, TechRadius, TechSpacing, TechStyles } from '../src/components/theme';
import { TechButton, TechCard, TechTopbar } from '../src/components/ui';
import { techJobApi } from '../src/services/api';
import { TechRootStackParamList } from '../src/types';

type Props = {
  navigation: NativeStackNavigationProp<TechRootStackParamList, 'Signature'>;
  route: RouteProp<TechRootStackParamList, 'Signature'>;
};

interface Point { x: number; y: number; }
interface Stroke { points: Point[]; }

export default function SignatureScreen() {
  const { jobId } = route.params;
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const isDrawing = useRef(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e: GestureResponderEvent) => {
      const { locationX, locationY } = e.nativeEvent;
      isDrawing.current = true;
      setCurrentStroke([{ x: locationX, y: locationY }]);
    },
    onPanResponderMove: (e: GestureResponderEvent) => {
      if (!isDrawing.current) return;
      const { locationX, locationY } = e.nativeEvent;
      setCurrentStroke((prev) => [...prev, { x: locationX, y: locationY }]);
    },
    onPanResponderRelease: () => {
      isDrawing.current = false;
      setStrokes((prev) => [...prev, { points: currentStroke }]);
      setCurrentStroke([]);
    },
  });

  const clear = () => {
    setStrokes([]);
    setCurrentStroke([]);
  };

  const strokeToPath = (points: Point[]): string => {
    if (points.length === 0) return '';
    const [first, ...rest] = points;
    return `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(' ');
  };

  const hasSignature = strokes.length > 0 || currentStroke.length > 0;

  const handleSubmit = async () => {
    if (!hasSignature) {
      Alert.alert('Signature required', 'Please ask the customer to sign above.');
      return;
    }
    if (!confirmed) {
      Alert.alert('Confirm', 'Does the customer confirm the work is complete and they agree to payment?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, confirm', onPress: () => setConfirmed(true) },
      ]);
      return;
    }

    setSaving(true);
    try {
      // In production, capture SVG as image and upload
      // For now, we send a placeholder URL after confirmation
      const signatureUrl = `signature_job_${jobId}_${Date.now()}.png`;
      await techJobApi.uploadSignature(jobId, signatureUrl);
      Alert.alert('✅ Complete', 'Signature collected. Job marked as complete!', [
        { text: 'Done', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={TechStyles.screen}>
      <TechTopbar title="Customer Signature" onBack={() => router.back()} />

      <View style={{ flex: 1, padding: TechSpacing.lg, gap: 12 }}>
        {/* Instructions */}
        <TechCard>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 20 }}>✍️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: TechColors.text, marginBottom: 4 }}>
                Collect customer signature
              </Text>
              <Text style={{ fontSize: 12, color: TechColors.text2, lineHeight: 18 }}>
                Hand your phone to the customer and ask them to sign below to confirm the work is complete and they agree to the payment.
              </Text>
            </View>
          </View>
        </TechCard>

        {/* Signature Pad */}
        <View style={styles.padContainer}>
          <View style={styles.padHeader}>
            <Text style={styles.padLabel}>Customer signature</Text>
            <TouchableOpacity onPress={clear} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pad} {...panResponder.panHandlers}>
            {!hasSignature && (
              <View style={styles.padPlaceholder}>
                <Text style={styles.padPlaceholderText}>Sign here</Text>
              </View>
            )}
            <Svg style={StyleSheet.absoluteFill}>
              {strokes.map((stroke, i) => (
                <Path
                  key={i}
                  d={strokeToPath(stroke.points)}
                  stroke={TechColors.text}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentStroke.length > 0 && (
                <Path
                  d={strokeToPath(currentStroke)}
                  stroke={TechColors.text}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>

          <View style={styles.padFooter}>
            <View style={styles.signatureLine} />
            <Text style={styles.padFooterText}>Customer signature — Job #{jobId}</Text>
          </View>
        </View>

        {/* Confirmation */}
        {hasSignature && !confirmed && (
          <TechCard>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 16 }}>📋</Text>
              <Text style={{ fontSize: 12, color: TechColors.text2, flex: 1 }}>
                By signing, the customer confirms the work is complete and agrees to the total amount payable.
              </Text>
            </View>
          </TechCard>
        )}

        {confirmed && (
          <View style={styles.confirmedBanner}>
            <Text style={{ fontSize: 18 }}>✅</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: TechColors.green }}>
              Customer confirmation received
            </Text>
          </View>
        )}

        <TechButton
          label={confirmed ? '✅  Submit & complete job' : '✍️  Confirm signature'}
          onPress={handleSubmit}
          loading={saving}
          disabled={!hasSignature}
          variant={confirmed ? 'accent' : 'primary'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  padContainer: {
    flex: 1,
    backgroundColor: TechColors.cardBg,
    borderRadius: TechRadius.xl,
    borderWidth: 0.5,
    borderColor: TechColors.border,
    overflow: 'hidden',
  },
  padHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: TechSpacing.lg, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: TechColors.border,
  },
  padLabel: { fontSize: 12, fontWeight: '600', color: TechColors.text3, textTransform: 'uppercase', letterSpacing: 0.6 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: TechColors.pageBg, borderRadius: TechRadius.md },
  clearBtnText: { fontSize: 12, fontWeight: '600', color: TechColors.red },
  pad: { flex: 1, backgroundColor: '#FAFAFA' },
  padPlaceholder: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  padPlaceholderText: { fontSize: 16, color: TechColors.border, fontStyle: 'italic' },
  padFooter: {
    paddingHorizontal: TechSpacing.lg, paddingVertical: 10,
    borderTopWidth: 0.5, borderTopColor: TechColors.border, gap: 6,
  },
  signatureLine: { height: 1, backgroundColor: TechColors.borderMd },
  padFooterText: { fontSize: 11, color: TechColors.text3, textAlign: 'center' },
  confirmedBanner: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    backgroundColor: TechColors.greenBg, borderRadius: TechRadius.lg, padding: 14,
  },
});
