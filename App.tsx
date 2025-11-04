import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LongDog from './src/components/LongDog';
import { FoodRunner } from './src/components/SnakeGame';

type AppMode = 'main' | 'foodRunner';

function App(): React.JSX.Element {
  const [appMode, setAppMode] = useState<AppMode>('main');

  const switchToFoodRunner = () => {
    setAppMode('foodRunner');
  };

  const switchToMain = () => {
    setAppMode('main');
  };

  return (
    <GestureHandlerRootView style={styles.container}>
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#87CEEB" />
        {appMode === 'main' ? (
          <LongDog onSwitchToSnake={switchToFoodRunner} />
        ) : (
          <FoodRunner onBackToMain={switchToMain} />
        )}
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB', // 水色
  },
});

export default App;