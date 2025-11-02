import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import storage from '../../utils/storage';
import { studentService } from '../../services/studentService';
import { pickupService } from '../../services/pickupService';
import { locationService } from '../../services/locationService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const CreatePickupScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationChecking, setLocationChecking] = useState(false);
  const [notes, setNotes] = useState('');
  const [requestType, setRequestType] = useState('standard'); // 'standard' or 'guest'
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    phone: '',
    idNumber: '',
  });

  useEffect(() => {
    loadChildren();
    checkLocation();
  }, []);

  const loadChildren = async () => {
    const result = await studentService.getMyChildren();
    if (result.success) {
      setChildren(result.data || []);

      // Pre-select child if passed from previous screen
      if (route.params?.childId) {
        const child = result.data.find(c => c.id === route.params.childId);
        if (child) {
          setSelectedChild(child);
        }
      } else {
        // Try to load selected student from storage
        try {
          const studentData = await storage.getItem('selectedStudent');
          if (studentData) {
            const student = JSON.parse(studentData);
            const child = result.data.find(c => c.id === student.id);
            if (child) {
              setSelectedChild(child);
            }
          }
        } catch (error) {
          console.error('Load selected student error:', error);
        }
      }
    }
  };

  const checkLocation = async () => {
    setLocationChecking(true);
    const result = await locationService.getCurrentLocation();
    
    if (result.success) {
      setLocation(result.data);
      
      // Check if within school radius (example coordinates)
      const schoolLat = 47.9186;
      const schoolLon = 106.9178;
      const check = locationService.isWithinSchoolRadius(
        result.data.latitude,
        result.data.longitude,
        schoolLat,
        schoolLon
      );
      
      if (!check.isWithin) {
        Alert.alert(
          'Анхааруулга',
          `Та сургуулиас ${check.distance}м зайтай байна. Сургуулийн хүрээнд байх шаардлагатай.`,
          [{ text: 'OK' }]
        );
      }
    } else {
      Alert.alert('Алдаа', result.error);
    }
    setLocationChecking(false);
  };

  const handleSubmit = async () => {
    if (!selectedChild) {
      Alert.alert('Анхааруулга', 'Хүүхдээ сонгоно уу');
      return;
    }

    if (!location) {
      Alert.alert('Анхааруулга', 'Байршлын мэдээлэл олдсонгүй');
      return;
    }

    // Validate guest info if guest pickup
    if (requestType === 'guest') {
      if (!guestInfo.name.trim()) {
        Alert.alert('Анхааруулга', 'Зочин хүний нэрийг оруулна уу');
        return;
      }
      if (!guestInfo.phone.trim()) {
        Alert.alert('Анхааруулга', 'Зочин хүний утасны дугаарыг оруулна уу');
        return;
      }
      if (!guestInfo.idNumber.trim()) {
        Alert.alert('Анхааруулга', 'Зочин хүний РД-г оруулна уу');
        return;
      }
    }

    setLoading(true);
    try {
      const data = {
        studentId: selectedChild.id,
        requestType: requestType,
        scheduledPickupTime: new Date().toISOString(),
        requestLocationLat: location.latitude,
        requestLocationLng: location.longitude,
        notes: notes.trim(),
        // Guest pickup fields
        ...(requestType === 'guest' && {
          guestName: guestInfo.name.trim(),
          guestPhone: guestInfo.phone.trim(),
          guestIdNumber: guestInfo.idNumber.trim(),
        }),
      };

      const result = await pickupService.createRequest(data);

      if (result.success) {
        const message = requestType === 'guest'
          ? 'Зочин хүний хүсэлт илгээгдлээ. Эцэг эх баталгаажуулна.'
          : 'Хүсэлт амжилттай илгээгдлээ. Багш баталгаажуулна.';

        Alert.alert('Амжилттай', message, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]);
      } else {
        Alert.alert('Алдаа', result.error);
      }
    } catch (error) {
      Alert.alert('Алдаа', 'Хүсэлт илгээхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Request Type Selection */}
        <Card>
          <Text style={styles.sectionTitle}>Хүсэлтийн төрөл</Text>
          <View style={styles.requestTypeContainer}>
            <Button
              title="Энгийн"
              onPress={() => setRequestType('standard')}
              variant={requestType === 'standard' ? 'primary' : 'secondary'}
              style={styles.requestTypeButton}
            />
            <Button
              title="Зочин хүн"
              onPress={() => setRequestType('guest')}
              variant={requestType === 'guest' ? 'primary' : 'secondary'}
              style={styles.requestTypeButton}
            />
          </View>
          {requestType === 'guest' && (
            <Text style={styles.guestInfoText}>
              Зочин хүн хүүхдээ авах бол эцэг эхийн баталгаажуулалт шаардлагатай
            </Text>
          )}
        </Card>

        {/* Location Status */}
        <Card>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={24} color="#3b82f6" />
            <Text style={styles.locationTitle}>Байршил</Text>
          </View>
          
          {locationChecking ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator color="#3b82f6" />
              <Text style={styles.locationLoadingText}>
                Байршил шалгаж байна...
              </Text>
            </View>
          ) : location ? (
            <View>
              <Text style={styles.locationText}>
                ✓ Байршил баталгаажлаа
              </Text>
              <Text style={styles.locationCoords}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </View>
          ) : (
            <Text style={styles.locationError}>
              Байршил олдсонгүй
            </Text>
          )}
          
          <Button
            title="Байршил шалгах"
            onPress={checkLocation}
            variant="outline"
            size="small"
            style={styles.refreshButton}
          />
        </Card>

        {/* Select Child */}
        <Card>
          <Text style={styles.sectionTitle}>Хүүхдээ сонгох</Text>
          {children.map((child) => (
            <Button
              key={child.id}
              title={`${child.firstName} ${child.lastName} - ${child.class?.className}`}
              onPress={() => setSelectedChild(child)}
              variant={selectedChild?.id === child.id ? 'primary' : 'secondary'}
              style={styles.childButton}
            />
          ))}
        </Card>

        {/* Guest Information */}
        {requestType === 'guest' && (
          <Card>
            <Text style={styles.sectionTitle}>Зочин хүний мэдээлэл</Text>
            <Input
              label="Овог нэр"
              placeholder="Жишээ: Б.Дорж"
              value={guestInfo.name}
              onChangeText={(text) => setGuestInfo({ ...guestInfo, name: text })}
            />
            <Input
              label="Утасны дугаар"
              placeholder="99119911"
              value={guestInfo.phone}
              onChangeText={(text) => setGuestInfo({ ...guestInfo, phone: text })}
              keyboardType="phone-pad"
            />
            <Input
              label="Регистрийн дугаар"
              placeholder="УА12345678"
              value={guestInfo.idNumber}
              onChangeText={(text) => setGuestInfo({ ...guestInfo, idNumber: text })}
              autoCapitalize="characters"
            />
          </Card>
        )}

        {/* Notes */}
        <Card>
          <Input
            label="Тэмдэглэл (заавал биш)"
            placeholder="Нэмэлт мэдээлэл..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </Card>

        {/* Submit Button */}
        <Button
          title="Хүсэлт илгээх"
          onPress={handleSubmit}
          loading={loading}
          disabled={!selectedChild || !location}
          variant="primary"
          size="large"
          style={styles.submitButton}
        />
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLoadingText: {
    marginLeft: 12,
    color: '#6b7280',
  },
  locationText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  locationCoords: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  locationError: {
    fontSize: 14,
    color: '#ef4444',
  },
  refreshButton: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  childButton: {
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  requestTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  requestTypeButton: {
    flex: 1,
  },
  guestInfoText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default CreatePickupScreen;
