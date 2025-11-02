import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import storage from '../../utils/storage';
import { pickupService } from '../../services/pickupService';
import Card from '../../components/common/Card';

const HistoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    setLoading(true);
    try {
      const studentData = await storage.getItem('selectedStudent');
      if (studentData) {
        const student = JSON.parse(studentData);
        setSelectedStudent(student);

        // Load pickup history for selected student
        const result = await pickupService.getMyRequests({
          studentId: student.id,
          limit: 50,
        });

        if (result.success) {
          setRequests(result.data || []);
        }
      }
    } catch (error) {
      console.error('Load history error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      completed: '#6366f1',
      rejected: '#ef4444',
      cancelled: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Хүлээгдэж буй',
      approved: 'Баталгаажсан',
      completed: 'Дууссан',
      rejected: 'Татгалзсан',
      cancelled: 'Цуцлагдсан',
    };
    return texts[status] || status;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Авалтын түүх</Text>
          {selectedStudent && (
            <Text style={styles.subtitle}>
              {selectedStudent.firstName} {selectedStudent.lastName}
            </Text>
          )}
        </View>

        {requests.length === 0 ? (
          <Card>
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>
                Авалтын түүх байхгүй байна
              </Text>
            </View>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestDate}>
                    {new Date(request.scheduledPickupTime).toLocaleDateString(
                      'mn-MN',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </Text>
                  <Text style={styles.requestTime}>
                    {new Date(request.scheduledPickupTime).toLocaleTimeString(
                      'mn-MN',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(request.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(request.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.requestDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color="#6b7280" />
                  <Text style={styles.detailText}>
                    Төрөл: {request.requestType === 'guest' ? 'Зочин хүн' : 'Энгийн'}
                  </Text>
                </View>

                {request.guestName && (
                  <View style={styles.detailRow}>
                    <Ionicons name="people-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      Зочин: {request.guestName}
                    </Text>
                  </View>
                )}

                {request.notes && (
                  <View style={styles.detailRow}>
                    <Ionicons name="document-text-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>{request.notes}</Text>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  requestCard: {
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  requestInfo: {
    flex: 1,
  },
  requestDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  requestDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
});

export default HistoryScreen;
