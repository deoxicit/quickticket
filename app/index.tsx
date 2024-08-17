// app/index.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useWeb3Modal } from '@web3modal/wagmi-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockEvents } from '../utils/mockData';
import { Event } from '../types/event';

export default function Home() {
  const router = useRouter();
  const { open } = useWeb3Modal();

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-4 rounded-lg shadow-md"
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <Image
        source={{ uri: item.displayPicture }}
        className="w-full h-40 rounded-lg mb-2"
      />
      <Text className="text-xl font-bold mb-1">{item.name}</Text>
      <Text className="text-gray-600 mb-1">{new Date(item.dateTime).toLocaleString()}</Text>
      <Text className="text-gray-600 mb-1">{item.location}</Text>
      <Text className="text-green-600 font-bold">{item.ticketPrice}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold">Events</Text>
          <Pressable 
            className="bg-blue-500 px-4 py-2 rounded-full"
            onPress={() => open()}
          >
            <Text className="text-white">Connect</Text>
          </Pressable>
        </View>
        
        <FlatList
          data={mockEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          showsVerticalScrollIndicator={false} // Hide scroll bar
        />
        
        <Pressable 
          className="bg-green-500 py-3 rounded-full mt-4"
          onPress={() => router.push('/create')}
        >
          <Text className="text-white text-center text-lg">Create Event</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}