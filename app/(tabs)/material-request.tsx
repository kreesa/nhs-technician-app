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
import { TechColors, TechSpacing, TechStyles } from '../src/components/theme';
import { TechButton, TechCard, TechTopbar } from '../src/components/ui';
import { materialApi } from '../src/services/api';
import { Material, TechRootStackParamList } from '../src/types';

type Props = {
  route: RouteProp<TechRootStackParamList, 'MaterialRequest'>;
};

interface SelectedMaterial { material: Material; quantity: number; }

// Fallback demo materials if API not connected yet
const DEMO_MATERIALS: Material[] = [
  { id: 1, name: 'PVC Pipe (1 inch)', unit: 'meter', estimated_price: 120 },
  { id: 2, name: 'Pipe Fitting (elbow)', unit: 'piece', estimated_price: 45 },
  { id: 3, name: 'Electrical Wire (1.5mm)', unit: 'meter', estimated_price: 85 },
  { id: 4, name: 'MCB Switch 16A', unit: 'piece', estimated_price: 340 },
  { id: 5, name: 'Sealant Tape', unit: 'roll', estimated_price: 60 },
  { id: 6, name: 'Wall Plug Set', unit: 'set', estimated_price: 150 },
  { id: 7, name: 'Copper Wire (2.5mm)', unit: 'meter', estimated_price: 165 },
  { id: 8, name: 'Gate Valve', unit: 'piece', estimated_price: 280 },
];

export default function MaterialRequestScreen() {
  const { jobId } = route.params;
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selected, setSelected] = useState<SelectedMaterial[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    materialApi.getAllMaterials()
      .then(setMaterials)
      .catch(() => setMaterials(DEMO_MATERIALS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const getSelected = (id: number) => selected.find((s) => s.material.id === id);

  const toggleMaterial = (mat: Material) => {
    const exists = getSelected(mat.id);
    if (exists) {
      setSelected((prev) => prev.filter((s) => s.material.id !== mat.id));
    } else {
      setSelected((prev) => [...prev, { material: mat, quantity: 1 }]);
    }
  };

  const updateQty = (id: number, qty: number) => {
    if (qty < 1) { setSelected((prev) => prev.filter((s) => s.material.id !== id)); return; }
    setSelected((prev) =>
      prev.map((s) => s.material.id === id ? { ...s, quantity: qty } : s)
    );
  };

  const estimatedTotal = selected.reduce((sum, s) => sum + (s.material.estimated_price ?? 0) * s.quantity, 0);

  const handleSubmit = async () => {
    if (selected.length === 0) { Alert.alert('Select materials', 'Please select at least one material.'); return; }
    setSubmitLoading(true);
    try {
      await Promise.all(
        selected.map((s) =>
          materialApi.requestMaterial({
            service_id: jobId,
            fee_type: 'Material Cost',
            material_type: s.material.id,
            quantity: s.quantity,
          })
        )
      );
      Alert.alert('✅ Requested', 'Materials have been requested from admin.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <View style={TechStyles.screen}>
      <TechTopbar title="Request Materials" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <TechCard>
          <TextInput
            style={[TechStyles.input, { marginBottom: 0 }]}
            placeholder="🔍  Search materials..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={TechColors.text3}
          />
        </TechCard>

        {/* Materials List */}
        <TechCard label={`Available materials (${filtered.length})`}>
          {filtered.map((mat, i) => {
            const sel = getSelected(mat.id);
            return (
              <View key={mat.id} style={[styles.matRow, i === filtered.length - 1 && { borderBottomWidth: 0 }]}>
                <TouchableOpacity
                  style={styles.matCheckbox}
                  onPress={() => toggleMaterial(mat)}
                >
                  <View style={[styles.checkbox, sel && { backgroundColor: TechColors.brand, borderColor: TechColors.brand }]}>
                    {sel && <Text style={{ color: TechColors.white, fontSize: 11 }}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={styles.matName}>{mat.name}</Text>
                  <Text style={styles.matMeta}>
                    {mat.unit && `Per ${mat.unit}`}
                    {mat.estimated_price ? ` · est. NPR ${mat.estimated_price}` : ''}
                  </Text>
                </View>
                {sel && (
                  <View style={styles.qtyControl}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(mat.id, sel.quantity - 1)}>
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{sel.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(mat.id, sel.quantity + 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </TechCard>

        {/* Selected Summary */}
        {selected.length > 0 && (
          <TechCard label={`Selected (${selected.length})`}>
            {selected.map((s) => (
              <View key={s.material.id} style={styles.selectedRow}>
                <Text style={styles.selectedName}>{s.material.name}</Text>
                <Text style={styles.selectedQty}>×{s.quantity}</Text>
                {s.material.estimated_price && (
                  <Text style={styles.selectedPrice}>
                    NPR {(s.material.estimated_price * s.quantity).toLocaleString()}
                  </Text>
                )}
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated total</Text>
              <Text style={styles.totalValue}>NPR {estimatedTotal.toLocaleString()}</Text>
            </View>
            <Text style={styles.totalNote}>
              * Final price confirmed by admin after material procurement.
            </Text>
          </TechCard>
        )}

        <TechButton
          label={`📦  Request ${selected.length} material${selected.length !== 1 ? 's' : ''}`}
          onPress={handleSubmit}
          loading={submitLoading}
          disabled={selected.length === 0}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: TechSpacing.lg, paddingBottom: 40, gap: 12 },
  matRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 11, borderBottomWidth: 0.5, borderBottomColor: TechColors.border,
  },
  matCheckbox: { padding: 4 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: TechColors.borderMd,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: TechColors.pageBg,
  },
  matName: { fontSize: 13, fontWeight: '500', color: TechColors.text },
  matMeta: { fontSize: 11, color: TechColors.text3, marginTop: 2 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: TechColors.brandBg, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 18, color: TechColors.brand, fontWeight: '700', lineHeight: 22 },
  qtyValue: { fontSize: 14, fontWeight: '600', color: TechColors.text, minWidth: 20, textAlign: 'center' },
  selectedRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: TechColors.border,
  },
  selectedName: { flex: 1, fontSize: 13, color: TechColors.text },
  selectedQty: { fontSize: 13, color: TechColors.text2, marginRight: 12 },
  selectedPrice: { fontSize: 13, fontWeight: '600', color: TechColors.brand },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 12, marginTop: 4,
  },
  totalLabel: { fontSize: 13, fontWeight: '600', color: TechColors.text2 },
  totalValue: { fontSize: 16, fontWeight: '700', color: TechColors.brand },
  totalNote: { fontSize: 11, color: TechColors.text3, marginTop: 6 },
});
