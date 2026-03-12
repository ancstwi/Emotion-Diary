import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { entriesAPI, emotionsAPI } from '../api';
import { EMOTIONS_LIST } from '../constants/emotions';
import { HEADER_SAFE_EXTRA } from '../constants/layout';
import { MOTION } from '../constants/motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import SmoothBottomSheetModal from '../components/SmoothBottomSheetModal';

const FORM_FIELD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 2,
};

function buildStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.screenBg },
    headerBar: {
      position: 'relative',
      paddingBottom: 8,
      paddingHorizontal: 6,
    },
    headerRow: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
    },
    headerRowSpacer: { flex: 1 },
    headerBackBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      zIndex: 3,
    },
    headerSideLeft: { alignItems: 'flex-start', paddingLeft: 2 },
    headerSaveBtn: {
      paddingVertical: 8,
      paddingLeft: 12,
      paddingRight: 12,
      justifyContent: 'center',
      minWidth: 96,
      alignItems: 'flex-end',
      zIndex: 3,
    },
    headerTextBtnPressed: { opacity: 0.55 },
    headerTitleWrap: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      maxWidth: '72%',
    },
    saveText: { fontSize: 16, fontWeight: '600', color: colors.accent },
    saveDisabled: { opacity: 0.5 },
    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    block: { marginBottom: 24 },
    label: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 8 },
    input: {
      backgroundColor: colors.fieldBg,
      borderRadius: 20,
      padding: 14,
      fontSize: 16,
      color: colors.text,
      borderWidth: 0,
      ...FORM_FIELD_SHADOW,
    },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    emotionRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 },
    pickerBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.fieldBg,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 0,
      ...FORM_FIELD_SHADOW,
    },
    pickerBtnText: { fontSize: 16, color: colors.text },
    addBtn: { backgroundColor: colors.accent, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 20 },
    addBtnPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
    intensityLabel: { fontSize: 12, color: colors.placeholder, marginTop: 12, marginBottom: 4 },
    slider: { width: '100%', height: 40 },
    emotionTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.tagChipBg,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 14,
    },
    tagText: { fontSize: 14, color: colors.text, marginRight: 6 },
    tagClose: { fontSize: 18, color: '#ef4444', fontWeight: 'bold' },
    modalSheet: {
      backgroundColor: colors.pickerSheetBg,
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      paddingTop: 8,
      paddingBottom: Platform.OS === 'ios' ? 34 : 20,
      paddingHorizontal: 10,
    },
    modalGrabber: {
      width: 36,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.pickerGrabber,
      alignSelf: 'center',
      marginBottom: 10,
    },
    modalSheetTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.pickerTitle,
      textAlign: 'center',
      marginBottom: 10,
      letterSpacing: 0.2,
    },
    modalListCard: {
      backgroundColor: colors.pickerItemBg,
      borderRadius: 14,
      overflow: 'hidden',
      maxHeight: 340,
      marginBottom: 10,
    },
    modalFlatList: { maxHeight: 340 },
    pickerItem: {
      paddingVertical: 16,
      paddingHorizontal: 18,
      backgroundColor: colors.pickerItemBg,
    },
    pickerItemBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.pickerSeparator,
    },
    pickerItemText: { fontSize: 17, color: colors.pickerItemText, textAlign: 'center' },
    modalCancelBtn: {
      backgroundColor: colors.pickerCancelBg,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    modalCancelText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.pickerCancelText,
    },
    errorText: { color: '#ef4444', fontSize: 12, marginTop: 8 },
  });
}

const emptyForm = () => ({
  situation: '',
  thoughts: '',
  entryDate: new Date(),
  bodyReaction: '',
  behaviorReaction: '',
  emotionName: 'Оптимизм',
  emotionIntensity: 5,
  emotions: [],
});

