// app/(tabs)/profile.tsx
import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { W3mButton } from '@web3modal/wagmi-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Animated.Text entering={FadeInDown.delay(100).springify()} className="text-2xl font-bold">Profile</Animated.Text>
          <Pressable className="bg-slate-300 rounded-full">
            <W3mButton />
          </Pressable>
        </View>
        <Animated.View entering={FadeInRight.delay(200).springify()}>
          <Pressable
            className="bg-blue-500 py-3 rounded-full mt-4"
            onPress={() => router.push('/create')}
          >
            <Text className="text-white text-center text-lg">Create Event</Text>
          </Pressable>
        </Animated.View>
        {/* Add other profile elements here with animations */}
      </ScrollView>
    </SafeAreaView>
  );
}