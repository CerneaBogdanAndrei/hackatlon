import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ExploreListScreen from "../screens/ExploreListScreen";
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "tomato",
                tabBarInactiveTintColor: "gray",
                tabBarIcon: ({ color, size }) => {
                    let icon: any = "ellipse";
                    if (route.name === "list") icon = "list";
                    if (route.name === "map") icon = "map";
                    if (route.name === "profile") icon = "person";
                    return <Ionicons name={icon} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="list" component={ExploreListScreen} options={{ title: "list" }} />
            <Tab.Screen name="map" component={MapScreen} options={{ title: "map" }} />
            <Tab.Screen name="profile" component={ProfileScreen} options={{ title: "profile" }} />
        </Tab.Navigator>
    );
}
