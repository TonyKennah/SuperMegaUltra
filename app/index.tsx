import { useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const [number, setNumber] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [sinceLastHit, setSinceLastHit] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const inputRef = useRef<TextInput>(null);

  const addNumberToHistory = (numToAdd: string) => {
    const newNumber = numToAdd.trim();
    if (newNumber && numberKey.hasOwnProperty(newNumber)) {
      const newHistory = [newNumber, ...history];
      setHistory(newHistory);
      setCounts((prevCounts) => ({
        ...prevCounts,
        [newNumber]: (prevCounts[newNumber] || 0) + 1,
      }));

      // Recalculate sinceLastHit from the new history
      const newSinceLastHit: Record<string, number> = {};
      displayOrder.forEach(num => {
        const lastIndex = newHistory.findIndex(h => h === String(num));
        // If found, the count is its index. If not, it's the total length.
        newSinceLastHit[num] = lastIndex === -1 ? newHistory.length : lastIndex;
      });
      setSinceLastHit(newSinceLastHit);
    }
  };

  const handleNumberSubmit = () => {
    addNumberToHistory(number);
    setNumber(""); // Clear the input field
  };

  const handleRemoveNumber = (indexToRemove: number) => {
    const numberToRemove = history[indexToRemove];

    // Remove from history
    const newHistory = history.filter((_, index) => index !== indexToRemove);
    setHistory(newHistory);

    // Decrement count
    setCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      newCounts[numberToRemove]--;
      if (newCounts[numberToRemove] === 0) {
        delete newCounts[numberToRemove];
      }
      return newCounts;
    });

    // Recalculate sinceLastHit after removal
    const newSinceLastHit: Record<string, number> = {};
    displayOrder.forEach(num => {
      const lastIndex = newHistory.findIndex(h => h === String(num));
      newSinceLastHit[num] = lastIndex === -1 ? newHistory.length : lastIndex;
    });
    setSinceLastHit(newSinceLastHit);
  };
  // Helper to group history into banks of 7
  const chunkArray = (arr: string[], size: number): string[][] => {
    const chunkedArr: string[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunkedArr.push(arr.slice(i, i + size));
    }
    return chunkedArr;
  };

  // Filter out '0' for display purposes only, keeping it in the main history state for calculations
  const displayHistory = history.filter(h => h !== '0');
  const chunkedHistory = chunkArray(displayHistory, 7);

  const renderHistoryRow: ListRenderItem<string[]> = ({ item, index: rowIndex }) => (
    <View style={styles.historyRow}>
      {item.map((num, index) => (
        <Pressable key={index} style={styles.historyBankItem} onPress={() => handleRemoveNumber(rowIndex * 7 + index)}>
          <Text style={styles.historyBankText}>{numberKey[Number(num)]}</Text>
        </Pressable>
      ))}
    </View>
  );

  const totalEntries = history.length;
  const displayOrder = [2, 4, 5, 8, 9, 0, 7, 1];

  const expectedPercentages: Record<number, number> = {
    0: 0.0926,
    1: 0.037,
    2: 0.3704, // Cherry
    4: 0.1667, // Grape
    5: 0.1481, // Lemon
    7: 0.037,
    8: 0.0926,
    9: 0.037,
  };

  const numberKey: Record<number, string> = {
    0: "⬆️",
    1: "🎰",
    2: "🍒",
    4: "🍇",
    5: "🍋",
    7: "7️⃣",
    8: "🍉",
    9: "💰",
  };

  const colors = {
    light: {
      background: '#f0f0f0',
      text: '#333',
      sectionBorder: '#ccc',
      statItemBg: '#f0f0f0',
      legendItemBg: '#e2e8f0',
      historyRowBorder: '#ddd',
      statTopLeft: '#0056b3',
      statTopRight: '#6c757d',
      statSince: '#888',
    },
    dark: {
      background: '#121212',
      text: '#e0e0e0',
      sectionBorder: '#444',
      statItemBg: '#1e1e1e',
      legendItemBg: '#2c2c2c',
      historyRowBorder: '#444',
      statTopLeft: '#4dabf7',
      statTopRight: '#adb5bd',
      statSince: '#999',
    }
  };

  const currentColors = colors[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <View style={styles.content}>
        <View style={[styles.sectionContainer, { borderBottomColor: currentColors.sectionBorder }]}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Super Mega Ultra Tracker</Text>
          <View style={styles.countsContent}>
            {displayOrder.map(num => {
              const actual = counts[num] || 0;
              const expected = totalEntries * expectedPercentages[num];
              const diff = actual - expected;
              const diffColor = diff > 0 ? '#28a745' : diff < 0 ? '#dc3545' : '#666';
              const since = sinceLastHit[num] ?? 'N/A';

              return (
                <View key={num} style={[styles.statItemContainer, { backgroundColor: currentColors.statItemBg }]}>
                  <Text style={[styles.statTopLeft, { color: currentColors.statTopLeft }]}>{actual}</Text>
                  <Text style={[styles.statTopRight, { color: currentColors.statTopRight }]}>{Math.round(expected)}</Text>
                  <Text style={[styles.statBottomLeft, { color: diffColor }]}>{diff > 0 ? '+' : ''}{Math.round(diff)}</Text>
                  <Text style={styles.statEmoji}>{numberKey[num]}</Text>
                  <Text style={[styles.statDifference, { color: currentColors.statSince }]}>
                    {since}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={[styles.sectionContainer, { borderBottomColor: currentColors.sectionBorder }]}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Add</Text>
          <View style={styles.countsContent}>
            {displayOrder.map((num) => {
              return (
                <Pressable key={num} onPress={() => addNumberToHistory(String(num))}>
                  <View style={[styles.legendItem, {minWidth: 70, backgroundColor: currentColors.legendItemBg}]}>
                    <Text style={styles.legendDesc}>{numberKey[num]}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={[styles.sectionContainer, { borderBottomColor: currentColors.sectionBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={[styles.sectionTitle, { color: currentColors.text, marginBottom: 0 }]}>Settings</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: currentColors.text }}>Dark Mode</Text>
                <Switch value={theme === 'dark'} onValueChange={(isOn) => setTheme(isOn ? 'dark' : 'light')} />
            </View>
        </View>
        <Text style={[styles.historyTitle, { color: currentColors.text }]}>History ({displayHistory.length})</Text>
        <FlatList
          data={chunkedHistory}
          renderItem={renderHistoryRow}
          keyExtractor={(_item, index) => index.toString()}
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 20, textAlign: "center" },
  sectionContainer: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  countsContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  statItemContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderRadius: 10,
  },
  statTopLeft: {
    position: 'absolute',
    top: 4,
    left: 6,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statBottomLeft: {
    position: 'absolute',
    bottom: 1,
    left: 6,
    fontSize: 20,
    color: '#888',
  },
  statTopRight: {
    fontSize: 14,
    fontWeight: 'bold',
    position: 'absolute',
    top: 4,
    right: 6,
  },
  statEmoji: {
    fontSize: 32,
  },
  statDifference: {
    fontSize: 14,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 2,
    right: 8,
  },
  legendItem: {
    padding: 2,
    margin: 4,
    borderRadius: 12,
  },
  legendDesc: {
    fontSize: 64,
    userSelect: 'none', // Prevents the emoji text from being selected
  },
  emojiLabel: {
    fontSize: 20,
    marginRight: 5,
  },
  countNumber: { fontWeight: "bold", marginRight: 5 },
  countValue: { color: "#333" },
  historyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  list: { flex: 1 },
  historyRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  historyBankItem: {
    width: '3.28%', // 100% / 7 items
  },
  historyBankText: {
    fontSize: 24,
    textAlign: 'center',
  },
});
