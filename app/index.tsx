import { Text, View } from "react-native";
import { W3mButton } from '@web3modal/wagmi-react-native'

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <W3mButton />
    </View>
  );
}
