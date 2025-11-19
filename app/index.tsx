import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  ListRenderItem,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  type HistoryItem = { num: string; highlight: 'none' | 'blue' | 'red' };

  const [number, setNumber] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [sinceLastHit, setSinceLastHit] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const inputRef = useRef<TextInput>(null);
  const isInitialMount = useRef(true);

  // Load state from storage on app start
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('history');
        const savedCounts = await AsyncStorage.getItem('counts');
        const savedSinceLastHit = await AsyncStorage.getItem('sinceLastHit');
        const savedTheme = await AsyncStorage.getItem('theme');

        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (savedCounts) setCounts(JSON.parse(savedCounts));
        if (savedSinceLastHit) setSinceLastHit(JSON.parse(savedSinceLastHit));
        if (savedTheme) setTheme(savedTheme as 'light' | 'dark');
      } catch (e) {
        console.error("Failed to load state from storage", e);
      }
    };
    loadState();
  }, []);

  // Save history-related state whenever history changes
  useEffect(() => {
    const saveHistoryState = async () => {
      try {
        await AsyncStorage.setItem('history', JSON.stringify(history));
        await AsyncStorage.setItem('counts', JSON.stringify(counts));
        await AsyncStorage.setItem('sinceLastHit', JSON.stringify(sinceLastHit));
      } catch (e) {
        console.error("Failed to save history state", e);
      }
    };
    saveHistoryState();
  }, [history, counts, sinceLastHit]); // This effect depends on the history state

  // Save theme when it changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      // Only save theme on subsequent renders, not on initial mount
      AsyncStorage.setItem('theme', theme);
    }
  }, [theme]);


  const addNumberToHistory = (numToAdd: string) => {
    const newNumber = numToAdd.trim();
    if (newNumber && numberKey.hasOwnProperty(newNumber)) {
      // Determine highlight status for the NEW item based on previous entries
      let highlight: HistoryItem['highlight'] = 'none';
      if (history.length > 0 && history[0].num === '0') {
        if (history.length > 1 && history[1].num === '0') {
          highlight = 'red'; // Two 0s in a row
        } else {
          highlight = 'blue'; // One 0
        }
      }

      const newHistoryItem: HistoryItem = { num: newNumber, highlight };
      const newHistory = [newHistoryItem, ...history];
      setHistory(newHistory);

      setCounts((prevCounts) => ({
        ...prevCounts,
        [newNumber]: (prevCounts[newNumber] || 0) + 1,
      }));

      const newSinceLastHit: Record<string, number> = {};
      displayOrder.forEach(num => {
        const lastIndex = newHistory.findIndex(h => h.num === String(num));
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

  const handleClearState = () => {
    const clearMessage = "This will clear all saved history and settings from storage. The app will use default values on the next reload. Are you sure?";
    
    const clearAction = async () => {
      try {
        await AsyncStorage.removeItem('history');
        await AsyncStorage.removeItem('counts');
        await AsyncStorage.removeItem('sinceLastHit');

        if (Platform.OS === 'web') {
          window.location.reload();
        } else {
          await Updates.reloadAsync();
        }
      } catch (e) {
        console.error("Failed to clear storage", e);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Clear Saved Data\n\n${clearMessage}`)) {
        clearAction();
      }
    } else {
      Alert.alert(
        "Clear Saved Data",
        clearMessage,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear Storage",
            style: "destructive",
            onPress: clearAction,
          },
        ]
      );
    }
  };
  const handleRemoveNumber = (indexToRemove: number) => {
    // Find the correct item to remove from the display history
    const itemToRemove = displayHistory[indexToRemove];
    if (!itemToRemove) return;

    // Find the first occurrence of this specific item instance in the main history and remove it
    const realIndex = history.findIndex(h => h === itemToRemove);
    if (realIndex === -1) return;

    const newHistory = history.filter((_, index) => index !== realIndex);
    setHistory(newHistory);

    // Decrement count
    setCounts(prevCounts => {
      const numberToRemove = itemToRemove.num;
      const newCounts = { ...prevCounts };
      if (newCounts[numberToRemove]) {
        newCounts[numberToRemove]--;
        if (newCounts[numberToRemove] === 0) {
          delete newCounts[numberToRemove];
        }
      }
      // If the count is somehow already 0 or doesn't exist, we don't need to do anything.
      if (!newCounts[numberToRemove]) {
        delete newCounts[numberToRemove];
      }
      return newCounts;
    });

    // Recalculate sinceLastHit after removal
    const newSinceLastHit: Record<string, number> = {};
    displayOrder.forEach(num => {
      const lastIndex = newHistory.findIndex(h => h.num === String(num));
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
  const displayHistory = history.filter(h => h.num !== '0');
  const chunkedHistory = chunkArray(displayHistory, 7);

  const renderHistoryRow: ListRenderItem<string[]> = ({ item, index: rowIndex }) => {
    return (
      <View style={styles.historyRow}>
        {item.map((historyItem, index) => {
          const flatIndex = (rowIndex * 7) + index;
          const highlightStyle = historyItem.highlight === 'blue' ? styles.highlightedBlue :
                                 historyItem.highlight === 'red' ? styles.highlightedRed : null;

          return (
            <Pressable key={index} style={[styles.historyBankItem, highlightStyle]} onPress={() => handleRemoveNumber(flatIndex)}>
              <Text style={styles.historyBankText}>{numberKey[Number(historyItem.num)]}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

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
        <View style={[styles.sectionContainer, { borderBottomColor: currentColors.sectionBorder, paddingBottom: 0 }]}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Super Mega Ultra Tracker</Text>
          <View style={[styles.countsContent, { marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: currentColors.sectionBorder, alignItems: 'flex-end' }]}>
            {displayOrder.map(num => {
              const multipliers: Record<number, number> = {
                2: 2, // Cherry
                4: 4, // Grape
                5: 5, // Lemon
                8: 8, // Melon
                9: 20, // Gold
                // 0 is also Gold, but not in the original array. Let's assume it's not needed here based on the code.
              };
              const multiplier = multipliers[num];
              
              // If a multiplier exists, calculate and show the result. Otherwise, render an empty placeholder to maintain alignment.
              const result = multiplier !== undefined
                ? ((counts[num] || 0) * multiplier).toFixed(0)
                : null;

              return (
                <View key={num} style={styles.multiplierItem} >
                  {result !== null && <Text style={[styles.multiplierValue, { color: currentColors.text }]}>{result}</Text>}
                </View>
              );
            })}
          </View>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={[styles.historyTitle, { color: currentColors.text, marginBottom: 0 }]}>History ({displayHistory.length})</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: currentColors.text }}>Dark Mode</Text>
                <Switch value={theme === 'dark'} onValueChange={(isOn) => setTheme(isOn ? 'dark' : 'light')} />
                <Pressable onPress={handleClearState} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                </Pressable>
            </View>
        </View>
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
  multiplierItem: {
    width: 80, // Match statItemContainer width
    height: 30, // Give it some height
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8, // Match statItemContainer margin
  },
  multiplierValue: {
    fontSize: 18,
    fontWeight: 'bold',
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
  clearButton: {
    backgroundColor: '#c82333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginLeft: 10,
  },
  clearButtonText: {
    color: 'white',
  },
  list: { flex: 1 },
  historyRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  historyBankItem: {
    width: '3.28%', // 100% / 7 items
  },
  highlightedBlue: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007aff',
  },
  highlightedRed: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ff3b30',
  },
  historyBankText: {
    fontSize: 24,
    textAlign: 'center',
  },
});
