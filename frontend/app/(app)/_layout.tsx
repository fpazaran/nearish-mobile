import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/constants/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_ICON: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  home: { active: 'heart', inactive: 'heart-outline' },
  visits: { active: 'calendar', inactive: 'calendar-outline' },
  memories: { active: 'camera', inactive: 'camera-outline' },
  activities: { active: 'sparkles', inactive: 'sparkles-outline' },
  wishlist: { active: 'gift', inactive: 'gift-outline' },
};

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.medium_pink,
        tabBarStyle: {
          backgroundColor: colors.backgroundOverlay97,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 84,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICON[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tabs.Screen name="visits" options={{ title: 'Visits', tabBarLabel: 'Visits' }} />
      <Tabs.Screen name="memories" options={{ title: 'Memories', tabBarLabel: 'Memories' }} />
      <Tabs.Screen name="activities" options={{ title: 'Activities', tabBarLabel: 'Activities' }} />
      <Tabs.Screen name="wishlist" options={{ title: 'Wishlist', tabBarLabel: 'Wishlist' }} />
    </Tabs>
  );
}
