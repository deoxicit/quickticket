import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Pressable, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { W3mButton } from '@web3modal/wagmi-react-native';
import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESS, TYPED_CONTRACT_ABI } from '@/contract/contractConfig';
import Animated, { FadeInDown } from 'react-native-reanimated';

const EVENTS_PER_PAGE = 10;
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function Home() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const flatListRef = useRef<FlatList | null>(null);

  const {
    data: eventCount,
    isError: isEventCountError,
    error: eventCountError,
    isLoading: isEventCountLoading,
    refetch: refetchEventCount
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TYPED_CONTRACT_ABI,
    functionName: 'eventCount',
  });

  const fetchEvents = useCallback((start: number, end: number) => {
    return useReadContracts({
      contracts: Array.from({ length: end - start + 1 }, (_, i) => ({
        address: CONTRACT_ADDRESS,
        abi: TYPED_CONTRACT_ABI,
        functionName: 'getEvent',
        args: [BigInt(start + i)],
      })),
    });
  }, []);

  const {
    data: events = [],
    isPending: isEventsPending,
    error: eventsError,
    refetch: refetchEvents
  } = fetchEvents(1, Math.min(Number(eventCount || 0), EVENTS_PER_PAGE));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchEventCount();
    await refetchEvents();
    setRefreshing(false);
    setCurrentPage(1);
  }, [refetchEventCount, refetchEvents]);

  const loadMoreEvents = useCallback(async () => {
    if (loadingMore || events.length >= Number(eventCount || 0)) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const start = (nextPage - 1) * EVENTS_PER_PAGE + 1;
    const end = Math.min(start + EVENTS_PER_PAGE - 1, Number(eventCount || 0));

    const { data: newEvents } = await fetchEvents(start, end);
    if (newEvents) {
      events.push(...newEvents);
      setCurrentPage(nextPage);
    }
    setLoadingMore(false);
  }, [events, eventCount, currentPage, loadingMore, fetchEvents]);

  const renderEventItem = useCallback(({ item, index }: { item: any; index: number }) => {
    if (!Array.isArray(item.result) || item.result.length !== 11) {
      console.error('Invalid event item:', item);
      return null;
    }

    const [id, creator, name, date, ticketPrice, maxParticipants, ticketsSold, isActive, imageUrl, description, location] = item.result;

    const safeFormat = (value: bigint | number | undefined) => {
      return `${(Number(value) / 1e18).toFixed(4)} ETH`;
    };

    const safeFormatDate = (value: bigint | undefined) => {
      if (value === undefined || value === null) return 'Date not set';
      const date = new Date(Number(value) * 1000);
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        className="bg-white p-4 mb-4 rounded-lg shadow-md"
      >
        <TouchableOpacity
          className="bg-white p-4 mb-4 rounded-lg shadow-md"
          onPress={() => router.push(`/event/${id.toString()}`)}
        >
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-40 rounded-lg mb-2"
          />
          <Text className="text-xl font-bold mb-1">{name || 'Unnamed Event'}</Text>
          <Text className="text-gray-600 mb-1">{safeFormatDate(date)}</Text>
          <Text className="text-green-600 font-bold">{safeFormat(ticketPrice)} ETH</Text>
          <Text className="text-gray-600 mb-1">
            Tickets sold: {safeFormat(ticketsSold)} / {safeFormat(maxParticipants)}
          </Text>
          <Text className="text-gray-600">{location}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [router]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
    <View className="flex-1 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Events</Text>
        <Pressable className="bg-slate-300 rounded-full">
          <W3mButton />
        </Pressable>
      </View>
      {isEventCountLoading ? (
        <Text>Loading event count...</Text>
      ) : isEventCountError ? (
        <Text>Error loading event count: {eventCountError?.message}</Text>
      ) : eventCount === 0n ? (
        <Text>No events have been created yet.</Text>
      ) : (
        <AnimatedFlatList
          data={events}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderEventItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadingMore ? null : loadMoreEvents}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  </SafeAreaView>
  );
}