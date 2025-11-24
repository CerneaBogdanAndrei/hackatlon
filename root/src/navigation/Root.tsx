import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppTabs from "./AppTabs";
import DetailsScreen from "../screens/DetailsScreen";

export type RootStackParamList = {
    tabs: undefined;
    details: { location: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Root() {
    return (
        <Stack.Navigator>
            {/* Tabs (map / explore / ai / profile) */}
            <Stack.Screen
                name="tabs"
                component={AppTabs}
                options={{ headerShown: false }}
            />

            {/* Details */}
            <Stack.Screen
                name="details"
                component={DetailsScreen}
                options={{ title: "details" }}
            />
        </Stack.Navigator>
    );
}
