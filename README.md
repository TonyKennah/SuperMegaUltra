# SuperMegaUltra

A tracker application to monitor the frequency of numbers, compare them against statistical expectations, and view a history of entries.

## Features

*   **Statistical Analysis**: View actual counts, expected counts based on weighted probabilities, and the difference between them.
*   **Interactive UI**: Add numbers to your history by clicking on items in the legend.
*   **History View**: See a log of all entered numbers (excluding "0"), grouped in banks of seven.
*   **Data Persistence**: Your session, including history and theme preference, is automatically saved and loaded.
*   **Light & Dark Modes**: Switch between light and dark themes for user comfort.
*   **State Management**: Clear all saved data to start fresh.
*   **Click to Remove**: Easily remove single entries from the history by clicking on them.

## User Guide

This guide explains how to use the different features of the SuperMegaUltra tracker.

### Statistics View

At the top of the screen, you will see a "Statistics" section. For each item (represented by an emoji), this view provides four key pieces of information:

*   **Top-Left**: The **Actual Count** of how many times you have entered that number.
*   **Top-Right**: The **Expected Count**, which is the statistically expected number of hits for the current total number of entries.
*   **Bottom-Left**: The **Difference** between the actual and expected counts. Green indicates you are above the expectation, and red indicates you are below.
*   **Bottom-Right**: The number of entries **Since Last Hit**.

### Adding Numbers

You can add numbers to your history by clicking on any of the emojis in the "Add" section. This is the fastest way to add an entry.

### History & Settings

Below the main sections, you will find the **History** log and settings controls.

*   **History**: Displays a list of all the numbers you have entered, with the most recent entries appearing first. The number `0` (⬆️) is tracked in the statistics but is not displayed in this list.
    *   **To remove an item**, simply click on its emoji in the history list.
*   **Dark Mode**: Use the toggle switch to turn dark mode on or off. Your preference is saved automatically.
*   **Clear Button**: Click this button to clear all saved data from the application's storage. A confirmation dialog will appear to prevent accidental data loss. After clearing, you will need to reload the app to start with a fresh state.
