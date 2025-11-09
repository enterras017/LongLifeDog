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
                1日3回までごはんをあげられます。
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.emoji}>🐕</Text>
              <Text style={styles.sectionTitle}>なでなでする</Text>
              <Text style={styles.description}>
                ながいぬの頭をタップやスワイプすると喜びます！{'\n'}
                「わん！」と鳴きます。
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.emoji}>😢</Text>
              <Text style={styles.sectionTitle}>お世話を忘れずに</Text>
              <Text style={styles.description}>
                1日以上ご飯をあげないと悲しい顔になります。{'\n'}
                毎日お世話してあげましょう！
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.emoji}>🐶</Text>
              <Text style={styles.sectionTitle}>あそぶ</Text>
              <Text style={styles.description}>
                下部の「あそぶ」ボタンからミニゲームで遊べます！{'\n'}
                ご飯を30個集めるごとに、ご飯をあげる回数が+1されます。
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.emoji}>⚙️</Text>
              <Text style={styles.sectionTitle}>設定</Text>
              <Text style={styles.description}>
                下部の「設定」ボタンから効果音やバイブレーションの{'\n'}
                ON/OFFを切り替えられます。
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
            <Text style={styles.emoji}>🎮</Text>
            <Text style={styles.sectionTitle}>ゲーム開始</Text>
            <Text style={styles.description}>
              「スタート」ボタンを押すと3秒カウントダウン。{'\n'}
              カウントダウン中にゲーム画面を確認しよう！
            </Text>
          </View>

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


