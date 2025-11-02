import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import storage from '../../utils/storage';
import { studentService } from '../../services/studentService';
import Card from '../../components/common/Card';

const StudentSelectionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    setLoading(true);
    try {
      const result = await studentService.getMyChildren();
      if (result.success) {
        setChildren(result.data || []);

        // If only one child, auto-select and proceed
        if (result.data?.length === 1) {
          await selectStudent(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Load children error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = async (student) => {
    try {
      // Store selected student
      await storage.setItem('selectedStudent', JSON.stringify(student));

      // Navigate to home
      navigation.replace('Home');
    } catch (error) {
      console.error('Select student error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Ачааллаж байна...</Text>
      </View>
    );
  }

  if (children.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Хүүхэд олдсонгүй</Text>
          <Text style={styles.emptyText}>
            Танд холбогдсон хүүхдийн мэдээлэл байхгүй байна. Системийн админтай холбогдоно уу.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={40} color="#3b82f6" />
          </View>
          <Text style={styles.title}>Хүүхдээ сонгоно уу</Text>
          <Text style={styles.subtitle}>
            Та өөрийн хүүхдээ сонгосноор түүний мэдээлэл, авах түүхийг харах боломжтой
          </Text>
        </View>

        {children.map((child) => (
          <TouchableOpacity
            key={child.id}
            onPress={() => selectStudent(child)}
            activeOpacity={0.7}
          >
            <Card style={styles.studentCard}>
              <View style={styles.studentContent}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {child.firstName?.charAt(0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {child.firstName} {child.lastName}
                  </Text>
                  <View style={styles.studentDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="school-outline" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>
                        {child.class?.className || 'Анги тодорхойгүй'}
                      </Text>
                    </View>
                    {child.class?.teacher && (
                      <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={16} color="#6b7280" />
                        <Text style={styles.detailText}>
                          Багш: {child.class.teacher.fullName}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Та дараа дахин өөр хүүхдээ сонгохыг хүсвэл профайл хэсгээс солих боломжтой
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  studentCard: {
    marginBottom: 16,
    padding: 0,
  },
  studentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  studentDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StudentSelectionScreen;
