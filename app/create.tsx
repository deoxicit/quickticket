import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useWeb3Modal } from '@web3modal/wagmi-react-native';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CONTRACT_ADDRESS, TYPED_CONTRACT_ABI } from '@/contract/contractConfig';
import DatePicker from 'react-native-date-picker';

export default function CreateEvent() {
  const [eventName, setEventName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [location, setLocation] = useState('');

  const { open: openWeb3Modal } = useWeb3Modal();
  const { isConnected } = useAccount();
  const router = useRouter();

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed) {
      Alert.alert(
        "Success",
        "Event created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace('/');
            }
          }
        ]
      );
    }
  }, [isConfirmed, router]);
  const handleCreateEvent = () => {
    if (!isConnected) {
      openWeb3Modal();
      return;
    }

    const ticketPriceWei = BigInt(parseFloat(ticketPrice) * 1e18);
    const dateTimestamp = BigInt(Math.floor(date.getTime() / 1000));

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: TYPED_CONTRACT_ABI,
      functionName: 'createEvent',
      args: [
        eventName,
        dateTimestamp,
        ticketPriceWei,
        BigInt(maxParticipants),
        imageUrl,
        description,
        location
      ],
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4">Create New Event</Text>
        <TextInput
          className="border border-gray-300 p-2 rounded-lg mb-4"
          placeholder="Event Name"
          value={eventName}
          onChangeText={setEventName}
        />
        <TextInput
          className="border border-gray-300 p-2 rounded-lg mb-4"
          placeholder="Image URL"
          value={imageUrl}
          onChangeText={setImageUrl}
        />
        <Pressable
          className="border border-gray-300 p-2 rounded-lg mb-4"
          onPress={() => setOpen(true)}
        >
          <Text>{date.toLocaleString()}</Text>
        </Pressable>
        <DatePicker
          modal
          open={open}
          date={date}
          onConfirm={(selectedDate) => {
            setOpen(false)
            setDate(selectedDate)
          }}
          onCancel={() => {
            setOpen(false)
          }}
          minimumDate={new Date()} // Prevent selecting past dates
        />
        <TextInput
          className="border border-gray-300 p-2 rounded-lg mb-4"
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          className="border border-gray-300 p-2 rounded-lg mb-4"
          placeholder="Max Participants"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          keyboardType="numeric"
        />
        <TextInput
          className="border border-gray-300 p-2 rounded-lg mb-4"
          placeholder="Ticket Price (ETH)"
          value={ticketPrice}
          onChangeText={setTicketPrice}
          keyboardType="numeric"
        />
        <TextInput
          className="border border-gray-300 p-2 rounded-lg mb-4"
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
        <Pressable
          className={`py-3 rounded-full mb-4 ${isPending || isConfirming ? 'bg-gray-400' : 'bg-blue-500'}`}
          onPress={handleCreateEvent}
          disabled={isPending || isConfirming}
        >
          <Text className="text-white text-center text-lg">
            {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Create Event'}
          </Text>
        </Pressable>
        {hash && <Text className="text-sm text-gray-600 mb-2">Transaction Hash: {hash}</Text>}
        {isConfirming && <Text className="text-sm text-blue-600 mb-2">Waiting for confirmation...</Text>}
        {isConfirmed && <Text className="text-sm text-green-600 mb-2">Event created successfully!</Text>}
        {error && (
          <Text className="text-sm text-red-600 mb-2">Error: "Please set the event time to future"</Text>
        )}
        <Pressable
          className="py-3 rounded-full border border-gray-300"
          onPress={() => router.back()}
        >
          <Text className="text-center text-lg">Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}