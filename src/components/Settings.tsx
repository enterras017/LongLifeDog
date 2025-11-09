import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { loadSettings, saveSettings, type SettingsData } from '../utils/storage';

interface SettingsProps {
  onClose: () => void;
  onShowTutorial?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose, onShowTutorial }) => {
  const [settings, setSettings] = useState<SettingsData>({
    soundEnabled: true,
    vibrationEnabled: true,
    tutorialCompleted: false,
  });

  useEffect(() => {
    const load = async () => {
      const data = await loadSettings();
      setSettings(data);
    };
    load();
  }, []);

  const handleToggleSound = async (value: boolean) => {
    const newSettings = { ...settings, soundEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleToggleVibration = async (value: boolean) => {
    const newSettings = { ...settings, vibrationEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleShowTutorial = () => {
    onClose();
    if (onShowTutorial) {
      onShowTutorial();
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>設定</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>音声設定</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>効果音</Text>
                <Text style={styles.settingDescription}>
                  なでなでやご飯を食べたときの音
                </Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                thumbColor={settings.soundEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>バイブレーション</Text>
                <Text style={styles.settingDescription}>
                  ご飯ランナーでの振動フィードバック
                </Text>
              </View>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={handleToggleVibration}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                thumbColor={settings.vibrationEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ヘルプ</Text>
            
            <TouchableOpacity
              style={styles.tutorialButton}
              onPress={handleShowTutorial}
            >
              <Text style={styles.tutorialButtonText}>チュートリアルを表示</Text>
            </TouchableOpacity>
            <Text style={styles.tutorialDescription}>
              アプリの使い方を確認できます
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>アプリ情報</Text>
            <Text style={styles.infoText}>バージョン: 1.0.0</Text>
            <Text style={styles.infoText}>アプリ名: ながいぬのいる生活</Text>
            <Text style={styles.infoText}>© 2025 RAS1001</Text>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.doneButton} onPress={onClose}>
          <Text style={styles.doneButtonText}>完了</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    fontSize: 24,
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  tutorialButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  tutorialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tutorialDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


