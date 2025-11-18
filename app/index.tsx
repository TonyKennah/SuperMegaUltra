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
    if (newNumber) {
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
  const expectedCount = (totalEntries / 10).toFixed(1);
  const expectedNumbers = Array.from({ length: 10 }, (_, i) => i);

  const numberKey: Record<number, string> = {
    0: "⬆️",
    1: "🎰",
    2: "🍒",
    3: "3",
    4: "🍇",
    5: "🍋",
    6: "6",
    7: "7️⃣",
    8: "🍉",
    9: "💰",
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Expected Counts (for {totalEntries} entries)</Text>
          <View style={styles.countsContent}>
            {expectedNumbers.map((num) => (
              <View key={num} style={[styles.countItem, styles.expectedItem]}>
                <Text style={styles.countNumber}>{num}:</Text>
                <Text style={styles.countValue}>{expectedCount}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Difference (Actual - Expected)</Text>
          <View style={styles.countsContent}>
            {expectedNumbers.map((num) => {
              const actual = counts[num] || 0;
              const expected = totalEntries / 10;
              const diff = actual - expected;
              const diffColor = diff > 0 ? '#28a745' : diff < 0 ? '#dc3545' : '#333';

              return (
                <View key={num} style={[styles.countItem, styles.differenceItem]}>
                  <Text style={styles.emojiLabel}>{numberKey[num]}</Text>
                  <Text style={[styles.countValue, { color: diffColor, fontWeight: 'bold' }]}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Actual Counts</Text>
          <View style={styles.countsContent}>
            {Object.entries(counts)
              .sort(([a], [b]) => Number(a) - Number(b)) // Sort counts numerically
              .map(([num, count]) => (
                <View key={num} style={[styles.countItem, {minWidth: 70}]}>
                  <Text style={styles.emojiLabel}>{numberKey[Number(num)]}</Text>
                  <Text style={styles.countValue}>{count}</Text>
                </View>
            ))}
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Legend</Text>
          <View style={styles.countsContent}>
            {Object.entries(numberKey).map(([num, desc]) => (
              <Pressable key={num} onPress={() => addNumberToHistory(num)}>
                <View style={[styles.countItem, styles.legendItem, {minWidth: 70}]}>
                  <Text style={styles.countNumber}>{num}:</Text>
                  <Text style={styles.legendDesc}>{desc}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={styles.historyTitle}>History</Text>
        <FlatList
          data={chunkedHistory}
          renderItem={renderHistoryRow}
          keyExtractor={(_, index) => index.toString()}
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
  countItem: {
    flexDirection: "row",
    backgroundColor: "#e9e9e9",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    margin: 4,
  },
  expectedItem: {
    backgroundColor: '#dbeafe', // A light blue to differentiate
  },
  differenceItem: {
    backgroundColor: '#f0f0f0',
  },
  legendItem: {
    backgroundColor: '#e2e8f0', // A light gray-blue
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
  input: { height: 40, borderColor: "gray", borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, backgroundColor: 'white', borderRadius: 5 },
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
    fontSize: 48,
    textAlign: 'center',
  },
});
