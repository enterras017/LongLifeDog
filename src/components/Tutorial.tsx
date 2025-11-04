import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface TutorialProps {
  onClose: () => void;
  type: 'main' | 'foodRunner';
}

export const Tutorial: React.FC<TutorialProps> = ({ onClose, type }) => {
  if (type === 'main') {
    return (
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>ながいぬのいる生活</Text>
            <Text style={styles.subtitle}>遊び方</Text>
            
            <View style={styles.section}>
              <Text style={styles.emoji}>🍖</Text>
              <Text style={styles.sectionTitle}>ごはんをあげる</Text>
              <Text style={styles.description}>
                「ごはんをあげる」ボタンを押すと、ながいぬが伸びます！{'\n'}
                1日100回までごはんをあげられます。
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.emoji}>🐕</Text>
              <Text style={styles.sectionTitle}>なでなでする</Text>
              <Text style={styles.description}>
                ながいぬの頭をタップやスワイプすると喜びます！{'\n'}
                「わん！」と鳴いて、しっぽを振ります。
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.emoji}>🏃‍♂️</Text>
              <Text style={styles.sectionTitle}>ご飯ランナー</Text>
              <Text style={styles.description}>
                右上のボタンからミニゲームで遊べます！{'\n'}
                ご飯を集めてハイスコアを目指そう。
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.emoji}>💾</Text>
              <Text style={styles.sectionTitle}>データ保存</Text>
              <Text style={styles.description}>
                ながいぬの長さやハイスコアは自動的に保存されます。{'\n'}
                アプリを閉じても安心！
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>始める！</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ご飯ランナーのチュートリアル
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>ご飯ランナー</Text>
          <Text style={styles.subtitle}>遊び方</Text>
          
          <View style={styles.section}>
            <Text style={styles.emoji}>👆</Text>
            <Text style={styles.sectionTitle}>スワイプで移動</Text>
            <Text style={styles.description}>
              画面を上下左右にスワイプすると、{'\n'}
              ながいぬが動きます。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.emoji}>🍖</Text>
            <Text style={styles.sectionTitle}>ご飯を集める</Text>
            <Text style={styles.description}>
              ご飯に当たるとスピードがアップ！{'\n'}
              「わん！」と鳴いて振動します。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.emoji}>🧱</Text>
            <Text style={styles.sectionTitle}>壁に注意</Text>
            <Text style={styles.description}>
              壁に当たるとゲームオーバー。{'\n'}
              スピードが上がると難しくなります！
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.emoji}>🏆</Text>
            <Text style={styles.sectionTitle}>ハイスコア</Text>
            <Text style={styles.description}>
              最高のスピードレベルが記録されます。{'\n'}
              どこまで速くなれるかな？
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>わかった！</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

