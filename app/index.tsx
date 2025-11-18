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
  const inputRef = useRef<TextInput>(null);

  const addNumberToHistory = (numToAdd: string) => {
    const newNumber = numToAdd.trim();
    if (newNumber && numberKey.hasOwnProperty(newNumber)) {
      setHistory([newNumber, ...history]); // Add new number to the top of the list
      setCounts((prevCounts) => ({
        ...prevCounts,
        [newNumber]: (prevCounts[newNumber] || 0) + 1,
      }));
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
    setCounts((prevCounts) => {
      const newCounts = { ...prevCounts };
      newCounts[numberToRemove]--;
      if (newCounts[numberToRemove] === 0) {
        delete newCounts[numberToRemove];
      }
      return newCounts;
    });
  };
  // Helper to group history into banks of 6
  const chunkArray = (arr: string[], size: number): string[][] => {
    const chunkedArr: string[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunkedArr.push(arr.slice(i, i + size));
    }
    return chunkedArr;
  };

  const chunkedHistory = chunkArray(history, 6);

  const renderHistoryRow: ListRenderItem<string[]> = ({ item, index: rowIndex }) => (
    <View style={styles.historyRow}>
      {item.map((num, index) => (
        <Pressable key={index} style={styles.historyBankItem} onPress={() => handleRemoveNumber(rowIndex * 6 + index)}>
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
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.countsContent}>
            {displayOrder.map(num => {
              const actual = counts[num] || 0;
              const expected = totalEntries * expectedPercentages[num];
              const diff = actual - expected;
              const diffColor = diff > 0 ? '#28a745' : diff < 0 ? '#dc3545' : '#333';

              return (
                <View key={num} style={styles.statItemContainer}>
                  <Text style={styles.statTopLeft}>{Math.round(expected)}</Text>
                  <Text style={styles.statTopRight}>{actual}</Text>
                  <Text style={styles.statEmoji}>{numberKey[num]}</Text>
                  <Text style={[styles.statDifference, { color: diffColor }]}>
                    {diff > 0 ? '+' : ''}{Math.round(diff)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Legend / Quick Add</Text>
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  statTopRight: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  statEmoji: {
    fontSize: 32,
  },
  statDifference: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  legendItem: {
    backgroundColor: '#e2e8f0', // A light gray-blue
    padding: 10,
    margin: 4,
    borderRadius: 12,
  },
  legendDesc: {
    fontSize: 64,
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
    width: '16.66%', // 100% / 6 items
  },
  historyBankText: {
    fontSize: 24,
    textAlign: 'center',
  },
});
