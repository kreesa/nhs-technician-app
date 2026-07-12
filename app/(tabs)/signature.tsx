import React, { useRef, useState } from "react";
import { View, StyleSheet, Text, Alert, ActivityIndicator } from "react-native";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";
import { router, useLocalSearchParams } from "expo-router";
import { TechPageHeader, TechButton } from "../src/components/ui";
import { TechColors, TechStyles, TechSpacing } from "../src/components/theme";
import { techJobApi } from "../src/services/api";


export default function SignatureCapture() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const servId = Number(serviceId);
  const sigRef = useRef<SignatureViewRef>(null);

  const [saving, setSaving] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Called when the pad has content vs is empty
  const handleBegin = () => setHasSigned(true);

  // Called with base64 PNG data URI when user taps "confirm" inside the pad
  const handleOK = async (signature: string) => {
    setSaving(true);
    try {
      await techJobApi.uploadSignature(servId, signature);
      Alert.alert("Signed", "Signature saved successfully.");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save signature.");
    } finally {
      setSaving(false);
    }
  };

  const handleEmpty = () => {
    Alert.alert("Signature required", "Please sign before confirming.");
  };

  const handleConfirm = () => {
    sigRef.current?.readSignature(); // triggers handleOK or handleEmpty
  };

  const handleClear = () => {
    sigRef.current?.clearSignature();
    setHasSigned(false);
  };

  return (
    <View style={TechStyles.screen}>
      <TechPageHeader title="Customer Signature" onBack={() => router.back()} />

      <Text style={styles.hint}>
        Please have the customer sign below to confirm payment received.
      </Text>

      <View style={styles.padWrapper}>
        <SignatureScreen
          ref={sigRef}
          onOK={handleOK}
          onEmpty={handleEmpty}
          onBegin={handleBegin}
          autoClear={false}
          descriptionText=""
          webStyle={sigPadStyle}
        />
      </View>

      <View style={styles.actions}>
        <TechButton
          label="Clear"
          variant="danger"
          onPress={handleClear}
          style={{ flex: 1 }}
        />
        <TechButton
          label={saving ? "Saving..." : "Confirm Signature"}
          onPress={handleConfirm}
          loading={saving}
          disabled={saving}
          style={{ flex: 1 }}
        />
      </View>

      {saving && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={TechColors.brand} />
        </View>
      )}
    </View>
  );
}

// Injected CSS for the WebView-based signature pad
const sigPadStyle = `
  .m-signature-pad--footer { display: none; margin: 0; }
  .m-signature-pad { box-shadow: none; border: none; }
  body,html { background-color: #fff; }
`;

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
    color: TechColors.text2,
    paddingHorizontal: TechSpacing.lg,
    marginTop: 8,
    marginBottom: 4,
  },
  padWrapper: {
    flex: 1,
    marginHorizontal: TechSpacing.lg,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: TechColors.borderMd,
    borderRadius: 12,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: TechSpacing.lg,
    paddingBottom: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});