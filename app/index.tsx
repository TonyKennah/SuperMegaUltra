import { useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const [number, setNumber] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [sinceLastHit, setSinceLastHit] = useState<Record<string, number>>({});
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

  const chunkedHistory = chunkArray(history, 7);

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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Super Mega Ultra Tracker</Text>
          <View style={styles.countsContent}>
            {displayOrder.map(num => {
              const actual = counts[num] || 0;
              const expected = totalEntries * expectedPercentages[num];
              const diff = actual - expected;
              const diffColor = diff > 0 ? '#28a745' : diff < 0 ? '#dc3545' : '#666';
              const since = sinceLastHit[num] ?? 'N/A';

              return (
                <View key={num} style={styles.statItemContainer}>
                  <Text style={styles.statTopLeft}>{actual}</Text>
                  <Text style={styles.statTopRight}>{Math.round(expected)}</Text>
                  <Text style={[styles.statBottomLeft, { color: diffColor }]}>{diff > 0 ? '+' : ''}{Math.round(diff)}</Text>
                  <Text style={styles.statEmoji}>{numberKey[num]}</Text>
                  <Text style={styles.statDifference}>
                    {since}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Add</Text>
          <View style={styles.countsContent}>
            {displayOrder.map((num) => {
              return (
                <Pressable key={num} onPress={() => addNumberToHistory(String(num))}>
                  <View style={[styles.legendItem, {minWidth: 70}]}>
                    <Text style={styles.legendDesc}>{numberKey[num]}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
        <Text style={styles.historyTitle}>History ({totalEntries})</Text>
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
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 20, textAlign: "center" },
  sectionContainer: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
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
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  statTopLeft: {
    position: 'absolute',
    top: 4,
    left: 6,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0056b3',
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
    color: '#6c757d',
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
    color: '#888',
  },
  legendItem: {
    backgroundColor: '#e2e8f0', // A light gray-blue
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
    borderBottomColor: '#ddd',
  },
  historyBankItem: {
    width: '3.28%', // 100% / 7 items
  },
  historyBankText: {
    fontSize: 24,
    textAlign: 'center',
  },
});
