import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

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
        </View>

        <Card>
          <Text style={styles.label}>DAN ID: {user?.danId}</Text>
          <Text style={styles.label}>Имэйл: {user?.email || 'N/A'}</Text>
        </Card>

        <Button title="Гарах" onPress={handleLogout} variant="danger" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 20, fontWeight: '600', color: '#111827' },
  label: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
});

export default ProfileScreen;
