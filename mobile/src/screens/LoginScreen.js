import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.authBg,
          justifyContent: 'center',
          padding: 24,
        },
        card: {
          backgroundColor: colors.authCard,
          borderRadius: 30,
          padding: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: colors.scheme === 'dark' ? 0.35 : 0.08,
          shadowRadius: 16,
          elevation: 8,
        },
        title: {
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.authTitle,
          textAlign: 'center',
          marginBottom: 24,
        },
        inputWrap: {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.authInputBorder,
          borderRadius: 14,
          marginBottom: 14,
        },
        inputError: { borderColor: '#ef4444' },
        inputIcon: { marginLeft: 14 },
        input: {
          flex: 1,
          paddingVertical: 14,
          paddingHorizontal: 12,
          fontSize: 16,
          color: colors.inputText,
        },
        inputFlex: { flex: 1 },
        passwordRow: {},
        eyeBtn: { padding: 14 },
        errorText: { color: '#ef4444', fontSize: 12, marginBottom: 8, marginTop: -6 },
        btn: {
          backgroundColor: colors.authButton,
          borderRadius: 14,
          padding: 16,
          marginTop: 8,
        },
        btnDisabled: { opacity: 0.6 },
        btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
        footer: { marginTop: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
        footerText: { color: colors.authPlaceholder, fontSize: 15 },
        footerLink: { color: colors.authLink, fontSize: 15, fontWeight: '600' },
      }),
    [colors]
  );

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email обязателен';
    if (!formData.password) newErrors.password = 'Пароль обязателен';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
        login();
      } else {
        setErrors({ submit: response.message || 'Произошла ошибка' });
      }
    } catch {
      setErrors({ submit: 'Ошибка подключения к серверу' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity
        onPress={toggleTheme}
        style={{ position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 }}
        accessibilityLabel={isDark ? 'Светлая тема' : 'Тёмная тема'}
      >
        <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={26} color={colors.authLink} />
      </TouchableOpacity>
      <View style={styles.card}>
        <Text style={styles.title}>ВХОД</Text>

        <View style={[styles.inputWrap, errors.email && styles.inputError]}>
          <Ionicons name="mail-outline" size={22} color={colors.authPlaceholder} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Введите ваш email"
            placeholderTextColor={colors.authPlaceholder}
            value={formData.email}
            onChangeText={(v) => handleChange('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <View style={[styles.inputWrap, styles.passwordRow, errors.password && styles.inputError]}>
          <Ionicons name="lock-closed-outline" size={22} color={colors.authPlaceholder} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputFlex]}
            placeholder="Введите пароль"
            placeholderTextColor={colors.authPlaceholder}
            value={formData.password}
            onChangeText={(v) => handleChange('password', v)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.authPlaceholder}
            />
          </TouchableOpacity>
        </View>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        {errors.submit ? <Text style={styles.errorText}>{errors.submit}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? 'Загрузка...' : 'Войти'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.footer}>
          <Text style={styles.footerText}>Нет аккаунта? </Text>
          <Text style={styles.footerLink}>Зарегистрируйтесь</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
