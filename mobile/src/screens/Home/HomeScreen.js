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
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { pickupService } from '../../services/pickupService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load children
      const childrenResult = await studentService.getMyChildren();
      if (childrenResult.success) {
        setChildren(childrenResult.data || []);
      }

      // Load recent requests
      const requestsResult = await pickupService.getMyRequests({ limit: 5 });
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
    loadData();
  };

  const handleQuickPickup = (child) => {
    navigation.navigate('CreatePickup', { childId: child.id });
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
        <View>
          <Text style={styles.greeting}>Сайн байна уу,</Text>
          <Text style={styles.userName}>{user?.fullName || 'Хэрэглэгч'}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#111827" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

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

      {/* My Children */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Миний хүүхдүүд</Text>
        {children.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Хүүхдийн мэдээлэл байхгүй байна</Text>
          </Card>
        ) : (
          children.map((child) => (
            <Card key={child.id} style={styles.childCard}>
              <View style={styles.childHeader}>
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>
                    {child.firstName?.charAt(0)}
                  </Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>
                    {child.firstName} {child.lastName}
                  </Text>
                  <Text style={styles.childClass}>
                    {child.class?.className || 'Анги тодорхойгүй'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.pickupButton}
                  onPress={() => handleQuickPickup(child)}
                >
                  <Ionicons name="car-outline" size={24} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
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
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
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
  childCard: {
    marginBottom: 12,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  childAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  childClass: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  pickupButton: {
    padding: 8,
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
