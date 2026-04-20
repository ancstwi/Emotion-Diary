import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { entriesAPI } from '../api';
import { getEmojiForEmotion } from '../constants/emotions';
import { usePeriodPicker } from '../context/PeriodPickerContext';
import { useTheme } from '../context/ThemeContext';
import SmoothBottomSheetModal from '../components/SmoothBottomSheetModal';

function buildListStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.listBg },
    container: { flex: 1, backgroundColor: colors.listBg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.listBg },
    loadingText: { fontSize: 18, color: colors.listText },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 2,
    },
    headerSide: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    searchRow: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
    searchInput: {
      flex: 1,
      backgroundColor: colors.listCard,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.listText,
    },
    catsRow: { alignItems: 'center', paddingTop: 0, paddingBottom: 4, marginTop: -14 },
    catsImg: { height: 160, width: 340 },
    list: { paddingHorizontal: 20, paddingBottom: 120 },
    yearBlock: { marginBottom: 16 },
    yearText: { fontSize: 18, fontWeight: 'bold', color: colors.listYear, marginBottom: 14, paddingLeft: 4 },
    card: {
      backgroundColor: colors.listCard,
      borderRadius: 20,
      padding: 18,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: colors.cardShadowOpacity,
      shadowRadius: 10,
      elevation: 4,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    date: { fontSize: 17, fontWeight: '600', color: colors.listText },
    emojis: { flexDirection: 'row', gap: 4 },
    emoji: { fontSize: 20 },
    situation: { fontSize: 17, fontWeight: 'bold', color: colors.listText, marginBottom: 4 },
    thoughts: { fontSize: 15, color: colors.listText, opacity: 0.9 },
    editBtn: { position: 'absolute', right: 14, bottom: 14 },
    emptyWrap: { flex: 1, paddingHorizontal: 24, paddingTop: 8, alignItems: 'center', justifyContent: 'center' },
    emptyCard: {
      backgroundColor: colors.welcomeCard,
      borderRadius: 28,
      padding: 28,
      paddingBottom: 32,
      alignItems: 'center',
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: colors.cardShadowOpacity,
      shadowRadius: 16,
      elevation: 6,
    },
    speechTail: {
      width: 0,
      height: 0,
      borderLeftWidth: 16,
      borderRightWidth: 16,
      borderTopWidth: 14,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: colors.welcomeCard,
      marginTop: -1,
    },
    handsWrap: {
      backgroundColor: colors.handsCircleBg,
      borderRadius: 80,
      padding: 24,
      marginVertical: 20,
    },
    handsImg: { height: 90, width: 140 },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.welcomeTitle,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyDesc: {
      fontSize: 15,
      color: colors.welcomeText,
      lineHeight: 22,
      textAlign: 'center',
    },
    errorText: { color: '#ef4444', textAlign: 'center', padding: 20, fontSize: 15 },
    modalContent: {
      backgroundColor: colors.modalContentBg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.listText },
    modalCloseBtn: { padding: 4 },
    modalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: colors.listBg,
      borderRadius: 12,
      marginBottom: 12,
    },
    modalLabel: { fontSize: 16, color: colors.listText },
    modalValue: { fontSize: 16, color: colors.listYear, fontWeight: '500' },
    modalDone: { marginTop: 12, padding: 12, alignItems: 'center' },
    modalDoneText: { fontSize: 16, color: colors.listAccent, fontWeight: '600' },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
    modalBtnSecondary: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: colors.listCard, alignItems: 'center' },
    modalBtnSecondaryText: { fontSize: 16, fontWeight: '600', color: colors.listText },
    modalBtnPrimary: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: colors.listAccent, alignItems: 'center' },
    modalBtnPrimaryText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  });
}

