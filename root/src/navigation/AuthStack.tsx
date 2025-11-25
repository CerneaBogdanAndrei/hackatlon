import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

export type AuthStackParamList = {
    login: undefined;
    register: undefined;
    forgot: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="register"
                component={RegisterScreen}
                options={{ title: "creează cont" }}
            />
            <Stack.Screen
                name="forgot"
                component={ForgotPasswordScreen}
                options={{ title: "resetare parolă" }}
            />
        </Stack.Navigator>
    );
}
