import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ExploreScreen from "../screens/ExploreScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function Tabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "tomato",
                tabBarInactiveTintColor: "gray",
                tabBarIcon: ({ color, size }) => {
                    let icon: any = "ellipse";

                    if (route.name === "Explore") icon = "map";
                    if (route.name === "Profile") icon = "person";

                    return <Ionicons name={icon} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Explore" component={ExploreScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
