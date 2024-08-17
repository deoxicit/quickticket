// app/event/[id].tsx
import React from 'react';
import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWeb3Modal } from '@web3modal/wagmi-react-native';
import { useAccount } from 'wagmi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockEvents } from '../../utils/mockData';

export default function EventDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { open } = useWeb3Modal();
    const { isConnected } = useAccount();

    const event = mockEvents.find(e => e.id === id);

    if (!event) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 p-4">
                    <Text className="text-xl">Event not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleBuyTicket = () => {
        if (!isConnected) {
            open();
            return;
        }
        // Implement ticket buying logic here
        console.log('Buying ticket for event:', id);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1"
                showsVerticalScrollIndicator={false} >
                <Image
                    source={{ uri: event.displayPicture }}
                    className="w-full h-64"
                />
                <View className="p-4">
                    <Text className="text-3xl font-bold mb-2">{event.name}</Text>
                    <Text className="text-xl text-gray-600 mb-2">{new Date(event.dateTime).toLocaleString()}</Text>
                    <Text className="text-lg mb-2">{event.location}</Text>
                    <Text className="text-lg font-bold text-green-600 mb-4">{event.ticketPrice}</Text>

                    <Text className="text-lg font-bold mb-2">Description</Text>
                    <Text className="text-base mb-4">{event.description}</Text>

                    <Pressable
                        className="bg-green-500 py-3 rounded-full mt-4 mb-4"
                        onPress={handleBuyTicket}
                    >
                        <Text className="text-white text-center text-lg">Buy Ticket</Text>
                    </Pressable>
                    <Text className="text-lg font-bold mb-2">Main Guests</Text>
                    {event.mainGuests.map((guest, index) => (
                        <Text key={index} className="text-base mb-1">• {guest}</Text>
                    ))}

                    <Text className="text-lg font-bold mt-4 mb-2">Event Details</Text>
                    <Text className="text-base mb-1">Max Participants: {event.maxParticipants}</Text>

                </View>
            </ScrollView>
            <View className="p-4">
                <Pressable
                    className="py-3 rounded-full border border-gray-300"
                    onPress={() => router.back()}
                >
                    <Text className="text-center text-lg">Back to Events</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}