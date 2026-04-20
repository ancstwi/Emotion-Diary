import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function InlineBold({ text, baseStyle, boldStyle }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={baseStyle}>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={idx} style={boldStyle}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={idx}>{part}</Text>;
      })}
    </Text>
  );
}

export default function FormattedAnalysisText({ text, textColor = '#1a1a1a' }) {
  const lines = String(text || '').split(/\r?\n/);
  const blocks = [];
  let firstBlock = true;

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const base = [styles.body, { color: textColor }];
    const bold = [styles.bold, { color: textColor }];

    if (trimmed.startsWith('## ')) {
      blocks.push(
        <Text
          key={`h-${i}`}
          style={[styles.h2, { color: textColor }, firstBlock && styles.h2First]}
        >
          {trimmed.replace(/^##\s+/, '')}
        </Text>
      );
      firstBlock = false;
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const content = trimmed.replace(/^[-*]\s+/, '');
      blocks.push(
        <View key={`li-${i}`} style={styles.listRow}>
          <Text style={[styles.bullet, { color: textColor }]}>•</Text>
          <View style={styles.listTextWrap}>
            <InlineBold text={content} baseStyle={base} boldStyle={bold} />
          </View>
        </View>
      );
      firstBlock = false;
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const m = trimmed.match(/^(\d+)\.\s+(.*)$/);
      const num = m ? m[1] : '';
      const content = m ? m[2] : trimmed;
      blocks.push(
        <View key={`n-${i}`} style={styles.listRow}>
          <Text style={[styles.bulletNum, { color: textColor }]}>{num}.</Text>
          <View style={styles.listTextWrap}>
            <InlineBold text={content} baseStyle={base} boldStyle={bold} />
          </View>
        </View>
      );
      firstBlock = false;
      return;
    }

    blocks.push(
      <View key={`p-${i}`} style={[styles.paragraph, firstBlock && styles.paragraphFirst]}>
        <InlineBold text={trimmed} baseStyle={base} boldStyle={bold} />
      </View>
    );
    firstBlock = false;
  });

  return <View style={styles.container}>{blocks}</View>;
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  h2: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
    lineHeight: 24,
  },
  h2First: { marginTop: 0 },
  paragraph: { marginBottom: 10 },
  paragraphFirst: { marginTop: 0 },
  body: { fontSize: 15, lineHeight: 24 },
  bold: { fontSize: 15, lineHeight: 24, fontWeight: '700' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 2,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 24,
    marginRight: 8,
    marginTop: 1,
    width: 14,
  },
  bulletNum: {
    fontSize: 15,
    lineHeight: 24,
    marginRight: 6,
    minWidth: 22,
    fontWeight: '600',
  },
  listTextWrap: { flex: 1 },
});
