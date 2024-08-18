import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Pressable, RefreshControl, ActivityIndicator, Image, ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { W3mButton } from '@web3modal/wagmi-react-native';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESS, TYPED_CONTRACT_ABI } from '@/contract/contractConfig';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Define types for the purchased tickets and event details
type PurchasedTicket = {
  eventId: bigint;
  ticketCount: bigint;
};

type EventDetails = [
  bigint, // id
  string, // creator
  string, // name
  bigint, // date
  bigint, // ticketPrice
  bigint, // maxParticipants
  bigint, // ticketsSold
  boolean, // isActive
  string, // imageUrl
  string, // description
  string  // location
];

type PurchasedEvent = {
  result: EventDetails;
  ticketsPurchased: bigint;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [purchasedEvents, setPurchasedEvents] = useState<PurchasedEvent[]>([]);
  const { address, isConnected } = useAccount();

  const {
    data: purchasedTickets,
    isError: isPurchasedTicketsError,
    error: purchasedTicketsError,
    isLoading: isPurchasedTicketsLoading,
    refetch: refetchPurchasedTickets
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TYPED_CONTRACT_ABI,
    functionName: 'getAllTicketsPurchased',
    args: [address],
  }) as { data: PurchasedTicket[] | undefined, isError: boolean, error: Error | null, isLoading: boolean, refetch: () => Promise<any> };

  const eventIds = purchasedTickets?.map(ticket => ticket.eventId) || [];

  const {
    data: eventDetails,
    isSuccess: isEventDetailsSuccess,
    refetch: refetchEventDetails
  } = useReadContracts({
    contracts: eventIds.map(id => ({
      address: CONTRACT_ADDRESS,
      abi: TYPED_CONTRACT_ABI,
      functionName: 'getEvent',
      args: [id],
    })),
  }) as { data: { result: EventDetails }[] | undefined, isSuccess: boolean, refetch: () => Promise<any> };

  useEffect(() => {
    if (isEventDetailsSuccess && eventDetails && purchasedTickets) {
      const eventsWithTickets = eventDetails.map((event, index) => ({
        ...event,
        ticketsPurchased: purchasedTickets[index].ticketCount,
      }));
      setPurchasedEvents(eventsWithTickets);
    }
  }, [isEventDetailsSuccess, eventDetails, purchasedTickets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchPurchasedTickets();
    await refetchEventDetails();
    setRefreshing(false);
  }, [refetchPurchasedTickets, refetchEventDetails]);

  const renderEventItem: ListRenderItem<PurchasedEvent> = useCallback(({ item, index }) => {
    const [id, creator, name, date, ticketPrice, maxParticipants, ticketsSold, isActive, imageUrl, description, location] = item.result;

    const safeFormatDate = (value: bigint) => {
      if (value === undefined || value === null) return 'Date not set';
      const date = new Date(Number(value) * 1000);
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
    };

    const safeFormat = (value: bigint) => {
      return `${(Number(value) / 1e18).toFixed(4)} ETH`;
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        className="bg-white p-4 mb-4 rounded-lg shadow-md"
      >
        <TouchableOpacity
          onPress={() => router.push(`/event/${id.toString()}`)}
        >
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-40 rounded-lg mb-2"
          />
          <Text className="text-xl font-bold mb-1">{name || 'Unnamed Event'}</Text>
          <Text className="text-gray-600 mb-1">{safeFormatDate(date)}</Text>
          <Text className="text-green-600 font-bold">{safeFormat(ticketPrice)} per ticket</Text>
          <Text className="text-blue-600 font-bold">You purchased: {item.ticketsPurchased.toString()} tickets</Text>
          <Text className="text-gray-600">{location}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [router]);

  const totalTicketsPurchased = purchasedTickets ? purchasedTickets.reduce((sum, ticket) => sum + Number(ticket.ticketCount), 0) : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-4 p-4">
          <Pressable className="bg-slate-300 rounded-full">
            <W3mButton />
          </Pressable>
          <Pressable
            className="bg-blue-500 px-3 py-2 rounded-full "
            onPress={() => router.push('/create')}
          >
            <Text className="text-white text-center text-lg">Create Event</Text>
          </Pressable>
        </View>
        {!isConnected ? (
          <Text className="text-center text-gray-500 mt-4">Please connect your wallet to view your profile and tickets.</Text>
        ) : isPurchasedTicketsLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : isPurchasedTicketsError ? (
          <Text className="text-center text-red-500 mt-4">Error loading tickets: {purchasedTicketsError?.message}</Text>
        ) : purchasedEvents.length > 0 ? (
          <>
            <Text className="text-lg font-semibold mb-2 px-4">Total Tickets Purchased: {totalTicketsPurchased}</Text>
            <AnimatedFlatList<PurchasedEvent>
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
              data={purchasedEvents}
              keyExtractor={(item) => item.result[0].toString()}
              renderItem={renderEventItem}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </>
        ) : (
          <Text className="text-center text-gray-500 mt-4">You haven't purchased any tickets yet.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}