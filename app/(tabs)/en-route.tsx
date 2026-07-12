import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { TechColors, TechSpacing } from "../src/components/theme";
import { haversineKm, estimateEtaMinutes } from "../src/utils/location";

export default function TechTrackingScreen() {
  const { destLat, destLng, jobId } = useLocalSearchParams<{
    destLat: string;
    destLng: string;
    jobId: string;
  }>();

  const destination = {
    latitude: parseFloat(destLat),
    longitude: parseFloat(destLng),
  };

  const [current, setCurrent] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Enable location to start navigation.");
        return;
      }

      // Get an initial fix immediately so the map doesn't sit empty
      const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (cancelled) return;

      const startCoords = { latitude: initial.coords.latitude, longitude: initial.coords.longitude };
      setCurrent(startCoords);
      setRegion(fitRegion(startCoords, destination));

      // Then keep watching for live movement
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 15,
        },
        (loc) => {
          setCurrent({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      );
    })();

    return () => {
      cancelled = true;
      watchRef.current?.remove();
    };
  }, []);

  const distanceKm = current ? haversineKm(current.latitude, current.longitude, destination.latitude, destination.longitude) : null;
  const etaMinutes = distanceKm != null ? estimateEtaMinutes(distanceKm) : null;

  if (!current || !region) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: TechColors.text2 }}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker coordinate={current} pinColor={TechColors.brand} title="You" />
        <Marker coordinate={destination} pinColor="red" title="Job site" />
        <Polyline
          coordinates={[current, destination]}
          strokeColor={TechColors.brand}
          strokeWidth={3}
          lineDashPattern={[6, 4]}
        />
      </MapView>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          {distanceKm != null ? `${distanceKm.toFixed(1)} km` : "—"} away · ETA {etaMinutes ?? "—"} min
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Fits both points in view with padding
function fitRegion(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): Region {
  const latDelta = Math.abs(a.latitude - b.latitude) * 1.8 || 0.02;
  const lngDelta = Math.abs(a.longitude - b.longitude) * 1.8 || 0.02;
  return {
    latitude: (a.latitude + b.latitude) / 2,
    longitude: (a.longitude + b.longitude) / 2,
    latitudeDelta: Math.max(latDelta, 0.01),
    longitudeDelta: Math.max(lngDelta, 0.01),
  };
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  infoBar: {
    position: "absolute",
    bottom: 20,
    left: TechSpacing.lg,
    right: TechSpacing.lg,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  infoText: { fontSize: 13, fontWeight: "600", color: TechColors.text },
  backBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: TechColors.brand, borderRadius: 8 },
  backText: { color: "#fff", fontWeight: "600", fontSize: 12 },
});