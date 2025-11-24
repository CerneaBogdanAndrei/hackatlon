import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabsNavigator from "./TabsNavigator";
import DetailsScreen from "../screens/DetailsScreen";
import ExploreScreen from "../screens/ExploreScreen";

export type RootStackParamList = {
    Tabs: undefined;
    Details: { location: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Tabs"
                component={TabsNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Details"
                component={DetailsScreen}
                options={{ title: "Location Details" }}
            />
        </Stack.Navigator>
    );
}
