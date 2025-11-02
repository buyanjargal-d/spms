import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import storage from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allChildren, setAllChildren] = useState([]);

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
    try {
      // Load selected student
      const studentData = await storage.getItem('selectedStudent');
      if (studentData) {
        setSelectedStudent(JSON.parse(studentData));
      }

      // Load all children
      const result = await studentService.getMyChildren();
      if (result.success) {
        setAllChildren(result.data || []);
      }
    } catch (error) {
      console.error('Load profile data error:', error);
    }
  };

  const handleSwitchStudent = () => {
    navigation.navigate('StudentSelection');
  };

  const handleLogout = () => {
    Alert.alert('Гарах', 'Та системээс гарахдаа итгэлтэй байна уу?', [
      { text: 'Үгүй', style: 'cancel' },
      { text: 'Тийм', onPress: () => logout(), style: 'destructive' },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.fullName || 'User'}</Text>
          <Text style={styles.role}>Эцэг эх</Text>
        </View>

        {/* Account Info */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Хувийн мэдээлэл</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DAN ID:</Text>
            <Text style={styles.infoValue}>{user?.danId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Утас:</Text>
            <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Имэйл:</Text>
            <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
          </View>
        </Card>

        {/* Selected Student */}
        {selectedStudent && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="school-outline" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Сонгогдсон хүүхэд</Text>
            </View>
            <View style={styles.studentInfoCard}>
              <View style={styles.studentAvatarSmall}>
                <Text style={styles.studentAvatarTextSmall}>
                  {selectedStudent.firstName?.charAt(0)}
                </Text>
              </View>
              <View style={styles.studentInfoText}>
                <Text style={styles.studentInfoName}>
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </Text>
                <Text style={styles.studentInfoClass}>
                  {selectedStudent.class?.className || 'Анги тодорхойгүй'}
                </Text>
              </View>
            </View>
            {allChildren.length > 1 && (
              <Button
                title="Хүүхэд солих"
                onPress={handleSwitchStudent}
                variant="outline"
                size="small"
                style={styles.switchButton}
              />
            )}
          </Card>
        )}

        {/* All Children */}
        {allChildren.length > 1 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>
                Бүх хүүхдүүд ({allChildren.length})
              </Text>
            </View>
            {allChildren.map((child) => (
              <View key={child.id} style={styles.childItem}>
                <View style={styles.childItemLeft}>
                  <View style={styles.childAvatarTiny}>
                    <Text style={styles.childAvatarTinyText}>
                      {child.firstName?.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.childItemName}>
                      {child.firstName} {child.lastName}
                    </Text>
                    <Text style={styles.childItemClass}>
                      {child.class?.className}
                    </Text>
                  </View>
                </View>
                {selectedStudent?.id === child.id && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Идэвхтэй</Text>
                  </View>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Гарах"
            onPress={handleLogout}
            variant="danger"
            size="large"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 4 },
  role: { fontSize: 14, color: '#6b7280' },
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: { fontSize: 14, color: '#6b7280' },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  studentInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
  },
  studentAvatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  studentAvatarTextSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  studentInfoText: { flex: 1 },
  studentInfoName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 },
  studentInfoClass: { fontSize: 14, color: '#6b7280' },
  switchButton: { marginTop: 8 },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  childItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  childAvatarTiny: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  childAvatarTinyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  childItemName: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 2 },
  childItemClass: { fontSize: 12, color: '#6b7280' },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#d1fae5',
    borderRadius: 6,
  },
  activeBadgeText: { fontSize: 12, fontWeight: '600', color: '#059669' },
  actionsSection: { marginTop: 16, marginBottom: 32 },
});

export default ProfileScreen;
