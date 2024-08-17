import React from 'react'
import { W3mButton } from '@web3modal/wagmi-react-native';

const WalletConnectButton = () => {
    return <W3mButton size='md' label='connect' loadingLabel='⚡︎'/>;
}

export default WalletConnectButton