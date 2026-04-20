import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { entriesAPI, insightsAPI } from '../api';
import { HEADER_SAFE_EXTRA } from '../constants/layout';
import { useTheme } from '../context/ThemeContext';
import FormattedAnalysisText from '../components/FormattedAnalysisText';

function buildStyles(colors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.screenBg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 17, color: colors.text },
    headerSheet: {
      paddingBottom: 10,
      paddingHorizontal: 12,
    },
    headerRow: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
    },
    headerRowSpacer: { flex: 1 },
    headerEdge: {
      minWidth: 44,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerEdgeRight: { justifyContent: 'flex-end', minWidth: 44 },
    headerEdgeZ: { zIndex: 3 },
    headerTap: { paddingVertical: 8, paddingHorizontal: 4 },
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
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    card: {
      backgroundColor: colors.fieldBg,
      borderRadius: 22,
      padding: 22,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 18,
    },
    barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    barLabel: { width: 118, fontSize: 15, color: colors.text },
    barBg: {
      flex: 1,
      height: 14,
      backgroundColor: colors.barTrack,
      borderRadius: 7,
      overflow: 'hidden',
    },
    barFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 7 },
    barValue: { width: 52, textAlign: 'right', fontWeight: '600', fontSize: 14, color: colors.accent },
    empty: { color: colors.text, opacity: 0.75, textAlign: 'center', paddingVertical: 20, fontSize: 15 },
    aiCard: { marginTop: 16 },
    aiHint: { fontSize: 13, color: colors.text, opacity: 0.72, marginBottom: 16, lineHeight: 18 },
    aiBtn: {
      backgroundColor: colors.accent,
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: 'center',
    },
    aiBtnDisabled: { opacity: 0.7 },
    aiBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    aiErr: { color: '#ef4444', fontSize: 14, marginTop: 12 },
    aiOutWrap: { marginTop: 16 },
  });
}

export default function StatsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    entriesAPI
      .getAll()
      .then((res) => setEntries(res.entries || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const analyzeEmotions = () => {
    const stats = {};
    entries.forEach((entry) => {
      (entry.emotions || []).forEach((em) => {
        const name = em.emotion_name || em.name;
        if (!stats[name]) stats[name] = { total: 0, count: 0 };
        stats[name].total += em.intensity;
        stats[name].count += 1;
      });
    });
    return Object.entries(stats)
      .map(([name, s]) => ({ name, avg: s.total / s.count, freq: s.count }))
      .sort((a, b) => (b.freq !== a.freq ? b.freq - a.freq : b.avg - a.avg))
      .slice(0, 5);
  };

  const topEmotions = analyzeEmotions();

  const runAiAnalysis = async () => {
    setAiLoading(true);
    setAiError('');
    setAiText('');
    try {
      const res = await insightsAPI.analyze();
      setAiText(res.analysis || '');
    } catch (e) {
      setAiError(e.message || 'Не удалось получить анализ');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.screenBg }]}>
        <Text style={styles.loadingText}>Загрузка статистики...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.headerSheet,
          {
            paddingTop: insets.top + HEADER_SAFE_EXTRA,
            backgroundColor: colors.fieldBg,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.headerEdge, styles.headerEdgeZ]}>
            <TouchableOpacity
              onPress={() =>
                navigation.canGoBack()
                  ? navigation.goBack()
                  : navigation.navigate('Tabs', { screen: 'Home' })
              }
              style={styles.headerTap}
              hitSlop={8}
              accessibilityLabel="Назад к записям"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerRowSpacer} />
          <View style={[styles.headerEdge, styles.headerEdgeRight, styles.headerEdgeZ]} />
          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              Статистика эмоций
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ваши топ-5 эмоций</Text>
          {topEmotions.length > 0 ? (
            topEmotions.map((em) => (
              <View key={em.name} style={styles.barRow}>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {em.name}
                </Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${(em.avg / 10) * 100}%` }]} />
                </View>
                <Text style={styles.barValue}>{em.avg.toFixed(1)}/10</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>Нет данных об эмоциях</Text>
          )}
        </View>

        <View style={[styles.card, styles.aiCard]}>
          <Text style={styles.cardTitle}>ИИ: паттерны и прогноз</Text>
          <Text style={styles.aiHint}>
            На основе ваших последних записей (GigaChat). Не заменяет консультацию специалиста.
          </Text>
          <TouchableOpacity
            style={[styles.aiBtn, aiLoading && styles.aiBtnDisabled]}
            onPress={runAiAnalysis}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.aiBtnText}>Получить анализ</Text>
            )}
          </TouchableOpacity>
          {aiError ? <Text style={styles.aiErr}>{aiError}</Text> : null}
          {aiText ? (
            <View style={styles.aiOutWrap}>
              <FormattedAnalysisText text={aiText} textColor={colors.text} />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
