// app/(tabs)/_layout.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

type IoniconsNames = keyof typeof Ionicons.glyphMap;

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: IoniconsNames;

          if (route.name === 'index') {
            iconName = 'calendar';
          } else if (route.name === 'profile') {
            iconName = 'person';
          } else {
            iconName = 'swap-horizontal-outline'; // default icon
          }

          const animatedIconStyle = useAnimatedStyle(() => {
            const scale = withTiming(focused ? 1.2 : 1, { duration: 200 });
            const iconColor = interpolateColor(
              scale,
              [1, 1.2],
              ['#6b7280', '#3b82f6']
            );

            return {
              transform: [{ scale }],
              color: iconColor,
            };
          });

          return (
            <View className="items-center justify-center">
              <AnimatedIonicons name={iconName} size={size} style={animatedIconStyle} />
            </View>
          );
        },
        tabBarLabel: ({ focused, children }) => (
          <Animated.Text 
            className={`text-xs ${focused ? 'text-blue-500 font-bold' : 'text-gray-500'}`}
            style={useAnimatedStyle(() => ({
              opacity: withTiming(focused ? 1 : 0.8, { duration: 200 }),
            }))}
          >
            {children}
          </Animated.Text>
        ),
        headerShown: false,
        tabBarStyle: { 
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
          borderRadius : 60,
          margin:8,
          bottom: 16, // Adjust this value to position the tab bar
        },
        tabBarItemStyle: {
          padding: 5,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Events',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}