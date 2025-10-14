import { Stack } from "expo-router";
import { Text, View } from 'react-native';

export default function SettingsScreen() {
    const placeholderImage = 'https://cdn-icons-png.flaticon.com/512/8187/8187143.png';
  return (
        <>
          <Stack.Screen
            options={{
              title: "Settings",
              headerBackTitle: "Profile",
              headerTitleAlign: "center",
            }}
          />
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>⚙️ Settings Screen</Text>
    </View>
    </>
  );
}