function EntryCard({ entry, onPress, styles, colors }) {
  const formatDate = (s) => new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const emotions = entry.emotions || [];

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(entry.id)} activeOpacity={0.9}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
        <View style={styles.emojis}>
          {emotions.slice(0, 5).map((e, i) => (
            <Text key={i} style={styles.emoji}>
              {getEmojiForEmotion(e.emotion_name || e.name)}
            </Text>
          ))}
          {emotions.length === 0 && <Text style={styles.emoji}>😐</Text>}
        </View>
      </View>
      <Text style={styles.situation}>{entry.situation}</Text>
      <Text style={styles.thoughts} numberOfLines={1}>
        {entry.thoughts}
      </Text>
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => onPress(entry.id)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="pencil" size={20} color={colors.listText} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const formatPeriodDate = (d) => (d ? d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export default function EntriesListScreen({ navigation }) {
  const { logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => buildListStyles(colors), [colors]);
  const { register } = usePeriodPicker();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [pickerMode, setPickerMode] = useState(null);

  const loadEntries = useCallback(async () => {
    try {
      const res = await entriesAPI.getAll();
      setEntries(res.entries || []);
      setError('');
    } catch (err) {
      setError('Ошибка при загрузке записей');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  useEffect(() => {
    register(() => setPeriodModalVisible(true));
    return () => register(null);
  }, [register]);

  const filteredEntries = entries.filter((entry) => {
    const d = new Date(entry.created_at);
    if (dateFrom && d < new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate())) return false;
    if (dateTo) {
      const toEnd = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate(), 23, 59, 59);
      if (d > toEnd) return false;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const text = [entry.situation, entry.thoughts, ...(entry.emotions || []).map((e) => e.emotion_name || e.name)]
      .join(' ')
      .toLowerCase();
    return text.includes(q);
  });

  const groupedByYear = filteredEntries.reduce((acc, entry) => {
    const year = new Date(entry.created_at).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(entry);
    return acc;
  }, {});
  const years = Object.keys(groupedByYear).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

  const handleMenuPress = () => {
    Alert.alert('Выход', 'Выйти из аккаунта?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: logout },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.yearBlock}>
      <Text style={styles.yearText}>{item.year}</Text>
      {item.entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          styles={styles}
          colors={colors}
          onPress={(id) => navigation.navigate('EntryDetail', { id })}
        />
      ))}
    </View>
  );

  const data = years.map((year) => ({ year, entries: groupedByYear[year], key: year }));

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleMenuPress} style={styles.iconBtn}>
            <Ionicons name="menu" size={26} color={colors.listText} />
          </TouchableOpacity>
          {searchOpen ? (
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Поиск..."
                placeholderTextColor={colors.listYear}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity onPress={() => setSearchOpen(false)} style={styles.iconBtn}>
                <Ionicons name="close" size={24} color={colors.listText} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.headerSide, { flex: 1, justifyContent: 'flex-end' }]}>
              <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn} accessibilityLabel={isDark ? 'Светлая тема' : 'Тёмная тема'}>
                <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={24} color={colors.listAccent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSearchOpen(true)} style={styles.iconBtn}>
                <Ionicons name="search" size={26} color={colors.listText} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!searchOpen && (
          <View style={styles.catsRow}>
            <Image source={require('../../assets/cats-illustration.png')} style={styles.catsImg} resizeMode="contain" />
          </View>
        )}

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredEntries.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyCard}>
              {entries.length === 0 ? (
                <>
                  <Text style={styles.emptyTitle}>Добро пожаловать в дневник эмоций!</Text>
                  <View style={styles.handsWrap}>
                    <Image source={require('../../assets/hands-writing.png')} style={styles.handsImg} resizeMode="contain" />
                  </View>
                  <Text style={styles.emptyDesc}>
                    Отслеживай ситуации, мысли и эмоции, чтобы понимать свои реакции и управлять ими по модели ABC. Каждая запись помогает лучше осознавать свои состояния и развивать навыки саморегуляции.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.emptyTitle}>Нет записей по запросу</Text>
                  <Text style={styles.emptyDesc}>Измените поиск</Text>
                </>
              )}
            </View>
            {entries.length === 0 && <View style={styles.speechTail} />}
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadEntries();
                }}
                colors={[colors.listAccent]}
                tintColor={colors.listAccent}
              />
            }
          />
        )}

        <SmoothBottomSheetModal
          visible={periodModalVisible}
          onRequestClose={() => setPeriodModalVisible(false)}
          statusBarTranslucent
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Выберите период</Text>
              <TouchableOpacity onPress={() => setPeriodModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={26} color={colors.listYear} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalRow} onPress={() => setPickerMode('from')}>
              <Text style={styles.modalLabel}>Дата с</Text>
              <Text style={styles.modalValue}>{formatPeriodDate(dateFrom) || 'Не выбрано'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalRow} onPress={() => setPickerMode('to')}>
              <Text style={styles.modalLabel}>Дата по</Text>
              <Text style={styles.modalValue}>{formatPeriodDate(dateTo) || 'Не выбрано'}</Text>
            </TouchableOpacity>
            {pickerMode && (
              <DateTimePicker
                value={pickerMode === 'from' ? (dateFrom || new Date()) : (dateTo || new Date())}
                mode="date"
                locale="ru-RU"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, selectedDate) => {
                  if (Platform.OS === 'android') setPickerMode(null);
                  if (selectedDate) {
                    pickerMode === 'from' ? setDateFrom(selectedDate) : setDateTo(selectedDate);
                  }
                }}
              />
            )}
            {Platform.OS === 'ios' && pickerMode && (
              <TouchableOpacity onPress={() => setPickerMode(null)} style={styles.modalDone}>
                <Text style={styles.modalDoneText}>Готово</Text>
              </TouchableOpacity>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => {
                  setDateFrom(null);
                  setDateTo(null);
                  setPeriodModalVisible(false);
                }}
              >
                <Text style={styles.modalBtnSecondaryText}>Сбросить</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={() => setPeriodModalVisible(false)}>
                <Text style={styles.modalBtnPrimaryText}>Применить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SmoothBottomSheetModal>
      </View>
    </SafeAreaView>
  );
}
