import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
            <ThemedText type="title">Notifications</ThemedText>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
screen: {
    flex: 1,
},

header: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 5,
  paddingHorizontal: 5,
  paddingTop: 10,
},
});