import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    danId: '',
  });

  const handleLogin = async () => {
    if (!formData.danId.trim()) {
      Alert.alert('Алдаа', 'DAN ID-аа оруулна уу');
      return;
    }

    setLoading(true);
    try {
      const result = await login({
        danId: formData.danId,
        role: 'parent', // Mobile app is for parents only
      });

      if (!result.success) {
        Alert.alert('Алдаа', result.error || 'Нэвтрэх үед алдаа гарлаа');
      }
    } catch (error) {
      Alert.alert('Алдаа', 'Нэвтрэх үед алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>SPMS</Text>
          <Text style={styles.subtitle}>Сурагч авах удирдлагын систем</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Нэвтрэх</Text>

          <Input
            label="DAN ID"
            placeholder="Жишээ: parent001"
            value={formData.danId}
            onChangeText={(text) => setFormData({ ...formData, danId: text })}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            title="Нэвтрэх"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            size="large"
            style={styles.loginButton}
          />

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Туршилтын нэвтрэх мэдээлэл:</Text>
            <Text style={styles.demoText}>• parent001</Text>
            <Text style={styles.demoText}>• parent002</Text>
            <Text style={styles.demoText}>• parent003</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Бакалаврын судалгааны ажил - Д.Буянжаргал
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
  },
  demoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#1e3a8a',
    marginBottom: 4,
  },
  footer: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
  },
});

export default LoginScreen;
