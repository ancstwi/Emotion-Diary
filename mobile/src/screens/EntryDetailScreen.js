import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { entriesAPI } from '../api';
import { getEmojiForEmotion } from '../constants/emotions';
import { HEADER_SAFE_EXTRA } from '../constants/layout';
import { useTheme } from '../context/ThemeContext';

function Section({ styles, title, content }) {
  if (!content && content !== 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{content}</Text>
    </View>
  );
}

function buildStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.screenBg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 17, color: colors.text },
    errorText: { fontSize: 17, color: '#ef4444' },
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
    headerEdgeRight: { justifyContent: 'flex-end', minWidth: 88 },
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
    scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
    card: {
      backgroundColor: colors.fieldBg,
      borderRadius: 22,
      padding: 22,
    },
    date: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 22,
    },
    section: { marginBottom: 22 },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      textDecorationLine: 'underline',
      marginBottom: 10,
      letterSpacing: 0.3,
    },
    sectionText: { fontSize: 16, color: colors.text, lineHeight: 24 },
    emotionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      gap: 12,
    },
    emotionLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    emoji: { fontSize: 18 },
    emotionName: { fontSize: 16, color: colors.text, flex: 1 },
    intensity: { fontSize: 16, color: colors.accent, fontWeight: '600' },
  });
}

export default function EntryDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const { id } = route.params;
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    entriesAPI
      .getById(id)
      .then((res) => setEntry(res.entry))
      .catch((err) => {
        console.error(err);
        setError('Запись не найдена');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (s) => {
    const str = new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const base = str.replace(/[\s\u00A0\u202F]*г\.?\s*$/i, '').trim();
    return `${base} г.`;
  };

  const handleDelete = () => {
    Alert.alert('Удалить?', 'Удалить запись?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await entriesAPI.delete(id);
            navigation.goBack();
          } catch (err) {
            console.error(err);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.screenBg }]}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (error || !entry) {
    return (
      <View style={[styles.center, { backgroundColor: colors.screenBg }]}>
        <Text style={styles.errorText}>{error || 'Запись не найдена'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerTap} hitSlop={8}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerRowSpacer} />
          <View style={[styles.headerEdge, styles.headerEdgeRight, styles.headerEdgeZ]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EntryForm', { editEntry: entry })}
              style={styles.headerTap}
              hitSlop={8}
            >
              <Ionicons name="pencil" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerTap} hitSlop={8}>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              Детали записи
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
          <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
          <Section styles={styles} title="СИТУАЦИЯ" content={entry.situation} />
          <Section styles={styles} title="МЫСЛИ" content={entry.thoughts} />
          {entry.emotions && entry.emotions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ЭМОЦИИ</Text>
              {entry.emotions.map((em, i) => (
                <View key={i} style={styles.emotionRow}>
                  <View style={styles.emotionLeft}>
                    <Text style={styles.emoji}>{getEmojiForEmotion(em.emotion_name || em.name)} </Text>
                    <Text style={styles.emotionName} numberOfLines={2}>
                      {em.emotion_name || em.name}
                    </Text>
                  </View>
                  <Text style={styles.intensity}>({em.intensity}/10)</Text>
                </View>
              ))}
            </View>
          )}
          <Section styles={styles} title="РЕАКЦИЯ (ТЕЛО)" content={entry.body_reaction} />
          <Section styles={styles} title="РЕАКЦИЯ (ПОВЕДЕНИЕ)" content={entry.behavior_reaction} />
        </View>
      </ScrollView>
    </View>
  );
}