function formatEntryDate(value) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function toSafeIsoDate(value) {
  const d = new Date(value);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function EmotionTagChip({ styles, name, intensity, onRemove }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: MOTION.chipFadeMs,
        easing: MOTION.easingStandard,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        ...MOTION.springChip,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View style={[styles.tag, { opacity, transform: [{ scale }] }]}>
      <Text style={styles.tagText}>
        {name} {intensity}/10
      </Text>
      <TouchableOpacity onPress={onRemove} hitSlop={12} accessibilityLabel={`Удалить ${name}`}>
        <Text style={styles.tagClose}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function InputBlock({ styles, colors, label, value, onChangeText, placeholder, multiline }) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

export default function EntryFormScreen({ navigation, route }) {
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const sliderMaxTrack = colors.scheme === 'dark' ? 'rgba(126, 179, 235, 0.28)' : 'rgba(84, 162, 242, 0.28)';

  const editEntry = route.params?.editEntry;
  const isEdit = Boolean(editEntry?.id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [emotionCatalog, setEmotionCatalog] = useState(EMOTIONS_LIST);

  useEffect(() => {
    AsyncStorage.getItem('authToken').then((token) => {
      if (!token) logout();
    });
  }, [logout]);

  useEffect(() => {
    emotionsAPI
      .getList()
      .then((res) => {
        const list = Array.isArray(res?.emotions) ? res.emotions : [];
        if (list.length > 0) {
          setEmotionCatalog(list);
          setFormData((prev) => {
            const hasCurrent = list.some((e) => e.name === prev.emotionName);
            if (hasCurrent) return prev;
            return { ...prev, emotionName: list[0].name };
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    if (!editEntry?.id) return;
    const raw = editEntry.emotions || [];
    const emotions = raw.filter(Boolean).map((e) => ({
      name: e.name || e.emotion_name,
      intensity: Number(e.intensity) || 5,
    }));
    const first = emotions[0];
    setFormData({
      situation: editEntry.situation ?? '',
      thoughts: editEntry.thoughts ?? '',
      entryDate: editEntry.created_at ? new Date(editEntry.created_at) : new Date(),
      bodyReaction: editEntry.body_reaction ?? '',
      behaviorReaction: editEntry.behavior_reaction ?? '',
      emotionName: first?.name || 'Оптимизм',
      emotionIntensity: first?.intensity ?? 5,
      emotions,
    });
  }, [editEntry?.id]);

  const addEmotion = () => {
    setError('');
    setFormData((prev) => {
      const name = prev.emotionName;
      if (!name || prev.emotions.find((e) => e.name === name)) return prev;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      return {
        ...prev,
        emotions: [...prev.emotions, { name, intensity: prev.emotionIntensity }],
      };
    });
  };

  const removeEmotion = (name) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setFormData((prev) => ({
      ...prev,
      emotions: prev.emotions.filter((e) => e.name !== name),
    }));
  };

  const buildEmotionPayload = () =>
    formData.emotions
      .map((emotion) => {
        const normalizedName = String(emotion.name || '').trim().toLowerCase();
        const obj = emotionCatalog.find(
          (e) => String(e.name || '').trim().toLowerCase() === normalizedName
        );
        return obj ? { emotion_id: obj.id, intensity: emotion.intensity } : null;
      })
      .filter(Boolean);

  const handleSubmit = async () => {
    if (!formData.situation || !formData.thoughts || !formData.bodyReaction || !formData.behaviorReaction) {
      setError('Заполните все поля');
      return;
    }
    if (formData.emotions.length === 0) {
      setError('Добавьте хотя бы одну эмоцию');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const emotionsPayload = buildEmotionPayload();
      if (emotionsPayload.length === 0) {
        setError('Не удалось сопоставить эмоции');
        return;
      }

      if (isEdit) {
        await entriesAPI.update(editEntry.id, {
          situation: formData.situation,
          thoughts: formData.thoughts,
          created_at: toSafeIsoDate(formData.entryDate),
          body_reaction: formData.bodyReaction,
          behavior_reaction: formData.behaviorReaction,
          emotions: emotionsPayload,
        });
        Alert.alert('Готово', 'Запись обновлена');
        navigation.navigate('EntryDetail', { id: editEntry.id });
        return;
      }

      const entryRes = await entriesAPI.create({
        situation: formData.situation,
        thoughts: formData.thoughts,
        created_at: toSafeIsoDate(formData.entryDate),
        body_reaction: formData.bodyReaction,
        behavior_reaction: formData.behaviorReaction,
      });
      const entryId = entryRes.id;
      for (const row of emotionsPayload) {
        await emotionsAPI.addToEntry({ entry_id: entryId, emotion_id: row.emotion_id, intensity: row.intensity });
      }
      Alert.alert('Готово', 'Запись сохранена');
      navigation.navigate('Tabs', { screen: 'Home' });
    } catch (err) {
      setError('Ошибка: ' + (err.message || 'не удалось сохранить'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + HEADER_SAFE_EXTRA,
            backgroundColor: colors.fieldBg,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.headerBackBtn, styles.headerSideLeft]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Назад"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerRowSpacer} />
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={({ pressed }) => [
              styles.headerSaveBtn,
              pressed && !loading && styles.headerTextBtnPressed,
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Сохранить"
          >
            <Text style={[styles.saveText, loading && styles.saveDisabled]} numberOfLines={1}>
              {loading ? '…' : 'Сохранить'}
            </Text>
          </Pressable>
          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              {isEdit ? 'Редактирование' : 'Новая запись'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(40, insets.bottom + 28) }]}
        keyboardShouldPersistTaps="handled"
      >
        <InputBlock
          styles={styles}
          colors={colors}
          label="Ситуация"
          value={formData.situation}
          onChangeText={(v) => setFormData((prev) => ({ ...prev, situation: v }))}
          placeholder="Что произошло?"
          multiline
        />
        <InputBlock
          styles={styles}
          colors={colors}
          label="Мысли"
          value={formData.thoughts}
          onChangeText={(v) => setFormData((prev) => ({ ...prev, thoughts: v }))}
          placeholder="Какие мысли пришли?"
          multiline
        />

        <View style={styles.block}>
          <Text style={styles.label}>Дата записи</Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setDatePickerVisible((prev) => !prev)}
            activeOpacity={0.85}
          >
            <Text style={styles.pickerBtnText}>{formatEntryDate(formData.entryDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          {datePickerVisible ? (
            <View style={{ marginTop: 10 }}>
              <DateTimePicker
                value={formData.entryDate || new Date()}
                mode="date"
                locale="ru-RU"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') setDatePickerVisible(false);
                  if (selectedDate) {
                    setFormData((prev) => ({ ...prev, entryDate: selectedDate }));
                  }
                }}
              />
              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setDatePickerVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Готово</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Эмоции</Text>
          <View style={styles.emotionRow}>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setPickerOpen(true)}>
              <Text style={styles.pickerBtnText}>{formData.emotionName}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.text} />
            </TouchableOpacity>
            <Pressable
              style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
              onPress={addEmotion}
              android_ripple={{ color: 'rgba(255,255,255,0.22)', borderless: false }}
            >
              <Text style={styles.addBtnText}>Добавить</Text>
            </Pressable>
          </View>
          <SmoothBottomSheetModal visible={pickerOpen} onRequestClose={() => setPickerOpen(false)}>
            <View style={styles.modalSheet}>
              <View style={styles.modalGrabber} />
              <Text style={styles.modalSheetTitle}>Выберите эмоцию</Text>
              <View style={styles.modalListCard}>
                <FlatList
                  data={emotionCatalog}
                  keyExtractor={(item) => String(item.id)}
                  showsVerticalScrollIndicator={false}
                  style={styles.modalFlatList}
                  nestedScrollEnabled
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        index < emotionCatalog.length - 1 && styles.pickerItemBorder,
                      ]}
                      onPress={() => {
                        setFormData((prev) => ({ ...prev, emotionName: item.name }));
                        setPickerOpen(false);
                      }}
                      activeOpacity={0.55}
                    >
                      <Text style={styles.pickerItemText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPickerOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </SmoothBottomSheetModal>
          <Text style={styles.intensityLabel}>Интенсивность {formData.emotionIntensity}/10</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={formData.emotionIntensity}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, emotionIntensity: Math.round(v) }))}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={sliderMaxTrack}
            thumbTintColor={colors.accent}
          />
          <View style={styles.emotionTags}>
            {formData.emotions.map((e) => (
              <EmotionTagChip
                key={e.name}
                styles={styles}
                name={e.name}
                intensity={e.intensity}
                onRemove={() => removeEmotion(e.name)}
              />
            ))}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <InputBlock
          styles={styles}
          colors={colors}
          label="Реакция (тело)"
          value={formData.bodyReaction}
          onChangeText={(v) => setFormData((prev) => ({ ...prev, bodyReaction: v }))}
          placeholder="Ощущения в теле?"
          multiline
        />
        <InputBlock
          styles={styles}
          colors={colors}
          label="Реакция (поведение)"
          value={formData.behaviorReaction}
          onChangeText={(v) => setFormData((prev) => ({ ...prev, behaviorReaction: v }))}
          placeholder="Что вы сделали?"
          multiline
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
