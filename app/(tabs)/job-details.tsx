import { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { router } from "expo-router";
import {
  Alert, Linking, RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TechColors, TechRadius, TechSpacing, TechStyles } from '../src/components/theme';
import { TechBadge, TechButton, TechCard, TechDivider, TechLoading, TechRowKV, TechTopbar } from '../src/components/ui';
import { useTechAuth } from '../src/context/TechAuthContext';
import { techJobApi } from '../src/services/api';
import { AssignedJob, TechRootStackParamList } from '../src/types';

type Props = {
  route: RouteProp<TechRootStackParamList, 'JobDetail'>;
};

export default function JobDetailScreen() {
  const { jobId } = route.params;
  const { technician } = useTechAuth();

  const [job, setJob] = useState<AssignedJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enRouteLoading, setEnRouteLoading] = useState(false);
  const [arrivedLoading, setArrivedLoading] = useState(false);
  const [quotationLoading, setQuotationLoading] = useState(false);

  const loadJob = async () => {
    try {
      const data = await techJobApi.getJobDetail(jobId);
      setJob(data);
    } catch (e) {
      Alert.alert('Error', 'Could not load job details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadJob(); }, [jobId]);

  const handleEnRoute = async () => {
    Alert.alert('Start Journey', 'Confirm you are heading to the customer location?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', onPress: async () => {
          setEnRouteLoading(true);
          try {
            await techJobApi.setEnRoute(jobId);
            await loadJob();
            Alert.alert('✅ En route', 'Customer has been notified you are on the way.');
          } catch (err: any) {
            Alert.alert('Error', err.message);
          } finally {
            setEnRouteLoading(false);
          }
        },
      },
    ]);
  };

  const handleArrived = async () => {
    Alert.alert('Check In', 'Confirm you have arrived at the customer location?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Check in', onPress: async () => {
          setArrivedLoading(true);
          try {
            await techJobApi.setArrived(jobId);
            await loadJob();
            Alert.alert('✅ Checked in', 'Your arrival has been recorded.');
          } catch (err: any) {
            Alert.alert('Error', err.message);
          } finally {
            setArrivedLoading(false);
          }
        },
      },
    ]);
  };

  const handleSendQuotation = async () => {
    Alert.alert('Send Quotation', 'This will send the current pricing to the customer for approval.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send', onPress: async () => {
          setQuotationLoading(true);
          try {
            await techJobApi.sendQuotation(jobId);
            await loadJob();
            Alert.alert('✅ Sent', 'Quotation sent to customer. Waiting for approval.');
          } catch (err: any) {
            Alert.alert('Error', err.message);
          } finally {
            setQuotationLoading(false);
          }
        },
      },
    ]);
  };

  const openMaps = () => {
    if (!job) return;
    const url = `https://maps.google.com/?q=${job.latitude},${job.longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open maps.'));
  };

  const callCustomer = () => {
    if (!job?.customer?.phone) return;
    Linking.openURL(`tel:${job.customer.phone}`).catch(() => {});
  };

  if (loading || !job) return <TechLoading />;

  const canEnRoute = !job.technician_en_route && job.service_status === 'Technician Assigned';
  const canCheckIn = job.technician_en_route && !job.technician_arrival_onsite;
  const canStartOnsite = job.technician_arrival_onsite;
  const canSendQuotation = job.technician_arrival_onsite && !job.send_quotation_to_customer;
  const canSign = job.agreed_to_quotation && !job.customer_confirmation_signature;

  return (
    <View style={TechStyles.screen}>
      <TechTopbar
        title={`Job #${jobId}`}
        onBack={() => router.back()}
        right={<TechBadge label={job.service_status} variant="orange" />}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadJob(); }} tintColor={TechColors.brand} />}
      >
        {/* Job Summary */}
        <TechCard label="Service details">
          <TechRowKV label="Category" value={job.service_category} />
          <TechRowKV label="Sub-category" value={job.service_subcategory} />
          <TechRowKV label="Date" value={job.requested_date} />
          <TechRowKV label="Customer slot" value={job.requested_timeslot} />
          <TechRowKV label="Scheduled slot" value={job.scheduled_timeslot} last />
          <TechDivider />
          <Text style={styles.descLabel}>Problem description</Text>
          <Text style={styles.descText}>{job.problem_description}</Text>
          {job.problem_images && job.problem_images.length > 0 && (
            <Text style={styles.photoCount}>📷 {job.problem_images.length} photo(s) attached</Text>
          )}
        </TechCard>

        {/* Customer Info */}
        <TechCard label="Customer">
          <TechRowKV label="Name" value={job.customer?.full_name ?? '—'} />
          <TechRowKV label="Address" value={job.service_location} />
          <TechRowKV label="Service fee" value={`NPR ${job.technician_service_fee?.toLocaleString() ?? '—'}`} last />
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn} onPress={callCustomer}>
              <Text style={{ fontSize: 18 }}>📞</Text>
              <Text style={styles.contactBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn} onPress={openMaps}>
              <Text style={{ fontSize: 18 }}>🗺️</Text>
              <Text style={styles.contactBtnText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </TechCard>

        {/* Progress Checklist */}
        <TechCard label="Job progress">
          {[
            { label: 'Assigned', done: true },
            { label: 'En route to customer', done: job.technician_en_route },
            { label: 'Arrived / Checked in', done: job.technician_arrival_onsite },
            { label: 'Quotation sent', done: job.send_quotation_to_customer },
            { label: 'Customer approved', done: job.agreed_to_quotation },
            { label: 'Signature collected', done: !!job.customer_confirmation_signature },
          ].map(({ label, done }, i, arr) => (
            <View key={label} style={[styles.checkRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[styles.checkDot, { backgroundColor: done ? TechColors.green : TechColors.border }]}>
                {done && <Text style={{ fontSize: 10, color: TechColors.white }}>✓</Text>}
              </View>
              <Text style={[styles.checkLabel, { color: done ? TechColors.text : TechColors.text3 }]}>
                {label}
              </Text>
            </View>
          ))}
        </TechCard>

        {/* Action Buttons */}
        <TechCard label="Actions">
          {canEnRoute && (
            <TechButton label="🚗  I'm heading there now" onPress={handleEnRoute} loading={enRouteLoading} variant="accent" style={{ marginBottom: 10 }} />
          )}

          {canCheckIn && (
            <TechButton label="📍  Check in — I've arrived" onPress={handleArrived} loading={arrivedLoading} variant="accent" style={{ marginBottom: 10 }} />
          )}

          {canStartOnsite && (
            <TechButton
              label="🔧  Update onsite progress"
              onPress= {() => router.push({
                  pathname: "/onsite-progress",
                  params: {
                    jobId: job.id,
                  },
                })
              }
              variant="primary"
              style={{ marginBottom: 10 }}
            />
          )}

          {canStartOnsite && (
            <TechButton
              label="📦  Request materials"
              onPress={() => navigation.navigate('MaterialRequest', { jobId })}
              variant="outline"
              style={{ marginBottom: 10 }}
            />
          )}

          {canSendQuotation && (
            <TechButton label="📤  Send quotation to customer" onPress={handleSendQuotation} loading={quotationLoading} variant="primary" style={{ marginBottom: 10 }} />
          )}

          {job.send_quotation_to_customer && !job.agreed_to_quotation && (
            <View style={styles.waitingBanner}>
              <Text style={{ fontSize: 16 }}>⏳</Text>
              <Text style={styles.waitingText}>Waiting for customer to approve quotation...</Text>
            </View>
          )}

          {canSign && (
            <TechButton
              label="✍️  Collect customer signature"
              onPress={() => navigation.navigate('Signature', { jobId })}
              variant="accent"
            />
          )}

          {job.service_status === 'Completed' && (
            <View style={styles.completedBanner}>
              <Text style={{ fontSize: 20 }}>✅</Text>
              <Text style={styles.completedText}>Job completed successfully</Text>
            </View>
          )}
        </TechCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: TechSpacing.lg, paddingBottom: 40, gap: 12 },
  descLabel: { fontSize: 12, fontWeight: '500', color: TechColors.text2, marginBottom: 6 },
  descText: { fontSize: 13, color: TechColors.text, lineHeight: 20 },
  photoCount: { fontSize: 11, color: TechColors.brand, marginTop: 8 },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  contactBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: TechColors.borderMd,
    borderRadius: TechRadius.md, padding: 10,
    backgroundColor: TechColors.pageBg,
  },
  contactBtnText: { fontSize: 13, fontWeight: '600', color: TechColors.text },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: TechColors.border,
  },
  checkDot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  checkLabel: { fontSize: 13, fontWeight: '500' },
  waitingBanner: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    backgroundColor: TechColors.amberBg, borderRadius: TechRadius.md,
    padding: 12, marginBottom: 10,
  },
  waitingText: { fontSize: 13, color: TechColors.amber, fontWeight: '500', flex: 1 },
  completedBanner: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    backgroundColor: TechColors.greenBg, borderRadius: TechRadius.md,
    padding: 12,
  },
  completedText: { fontSize: 14, color: TechColors.green, fontWeight: '600' },
});
