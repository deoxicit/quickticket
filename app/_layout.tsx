// app/_layout.js
import React from 'react';
import '@walletconnect/react-native-compat';
import { WagmiProvider } from 'wagmi';
import { arbitrumSepolia, polygonAmoy, sepolia } from '@wagmi/core/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal, defaultWagmiConfig, Web3Modal } from '@web3modal/wagmi-react-native';
import { emailConnector } from '@web3modal/email-wagmi-react-native';
import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();
const projectId = '0c870bf821194d9d4a6c46e9bdf2131b';
const metadata = {
  name: 'Event Ticket Platform',
  description: 'Buy and sell event tickets',
  url: 'https://quickticket.studio',
  icons: ['https://i.ibb.co/z7ywJWb/Quick-Ticket.png'],
  redirect: {
    native: 'QuickTicket://',
    universal: 'https://quickticket.studio'
  }
};

const email = emailConnector({ projectId, metadata });
const chains = [sepolia, polygonAmoy ,arbitrumSepolia] as const;

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  extraConnectors: [email]
});

createWeb3Modal({
  projectId,
  wagmiConfig,
  defaultChain: sepolia,
  enableAnalytics: true
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="create" />
            <Stack.Screen name="event/[id]" />
          </Stack>
          <Web3Modal />
        </QueryClientProvider>
      </WagmiProvider>
    </SafeAreaProvider>
  );
}