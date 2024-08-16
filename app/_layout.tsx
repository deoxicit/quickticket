import '@walletconnect/react-native-compat'
import { WagmiProvider } from 'wagmi'
import { mainnet, polygon, arbitrum } from '@wagmi/core/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal, defaultWagmiConfig, Web3Modal } from '@web3modal/wagmi-react-native'
import { emailConnector } from '@web3modal/email-wagmi-react-native'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '0c870bf821194d9d4a6c46e9bdf2131b'

// 2. Create config
const metadata = {
  name: 'AppKit RN',
  description: 'AppKit RN Example',
  url: 'https://walletconnect.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com'
  }
}

const email = emailConnector({ projectId, metadata })
const chains = [mainnet, polygon, arbitrum] as const

const wagmiConfig = defaultWagmiConfig({
  chains, projectId, metadata,
  extraConnectors: [email]
})

// 3. Create modal
createWeb3Modal({
  projectId,
  wagmiConfig,
  defaultChain: mainnet, // Optional
  enableAnalytics: true // Optional - defaults to your Cloud configuration
})

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="index" />
        </Stack>
        <Web3Modal />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
