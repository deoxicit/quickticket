import React from 'react';
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { W3mButton } from '@web3modal/wagmi-react-native';
import { CONTRACT_ADDRESS, TYPED_CONTRACT_ABI } from '@/contract/contractConfig';

export default function EventDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isConnected } = useAccount();

    const { data: eventData, isLoading, isError } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: TYPED_CONTRACT_ABI,
        functionName: 'getEvent',
        args: [BigInt(id as string)],
    });

    const {
        writeContract,
        data: hash,
        error,
        isPending,
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    const handleBuyTicket = () => {
        if (!isConnected) {
            // You might want to trigger the Web3Modal to open here
            return;
        }
        if (eventData && Array.isArray(eventData)) {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: TYPED_CONTRACT_ABI,
                functionName: 'buyTicket',
                args: [BigInt(id as string), 1n], // Buying 1 ticket
                value: eventData[4], // ticketPrice
            });
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </SafeAreaView>
        );
    }

    if (isError || !eventData || !Array.isArray(eventData)) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 p-4">
                    <Text className="text-xl">Error loading event details</Text>
                </View>
            </SafeAreaView>
        );
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatEth = (value: bigint) => {
        return `${(Number(value) / 1e18).toFixed(4)} ETH`;
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100e">
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-bold">Events</Text>
                    <Pressable className="bg-slate-300 rounded-full">
                        <W3mButton />
                    </Pressable>
                </View>
                <Image
                    source={{ uri: eventData[8] || 'https://via.placeholder.com/400x200' }}
                    className="w-full h-64"
                />

                <Pressable
                    className={`py-3 rounded-full mt-4 mb-4 ${isPending || isConfirming ? 'bg-gray-400' : 'bg-green-500'}`}
                    onPress={handleBuyTicket}
                    disabled={isPending || isConfirming}
                >
                    <Text className="text-white text-center text-lg font-bold">
                        {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Buy Ticket'}
                    </Text>
                </Pressable>
                <View className="p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-3xl font-bold">{eventData[2]}</Text>
                    </View>

                    <Text className="text-xl font-bold mb-2">About this event</Text>
                    <Text className="text-base mb-4">{eventData[9]}</Text>
                    
                    <View className="bg-gray-100 p-4 rounded-lg mb-4">
                        <Text className="text-lg mb-2">🗓 {formatDate(Number(eventData[3]))}</Text>
                        <Text className="text-lg mb-2">📍 {eventData[10]}</Text>
                        <Text className="text-xl font-bold text-green-600">💰 {formatEth(eventData[4])}</Text>
                    </View>


                    <View className="bg-gray-100 p-4 rounded-lg mb-4">
                        <Text className="text-lg mb-2">🎟 Tickets sold: {eventData[6].toString()} / {eventData[5].toString()}</Text>
                        <Text className="text-lg">🟢 Status: {eventData[7] ? 'Active' : 'Inactive'}</Text>
                    </View>

                    {hash && <Text className="text-sm text-gray-600 mb-2">Transaction Hash: {hash}</Text>}
                    {isConfirming && <Text className="text-sm text-blue-600 mb-2">Waiting for confirmation...</Text>}
                    {isConfirmed && <Text className="text-sm text-green-600 mb-2">Transaction confirmed!</Text>}
                    {error && (
                        <Text className="text-sm text-red-600 mb-2">Error: {error.message}</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}