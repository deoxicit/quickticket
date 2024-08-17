// app/create.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useWeb3Modal } from '@web3modal/wagmi-react-native';
import { useAccount } from 'wagmi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CreateEvent() {
  const [eventName, setEventName] = useState('');
  const [displayPicture, setDisplayPicture] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [location, setLocation] = useState('');
  const [mainGuests, setMainGuests] = useState('');

  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const handleCreateEvent = () => {
    if (!isConnected) {
      open();
      return;
    }
    // Implement event creation logic here
    console.log('Creating event:', { 
      eventName, 
      displayPicture, 
      dateTime, 
      description, 
      maxParticipants, 
      ticketPrice, 
      location, 
      mainGuests: mainGuests.split(',').map(guest => guest.trim()),
      creatorAddress: address 
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
          placeholder="Display Picture URL"
          value={displayPicture}
          onChangeText={setDisplayPicture}
        />
        <TextInput
          className="border border-gray-300 p-2 rounded-lg mb-4"
          placeholder="Date and Time (YYYY-MM-DDTHH:MM:SS)"
          value={dateTime}
          onChangeText={setDateTime}
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
        />
        <TextInput
          className="border border-gray-300 p-2 rounded-lg mb-4"
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          className="border border-gray-300 p-2 rounded-lg mb-4"
          placeholder="Main Guests (comma-separated)"
          value={mainGuests}
          onChangeText={setMainGuests}
        />
        <Pressable 
          className="bg-blue-500 py-3 rounded-full mb-4"
          onPress={handleCreateEvent}
        >
          <Text className="text-white text-center text-lg">Create Event</Text>
        </Pressable>
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