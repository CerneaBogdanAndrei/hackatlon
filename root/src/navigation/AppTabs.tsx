import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import MapScreen from "../screens/MapScreen";
import ExploreScreen from "../screens/ExploreScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarShowLabel: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let icon: any = "home";

                    if (route.name === "map") icon = focused ? "map" : "map-outline";
                    if (route.name === "explore") icon = focused ? "compass" : "compass-outline";
                    if (route.name === "favorites") icon = focused ? "heart" : "heart-outline";
                    if (route.name === "ai") icon = focused ? "sparkles" : "sparkles-outline";
                    if (route.name === "profile") icon = focused ? "person" : "person-outline";

                    return <Ionicons name={icon} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="map" component={MapScreen} />
            <Tab.Screen name="explore" component={ExploreScreen} />
            <Tab.Screen name="favorites" component={FavoritesScreen} />
            <Tab.Screen name="ai" component={ChatScreen} />
            <Tab.Screen name="profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
