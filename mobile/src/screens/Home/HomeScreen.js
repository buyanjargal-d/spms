import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import storage from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { pickupService } from '../../services/pickupService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allChildren, setAllChildren] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    loadSelectedStudent();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSelectedStudent();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSelectedStudent = async () => {
    try {
      const studentData = await storage.getItem('selectedStudent');
      if (studentData) {
        const student = JSON.parse(studentData);
        setSelectedStudent(student);
        loadData(student.id);
      } else {
        // No student selected, go back to selection
        navigation.navigate('StudentSelection');
      }
    } catch (error) {
      console.error('Load selected student error:', error);
    }
  };

  const loadData = async (studentId) => {
    setLoading(true);
    try {
      // Load all children for quick access
      const childrenResult = await studentService.getMyChildren();
      if (childrenResult.success) {
        setAllChildren(childrenResult.data || []);
      }

      // Load recent requests for selected student only
      const requestsResult = await pickupService.getMyRequests({
        studentId: studentId,
        limit: 5
      });
      if (requestsResult.success) {
        setRecentRequests(requestsResult.data || []);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (selectedStudent) {
      loadData(selectedStudent.id);
    }
  };

  const handleQuickPickup = () => {
    if (selectedStudent) {
      navigation.navigate('CreatePickup', { childId: selectedStudent.id });
    }
  };

  const handleSwitchStudent = () => {
    navigation.navigate('StudentSelection');
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Сайн байна уу,</Text>
          <Text style={styles.userName}>{user?.fullName || 'Хэрэглэгч'}</Text>
        </View>
      </View>

      {/* Selected Student Card */}
      {selectedStudent && (
        <Card style={styles.selectedStudentCard}>
          <View style={styles.selectedStudentHeader}>
            <View style={styles.selectedStudentInfo}>
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {selectedStudent.firstName?.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.selectedStudentLabel}>Сонгогдсон хүүхэд</Text>
                <Text style={styles.selectedStudentName}>
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </Text>
                <Text style={styles.selectedStudentClass}>
                  {selectedStudent.class?.className || 'Анги тодорхойгүй'}
                </Text>
              </View>
            </View>
            {allChildren.length > 1 && (
              <TouchableOpacity
                style={styles.switchButton}
                onPress={handleSwitchStudent}
              >
                <Ionicons name="swap-horizontal" size={20} color="#3b82f6" />
                <Text style={styles.switchButtonText}>Солих</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      )}

      {/* Quick Action */}
      <Card style={styles.quickActionCard}>
        <Text style={styles.sectionTitle}>Хурдан үйлдэл</Text>
        <Text style={styles.sectionSubtitle}>
          Хүүхдээ одоо авахыг хүсвэл товчийг дарна уу
        </Text>
        <Button
          title="Хүүхэд авах"
          onPress={() => navigation.navigate('CreatePickup')}
          variant="primary"
          size="large"
          style={styles.quickButton}
        />
      </Card>

      {/* Statistics */}
      {selectedStudent && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статистик</Text>
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Ionicons name="time-outline" size={32} color="#3b82f6" />
              <Text style={styles.statNumber}>{recentRequests.length}</Text>
              <Text style={styles.statLabel}>Сүүлийн хүсэлт</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#10b981" />
              <Text style={styles.statNumber}>
                {recentRequests.filter(r => r.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Дууссан</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="hourglass-outline" size={32} color="#f59e0b" />
              <Text style={styles.statNumber}>
                {recentRequests.filter(r => r.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Хүлээгдэж буй</Text>
            </Card>
          </View>
        </View>
      )}

      {/* Recent Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Сүүлийн хүсэлтүүд</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAllText}>Бүгдийг харах</Text>
          </TouchableOpacity>
        </View>

        {recentRequests.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Хүсэлт байхгүй байна</Text>
          </Card>
        ) : (
          recentRequests.map((request) => (
            <Card key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestStudent}>
                  {request.student?.firstName} {request.student?.lastName}
                </Text>
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
              <Text style={styles.requestTime}>
                {new Date(request.scheduledPickupTime).toLocaleString('mn-MN')}
              </Text>
            </Card>
          ))
        )}
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  selectedStudentCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#eff6ff',
  },
  selectedStudentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedStudentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  studentAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  selectedStudentLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  selectedStudentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  selectedStudentClass: {
    fontSize: 14,
    color: '#6b7280',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    gap: 4,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  quickActionCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#3b82f6',
  },
  quickButton: {
    marginTop: 16,
    backgroundColor: '#ffffff',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  requestCard: {
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestStudent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
  requestTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default HomeScreen;
